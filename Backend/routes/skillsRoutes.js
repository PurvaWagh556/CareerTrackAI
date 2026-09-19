// const express = require("express");
// const router = express.Router();
// const Skill = require("../models/Skill");
// const UserProfile = require("../models/UserProfile");
// const verifyToken = require("../middleware/verifyToken");

// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
//     const userProfile = await UserProfile.findOne({ userId });

//     let rawSkills = userProfile?.skills || [];
//     const displaySkills = rawSkills;

//     const skillsList = displaySkills.map((skill) => {
//       const skillName = typeof skill === "string" ? skill : skill.name || skill.title || "Tech Skill";
//       const lowerSkill = skillName.toLowerCase();
//       const isTerminal = lowerSkill.includes("java") || lowerSkill.includes("script") || lowerSkill.includes("c") || lowerSkill.includes("python");

//       return {
//         name: skillName,
//         icon: isTerminal ? "Terminal" : "Code2"
//       };
//     });

//     res.json({ success: true, skills: skillsList });
//   } catch (err) {
//     console.error("Error fetching skills from UserProfile:", err);
//     res.status(500).json({ success: false, error: "Server error while fetching skills." });
//   }
// });

// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const { name, category, level } = req.body;
//     const newSkill = new Skill({
//       user: req.user.userId,
//       name,
//       category,
//       level,
//     });

//     await newSkill.save();
//     res.status(201).json(newSkill);
//   } catch (error) {
//     console.error("Error saving skill:", error);
//     res.status(500).json({ error: "Failed to save skill!" });
//   }
// });

// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const skillId = req.params.id;
//     const deletedSkill = await Skill.findOneAndDelete({
//       _id: skillId,
//       user: req.user.userId,
//     });

//     if (!deletedSkill) {
//       return res.status(404).json({ success: false, error: "Skill not found or unauthorized" });
//     }

//     res.status(200).json({ success: true, message: "Skill deleted successfully!" });
//   } catch (error) {
//     console.error("Error deleting skill:", error);
//     res.status(500).json({ success: false, error: "Failed to delete skill" });
//   }
// });

// module.exports = router;









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