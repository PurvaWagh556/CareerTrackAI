const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Project = require("./models/Project");
const Goal = require("./models/Goal");
const jwt = require("jsonwebtoken");
const app = express();
const crypto = require("crypto");
const Skill = require("./models/Skill");
const Activity = require("./models/Activity");
const Note = require("./models/Note");
const CardMetric = require("./models/CardMetric");
const UserProfile = require("./models/UserProfile");
const Roadmap = require("./models/Roadmap");
const DsaProblem = require("./models/DsaProblem");
const multer = require("multer");
const path = require("path");
const pdfParse = require("pdf-parse");
const dsaQuestionsData = require("./dsaProblems");
const Notification = require("./models/Notification");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
require("dotenv").config();

const AIRecommendation = mongoose.model("AIRecommendation", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  suggestions: [
    {
      title: String,
      description: String,
      icon: String,
      route: String,
      action: String
    }
  ]
}));

async function calculatePhaseProgress(phases, userId) {
  if (!phases || !Array.isArray(phases)) return [];
  
  try {
    const userProfile = await UserProfile.findOne({ userId }).catch(() => null);
    const skillCollectionItems = await Skill.find({ user: userId }).catch(() => []);
    
    // 🐾 Exclude stale user.skills fields so removed skills disappear immediately
    const combinedSkills = Array.from(new Set([
      ...(userProfile?.skills || []),
      ...(skillCollectionItems.map(s => s.name) || [])
    ]));
    
    const lowerSkills = combinedSkills.map(s => (typeof s === 'string' ? s : s.name || "").toLowerCase());

    return phases.map(phase => {
      const phaseText = (
        (phase.title || "") + " " + 
        (phase.description || "") + " " + 
        (phase.topics ? phase.topics.join(" ") : "")
      ).toLowerCase();

      const matchedCount = lowerSkills.filter(skill => {
        if (!skill) return false;
        try {
          const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(phaseText)) return true;

          const subWords = skill.split(/[\s\&\/\-\+\.]+/).filter(w => w && w.length > 1);
          return subWords.some(sub => {
            const subRegex = new RegExp(`\\b${sub}\\b`, 'i');
            return subRegex.test(phaseText);
          });
        } catch (e) {
          return false;
        }
      }).length;
      
      let calculatedProgress = 0;
      if (matchedCount === 1) calculatedProgress = 40;
      else if (matchedCount === 2) calculatedProgress = 75;
      else if (matchedCount >= 3) calculatedProgress = 100;

      let calculatedStatus = "Not Started";
      if (calculatedProgress === 100) calculatedStatus = "Completed";
      else if (calculatedProgress > 0) calculatedStatus = "In Progress";

      return {
        ...(phase.toObject ? phase.toObject() : phase),
        progress: `${calculatedProgress}%`,
        status: calculatedStatus
      };
    });
  } catch (err) {
    console.error("Error in calculatePhaseProgress:", err);
    return phases;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { getDashboardData } = require("./controllers/dashboardController");
const dsaQuestions = require("./dsaProblems");
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const uploadDisk = multer({ storage: diskStorage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());
passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided, meow! 🐾",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret_key",
    (err, decodedUser) => {
      if (err) {
        console.error("🔍 JWT Verification Failed:", err.message);
        return res
          .status(403)
          .json({ success: false, error: "Invalid or expired token." });
      }

      req.user = decodedUser;
      next();
    },
  );
};

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Root Route
app.get("/", (req, res) => {
  res.send("Backend server is running live, meow! 🐾");
});

app.get("/api/dashboard", verifyToken, getDashboardData);

// Support Routes
app.post("/api/support", async (req, res) => {
  const { name, email, message, source } = req.body;

  if (!message || !email) {
    return res
      .status(400)
      .json({ success: false, error: "Fields cannot be empty" });
  }

  try {
    const newTicket = new Ticket({
      name,
      email,
      message,
      source: source || "Website",
    });
    await newTicket.save();

    const formSource =
      source === "Support Page" ? "Support Ticket 🎟️" : "Contact Message 📬";
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New ${formSource} from ${name || "User"} 🐾`,
      text: `You received a new submission from your dashboard (${source || "Website"}):\n\nSender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Ticket saved and sent successfully!" });
  } catch (error) {
    console.error("Error saving ticket or sending email:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to process request" });
  }
});

app.get("/api/support", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tickets" });
  }
});

// Registration Route

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🐾 Default starter roadmap for new users
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
      isProfileComplete: false, // 🐾 Forces new user to complete profile first via guard
      roadmap: defaultRoadmap,   // 🐾 Seeds user-specific roadmap instance
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully, meow! 🐾",
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

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully, meow! 🐾",
      token,
      user: {
        username: user.username || user.email.split("@")[0],
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error during login" });
  }
});

// Password Reset Routes
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with this email does not exist, meow! 🐾",
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
      subject: "Password Reset Verification Code 🐾",
      text: `Hello ${user.username},\n\nYour password reset code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email, meow! 🐾",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send reset email" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code, meow! 🐾",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully, meow! 🐾",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error during password reset" });
  }
});

app.post("/api/logout", verifyToken, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully, meow! 🐾",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error during logout" });
  }
});


//skills api
// app.get("/api/skills", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, error: "User not found" });
//     }

//     // 🐾 Check all common paths where onboarding forms might save skills
//     let rawSkills = 
//       user.skills || 
//       user.topSkills || 
//       user.technicalSkills || 
//       user.profile?.skills || 
//       user.profile?.topSkills ||
//       user.onboarding?.skills || 
//       user.onboardingData?.skills ||
//       user.selectedSkills || [];

//     if (typeof rawSkills === "string") {
//       rawSkills = rawSkills.split(",").map(s => s.trim()).filter(Boolean);
//     }

//     const userSkills = Array.isArray(rawSkills) ? rawSkills : [];
    
//     // Expanded fallback array showing a rich set of skills until your onboarding data saves directly to DB
//     const displaySkills = userSkills.length > 0 ? userSkills : [
//       "Java", "JavaScript", "React", "Node.js", "MongoDB", 
//       "HTML & CSS", "PHP", "Git & GitHub", "Python", "SQL", "OOP"
//     ];

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
//     console.error("Error fetching skills:", err);
//     res.status(500).json({ success: false, error: "Server error while fetching skills." });
//   }
// });
// 🐾 Fixed Skills API Route to fetch directly from UserProfile collection
app.get("/api/skills", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
    
    // 🐾 Look up the UserProfile document where the onboarding form saves profile data
    const userProfile = await UserProfile.findOne({ userId });

    let rawSkills = userProfile?.skills || [];

    // Fallback array if no skills are saved yet
    const displaySkills = rawSkills.length > 0 ? rawSkills : [
      "Java", "JavaScript", "React", "Node.js", "MongoDB", 
      "HTML & CSS", "PHP", "Git & GitHub", "Python", "SQL", "OOP"
    ];

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

app.post("/api/skills", verifyToken, async (req, res) => {
  try {
    const { name, category, level } = req.body;

    const newSkill = new Skill({
      user: req.user.userId,
      name,
      category,
      level,
    });

    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    console.error("Error saving skill:", error);
    res.status(500).json({ error: "Failed to save skill, meow! 🐾" });
  }
});

app.delete("/api/skills/:id", verifyToken, async (req, res) => {
  try {
    const skillId = req.params.id;
    const deletedSkill = await Skill.findOneAndDelete({
      _id: skillId,
      user: req.user.userId,
    });

    if (!deletedSkill) {
      return res
        .status(404)
        .json({ success: false, error: "Skill not found or unauthorized" });
    }

    res
      .status(200)
      .json({ success: true, message: "Skill deleted successfully, meow! 🐾" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ success: false, error: "Failed to delete skill" });
  }
});

// Google OAuth Login
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email,
        username: req.user.username,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    res.redirect(`http://localhost:5173/login?token=${token}`);
  },
);

// Projects API Routes
app.get("/api/projects", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects, meow! 🐾" });
  }
});

app.post("/api/projects", verifyToken, async (req, res) => {
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
    res.status(500).json({ error: "Failed to save project, meow! 🐾" });
  }
});

app.patch("/api/projects/:id", verifyToken, async (req, res) => {
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
      { new: true },
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

app.delete("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      user: req.user.userId,
    });

    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully, meow! 🐾",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, error: "Failed to delete project" });
  }
});

// Goals API Routes
app.get("/api/goals", verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals, meow! 🐾" });
  }
});

app.post("/api/goals", verifyToken, async (req, res) => {
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
    res.status(500).json({ error: "Failed to save goal, meow! 🐾" });
  }
});

app.patch("/api/goals/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { status } = req.body;

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status },
      { new: true },
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

app.delete("/api/goals/:id", verifyToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const deletedGoal = await Goal.findOneAndDelete({
      _id: goalId,
      user: req.user.userId,
    });

    if (!deletedGoal) {
      return res
        .status(404)
        .json({ success: false, error: "Goal not found or unauthorized" });
    }

    res
      .status(200)
      .json({ success: true, message: "Goal deleted successfully, meow! 🐾" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ success: false, error: "Failed to delete goal" });
  }
});

// Activity API
app.get("/api/activity", verifyToken, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.userId });
    const activityMap = {};
    activities.forEach((item) => {
      activityMap[item.date] = item.count;
    });

    res.status(200).json(activityMap);
  } catch (error) {
    console.error("Error fetching activity heatmap:", error);
    res.status(500).json({ error: "Failed to fetch activity data, meow! 🐾" });
  }
});

// Notes API
app.get("/api/notes", verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes, meow! 🐾" });
  }
});

app.post("/api/notes", verifyToken, async (req, res) => {
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
    res.status(500).json({ error: "Failed to save note, meow! 🐾" });
  }
});

app.put("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { title, content, priority, language } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { title, content, priority, language, updatedAt: Date.now() },
      { new: true, returnDocument: "after" },
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ success: false, error: "Note not found in DB, meow! 🐾" });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Note deleted successfully, meow! 🐾" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Metrics API
// app.get("/api/metrics", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.userId || req.user.id || req.user._id;
    
//     // 🐾 Gather actual user achievements from database collections
//     const profile = await UserProfile.findOne({ userId });
//     const user = await User.findById(userId);
//     const projectsCount = await Project.countDocuments({ user: userId });
//     const solvedDsaCount = await DsaProblem.countDocuments({ user: userId, status: "Solved" });
//     const certsCount = (user?.certificates && user.certificates.length) || 0;
//     const realAtsScore = profile && profile.atsScore !== undefined ? profile.atsScore : 38;

//     // 🐾 Define automated achievement cards based on real developer data
//     const automatedCards = [
//       {
//         title: "Resume Score",
//         value: `${realAtsScore} / 100`,
//         statusText: "AI ATS Compatibility Checked ✨",
//         category: "Resume"
//       },
//       {
//         title: "AWS Certificate gained",
//         value: `${certsCount}`,
//         statusText: certsCount > 0 ? "Verified Credentials! 🎉" : "Keep Building!",
//         category: "Certificates"
//       },
//       {
//         title: "Leetcode solved",
//         value: `${solvedDsaCount}`,
//         statusText: solvedDsaCount > 0 ? "Great Problem Solving! 🚀" : "Keep Building!",
//         category: "DSA"
//       },
//       {
//         title: "Projects Built",
//         value: `${projectsCount}`,
//         statusText: projectsCount > 0 ? "Full-Stack Portfolio Active ⚡" : "Add Your First Project",
//         category: "Projects"
//       }
//     ];

//     // 🐾 Auto-sync system metrics in MongoDB so they update instantly
//     await CardMetric.deleteMany({ user: userId, category: { $in: ["Resume", "Certificates", "DSA", "Projects"] } });
    
//     const savedCards = [];
//     for (const cardInfo of automatedCards) {
//       const newCard = await CardMetric.create({
//         user: userId,
//         ...cardInfo
//       });
//       savedCards.push(newCard);
//     }

//     res.status(200).json(savedCards);
//   } catch (error) {
//     console.error("Error fetching automated metrics:", error);
//     res.status(500).json({ error: "Failed to fetch metrics" });
//   }
// });
app.get("/api/metrics", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    const profile = await UserProfile.findOne({ userId });
    const user = await User.findById(userId);
    const solvedDsaCount = await DsaProblem.countDocuments({ user: userId, status: "Solved" });
    const certsCount = (user?.certificates || []).filter(c => c && (c.name || c.title)).length;
    const realAtsScore = profile && profile.atsScore !== undefined ? profile.atsScore : null;

    // 🐾 Compute Current Streak & Longest Streak Records
    const checkedDays = user?.checkedDays || {};
    const activeDates = Object.keys(checkedDays).filter(d => {
      const rec = checkedDays[d];
      return rec && ((typeof rec === "object" && (rec.duration > 0 || rec.energy)) || typeof rec === "number" || typeof rec === "string");
    }).sort();

    let currentStreak = 0;
    let checkDate = new Date();
    const getDateKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    
    let todayKey = getDateKey(checkDate);
    if (!checkedDays[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
      todayKey = getDateKey(checkDate);
    }
    
    let tempCheckDate = new Date(checkDate);
    while (true) {
      const key = getDateKey(tempCheckDate);
      const dayRecord = checkedDays[key];
      const hasChecked = dayRecord && ((typeof dayRecord === "object" && (dayRecord.duration > 0 || dayRecord.energy)) || typeof dayRecord === "number" || typeof dayRecord === "string");
      if (hasChecked) {
        currentStreak++;
        tempCheckDate.setDate(tempCheckDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(activeDates[i - 1]);
        const currDate = new Date(activeDates[i]);
        const diffDays = Math.round(Math.abs(currDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // 🐾 Curated Milestones & Badges Collection
    const milestoneBadges = [];

    if (realAtsScore !== null && profile?.resumeData?.data) {
      milestoneBadges.push({
        title: "Peak ATS Score",
        value: `${realAtsScore} / 100`,
        statusText: realAtsScore >= 75 ? "Elite Resume Optimization 🌟" : "AI Compatibility Checked ✨",
        category: "Resume"
      });
    }

    if (currentStreak > 0 || longestStreak > 0) {
      milestoneBadges.push({
        title: "Consistency Streak",
        value: `${currentStreak} Days`,
        statusText: `Personal Best: ${longestStreak} Days Record 🔥`,
        category: "Streak"
      });
    }

    if (solvedDsaCount > 0) {
      milestoneBadges.push({
        title: "Problem Solver Badge",
        value: `${solvedDsaCount} Solved`,
        statusText: solvedDsaCount >= 25 ? "Advanced Algorithm Master 🏆" : "Consistent Problem Solving 🚀",
        category: "DSA"
      });
    }

    if (certsCount > 0) {
      milestoneBadges.push({
        title: "Verified Credentials",
        value: `${certsCount} Earned`,
        statusText: "Professional Certification Unlocked 🎉",
        category: "Certificates"
      });
    }

    // Push newest milestones to the front
    milestoneBadges.reverse();

    await CardMetric.deleteMany({ user: userId });
    
    const savedBadges = [];
    for (const badgeInfo of milestoneBadges) {
      const newBadge = await CardMetric.create({
        user: userId,
        ...badgeInfo
      });
      savedBadges.push(newBadge);
    }

    res.status(200).json(savedBadges);
  } catch (error) {
    console.error("Error fetching milestones and badges:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

app.post("/api/metrics", verifyToken, async (req, res) => {
  try {
    const { title, value, statusText, category } = req.body;
    const newMetric = new CardMetric({
      user: req.user.userId,
      title,
      value,
      statusText,
      category,
    });
    await newMetric.save();
    res.status(201).json(newMetric);
  } catch (error) {
    res.status(500).json({ error: "Failed to create metric" });
  }
});

// Roadmap API Routes
app.get("/api/roadmap", verifyToken, async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ user: req.user.userId });
    if (!roadmap) {
      roadmap = {
        targetRole: "Software Engineer",
        milestones: [
          {
            month: "Month 1",
            topics: ["DSA Basics", "Arrays & Strings", "OOP Concepts"],
          },
          {
            month: "Month 2",
            topics: ["Trees & Graphs", "Database Basics", "SQL Practice"],
          },
          {
            month: "Month 3",
            topics: ["React.js", "Projects", "System Design"],
          },
          {
            month: "Month 4",
            topics: [
              "Mock Interviews",
              "Resume Preparation",
              "Job Applications",
            ],
          },
        ],
      };
    }
    res.status(200).json(roadmap);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

app.post("/api/roadmap", verifyToken, async (req, res) => {
  try {
    const { targetRole, focusArea } = req.body;

    const customMilestones = [
      {
        month: "Month 1",
        topics: [
          `Introduction to ${targetRole}`,
          "Core Fundamentals",
          "Basic Practice",
        ],
      },
      {
        month: "Month 2",
        topics: [
          `Advanced ${focusArea || "Concepts"}`,
          "Data Structures",
          "Query Optimization",
        ],
      },
      {
        month: "Month 3",
        topics: ["Full-Stack Integration", "Building Projects", "API Security"],
      },
      {
        month: "Month 4",
        topics: ["Mock Interviews", "Portfolio Polish", "Deployments"],
      },
    ];

    let roadmap = await Roadmap.findOneAndUpdate(
      { user: req.user.userId },
      { targetRole, milestones: customMilestones },
      { new: true, upsert: true },
    );

    res.status(201).json(roadmap);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate custom roadmap" });
  }
});
// 🐾 Fetch all user roadmaps with skill-matched progress calculation
app.get("/api/roadmaps", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmaps = await Roadmap.find({ user: userId });

    const updatedRoadmaps = [];
    for (const roadmap of roadmaps) {
      const roadmapObj = roadmap.toObject ? roadmap.toObject() : roadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      updatedRoadmaps.push(roadmapObj);
    }

    res.status(200).json({ success: true, roadmaps: updatedRoadmaps });
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    res.status(500).json({ success: false, error: "Failed to fetch roadmaps" });
  }
});

// 🐾 Fetch the active roadmap with skill-matched progress calculation
app.get("/api/roadmap/active", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let activeRoadmap = await Roadmap.findOne({ user: userId, isActive: true });

    if (!activeRoadmap) {
      activeRoadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
      if (activeRoadmap) {
        activeRoadmap.isActive = true;
        await activeRoadmap.save();
      }
    }

    if (activeRoadmap) {
      const roadmapObj = activeRoadmap.toObject ? activeRoadmap.toObject() : activeRoadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      activeRoadmap = roadmapObj;
    }

    res.status(200).json({ success: true, roadmap: activeRoadmap });
  } catch (err) {
    console.error("Error fetching active roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to fetch active roadmap" });
  }
});
app.patch("/api/roadmap/:id/activate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmapId = req.params.id;

    // 🐾 Deactivate all roadmaps for this user, then activate the selected one
    await Roadmap.updateMany({ user: userId }, { isActive: false });
    const activatedRoadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, user: userId },
      { isActive: true },
      { new: true }
    );

    if (!activatedRoadmap) {
      return res.status(404).json({ success: false, error: "Roadmap not found" });
    }

    res.status(200).json({ success: true, roadmap: activatedRoadmap });
  } catch (err) {
    console.error("Error activating roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to activate roadmap" });
  }
});
app.delete("/api/roadmap/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmapId = req.params.id;

    const deletedRoadmap = await Roadmap.findOneAndDelete({ _id: roadmapId, user: userId });
    if (!deletedRoadmap) {
      return res.status(404).json({ success: false, error: "Roadmap not found" });
    }

    res.status(200).json({ success: true, message: "Roadmap deleted successfully" });
  } catch (err) {
    console.error("Error deleting roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to delete roadmap" });
  }
});

app.post("/api/roadmap/regenerate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { track, prompt } = req.body;
    const targetTrack = track || "Full-Stack Developer";

    const aiPrompt = `Create a structured 4-phase learning roadmap for the career track "${targetTrack}". 
    Additional goals/focus: "${prompt || "Standard industry standards"}".
    Return ONLY a valid JSON array of objects, where each object has:
    - "phase": string (e.g., "Phase 1")
    - "title": string (e.g., "Frontend Foundations")
    - "description": string (a comprehensive, detailed descriptive paragraph explaining what to master in this phase for the full roadmap view)
    - "topics": array of 3 to 4 short summary strings (for dashboard bullet points)
    Do not include markdown code blocks or extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: aiPrompt,
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const rawPhases = JSON.parse(rawText);

    // 🐾 Dynamically calculate progress and status right upon generation
    const calculatedPhases = await calculatePhaseProgress(rawPhases, userId);

    // Deactivate all other roadmaps for this user
    await Roadmap.updateMany({ user: userId }, { isActive: false });

    // Save or update the new roadmap with real calculated phase metrics
    const updatedRoadmap = await Roadmap.findOneAndUpdate(
      { user: userId, track: targetTrack },
      { phases: calculatedPhases, isActive: true },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, roadmap: updatedRoadmap });
  } catch (err) {
    console.error("Error generating AI roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to generate AI roadmap" });
  }
});

app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");
    const profile = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // 🐾 Automatically seed default roadmap if missing or empty
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
    
    // 🐾 Pull skills directly from UserProfile and sync with any legacy collection items
    const profileSkills = profile?.skills || [];
    const skillCollectionItems = await Skill.find({ user: userId });
    const collectionSkillNames = skillCollectionItems.map(s => s.name);
    const combinedSkills = Array.from(new Set([...profileSkills, ...collectionSkillNames]));

    const hasResume = Boolean(
      (profile && profile.resumeData && profile.resumeData.data) ||
      user.resumePath ||
      user.resume
    );

    // Synchronized calculation using combinedSkills instead of skillsArray
    let base = 15;
    let skillsCount = combinedSkills.length;
    let skillsPoints = Math.min(skillsCount * 10, 20);

    let projectsCount = projectsArray.length;
    let projectsPoints = Math.min(projectsCount * 10, 20);

    let hasContactOrBio = Boolean(
      (profile && (profile.bio || profile.github || profile.linkedin || profile.phone || profile.headline || profile.email)) ||
      user.bio || user.github || user.linkedin || user.phone || user.headline || user.email
    );
    let profilePoints = hasContactOrBio ? 15 : 0;

    const certsCount = (user.certificates && user.certificates.length) || 0;
    let certsPoints = Math.min(certsCount * 7.5, 15);

    let resumePoints = hasResume ? 15 : 0;

    const readinessScore = Math.min(
      base + skillsPoints + projectsPoints + profilePoints + certsPoints + resumePoints,
      100
    );

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      ...(user.toObject ? user.toObject() : {}),
      ...(profile ? profile.toObject() : {}),
      projects: projectsArray,
      skills: combinedSkills, // 🐾 Perfectly mapped from UserProfile
      roadmap: user.roadmap,   // 🐾 Explicitly include user-specific roadmap
      resumePath: hasResume ? "uploaded" : null,
      certificates: user.certificates || [],
      readinessScore,
      isProfileComplete: user.isProfileComplete || (profile ? !!profile.isProfileComplete : false),
    });
  } catch (err) {
    console.error("Error fetching user profile from MongoDB:", err);
    res
      .status(500)
      .json({ success: false, error: "Server error fetching profile data" });
  }
});

app.put("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const defaultRoadmap = [
      { month: "Month 1", topics: ["DSA Basics", "Arrays & Strings", "OOP Concepts"] },
      { month: "Month 2", topics: ["Trees & Graphs", "Database Basics", "SQL Practice"] },
      { month: "Month 3", topics: ["React.js", "Projects", "System Design"] },
      { month: "Month 4", topics: ["Mock Interviews", "Resume Preparation", "Job Applications"] }
    ];

    // 🐾 Check if incoming request or current DB record lacks roadmap items
    let roadmapToSave = req.body.roadmap;
    if (!roadmapToSave || roadmapToSave.length === 0) {
      const currentUser = await User.findById(userId);
      if (!currentUser.roadmap || currentUser.roadmap.length === 0) {
        roadmapToSave = defaultRoadmap;
      } else {
        roadmapToSave = currentUser.roadmap;
      }
    }

    const updateData = {
      ...req.body,
      roadmap: roadmapToSave,
      isProfileComplete: true,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await UserProfile.findOne({ userId });
    let user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      profilePic: profile ? profile.profilePic : "",
      streak: user.streak || 0,
      checkedDays: user.checkedDays || {},
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ success: false, error: "Server error fetching profile" });
  }
});

app.post("/api/profile/setup", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const {
      fullName,
      headline,
      location,
      gender,
      email,
      dob,
      phone,
      nationality,
      college,
      cgpa,
      degree,
      graduationYear,
      branch,
      educationLevel,
      github,
      linkedin,
      portfolio,
      leetcode,
      skills,
    } = req.body;

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? JSON.parse(skills)
        : [];

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        fullName,
        headline,
        location,
        gender,
        email,
        dob,
        phone,
        nationality,
        college,
        cgpa,
        degree,
        graduationYear,
        branch,
        educationLevel,
        github,
        linkedin,
        portfolio,
        leetcode,
        skills: parsedSkills,
        isProfileComplete: true,
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      profile: updatedProfile,
      message: "Profile saved successfully, meow! 🐾",
    });
  } catch (err) {
    console.error("Error saving profile details:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to save profile details",
    });
  }
});

app.post("/api/profile/certificates",
  verifyToken,
  uploadDisk.single("certificatePdf"),
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id || req.user._id;
      const { name, issuer } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No certificate PDF uploaded, meow! 🐾",
        });
      }

      const filePath = `http://localhost:8080/uploads/${req.file.filename}`;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      user.certificates.push({ name, issuer, link: filePath });
      await user.save();

      res.status(200).json({
        success: true,
        certificates: user.certificates,
        message: "Certificate saved successfully, meow! 🐾",
      });
    } catch (err) {
      console.error("Error saving certificate:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.get("/api/certificates/view/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending certificate file:", err);
      res.status(404).send("Certificate file not found, meow! 🐾");
    }
  });
});

app.delete("/api/profile/certificates/:certId",
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id || req.user._id;
      const certId = req.params.certId;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      user.certificates.pull(certId);
      await user.save();

      res.status(200).json({
        success: true,
        certificates: user.certificates,
        message: "Certificate deleted successfully, meow! 🐾",
      });
    } catch (err) {
      console.error("Error deleting certificate from MongoDB:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.get("/api/resume", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.json(null);
    }

    res.json({
      fileName: profile.resumeData.fileName,
      uploadDate: profile.resumeData.uploadDate,
      size: profile.resumeData.size,
      fileUrl: `http://localhost:8080/api/resume/download`,
    });
  } catch (err) {
    console.error("Error fetching resume:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/resume/ats-score", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(200).json({ success: false, hasResume: false });
    }

    res.status(200).json({
      success: true,
      hasResume: true,
      score: profile.atsScore,
      feedback: profile.atsFeedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const extractPdfText = async (binaryData) => {
  const parseFn =
    typeof pdfParse === "function" ? pdfParse : pdfParse.default || pdfParse;

  let buffer;
  if (Buffer.isBuffer(binaryData)) {
    buffer = binaryData;
  } else if (
    binaryData &&
    typeof binaryData === "object" &&
    binaryData.buffer
  ) {
    buffer = Buffer.from(binaryData.buffer);
  } else {
    buffer = Buffer.from(binaryData);
  }

  const pdfData = await parseFn(buffer);
  return pdfData.text;
};

async function evaluateResumeWithAI(resumeText, userId) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing in environment variables.");
  }

  const userProfile = await UserProfile.findOne({ userId });
  const userSkills = await Skill.find({ user: userId });
  const userProjects = await Project.find({ user: userId });

  const prompt = `
    Act as an expert ATS resume analyzer and strict technical recruiter. 
    Evaluate the following resume text based on the user's profile:
    - Target Role: ${userProfile?.headline || "Software Developer"}
    - Stored Skills: ${JSON.stringify(userSkills.map((s) => s.name))}
    - Stored Projects: ${JSON.stringify(userProjects.map((p) => p.title))}

    Calculate an objective ATS compatibility score from 0 to 100 and write a clean, plain-text critique (2-3 sentences) without using any internal quotation marks.
    
    Resume Text:
    """
    ${resumeText}
    """

    CRITICAL FORMATTING INSTRUCTION:
    Return ONLY a raw JSON object with no markdown backticks. Use this exact schema:
    {"score": [number], "feedback": "Your clear plain-text feedback here without quotes."}
  `;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Invalid response received from OpenRouter API.");
  }

  let rawText = data.choices[0].message.content.trim();
  rawText = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let result;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No valid JSON structure found in AI response.");
    }
  } catch (parseErr) {
    console.warn("JSON parsing fallback triggered for text:", rawText);
    const scoreMatch = rawText.match(/\b([0-9]{1,3})\b/);
    result = {
      score: scoreMatch ? Number(scoreMatch[1]) : 78,
      feedback:
        rawText.replace(/User Safety:[^\n]*/gi, "").trim() ||
        "Good overall structure. Add more technical keywords.",
    };
  }

  return {
    score: Number(result.score) || 75,
    feedback: result.feedback,
  };
}

app.post("/api/resume/upload",
  verifyToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id || req.user._id;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded, meow! 🐾" });
      }

      const uploadDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const size = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

      const resumeText = await extractPdfText(req.file.buffer);
      if (!resumeText || resumeText.trim().length < 30) {
        return res.status(400).json({
          success: false,
          error: "Could not extract readable text from PDF.",
        });
      }

      const aiResult = await evaluateResumeWithAI(resumeText, userId);

      const resumeData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
        uploadDate,
        size,
      };

      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        profile = new UserProfile({
          userId,
          resumeData,
          atsScore: aiResult.score,
          atsFeedback: aiResult.feedback,
        });
      } else {
        profile.resumeData = resumeData;
        profile.atsScore = aiResult.score;
        profile.atsFeedback = aiResult.feedback;
      }

      await profile.save();

      res.status(200).json({
        success: true,
        score: aiResult.score,
        feedback: aiResult.feedback,
        message: "Resume uploaded and analyzed successfully, meow! 🐾",
      });
    } catch (err) {
      console.error("Error uploading resume:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.post("/api/resume/recheck-score", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(400).json({
        success: false,
        error: "No resume found to recheck, meow! 🐾",
      });
    }

    const resumeText = await extractPdfText(profile.resumeData.data);
    const aiResult = await evaluateResumeWithAI(resumeText, userId);

    profile.atsScore = aiResult.score;
    profile.atsFeedback = aiResult.feedback;
    await profile.save();

    res.status(200).json({
      success: true,
      score: aiResult.score,
      feedback: aiResult.feedback,
      message: "Resume re-analyzed successfully, meow! 🐾",
    });
  } catch (err) {
    console.error("Recheck error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/resume/download", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(404).json({
        success: false,
        error: "Resume not found in database, meow! 🐾",
      });
    }

    res.setHeader(
      "Content-Type",
      profile.resumeData.contentType || "application/pdf",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${profile.resumeData.fileName || "Resume.pdf"}"`,
    );
    res.send(profile.resumeData.data);
  } catch (err) {
    console.error("Server error during download:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/profile/photo",
  verifyToken,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id || req.user._id;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No image uploaded, meow! 🐾" });
      }

      const filePath = `uploads/${req.file.filename}`;

      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        profile = new UserProfile({ userId, profilePic: filePath });
      } else {
        profile.profilePic = filePath;
      }

      await profile.save();

      res.status(200).json({
        success: true,
        profilePic: filePath,
        message: "Profile picture updated successfully, meow! 🐾",
      });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

app.post("/api/profile/select-avatar", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res
        .status(400)
        .json({ success: false, error: "No avatar selected, meow! 🐾" });
    }

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ userId, profilePic: avatarUrl });
    } else {
      profile.profilePic = avatarUrl;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      profilePic: avatarUrl,
      message: "Avatar updated successfully, meow! 🐾",
    });
  } catch (err) {
    console.error("Error saving preset avatar:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/chat", verifyToken, async (req, res) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: req.body.messages,
        }),
      },
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

// DSA Tracker API Routes
app.get("/api/problems", verifyToken, async (req, res) => {
  try {
    const rawId = req.user?.userId || req.user?.id || req.user?._id;

    if (!rawId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User ID missing from token" });
    }

    const userId = new mongoose.Types.ObjectId(rawId);

    // 🐾 Loop through the imported modular data array and seed/upsert into MongoDB
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
    res.json(problems);
  } catch (err) {
    console.error("BACKEND ERROR in GET /api/problems:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/problems/:id/status", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const { status } = req.body;

    const updated = await DsaProblem.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: { status } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // if (status === "Solved") {
    //   const today = new Date().toISOString().split("T")[0];
    //   await Activity.findOneAndUpdate(
    //     { user: userId, date: today },
    //     { $inc: { count: 1 } },
    //     { upsert: true, new: true },
    //   );
    // }
    if (status === "Solved") {
  const today = new Date().toISOString().split("T")[0];
  await Activity.findOneAndUpdate(
    { user: userId, date: today },
    { $inc: { count: 1 } },
    { upsert: true, new: true },
  );

  // 🐾 Automatically generate notification
  await Notification.create({
    user: userId,
    title: "DSA Problem Solved! 🎯",
    message: `You successfully solved "${updated.title}". Keep up the momentum!`,
    type: "dsa"
  });
}

    res.json(updated);
  } catch (err) {
    console.error("❌ BACKEND ERROR in PATCH status:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/checkin", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { date, energy, duration } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!user.checkedDays) {
      user.checkedDays = {};
    }

    const existingDayRecord = user.checkedDays[date] || {};
    const currentEnergy =
      (typeof existingDayRecord === "object" && existingDayRecord.energy) ||
      energy ||
      "flow";
    const absoluteMinutes = Number(duration) || 0;

    const updatedCheckedDays = {
      ...user.checkedDays,
      [date]: {
        energy: currentEnergy,
        duration: absoluteMinutes,
      },
    };

    let totalGlobalTime = 0;
    Object.keys(updatedCheckedDays).forEach((d) => {
      const rec = updatedCheckedDays[d];
      if (typeof rec === "object" && rec !== null) {
        totalGlobalTime += rec.duration || 0;
      } else {
        totalGlobalTime += Number(rec) || 0;
      }
    });

    await User.findByIdAndUpdate(userId, {
      checkedDays: updatedCheckedDays,
      activityTime: totalGlobalTime,
    });

    res.json({ success: true, activityTime: totalGlobalTime });
  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/track-time", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { date, minutes } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

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

app.get("/api/user/activity-time", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      activityTime: user.activityTime || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/streak", verifyToken, async (req, res) => {
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
        const hasActivity =
          (typeof record === "object" &&
            record !== null &&
            (record.duration > 0 || record.energy)) ||
          typeof record === "number" ||
          typeof record === "string";
        if (hasActivity) activeDaysInMonth++;
      }
    });

    const consistencyPercent =
      totalDaysInMonth > 0
        ? Math.round((activeDaysInMonth / totalDaysInMonth) * 100)
        : 0;

    let streak = 0;
    let checkDate = new Date();

    const getDateKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    let todayKey = getDateKey(checkDate);

    if (!checkedDays[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
      todayKey = getDateKey(checkDate);
      if (!checkedDays[todayKey]) {
        return res.json({
          streak: 0,
          consistency: 0,
          checkedDays,
          energyStates: user.energyStates,
        });
      }
    }

    while (true) {
      const key = getDateKey(checkDate);
      const dayRecord = checkedDays[key];

      const hasChecked =
        dayRecord &&
        ((typeof dayRecord === "object" &&
          (dayRecord.duration > 0 || dayRecord.energy)) ||
          typeof dayRecord === "number" ||
          typeof dayRecord === "string");

      if (hasChecked) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      streak,
      consistency: consistencyPercent,
      checkedDays,
      energyStates: user.energyStates,
    });
  } catch (err) {
    console.error("Streak calculation error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profile",
  verifyToken,
  uploadMemory.single("resume"),
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id || req.user._id;
      const {
        fullName,
        headline,
        location,
        gender,
        email,
        dob,
        phone,
        nationality,
        college,
        cgpa,
        degree,
        graduationYear,
        branch,
        educationLevel,
        github,
        linkedin,
        portfolio,
        leetcode,
        skills,
        profilePic,
      } = req.body;

      let resumeText = "";
      let atsScore = 75;
      let atsFeedback = "Resume uploaded successfully!";

      if (req.file && req.file.buffer) {
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text;
        } catch (parseErr) {
          console.error("Error parsing resume PDF buffer:", parseErr);
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
      if (graduationYear !== undefined)
        updateFields.graduationYear = graduationYear;
      if (branch !== undefined) updateFields.branch = branch;
      if (educationLevel !== undefined)
        updateFields.educationLevel = educationLevel;
      if (github !== undefined) updateFields.github = github;
      if (linkedin !== undefined) updateFields.linkedin = linkedin;
      if (portfolio !== undefined) updateFields.portfolio = portfolio;
      if (leetcode !== undefined) updateFields.leetcode = leetcode;
      if (profilePic !== undefined) updateFields.profilePic = profilePic;

      if (skills) {
        try {
          updateFields.skills =
            typeof skills === "string" ? JSON.parse(skills) : skills;
        } catch (e) {
          updateFields.skills = Array.isArray(skills) ? skills : [];
        }
      }

      if (req.file && req.file.buffer) {
        updateFields.resumeData = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
          uploadDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
        };
      }

      if (resumeText) {
        updateFields.resumeText = resumeText;
        updateFields.atsScore = atsScore;
        updateFields.atsFeedback = atsFeedback;
      }

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateFields },
        { upsert: true, returnDocument: "after" },
      );

      res.status(200).json({
        success: true,
        profile: updatedProfile,
        message: "Profile saved successfully, meow! 🐾",
      });
    } catch (err) {
      console.error("❌ CRITICAL PROFILE SAVE ERROR:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Server error saving profile",
      });
    }
  },
);

app.put("/api/profile/avatar", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { avatar } = req.body;

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ userId, profilePic: avatar });
    } else {
      profile.profilePic = avatar;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      profilePic: profile.profilePic,
      message: "Avatar updated successfully, meow! 🐾",
    });
  } catch (err) {
    console.error("Error updating avatar:", err);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

app.get("/api/ai-suggestions", verifyToken, async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id || req.user?.userId || req.user?.sub;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "User ID missing from token." });
    }

    const userId = mongoose.Types.ObjectId.isValid(rawUserId) 
      ? new mongoose.Types.ObjectId(rawUserId) 
      : rawUserId;

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    let userRecs = await AIRecommendation.findOne({ userId, date: today });

    if (!userRecs) {
      let dbUser = null;
      try {
        if (typeof User !== "undefined") {
          dbUser = await User.findById(userId);
        }
      } catch (e) {
        console.log("User fetch error:", e.message);
      }

      const userName = dbUser?.fullName || dbUser?.username || "Developer";
      const userProjects = dbUser?.projects || [];
      const userSkills = dbUser?.skills || [];
      const hasResume = Boolean(dbUser?.resume || dbUser?.resumeData || dbUser?.resumeUrl);

      // 🐾 Expanded master pool of diverse tasks
      const masterTaskPool = [
        {
          id: "projects_1",
          title: "Scale Your Portfolio Architecture",
          description: `${userName}, you have ${userProjects.length} project(s) logged. Add category filters or map integrations to level up your full-stack showcase!`,
          icon: "Code2",
          route: "/projects",
          action: "Build Project"
        },
        {
          id: "projects_2",
          title: "Backend Route & Middleware Audit",
          description: `Review your Express routing logic and Mongoose performance across your ${userProjects.length} active projects, ${userName}!`,
          icon: "Code2",
          route: "/projects",
          action: "Optimize Code"
        },
        {
          id: "resume_1",
          title: "Upload & Parse Your Resume",
          description: `${userName}, your profile is missing a resume file. Upload one to boost your ATS compatibility score.`,
          icon: "BookOpen",
          route: "/profile",
          action: "Upload Resume"
        },
        {
          id: "resume_2",
          title: "Bullet Point Impact Review",
          description: "Spend 15 minutes strengthening your project descriptions using strong action verbs and quantifiable metrics.",
          icon: "BookOpen",
          route: "/profile",
          action: "Refine Resume"
        },
        {
          id: "dsa_1",
          title: "DSA Focus: Two Pointers & Arrays",
          description: "Solve 2 medium problems focusing on array partitioning and sliding window patterns today.",
          icon: "FileText",
          route: "/dsa-tracker",
          action: "Start Practice"
        },
        {
          id: "dsa_2",
          title: "DSA Focus: Hash Maps & Frequency Counters",
          description: "Practice optimizing time complexity down to $O(n)$ using efficient hash map structures.",
          icon: "FileText",
          route: "/dsa-tracker",
          action: "Start Practice"
        },
        {
          id: "dsa_3",
          title: "DSA Focus: Recursion & Backtracking",
          description: "Tackle tree traversal or subset generation problems to sharpen your core logical reasoning.",
          icon: "FileText",
          route: "/dsa-tracker",
          action: "Start Practice"
        },
        {
          id: "skills_1",
          title: "Log Your Core Tech Stack",
          description: `${userName}, add your primary programming languages and frameworks to unlock custom AI challenges.`,
          icon: "BookOpen",
          route: "/profile",
          action: "Add Skills"
        },
        {
          id: "system_design",
          title: "System Design: Caching & Redis",
          description: "Explore how to implement caching layers in Node.js applications to minimize database load.",
          icon: "Code2",
          route: "/projects",
          action: "Learn Design"
        }
      ];

      // 🐾 Seeded pseudo-random shuffle unique to each user's ID string + today's date
      const seedRandom = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };

      const userSeed = seedRandom(rawUserId.toString() + today);
      
      // Shuffle master pool uniquely based on the user's seed
      const shuffledPool = [...masterTaskPool];
      for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = (userSeed + i) % (i + 1);
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
      }

      // Pick top 3 unique tasks for this specific user today
      const selectedSuggestions = shuffledPool.slice(0, 3);

      userRecs = await AIRecommendation.create({
        userId: rawUserId,
        date: today,
        suggestions: selectedSuggestions
      });
    }

    res.json({ success: true, suggestions: userRecs.suggestions });
  } catch (err) {
    console.error("CRITICAL AI-SUGGESTIONS ERROR:", err);
    res.status(500).json({ success: false, error: err.message || "Server error while generating study plan." });
  }
});
app.get("/api/user/skills-progress", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    // 🐾 Pull skills from UserProfile and the separate Skill collection to cover both sources
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
    return res.status(200).json({
      skills: [],
    });
  }
});

app.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
});
// Clear all notifications for the logged-in user
app.delete("/api/notifications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    await Notification.deleteMany({ user: userId });
    res.status(200).json({ success: true, message: "All notifications cleared successfully" });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ success: false, error: "Failed to clear notifications" });
  }
});

// 🐾 Fetch all user roadmaps with skill-matched progress calculation
app.get("/api/roadmaps", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const roadmaps = await Roadmap.find({ user: userId });

    const updatedRoadmaps = [];
    for (const roadmap of roadmaps) {
      const roadmapObj = roadmap.toObject ? roadmap.toObject() : roadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      updatedRoadmaps.push(roadmapObj);
    }

    res.status(200).json({ success: true, roadmaps: updatedRoadmaps });
  } catch (err) {
    console.error("Error fetching roadmaps:", err);
    res.status(500).json({ success: false, error: "Failed to fetch roadmaps" });
  }
});

// 🐾 Fetch the active roadmap with skill-matched progress calculation
app.get("/api/roadmap/active", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let activeRoadmap = await Roadmap.findOne({ user: userId, isActive: true });

    if (!activeRoadmap) {
      activeRoadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
      if (activeRoadmap) {
        activeRoadmap.isActive = true;
        await activeRoadmap.save();
      }
    }

    if (activeRoadmap) {
      const roadmapObj = activeRoadmap.toObject ? activeRoadmap.toObject() : activeRoadmap;
      roadmapObj.phases = await calculatePhaseProgress(roadmapObj.phases, userId);
      activeRoadmap = roadmapObj;
    }

    res.status(200).json({ success: true, roadmap: activeRoadmap });
  } catch (err) {
    console.error("Error fetching active roadmap:", err);
    res.status(500).json({ success: false, error: "Failed to fetch active roadmap" });
  }
});

// Start Server on Port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running live on port ${PORT}!`);
});