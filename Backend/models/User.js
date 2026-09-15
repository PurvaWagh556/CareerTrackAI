const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { 
    type: String, 
    required: function() { 
      return !this.googleId; 
    } 
  },
  isProfileComplete: { type: Boolean, default: false },
  roadmap: [
    {
      month: { type: String },
      topics: [{ type: String }]
    }
  ],
  googleId: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatar: { type: String, default: "" },
  streak: { type: Number, default: 0 },
  lastCheckinDate: { type: String, default: "" },
  activityTime: { type: Number, default: 0 },
  checkedDays: { type: Object, default: {} },
  skills: { type: [String], default: [] },
  certificates: [
  {
    name: String,
    issuer: String,
    link: String,
    data: Buffer,
    contentType: String,
    fileName: String,
    uploadDate: String,
    size: String
  }
],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);