const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
require("dotenv").config();

const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Ticket = require("./models/Ticket");
const verifyToken = require("./middleware/verifyToken");

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
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    
    return callback(new Error('CORS policy violation: This origin is not allowed.'), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

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

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://careertrackai.onrender.com' 
  : 'http://localhost:8080';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/google/callback`
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

app.get("/", (req, res) => {
  res.send("Backend server is running live!");
});

app.use("/api", require("./routes/authRoutes"));
app.use("/api/skills", require("./routes/skillsRoutes"));
app.use("/api/projects", require("./routes/projectsRoutes"));
app.use("/api/goals", require("./routes/goalsRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/roadmap", require("./routes/roadmapRoutes"));
app.use("/api/roadmaps", require("./routes/roadmapRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/metrics", require("./routes/metricsRoutes"));
app.use("/api", require("./routes/dsaRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/certificates", require("./routes/certificatesRoutes"));
app.use("/api/resources", require("./routes/resourcesRoutes"));

app.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    res.status(200).json({ success: true, notifications: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
      return res.status(400).json({ success: false, error: "All fields are required!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Incorrect current password!" });
    }

    user.password = hashPassword(newPassword);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ success: false, error: "Server error during password update" });
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

app.post("/api/profile", verifyToken, uploadMemory.any(), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profileData = { ...req.body };

    // 1. Parse skills back into an array if they were sent as a JSON string from FormData
    if (profileData.skills && typeof profileData.skills === "string") {
      try {
        profileData.skills = JSON.parse(profileData.skills);
      } catch (e) {
        profileData.skills = [];
      }
    }

    // 2. Handle uploaded resume file if present
    if (req.files && req.files.length > 0) {
      const resumeFile = req.files.find(f => f.fieldname === "resume");
      if (resumeFile) {
        profileData.resumeData = {
          data: resumeFile.buffer,
          contentType: resumeFile.mimetype,
          fileName: resumeFile.originalname,
          uploadDate: new Date().toISOString(),
          size: resumeFile.size.toString()
        };
      }
    }

    // 3. Find or create profile using strict userId reference matching your schema
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId, ...profileData });
    } else {
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== undefined) {
          profile[key] = profileData[key];
        }
      });
    }
    
    await profile.save();

    // 4. Explicitly mark user profile as complete so guards don't loop
    await User.findByIdAndUpdate(userId, { isProfileComplete: true });

    res.status(200).json({ success: true, message: "Profile saved successfully!", profile });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const calculateStreak = (checkedDays) => {
  if (!checkedDays || typeof checkedDays !== "object") return 0;
  
  let streak = 0;
  const curr = new Date();
  
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let key = formatDateKey(curr);
  let record = checkedDays[key];
  let isActive = record && (typeof record === 'object' ? (record.duration > 0 || record.energy) : Number(record) > 0);

  // If today isn't checked yet, check yesterday to see if a streak is active
  if (!isActive) {
    curr.setDate(curr.getDate() - 1);
    key = formatDateKey(curr);
    record = checkedDays[key];
    isActive = record && (typeof record === 'object' ? (record.duration > 0 || record.energy) : Number(record) > 0);
    if (!isActive) return 0;
  }

  // Count backwards consecutively
  while (true) {
    key = formatDateKey(curr);
    record = checkedDays[key];
    isActive = record && (typeof record === 'object' ? (record.duration > 0 || record.energy) : Number(record) > 0);
    
    if (isActive) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

app.get("/api/streak", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const calculatedStreak = calculateStreak(user.checkedDays);

    res.status(200).json({
      success: true,
      streak: calculatedStreak,
      checkedDays: user.checkedDays || {}
    });
  } catch (err) {
    console.error("Error fetching streak:", err);
    res.status(500).json({ success: false, error: err.message });
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

    const calculatedStreak = calculateStreak(user.checkedDays);

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      isProfileComplete: user.isProfileComplete || !!profile,
      fullName: profile?.fullName || user.fullName || "",
      streak: calculatedStreak,
      checkedDays: user.checkedDays || {},
    });
  } catch (err) {
    console.error("Error fetching user profile guard:", err);
    res.status(500).json({ success: false, error: "Server error fetching user profile" });
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
    const currentEnergy = (typeof existingDayRecord === "object" && existingDayRecord.energy) || energy || "flow";
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

    const calculatedStreak = calculateStreak(updatedCheckedDays);

    await User.findByIdAndUpdate(userId, {
      checkedDays: updatedCheckedDays,
      activityTime: totalGlobalTime,
      streak: calculatedStreak,
    });

    res.json({ success: true, activityTime: totalGlobalTime, streak: calculatedStreak });
  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/support", async (req, res) => {
  const { name, email, message, source } = req.body;

  if (!message || !email) {
    return res.status(400).json({ success: false, error: "Fields cannot be empty" });
  }

  try {
    const newTicket = new Ticket({
      name,
      email,
      message,
      source: source || "Website",
    });
    await newTicket.save();

    const formSource = source === "Support Page" ? "Support Ticket 🎟️" : "Contact Message 📬";
    
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "User-Agent": "CareerTrackApp/1.0"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", 
        to: process.env.EMAIL_USER,
        reply_to: email,
        subject: `New ${formSource} from ${name || "User"}`,
        text: `You received a new submission from your dashboard (${source || "Website"}):\n\nSender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`
      })
    });

    res.status(200).json({ success: true, message: "Ticket saved and sent successfully!" });
  } catch (error) {
    console.error("Error saving ticket or sending email:", error);
    res.status(500).json({ success: false, error: "Failed to process request" });
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

app.use(express.static(path.resolve(__dirname, "../Frontend/careertrack-ai/dist")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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