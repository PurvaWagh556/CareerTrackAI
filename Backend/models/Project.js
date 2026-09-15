const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "In Progress" },
  techStack: String,
  link: String,  
  github: String 
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);