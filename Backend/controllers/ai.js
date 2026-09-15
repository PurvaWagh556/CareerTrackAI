const UserProfile = require("../models/UserProfile");
const mongoose = require("mongoose");

// Ensure the model is available
const AIRecommendationModel = mongoose.models.AIRecommendation || mongoose.model("AIRecommendation", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  suggestions: [
    {
      title: String,
      description: String,
      icon: String,
      route: String,
      action: String
    }
  ]
}));

// Controller: Get Resume ATS Score
const getAtsScore = async (req, res) => {
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
};

// Controller: Get AI Suggestions & Study Plan
const getAiSuggestions = async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "User ID missing from token." });
    }

    const userId = mongoose.Types.ObjectId.isValid(rawUserId) 
      ? new mongoose.Types.ObjectId(rawUserId) 
      : rawUserId;

    const today = new Date().toISOString().split("T")[0];
    let userRecs = await AIRecommendationModel.findOne({ userId, date: today });

    if (!userRecs) {
      const masterTaskPool = [
        {
          id: "projects_1",
          title: "Scale Your Portfolio Architecture",
          description: "Add category filters or map integrations to level up your full-stack showcase!",
          icon: "Code2",
          route: "/projects",
          action: "Build Project"
        },
        {
          id: "resume_1",
          title: "Upload & Parse Your Resume",
          description: "Your profile is missing a resume file. Upload one to boost your ATS compatibility score.",
          icon: "BookOpen",
          route: "/profile",
          action: "Upload Resume"
        },
        {
          id: "dsa_1",
          title: "DSA Focus: Two Pointers & Arrays",
          description: "Solve 2 medium problems focusing on array partitioning and sliding window patterns today.",
          icon: "FileText",
          route: "/dsa-tracker",
          action: "Start Practice"
        },
        {
          id: "skills_1",
          title: "Log Your Core Tech Stack",
          description: "Add your primary programming languages and frameworks to unlock custom AI challenges.",
          icon: "BookOpen",
          route: "/profile",
          action: "Add Skills"
        }
      ];

      userRecs = await AIRecommendationModel.create({
        userId: rawUserId,
        date: today,
        suggestions: masterTaskPool.slice(0, 3)
      });
    }

    res.json({ success: true, suggestions: userRecs.suggestions });
  } catch (err) {
    console.error("AI-SUGGESTIONS ERROR:", err);
    res.status(500).json({ success: false, error: err.message || "Server error while generating study plan." });
  }
};

module.exports = {
  getAtsScore,
  getAiSuggestions
};