const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const medicalRoutes = require("./routes/medicalRoutes");
const app = express();
const PORT = 4000;

// MongoDB connection
require('dotenv').config(); // at the very top of server.js
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Store medical data in memory
let storedMedicalData = null;

// Existing routes
app.get("/api/symptoms", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/api/symptoms");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching symptoms from Flask:", error);
    res.status(500).json({ success: false, error: "Failed to fetch symptoms" });
  }
});

app.post("/api/predict", async (req, res) => {
  console.log("✅ Received in Node:", req.body);

  try {
    const response = await axios.post("http://localhost:5000/api/predict", req.body, {
      headers: { "Content-Type": "application/json" },
    });

    const data = response.data;
    storedMedicalData = data; // keep for /results
    console.log("✅ Response from Flask:", data);

    res.json(data);
  } catch (error) {
    console.error("Error calling Flask API:", error);
    res.status(500).json({ success: false, error: "Prediction failed" });
  }
});

app.post("/api/results", (req, res) => {
  if (!storedMedicalData) return res.status(404).json({ error: "No medical data found" });
  res.json(storedMedicalData);
});

// New user route
app.use("/api/user", userRoutes);

app.use("/api/medical", medicalRoutes);

app.get("/test", (req, res) => {
  res.send("Node server is working!");
});

app.listen(PORT, () => {
  console.log(`✅ Node server running on http://localhost:${PORT}`);
});
