const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, default: "" },
  headline: { type: String, default: "" },
  location: { type: String, default: "" },
  gender: { type: String, default: "Female" },
  email: { type: String, default: "" },
  dob: { type: String, default: "" },
  phone: { type: String, default: "" },
  nationality: { type: String, default: "Indian" },
  
  resumeData: {
    data: Buffer,
    contentType: String,
    fileName: String,
    uploadDate: String,
    size: String
  },

  atsScore: { type: Number, default: null },
  atsFeedback: { type: String, default: "" },

  college: { type: String, default: "" },
  cgpa: { type: String, default: "" },
  degree: { type: String, default: "" },
  graduationYear: { type: String, default: "" },
  branch: { type: String, default: "" },
  educationLevel: { type: String, default: "Undergraduate" },

  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  leetcode: { type: String, default: "" },

  skills: { type: [String], default: [] },

  profilePic: { type: String, default: "" },
  resumePath: { type: String, default: "" },
  certificates: [
    {
      name: String,
      issuer: String,
      link: String
    }
  ],
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);