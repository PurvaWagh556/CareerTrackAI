const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");
const CardMetric = require("../models/CardMetric");
const Skill = require("../models/Skill");
const Roadmap = require("../models/Roadmap");
const AIRecommendation = require("../models/AIRecommendation");

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const metrics = await CardMetric.findOne({ userId }) || { streak: 0, totalHours: 0, completedTasks: 0 };
    const skills = await Skill.find({ userId }) || [];
    const roadmap = await Roadmap.find({ userId }) || [];
    const suggestions = await AIRecommendation.find({ userId }) || [];

    res.status(200).json({
  success: true,
  user: { username: user.username, email: user.email },
  readiness: user.readiness || 75,
  metrics: { streak: 5, totalHours: 42, completedTasks: 18 },
  skills: user.skills || [],
  roadmap: [],
  suggestions: []
});
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;