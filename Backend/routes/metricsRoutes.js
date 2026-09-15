const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const DsaProblem = require("../models/DsaProblem");
const CardMetric = require("../models/CardMetric");
const Project = require("../models/Project");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;   
    const profile = await UserProfile.findOne({ userId });
    const user = await User.findById(userId);
    const solvedDsaCount = await DsaProblem.countDocuments({ user: userId, status: "Solved" });
    const certsCount = (user?.certificates || []).filter(c => c && (c.name || c.title)).length;
    const realAtsScore = profile && profile.atsScore !== undefined ? profile.atsScore : null;

    const projectCount = await Project.countDocuments({ user: userId });

    const checkedDays = user?.checkedDays || {};
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

    const bulkOps = [];

    if (realAtsScore !== null && profile?.resumeData?.data) {
      bulkOps.push({
        updateOne: {
          filter: { user: userId, category: "Resume" },
          update: {
            $set: {
              title: "Peak ATS Score",
              value: `${realAtsScore} / 100`,
              statusText: realAtsScore >= 75 ? "Elite Resume Optimization 🌟" : "AI Compatibility Checked ✨",
            }
          },
          upsert: true
        }
      });
    }

    if (currentStreak > 0) {
      bulkOps.push({
        updateOne: {
          filter: { user: userId, category: "Streak" },
          update: {
            $set: {
              title: "Consistency Streak",
              value: `${currentStreak} Days`,
              statusText: `Active Streak Record 🔥`,
            }
          },
          upsert: true
        }
      });
    }

    if (solvedDsaCount > 0) {
      bulkOps.push({
        updateOne: {
          filter: { user: userId, category: "DSA" },
          update: {
            $set: {
              title: "Problem Solver Badge",
              value: `${solvedDsaCount} Solved`,
              statusText: solvedDsaCount >= 25 ? "Advanced Algorithm Master 🏆" : "Consistent Problem Solving 🚀",
            }
          },
          upsert: true
        }
      });
    }

    if (certsCount > 0) {
      bulkOps.push({
        updateOne: {
          filter: { user: userId, category: "Certificates" },
          update: {
            $set: {
              title: "Verified Credentials",
              value: `${certsCount} Earned`,
              statusText: "Professional Certification Unlocked 🎉",
            }
          },
          upsert: true
        }
      });
    }


    if (projectCount > 0) {
      bulkOps.push({
        updateOne: {
          filter: { user: userId, category: "Projects" },
          update: {
            $set: {
              title: "Registered Projects",
              value: `${projectCount} Active`,
              statusText: "Full-Stack Web Apps Deployed 🚀",
              icon: "FolderGit2" 
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await CardMetric.bulkWrite(bulkOps);
    }

    const allBadges = await CardMetric.find({ user: userId }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json(allBadges);
  } catch (error) {
    console.error("Error fetching milestones and badges:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

router.post("/", verifyToken, async (req, res) => {
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

module.exports = router;