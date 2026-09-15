const mongoose = require('mongoose');

const cardMetricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },       
  value: { type: String, required: true },       
  statusText: { type: String, required: true },  
  category: { type: String, default: "project" }, 
}, { timestamps: true });

module.exports = mongoose.model('CardMetric', cardMetricSchema);