const mongoose = require("mongoose");

const aiRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  suggestions: [
    {
      title: String,
      description: String,
      icon: String,
      route: String,
      action: String
    }
  ]
});

module.exports = mongoose.models.AIRecommendation || mongoose.model("AIRecommendation", aiRecommendationSchema);