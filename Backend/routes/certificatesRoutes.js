const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");

const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post("/", verifyToken, uploadMemory.single("certificatePdf"), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { name, issuer } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No certificate PDF uploaded!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const newCertificate = {
      name: name || "Certificate",
      issuer: issuer || "Verified Provider",
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    if (!user.certificates) {
      user.certificates = [];
    }
    user.certificates.push(newCertificate);
    await user.save();

    res.status(200).json({
      success: true,
      certificates: user.certificates,
      message: "Certificate saved successfully to database!",
    });
  } catch (err) {
    console.error("Error saving certificate:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/view/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const certificate = user.certificates.id(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    if (!certificate.data && !certificate.link) {
      return res.status(404).json({ success: false, error: "No document attached" });
    }

    if (certificate.data) {
      res.setHeader("Content-Type", certificate.contentType || "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${certificate.fileName || "Certificate.pdf"}"`);
      return res.send(certificate.data);
    }

  } catch (err) {
    console.error("Error viewing certificate:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.delete("/:certId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const certId = req.params.certId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.certificates.id(certId)?.deleteOne();
    await user.save();

    res.status(200).json({
      success: true,
      certificates: user.certificates,
      message: "Certificate deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting certificate from MongoDB:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;