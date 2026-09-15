const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 1 },
});

module.exports = mongoose.model('Activity', activitySchema);