const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes!" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content, priority, type } = req.body;
    const newNote = new Note({
      user: req.user.userId,
      title,
      content,
      priority: priority || "Low",
      type: type || "plain text",
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: "Failed to save note!" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { title, content, priority, language } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { title, content, priority, language, updatedAt: Date.now() },
      { new: true, returnDocument: "after" }
    );

    if (!updatedNote) {
      return res.status(404).json({ success: false, error: "Note not found in DB!" });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.status(200).json({ success: true, message: "Note deleted successfully!" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;