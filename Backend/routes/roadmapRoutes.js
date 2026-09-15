const express = require("express");
const router = express.Router();
const Roadmap = require("../models/Roadmap");
const verifyToken = require("../middleware/verifyToken");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const UserProfile = require("../models/UserProfile");
const Skill = require("../models/Skill");

async function calculatePhaseProgress(phases, userId) {
  if (!phases || !Array.isArray(phases)) return [];
  try {
    const userProfile = await UserProfile.findOne({ userId }).catch(() => null);
    const skillCollectionItems = await Skill.find({ user: userId }).catch(() => []);
    
    const combinedSkills = Array.from(new Set([
      ...(userProfile?.skills || []),
      ...(skillCollectionItems.map(s => s.name) || [])
    ]));
    
    const lowerSkills = combinedSkills.map(s => (typeof s === 'string' ? s : s.name || "").toLowerCase());

    return phases.map(phase => {
      const phaseText = (
        (phase.title || "") + " " + 
        (phase.description || "") + " " + 
        (phase.topics ? phase.topics.join(" ") : "")
      ).toLowerCase();

      const matchedCount = lowerSkills.filter(skill => {
        if (!skill) return false;
        try {
          const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(phaseText)) return true;

          const subWords = skill.split(/[\s\&\/\-\+\.]+/).filter(w => w && w.length > 1);
          return subWords.some(sub => {
            const subRegex = new RegExp(`\\b${sub}\\b`, 'i');
            return subRegex.test(phaseText);
          });
        } catch (e) {
          return false;
        }
      }).length;
      
      let calculatedProgress = 0;
      if (matchedCount === 1) calculatedProgress = 40;
      else if (matchedCount === 2) calculatedProgress = 75;
      else if (matchedCount >= 3) calculatedProgress = 100;

      let calculatedStatus = "Not Started";
      if (calculatedProgress === 100) calculatedStatus = "Completed";
      else if (calculatedProgress > 0) calculatedStatus = "In Progress";

      return {
        ...(phase.toObject ? phase.toObject() : phase),
        progress: `${calculatedProgress}%`,
        status: calculatedStatus
      };
    });
  } catch (err) {
    console.error("Error in calculatePhaseProgress:", err);
    return phases;
  }
}

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmaps = await Roadmap.find({ user: userId });

    const updatedRoadmaps = [];
    for (const roadmap of roadmaps) {
      const roadmapObj = roadmap.toObject ? roadmap.toObject() : roadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      updatedRoadmaps.push(roadmapObj);
    }

    res.status(200).json({ success: true, roadmaps: updatedRoadmaps });
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    res.status(500).json({ success: false, error: "Failed to fetch roadmaps" });
  }
});

router.patch("/:id/activate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmapId = req.params.id;

    await Roadmap.updateMany({ user: userId }, { isActive: false });
    const activatedRoadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, user: userId },
      { isActive: true },
      { new: true }
    );

    if (!activatedRoadmap) {
      return res.status(404).json({ success: false, error: "Roadmap not found" });
    }

    res.status(200).json({ success: true, roadmap: activatedRoadmap });
  } catch (err) {
    console.error("Error activating roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to activate roadmap" });
  }
});

router.get("/active", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let activeRoadmap = await Roadmap.findOne({ user: userId, isActive: true });

    if (!activeRoadmap) {
      activeRoadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
      if (activeRoadmap) {
        activeRoadmap.isActive = true;
        await activeRoadmap.save();
      }
    }

    if (activeRoadmap) {
      const roadmapObj = activeRoadmap.toObject ? activeRoadmap.toObject() : activeRoadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      activeRoadmap = roadmapObj;
    }

    res.status(200).json({ success: true, roadmap: activeRoadmap });
  } catch (err) {
    console.error("Error fetching active roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to fetch active roadmap" });
  }
});

router.post("/regenerate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { track, prompt } = req.body;
    const targetTrack = track || "Full-Stack Developer";

    const aiPrompt = `Create a deeply detailed, structured 4-phase learning roadmap for the career track "${targetTrack}". 
Additional focus/goals: "${prompt || "Standard industry standards"}".
Return ONLY a valid JSON array of objects without markdown formatting or code blocks:
[
  {
    "phase": "Phase 1",
    "title": "Clear Phase Title",
    "description": "Comprehensive, multi-sentence technical overview detailing key tools, libraries, architectural concepts, and hands-on milestones to master.",
    "topics": ["Specific Topic 1", "Specific Topic 2", "Specific Topic 3", "Specific Topic 4"]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: aiPrompt,
    });

    const rawText = (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON array. Raw output: " + rawText);
    }

    const rawPhases = JSON.parse(jsonMatch[0]);
    const calculatedPhases = await calculatePhaseProgress(rawPhases, userId);

    await Roadmap.updateMany({ user: userId }, { isActive: false });

    const updatedRoadmap = await Roadmap.findOneAndUpdate(
      { user: userId, track: targetTrack },
      { phases: calculatedPhases, isActive: true, targetRole: targetTrack },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, roadmap: updatedRoadmap });
  } catch (err) {
    console.error("Error generating AI roadmap with gemini-3.6-flash:", err);
    res.status(500).json({ success: false, error: "Failed to generate AI roadmap: " + err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmapId = req.params.id;

    const deletedRoadmap = await Roadmap.findOneAndDelete({ _id: roadmapId, user: userId });
    if (!deletedRoadmap) {
      return res.status(404).json({ success: false, error: "Roadmap not found" });
    }

    res.status(200).json({ success: true, message: "Roadmap deleted successfully" });
  } catch (err) {
    console.error("Error deleting roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to delete roadmap" });
  }
});

module.exports = router;