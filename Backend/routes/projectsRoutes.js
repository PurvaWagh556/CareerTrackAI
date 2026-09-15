const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects!" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, status, techStack, link, github } = req.body;
    const newProject = new Project({
      user: req.user.userId,
      title,
      description,
      status: status || "In Progress",
      techStack,
      link,
      github,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ error: "Failed to save project!" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { status, link, github, title, description, techStack } = req.body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (link !== undefined) updateFields.link = link;
    if (github !== undefined) updateFields.github = github;
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (techStack !== undefined) updateFields.techStack = techStack;

    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      user: req.user.userId,
    });

    if (!deletedProject) {
      return res.status(404).json({ success: false, error: "Project not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully!" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, error: "Failed to delete project" });
  }
});

module.exports = router;