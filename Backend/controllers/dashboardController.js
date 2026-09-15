const User = require('../models/User');
const Note = require('../models/Note');

const calculateReadinessScore = async (userId) => {
  const user = await User.findById(userId);
  const notes = await Note.find({ user: userId });
  const certificates = user.certificates || [];
  
  let score = 0;

  // 1. Profile completeness (25%)
  if (user && user.name && user.email) score += 25;

  // 2. Portfolio / Links / Resume (25%)
  if (user?.resumeUrl) score += 15;
  if (user?.githubUrl || user?.linkedinUrl) score += 10;

  // 3. Certificates & Notes (30%)
  score += Math.min(certificates.length * 10, 20);
  score += Math.min(notes.length * 5, 10);

  // 4. Consistency & Check-ins (20%)
  const checkinCount = Object.keys(user?.checkins?.history || {}).length;
  score += Math.min(checkinCount * 2, 20);

  return Math.min(Math.round(score), 100);
};

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Calculate your dynamic score from the database
    const score = await calculateReadinessScore(userId);

    // 2. Send it back in the response object
    res.status(200).json({
      success: true,
      message: "Welcome to the secure dashboard!",
      readinessScore: score, 
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { getDashboardData };
