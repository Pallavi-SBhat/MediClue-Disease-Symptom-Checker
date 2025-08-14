const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Flask ML service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Check if backend is running
    const backendStatus = { status: 'Backend server running', timestamp: new Date().toISOString() };
    
    // Check if ML service is running
    const mlResponse = await axios.get(`${ML_SERVICE_URL}/health`);
    
    res.json({
      backend: backendStatus,
      ml_service: mlResponse.data,
      overall_status: 'All services running'
    });
  } catch (error) {
    res.status(500).json({
      backend: { status: 'Backend running' },
      ml_service: { status: 'ML service unavailable', error: error.message },
      overall_status: 'Partial service failure'
    });
  }
});

// Get available symptoms
app.get('/api/symptoms', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/symptoms`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching symptoms:', error.message);
    res.status(500).json({ error: 'Failed to fetch symptoms from ML service' });
  }
});

// Predict disease
app.post('/api/predict-disease', async (req, res) => {
  try {
    const { symptoms, age, gender, additionalInfo } = req.body;
    
    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Symptoms array is required and cannot be empty' });
    }

    // Prepare data for ML service
    const mlData = {
      symptoms,
      age: age || 25,
      gender: gender || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Call Flask ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 second timeout
    });

    // Log the request for monitoring
    console.log(`Disease prediction requested:`, {
      symptoms: symptoms.length,
      age,
      gender,
      predictions: mlResponse.data.predictions?.length || 0
    });

    // Return ML service response
    res.json({
      ...mlResponse.data,
      request_id: Date.now().toString(),
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in disease prediction:', error.message);
    
    if (error.response) {
      // ML service returned an error
      res.status(error.response.status).json({
        error: 'ML service error',
        details: error.response.data
      });
    } else if (error.code === 'ECONNREFUSED') {
      // ML service is down
      res.status(503).json({
        error: 'ML service is currently unavailable',
        message: 'Please try again later'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process disease prediction'
      });
    }
  }
});

// Emergency symptom check
app.post('/api/emergency-check', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/emergency-check`, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error in emergency check:', error.message);
    res.status(500).json({ error: 'Failed to check emergency symptoms' });
  }
});

// User feedback endpoint (for future use)
app.post('/api/feedback', (req, res) => {
  const { prediction_id, rating, comments } = req.body;
  
  // In a real app, you'd save this to database
  console.log('User feedback received:', { prediction_id, rating, comments });
  
  res.json({ 
    message: 'Thank you for your feedback!',
    feedback_id: Date.now().toString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 Backend server starting...');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 ML Service URL: ${ML_SERVICE_URL}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/symptoms');
  console.log('   POST /api/predict-disease');
  console.log('   POST /api/emergency-check');
  console.log('   POST /api/feedback');
});