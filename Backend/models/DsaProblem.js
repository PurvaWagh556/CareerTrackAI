const mongoose = require("mongoose");

const dsaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  platform: { type: String, default: "LeetCode" },
  status: { type: String, enum: ["Solved", "In Progress", "To Do"], default: "To Do" },
  link: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("DsaProblem", dsaSchema);