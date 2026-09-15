const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }, 
  topics: [{ type: String }], 
  status: { type: String, default: "Not Started" },
  progress: { type: String, default: "0%" }
});

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  track: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  phases: [phaseSchema]
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);