const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const Project = require("../models/Project");
const Skill = require("../models/Skill");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");
    let profile = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!profile) {
      profile = await UserProfile.create({
        userId: user._id,
        email: user.email,
        fullName: user.username || "",
      });
    }

    const defaultRoadmap = [
      { month: "Month 1", topics: ["DSA Basics", "Arrays & Strings", "OOP Concepts"] },
      { month: "Month 2", topics: ["Trees & Graphs", "Database Basics", "SQL Practice"] },
      { month: "Month 3", topics: ["React.js", "Projects", "System Design"] },
      { month: "Month 4", topics: ["Mock Interviews", "Resume Preparation", "Job Applications"] }
    ];

    if (!user.roadmap || user.roadmap.length === 0) {
      user.roadmap = defaultRoadmap;
      await user.save();
    }

    const projectsArray = await Project.find({ user: userId });
    const profileSkills = profile?.skills || [];
    const skillCollectionItems = await Skill.find({ user: userId });
    const collectionSkillNames = skillCollectionItems.map(s => s.name);
    const combinedSkills = Array.from(new Set([...profileSkills, ...collectionSkillNames]));

    const hasResume = Boolean(
      (profile && profile.resumeData && profile.resumeData.data) ||
      user.resumePath ||
      user.resume
    );

    let base = 15;
    let skillsPoints = Math.min(combinedSkills.length * 10, 20);
    let projectsPoints = Math.min(projectsArray.length * 10, 20);
    
    let hasContactOrBio = Boolean(
      (profile && (profile.bio || profile.github || profile.linkedin || profile.phone || profile.headline || profile.email)) ||
      user.bio || user.github || user.linkedin || user.phone || user.headline || user.email
    );
    let profilePoints = hasContactOrBio ? 15 : 0;
    let certsPoints = Math.min((user.certificates?.length || 0) * 7.5, 15);
    let resumePoints = hasResume ? 15 : 0;

    const readinessScore = Math.min(
      base + skillsPoints + projectsPoints + profilePoints + certsPoints + resumePoints,
      100
    );

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      fullName: profile.fullName || user.username || "N/A",
      gender: profile.gender || "N/A",
      dob: profile.dob || "N/A",
      phone: profile.phone || "N/A",
      nationality: profile.nationality || "N/A",
      profilePic: profile.profilePic || "",
      ...(user.toObject ? user.toObject() : {}),
      ...(profile ? profile.toObject() : {}),
      projects: projectsArray,
      skills: combinedSkills,
      roadmap: user.roadmap,
      resumePath: hasResume ? "uploaded" : null,
      certificates: user.certificates || [],
      readinessScore,
      isProfileComplete: user.isProfileComplete || (profile ? !!profile.isProfileComplete : false),
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, error: "Server error fetching profile" });
  }
});


router.post("/profile", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { fullName, headline, location, gender, email, dob, phone, nationality, college, cgpa, degree, graduationYear, branch, educationLevel, github, linkedin, portfolio, leetcode, skills, profilePic } = req.body;

    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch (e) {
        parsedSkills = Array.isArray(skills) ? skills : [];
      }
    }

    const updateFields = { isProfileComplete: true };
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (headline !== undefined) updateFields.headline = headline;
    if (location !== undefined) updateFields.location = location;
    if (gender !== undefined) updateFields.gender = gender;
    if (email !== undefined) updateFields.email = email;
    if (dob !== undefined) updateFields.dob = dob;
    if (phone !== undefined) updateFields.phone = phone;
    if (nationality !== undefined) updateFields.nationality = nationality;
    if (college !== undefined) updateFields.college = college;
    if (cgpa !== undefined) updateFields.cgpa = cgpa;
    if (degree !== undefined) updateFields.degree = degree;
    if (graduationYear !== undefined) updateFields.graduationYear = graduationYear;
    if (branch !== undefined) updateFields.branch = branch;
    if (educationLevel !== undefined) updateFields.educationLevel = educationLevel;
    if (github !== undefined) updateFields.github = github;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (portfolio !== undefined) updateFields.portfolio = portfolio;
    if (leetcode !== undefined) updateFields.leetcode = leetcode;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;
    if (parsedSkills.length > 0) updateFields.skills = parsedSkills;

    if (req.file && req.file.buffer) {
      updateFields.resumeData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
        uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, returnDocument: "after" }
    );

    await User.findByIdAndUpdate(userId, { isProfileComplete: true });

    res.status(200).json({
      success: true,
      profile: updatedProfile,
      message: "Profile saved successfully!",
    });
  } catch (err) {
    console.error("Profile submission error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error saving profile" });
  }
});

router.post("/profile/select-avatar", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ success: false, error: "No avatar selected" });
    }

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ userId, profilePic: avatarUrl });
    } else {
      profile.profilePic = avatarUrl;
    }
    await profile.save();

    res.status(200).json({ success: true, profilePic: avatarUrl, message: "Avatar updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/skills-progress", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });
    const skillCollectionItems = await Skill.find({ user: userId });

    const combinedSkillsSet = new Set([
      ...(profile?.skills || []),
      ...(skillCollectionItems.map(s => s.name) || [])
    ]);
    
    const userSkills = Array.from(combinedSkillsSet);
    if (userSkills.length === 0) {
      return res.status(200).json({ skills: [] });
    }

    const fallbackSkills = userSkills.map((skill, index) => ({
      name: typeof skill === "string" ? skill : skill.name || "Skill",
      progress: 70 + (index * 5) % 25,
    }));

    return res.status(200).json({ skills: fallbackSkills });
  } catch (error) {
    console.error("Error generating skill progress:", error.message);
    return res.status(200).json({ skills: [] });
  }
});


router.get("/streak", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const checkedDays = user.checkedDays || {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    let activeDaysInMonth = 0;
    Object.keys(checkedDays).forEach((dateKey) => {
      const [dYear, dMonth] = dateKey.split("-").map(Number);
      if (dYear === year && dMonth === month + 1) {
        const record = checkedDays[dateKey];
        if (record) activeDaysInMonth++;
      }
    });

    const consistencyPercent = totalDaysInMonth > 0 ? Math.round((activeDaysInMonth / totalDaysInMonth) * 100) : 0;

    let streak = 0;
    let checkDate = new Date();
    const getDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    let todayKey = getDateKey(checkDate);
    if (!checkedDays[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
      todayKey = getDateKey(checkDate);
      if (!checkedDays[todayKey]) {
        return res.json({ streak: 0, consistency: consistencyPercent, checkedDays });
      }
    }

    while (true) {
      const key = getDateKey(checkDate);
      if (checkedDays[key]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak, consistency: consistencyPercent, checkedDays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
});

router.delete("/notifications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    await Notification.deleteMany({ user: userId });
    res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to clear notifications" });
  }
});

router.delete("/account", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    await User.findByIdAndDelete(userId);

    await UserProfile.findOneAndDelete({ userId });

    await Project.deleteMany({ user: userId });
    await Skill.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });

    res.status(200).json({ success: true, message: "Account deleted successfully!" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ success: false, error: "Failed to delete account" });
  }
});

module.exports = router;