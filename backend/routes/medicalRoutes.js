const express = require("express");
const UserMedicalData = require("../models/userMedicalData");

const router = express.Router();

/**
 * Save or update medical analysis results (Upsert)
 */
router.post("/save", async (req, res) => {
  try {
    const { clerkUserId, age, gender, symptoms, predictions, userProfile } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const updatedRecord = await UserMedicalData.findOneAndUpdate(
      { clerkUserId }, // find by Clerk ID
      {
        $set: {
          age,
          gender,
          symptoms: symptoms || [],
          predictions: predictions || [],
          userProfile: userProfile || {},
          timestamp: new Date(),
        },
      },
      { new: true, upsert: true } // ✅ create if not exists, return updated doc
    );

    res.status(201).json({ success: true, record: updatedRecord });
  } catch (error) {
    console.error("Error saving medical data:", error);
    res.status(500).json({ success: false, error: "Failed to save medical data" });
  }
});


/**
 * Get latest results for a user
 */
router.post("/results", async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId required" });
    }

    const medicalRecord = await UserMedicalData.findOne({ clerkUserId })
      .sort({ timestamp: -1 });

    if (!medicalRecord) {
      return res.status(404).json({ error: "No medical data found" });
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

module.exports = router;
