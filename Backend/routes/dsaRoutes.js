const express = require("express");
const router = express.Router();
const DsaProblem = require("../models/DsaProblem");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const dsaQuestionsData = require("../dsaProblems");
const mongoose = require("mongoose");

router.get("/problems", verifyToken, async (req, res) => {
  try {
    const rawId = req.user?.userId || req.user?.id || req.user?._id;
    if (!rawId) {
      return res.status(401).json({ error: "Unauthorized: User ID missing from token" });
    }

    const userId = new mongoose.Types.ObjectId(rawId);

    for (const prob of dsaQuestionsData) {
      await DsaProblem.findOneAndUpdate(
        { user: userId, title: prob.title },
        { 
          $setOnInsert: { 
            user: userId, 
            title: prob.title, 
            category: prob.category, 
            difficulty: prob.difficulty, 
            status: "To Do", 
            link: prob.link 
          } 
        },
        { upsert: true }
      );
    }

    const problems = await DsaProblem.find({ user: userId });
    
    const difficultyRank = {
      "Easy": 1,
      "Medium": 2,
      "Hard": 3
    };
    
    problems.sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);

    res.json(problems);
  } catch (err) {
    console.error("Error in GET /api/problems:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/problems/:id/status", verifyToken, async (req, res) => {
  try {
    const rawId = req.user?.userId || req.user?.id || req.user?._id;
    
    const userId = new mongoose.Types.ObjectId(rawId); 
    const { status } = req.body;

    const updated = await DsaProblem.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Problem not found" });
    }

    if (status === "Solved") {
      const today = new Date().toISOString().split("T")[0];
      await Activity.findOneAndUpdate(
        { user: userId, date: today }, 
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );

      await Notification.create({
        user: userId,
        title: "DSA Problem Solved! 🎯",
        message: `You successfully solved "${updated.title}". Keep up the momentum!`,
        type: "dsa"
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error patching DSA status:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/activity", verifyToken, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.userId });
    const activityMap = {};
    activities.forEach((item) => {
      activityMap[item.date] = item.count;
    });

    res.status(200).json(activityMap);
  } catch (error) {
    console.error("Error fetching activity heatmap:", error);
    res.status(500).json({ error: "Failed to fetch activity data" });
  }
});

router.post("/track-time", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { date, minutes } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (!user.checkedDays) user.checkedDays = {};
    if (!user.checkedDays[date]) {
      user.checkedDays[date] = { energy: "flow", duration: 0 };
    } else if (typeof user.checkedDays[date] === "number") {
      user.checkedDays[date] = {
        energy: "flow",
        duration: user.checkedDays[date],
      };
    }

    const delta = minutes || 1;
    user.checkedDays[date].duration += delta;
    user.activityTime = (user.activityTime || 0) + delta;

    user.markModified("checkedDays");
    await user.save();

    res.status(200).json({ success: true, activityTime: user.activityTime });
  } catch (err) {
    console.error("Error tracking time in DB:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/dsa-list", (req, res) => {
  const difficultyRank = { "Easy": 1, "Medium": 2, "Hard": 3 };
  const sortedData = [...dsaQuestionsData].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);
  
  res.status(200).json(sortedData); 
});

module.exports = router;