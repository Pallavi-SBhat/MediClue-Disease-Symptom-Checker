const express = require("express");
const axios = require("axios");
const UserMedicalData = require("../models/UserMedicalData");
const router = express.Router();

// Proxy endpoint: Symptoms
router.get("/symptoms", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/api/symptoms");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching symptoms from Flask:", error);
    res.status(500).json({ success: false, error: "Failed to fetch symptoms" });
  }
});

// Save prediction results
router.post("/predict", async (req, res) => {
  const { clerkUserId, age, gender, symptoms, userProfile } = req.body;
  console.log("✅ Received in Node:", req.body);

  try {
    // Call Flask API
    const response = await axios.post("http://localhost:5000/api/predict", req.body, {
      headers: { "Content-Type": "application/json" },
    });

    const data = response.data;

    // Save in MongoDB (upsert: create if not exists)
    const updatedUser = await UserMedicalData.findOneAndUpdate(
      { clerkUserId },
      { age, gender, symptoms, predictions: data.predictions, timestamp: new Date(), userProfile },
      { upsert: true, new: true }
    );

    console.log("✅ Saved to MongoDB:", updatedUser);

    res.json(data);
  } catch (error) {
    console.error("Error calling Flask API or saving:", error);
    res.status(500).json({ success: false, error: "Prediction failed" });
  }
});

// Return stored results
router.get("/results/:clerkUserId", async (req, res) => {
  const { clerkUserId } = req.params;
  try {
    const data = await UserMedicalData.findOne({ clerkUserId });
    if (!data) return res.status(404).json({ error: "No medical data found" });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

module.exports = router;
