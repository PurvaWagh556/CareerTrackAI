const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["dsa", "roadmap", "profile", "system"], default: "system" },
  createdAt: { type: Date, default: Date.now, expires: 604800 }
});

module.exports = mongoose.model("Notification", notificationSchema);