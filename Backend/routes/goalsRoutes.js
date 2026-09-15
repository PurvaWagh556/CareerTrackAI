const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals!" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, category, status } = req.body;
    const newGoal = new Goal({
      user: req.user.userId,
      title,
      category,
      status: status || "In Progress",
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error saving goal:", error);
    res.status(500).json({ error: "Failed to save goal!" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { status } = req.body;

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json(updatedGoal);
  } catch (err) {
    console.error("Error updating goal status:", err);
    res.status(500).json({ error: "Failed to update goal status" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const deletedGoal = await Goal.findOneAndDelete({
      _id: goalId,
      user: req.user.userId,
    });

    if (!deletedGoal) {
      return res.status(404).json({ success: false, error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Goal deleted successfully!" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ success: false, error: "Failed to delete goal" });
  }
});

module.exports = router;