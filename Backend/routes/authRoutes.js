const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const User = require("../models/User"); 
const verifyToken = require("../middleware/verifyToken"); 

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

// Helper function to hash passwords using crypto
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

// Helper function to verify passwords using crypto
const verifyPassword = (password, storedPassword) => {
  const [salt, key] = storedPassword.split(":");
  if (!salt || !key) return false; 
  const hashedBuffer = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return key === hashedBuffer;
};

// --- LOCAL AUTHENTICATION ---

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists with this email" });
    }

    const hashedPassword = hashPassword(password);

    const defaultRoadmap = [
      { month: "Month 1", topics: ["DSA Basics", "Arrays & Strings", "OOP Concepts"] },
      { month: "Month 2", topics: ["Trees & Graphs", "Database Basics", "SQL Practice"] },
      { month: "Month 3", topics: ["React.js", "Projects", "System Design"] },
      { month: "Month 4", topics: ["Mock Interviews", "Resume Preparation", "Job Applications"] }
    ];

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isProfileComplete: false, 
      roadmap: defaultRoadmap,  
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        username: newUser.username || newUser.email.split("@")[0],
        email: newUser.email,
        isProfileComplete: newUser.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error during registration",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: {
        username: user.username || user.email.split("@")[0],
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error during login" });
  }
});

// Password Reset Routes
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with this email does not exist!",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    user.resetPasswordToken = verificationCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Verification Code ",
      text: `Hello ${user.username},\n\nYour password reset code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email!",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, error: "Failed to send reset email" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code!",
      });
    }
    user.password = hashPassword(newPassword);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, error: "Server error during password reset" });
  }
});

router.post("/logout", verifyToken, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, error: "Server error during logout" });
  }
});

// --- GOOGLE OAUTH ---

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://career-track-ai-eight.vercel.app'
  : 'http://localhost:5173';

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false,
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          username: req.user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // Redirect back to Vercel with the token
      res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    } catch (err) {
      console.error("OAuth callback token error:", err);
      // Redirect back to Vercel on error
      res.redirect(`${FRONTEND_URL}/login`);
    }
  }
);

module.exports = router; 