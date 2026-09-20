const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
    const userProfile = await UserProfile.findOne({ userId });

    let rawSkills = userProfile?.skills || [];
    const displaySkills = rawSkills;

    const skillsList = displaySkills.map((skill) => {
      const skillName = typeof skill === "string" ? skill : skill.name || skill.title || "Tech Skill";
      const lowerSkill = skillName.toLowerCase();
      const isTerminal = lowerSkill.includes("java") || lowerSkill.includes("script") || lowerSkill.includes("c") || lowerSkill.includes("python");

      return {
        name: skillName,
        icon: isTerminal ? "Terminal" : "Code2"
      };
    });

    res.json({ success: true, skills: skillsList });
  } catch (err) {
    console.error("Error fetching skills from UserProfile:", err);
    res.status(500).json({ success: false, error: "Server error while fetching skills." });
  }
});


module.exports = router;