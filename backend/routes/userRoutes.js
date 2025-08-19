const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Save user (only if not exists)
router.post("/save", async (req, res) => {
  const { clerkUserId, name, email } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ success: false, error: "clerkUserId is required" });
  }

  try {
    let user = await User.findOne({ clerkUserId });
    if (!user) {
      user = await User.create({ clerkUserId, name, email });
      console.log("✅ New user saved:", user);
    } else {
      console.log("ℹ️ User already exists:", user.clerkUserId);
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ success: false, error: "Failed to save user" });
  }
});


module.exports = router;
