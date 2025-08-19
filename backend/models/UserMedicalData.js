const mongoose = require("mongoose");

const userMedicalDataSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true }, // unique per user
  age: Number,
  gender: String,
  symptoms: [String],
  predictions: Array,
  timestamp: { type: Date, default: Date.now },
  userProfile: Object,
});

module.exports = mongoose.model("UserMedicalData", userMedicalDataSchema);
