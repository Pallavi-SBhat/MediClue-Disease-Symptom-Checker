# MediClue Flask Backend

This is the Flask backend for the MediClue application with machine learning capabilities for disease prediction.

## Features

- **Machine Learning Model**: Random Forest classifier for disease prediction
- **Symptom Analysis**: Processes user symptoms and predicts potential diseases
- **Disease Information**: Provides detailed information about predicted diseases
- **Hospital Finder**: Returns nearby hospitals based on specialty
- **RESTful API**: Clean API endpoints for frontend integration

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Flask Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
- **URL**: `GET /`
- **Description**: Check if the API is running
- **Response**: API status and available endpoints

### 2. Predict Disease
- **URL**: `POST /predict`
- **Description**: Predict diseases based on symptoms
- **Request Body**:
```json
{
  "symptoms": ["fever", "headache", "cough"],
  "age": 25,
  "gender": "male"
}
```
- **Response**:
```json
{
  "success": true,
  "predictions": [
    {
      "disease": "Flu",
      "confidence": 85.2,
      "probability": 0.852,
      "data": {
        "description": "A contagious respiratory illness",
        "severity": "moderate",
        "remedies": ["Rest and stay hydrated", "Take antiviral medications"],
        "specialist": "General Practitioner",
        "urgency": "medium"
      }
    }
  ]
}
```

### 3. Get Symptoms
- **URL**: `GET /symptoms`
- **Description**: Get list of available symptoms
- **Response**: List of symptoms with descriptions

### 4. Get Hospitals
- **URL**: `GET /hospitals?specialty=Cardiology`
- **Description**: Get nearby hospitals, optionally filtered by specialty
- **Response**: List of hospitals with details

## Machine Learning Model

### Training Data
- **Diseases**: 10 common medical conditions
- **Symptoms**: 20 different symptoms
- **Samples**: 500 training samples with realistic symptom combinations

### Model Details
- **Algorithm**: Random Forest Classifier
- **Features**: Binary symptom indicators
- **Accuracy**: ~85-90% on test data
- **Output**: Disease predictions with confidence scores

### Supported Diseases
1. Common Cold
2. Flu
3. Migraine
4. Gastroenteritis
5. Pneumonia
6. Hypertension
7. Diabetes
8. Arthritis
9. Bronchitis
10. Food Poisoning

## Model Training

The model automatically trains on first run and saves to `disease_model.pkl`. To retrain:

1. Delete the existing model file
2. Restart the Flask server
3. The model will retrain automatically

## CORS Configuration

The backend is configured with CORS to allow requests from the React frontend running on different ports.

## Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (missing required fields)
- 500: Internal Server Error

## Security Notes

This is a demo application. For production use, consider:
- Input validation and sanitization
- Rate limiting
- Authentication and authorization
- HTTPS encryption
- Database integration for persistent storage