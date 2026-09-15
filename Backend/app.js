if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");

const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Ticket = require("./models/Ticket");
const verifyToken = require("./middleware/verifyToken");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
const multer = require("multer");
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL 
].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('CORS policy violation: This origin is not allowed.'), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.static(path.resolve(__dirname, "../Frontend/careertrack-ai/dist")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  const [salt, key] = storedPassword.split(":");
  if (!salt || !key) return false;
  const hashedBuffer = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return key === hashedBuffer;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/api/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            isProfileComplete: false,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Root Route
app.get("/", (req, res) => {
  res.send("Backend server is running live!");
});

// Register Modular & Auth Routers
app.use("/api", authRoutes);
app.use("/api/skills", require("./routes/skillsRoutes"));
app.use("/api/projects", require("./routes/projectsRoutes"));
app.use("/api/goals", require("./routes/goalsRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/roadmap", require("./routes/roadmapRoutes"));
app.use("/api/roadmaps", require("./routes/roadmapRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api/metrics", require("./routes/metricsRoutes"));
app.use("/api", require("./routes/dsaRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/certificates", require("./routes/certificatesRoutes"));

app.get("/api/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: { username: user.username, email: user.email },
      readiness: 75,
      metrics: { streak: 5, totalHours: 42, completedTasks: 18 },
      skills: user.skills || [],
      roadmap: [
        { month: "Month 1", title: "Fundamentals", description: "DSA Basics & OOP" },
        { month: "Month 2", title: "Databases", description: "MongoDB & SQL" }
      ],
      suggestions: [
        { title: "Practice Graphs", description: "2 medium problems" },
        { title: "React Optimization", description: "Review Hooks" }
      ]
    });
  } catch (err) {
    console.error("Dashboard endpoint error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.put("/api/user/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required!" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: "Incorrect current password!" 
      });
    }

    user.password = hashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error during password update" 
    });
  }
});

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    let user = await User.findById(userId).select("-password");
    let profile = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      fullName: profile?.fullName || user.fullName || "N/A",
      gender: profile?.gender || user.gender || "N/A",
      dob: profile?.dob || user.dob || "N/A",
      phone: profile?.phone || user.phone || "N/A",
      nationality: profile?.nationality || user.nationality || "N/A",
      profilePic: profile?.profilePic || user.profilePic || "",
      streak: user.streak || 0,
      checkedDays: user.checkedDays || {},
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, error: "Server error fetching profile" });
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
      ("flow");
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
      subject: `New ${formSource} from ${name || "User"}`,
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

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/careertrack-ai/dist/index.html"));
});
// Connect to MongoDB & Start Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running live on port ${PORT}!`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));