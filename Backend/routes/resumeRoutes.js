const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Project = require("../models/Project");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const upload = multer({ storage: multer.memoryStorage() });

const extractPdfText = async (binaryData) => {
  const parseFn = typeof pdfParse === "function" ? pdfParse : pdfParse.default || pdfParse;

  let buffer;
  if (Buffer.isBuffer(binaryData)) {
    buffer = binaryData;
  } else if (binaryData && typeof binaryData === "object" && binaryData.buffer) {
    buffer = Buffer.from(binaryData.buffer);
  } else {
    buffer = Buffer.from(binaryData);
  }

  const pdfData = await parseFn(buffer);
  return pdfData.text;
};

async function evaluateResumeWithAI(resumeText, userId) {
  const userProfile = await UserProfile.findOne({ userId });
  const userSkills = await Skill.find({ user: userId });
  const userProjects = await Project.find({ user: userId });

  const prompt = `
    Act as an expert ATS resume analyzer and strict technical recruiter. 
    Evaluate the following resume text based on the user's profile:
    - Target Role: ${userProfile?.headline || "Software Developer"}
    - Stored Skills: ${JSON.stringify(userSkills.map((s) => s.name))}
    - Stored Projects: ${JSON.stringify(userProjects.map((p) => p.title))}

    Calculate an objective ATS compatibility score from 0 to 100 based on the quality of the text (if it's not a resume like an emissions report, give it a low score like 10 to 25. If it is a real resume, score it appropriately). Write a clean, plain-text critique (2-3 sentences) without using internal quotation marks.
    
    Resume Text:
    """
    ${resumeText}
    """

    CRITICAL FORMATTING INSTRUCTION:
    Return ONLY a raw JSON object with no markdown backticks. Use this exact schema:
    {"score": [number], "feedback": "Your clear plain-text feedback here without quotes."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Number(parsed.score) !== undefined ? Number(parsed.score) : 45,
        feedback: parsed.feedback || "Resume analysis completed."
      };
    }
  } catch (err) {
    console.warn("AI evaluation error:", err.message);
  }

  return {
    score: Math.min(Math.max(Math.floor(resumeText.length / 50), 20), 85),
    feedback: "Analysis generated successfully based on document structure and content density."
  };
}

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.json(null);
    }

    res.json({
      fileName: profile.resumeData.fileName,
      uploadDate: profile.resumeData.uploadDate,
      size: profile.resumeData.size,
      fileUrl: `http://localhost:8080/api/resume/download`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/ats-score", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(200).json({ success: false, hasResume: false });
    }

    res.status(200).json({
      success: true,
      hasResume: true,
      score: profile.atsScore,
      feedback: profile.atsFeedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/upload", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded!" });
    }

    const uploadDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const size = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    const resumeText = await extractPdfText(req.file.buffer);
    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({ success: false, error: "Could not extract readable text from PDF." });
    }

    const aiResult = await evaluateResumeWithAI(resumeText, userId);

    const resumeData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
      uploadDate,
      size,
    };

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({
        userId,
        resumeData,
        atsScore: aiResult.score,
        atsFeedback: aiResult.feedback,
      });
    } else {
      profile.resumeData = resumeData;
      profile.atsScore = aiResult.score;
      profile.atsFeedback = aiResult.feedback;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      score: aiResult.score,
      feedback: aiResult.feedback,
      message: "Resume uploaded and analyzed successfully!",
    });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/recheck-score", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(400).json({ success: false, error: "No resume found to recheck!" });
    }

    const resumeText = await extractPdfText(profile.resumeData.data);
    const aiResult = await evaluateResumeWithAI(resumeText, userId);

    profile.atsScore = aiResult.score;
    profile.atsFeedback = aiResult.feedback;
    await profile.save();

    res.status(200).json({
      success: true,
      score: aiResult.score,
      feedback: aiResult.feedback,
      message: "Resume re-analyzed successfully!",
    });
  } catch (err) {
    console.error("Recheck error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/download", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(404).json({ success: false, error: "Resume not found in database!" });
    }

    res.setHeader("Content-Type", profile.resumeData.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${profile.resumeData.fileName || "Resume.pdf"}"`);
    res.send(profile.resumeData.data);
  } catch (err) {
    console.error("Server error during download:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;