from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os
import json
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import uuid


app = Flask(__name__)
app.secret_key = 'sk_test_4FlxbLx83f55UTOsFo51UNtDaN2raetFlQrcwnHsCR'
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://127.0.0.1:5173'])

class MedicalDatabase:
    def __init__(self):
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for storing user data and sessions"""
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        # User profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                date_of_birth TEXT,
                gender TEXT,
                height INTEGER,
                weight INTEGER,
                blood_type TEXT,
                allergies TEXT,
                medications TEXT,
                medical_history TEXT,
                emergency_contact_name TEXT,
                emergency_contact_phone TEXT,
                emergency_contact_relation TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                phone TEXT,
                profile_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Symptom analysis sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT,
                symptoms TEXT,
                age INTEGER,
                gender TEXT,
                duration TEXT,
                predictions TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles (user_id)
            )
        ''')
        
        conn.commit()
        conn.close()

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.symptoms_list = []
        self.diseases_info = {}
        self.medical_db = MedicalDatabase()
        self.load_or_train_model()
    
    def create_sample_data(self):
        """Create comprehensive medical training data"""
        # Extended symptoms list
        symptoms = [
            'fever', 'headache', 'cough', 'fatigue', 'shortness_of_breath',
            'nausea', 'dizziness', 'muscle_pain', 'joint_pain', 'chest_pain',
            'sore_throat', 'runny_nose', 'vomiting', 'diarrhea', 'abdominal_pain',
            'back_pain', 'skin_rash', 'loss_of_appetite', 'weight_loss', 'night_sweats',
            'chills', 'weakness', 'confusion', 'difficulty_swallowing', 'heart_palpitations',
            'numbness', 'tingling', 'blurred_vision', 'ear_pain', 'swollen_glands'
        ]
        
        # Comprehensive disease database with symptoms
        disease_symptoms = {
            'Common Cold': {
                'symptoms': ['cough', 'runny_nose', 'sore_throat', 'fatigue', 'headache'],
                'probability': [0.9, 0.8, 0.7, 0.6, 0.5]
            },
            'Influenza (Flu)': {
                'symptoms': ['fever', 'headache', 'muscle_pain', 'fatigue', 'cough', 'chills'],
                'probability': [0.9, 0.8, 0.8, 0.7, 0.6, 0.7]
            },
            'Migraine': {
                'symptoms': ['headache', 'nausea', 'dizziness', 'blurred_vision'],
                'probability': [0.95, 0.7, 0.6, 0.5]
            },
            'Gastroenteritis': {
                'symptoms': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'],
                'probability': [0.8, 0.7, 0.9, 0.8, 0.6]
            },
            'Pneumonia': {
                'symptoms': ['fever', 'cough', 'shortness_of_breath', 'chest_pain', 'fatigue'],
                'probability': [0.9, 0.8, 0.7, 0.7, 0.8]
            },
            'Hypertension': {
                'symptoms': ['headache', 'dizziness', 'chest_pain', 'heart_palpitations'],
                'probability': [0.6, 0.7, 0.5, 0.6]
            },
            'Type 2 Diabetes': {
                'symptoms': ['fatigue', 'weight_loss', 'loss_of_appetite', 'blurred_vision'],
                'probability': [0.8, 0.7, 0.6, 0.5]
            },
            'Arthritis': {
                'symptoms': ['joint_pain', 'muscle_pain', 'fatigue', 'weakness'],
                'probability': [0.9, 0.7, 0.6, 0.5]
            },
            'Bronchitis': {
                'symptoms': ['cough', 'chest_pain', 'fatigue', 'shortness_of_breath'],
                'probability': [0.9, 0.7, 0.6, 0.5]
            },
            'Food Poisoning': {
                'symptoms': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'],
                'probability': [0.8, 0.8, 0.9, 0.8, 0.6]
            },
            'Anxiety Disorder': {
                'symptoms': ['heart_palpitations', 'dizziness', 'shortness_of_breath', 'fatigue'],
                'probability': [0.8, 0.7, 0.6, 0.7]
            },
            'Sinusitis': {
                'symptoms': ['headache', 'runny_nose', 'fatigue', 'ear_pain'],
                'probability': [0.8, 0.9, 0.6, 0.5]
            }
        }
        
        # Disease information database
        self.diseases_info = {
            'Common Cold': {
                'description': 'A viral infection of the upper respiratory tract that affects the nose and throat',
                'severity': 'mild',
                'remedies': [
                    'Rest and get plenty of sleep (7-9 hours)',
                    'Drink lots of fluids (water, herbal tea, warm broth)',
                    'Use a humidifier or breathe steam from hot shower',
                    'Take over-the-counter pain relievers if needed',
                    'Gargle with warm salt water for sore throat'
                ],
                'specialist': 'General Practitioner',
                'urgency': 'low',
                'duration': '7-10 days',
                'when_to_seek_help': 'If symptoms worsen after 7 days or fever exceeds 101.3°F'
            },
            'Influenza (Flu)': {
                'description': 'A contagious respiratory illness caused by influenza viruses that can cause mild to severe illness',
                'severity': 'moderate',
                'remedies': [
                    'Rest and stay hydrated with plenty of fluids',
                    'Take antiviral medications if prescribed within 48 hours',
                    'Use fever reducers and pain relievers as directed',
                    'Avoid contact with others to prevent spread',
                    'Eat nutritious foods to support immune system'
                ],
                'specialist': 'General Practitioner',
                'urgency': 'medium',
                'duration': '3-7 days',
                'when_to_seek_help': 'If difficulty breathing, chest pain, or high fever persists'
            },
            'Migraine': {
                'description': 'A neurological condition characterized by intense, debilitating headaches often accompanied by nausea and sensitivity',
                'severity': 'moderate',
                'remedies': [
                    'Rest in a dark, quiet room',
                    'Apply cold or warm compress to head/neck',
                    'Take prescribed migraine medications as directed',
                    'Practice relaxation techniques and deep breathing',
                    'Stay hydrated and maintain regular sleep schedule'
                ],
                'specialist': 'Neurologist',
                'urgency': 'medium',
                'duration': '4-72 hours',
                'when_to_seek_help': 'If sudden severe headache or neurological symptoms occur'
            },
            'Gastroenteritis': {
                'description': 'Inflammation of the stomach and intestines, usually caused by viral or bacterial infection',
                'severity': 'mild',
                'remedies': [
                    'Stay hydrated with clear fluids (water, broths, electrolyte solutions)',
                    'Follow BRAT diet (Bananas, Rice, Applesauce, Toast)',
                    'Rest and avoid dairy products temporarily',
                    'Take probiotics to restore gut bacteria',
                    'Gradually return to normal diet as symptoms improve'
                ],
                'specialist': 'Gastroenterologist',
                'urgency': 'medium',
                'duration': '1-3 days',
                'when_to_seek_help': 'If severe dehydration, blood in stool, or high fever'
            },
            'Pneumonia': {
                'description': 'Infection that inflames air sacs in one or both lungs, which may fill with fluid',
                'severity': 'severe',
                'remedies': [
                    'Take prescribed antibiotics for bacterial pneumonia',
                    'Get plenty of rest and sleep',
                    'Drink fluids to help loosen secretions and prevent dehydration',
                    'Use a humidifier or breathe warm, moist air',
                    'Take fever reducers and pain medications as prescribed'
                ],
                'specialist': 'Pulmonologist',
                'urgency': 'high',
                'duration': '1-3 weeks',
                'when_to_seek_help': 'Seek immediate care for difficulty breathing or chest pain'
            },
            'Hypertension': {
                'description': 'High blood pressure - a condition where blood pressure in arteries is persistently elevated',
                'severity': 'moderate',
                'remedies': [
                    'Maintain a healthy diet low in sodium and rich in fruits/vegetables',
                    'Exercise regularly (150 minutes moderate activity per week)',
                    'Take prescribed medications consistently',
                    'Monitor blood pressure regularly at home',
                    'Limit alcohol consumption and quit smoking'
                ],
                'specialist': 'Cardiologist',
                'urgency': 'medium',
                'duration': 'Chronic condition requiring management',
                'when_to_seek_help': 'If blood pressure readings consistently above 140/90'
            },
            'Type 2 Diabetes': {
                'description': 'A metabolic disorder characterized by high blood sugar due to insulin resistance',
                'severity': 'moderate',
                'remedies': [
                    'Monitor blood sugar levels regularly',
                    'Follow a diabetic-friendly diet with controlled carbohydrates',
                    'Take prescribed medications (metformin, insulin) as directed',
                    'Exercise regularly to improve insulin sensitivity',
                    'Maintain healthy weight and regular meal timing'
                ],
                'specialist': 'Endocrinologist',
                'urgency': 'medium',
                'duration': 'Chronic condition requiring lifelong management',
                'when_to_seek_help': 'If blood sugar consistently above 250 mg/dL'
            },
            'Arthritis': {
                'description': 'Inflammation of one or more joints causing pain, swelling, and reduced range of motion',
                'severity': 'moderate',
                'remedies': [
                    'Take anti-inflammatory medications as prescribed',
                    'Apply hot or cold therapy to affected joints',
                    'Engage in gentle exercise and stretching',
                    'Maintain a healthy weight to reduce joint stress',
                    'Consider physical therapy for joint mobility'
                ],
                'specialist': 'Rheumatologist',
                'urgency': 'low',
                'duration': 'Chronic condition with flare-ups',
                'when_to_seek_help': 'If sudden severe joint pain or signs of infection'
            },
            'Bronchitis': {
                'description': 'Inflammation of the lining of bronchial tubes that carry air to and from lungs',
                'severity': 'moderate',
                'remedies': [
                    'Rest and drink plenty of fluids',
                    'Use a humidifier or inhale steam',
                    'Take cough suppressants if prescribed',
                    'Avoid smoke, dust, and other lung irritants',
                    'Take expectorants to help clear mucus'
                ],
                'specialist': 'Pulmonologist',
                'urgency': 'medium',
                'duration': '2-3 weeks',
                'when_to_seek_help': 'If coughing up blood or breathing difficulties worsen'
            },
            'Food Poisoning': {
                'description': 'Illness caused by eating food contaminated with bacteria, viruses, or toxins',
                'severity': 'mild',
                'remedies': [
                    'Stay hydrated with clear fluids and electrolyte solutions',
                    'Rest and avoid solid foods initially',
                    'Gradually return to bland foods (BRAT diet)',
                    'Avoid dairy, caffeine, and fatty foods',
                    'Seek medical attention if symptoms worsen or persist'
                ],
                'specialist': 'General Practitioner',
                'urgency': 'medium',
                'duration': '1-5 days',
                'when_to_seek_help': 'If severe dehydration, high fever, or bloody stools'
            },
            'Anxiety Disorder': {
                'description': 'Mental health condition characterized by excessive worry, fear, and physical symptoms',
                'severity': 'moderate',
                'remedies': [
                    'Practice deep breathing and relaxation techniques',
                    'Engage in regular physical exercise',
                    'Consider therapy (CBT) or counseling',
                    'Take prescribed anti-anxiety medications if needed',
                    'Maintain regular sleep schedule and limit caffeine'
                ],
                'specialist': 'Psychiatrist',
                'urgency': 'medium',
                'duration': 'Varies, may be chronic',
                'when_to_seek_help': 'If panic attacks or thoughts of self-harm occur'
            },
            'Sinusitis': {
                'description': 'Inflammation or swelling of the tissue lining the sinuses',
                'severity': 'mild',
                'remedies': [
                    'Use saline nasal rinses or sprays',
                    'Apply warm compresses to face',
                    'Take decongestants or antihistamines',
                    'Stay hydrated and use a humidifier',
                    'Take pain relievers for headache and facial pain'
                ],
                'specialist': 'ENT Specialist',
                'urgency': 'low',
                'duration': '7-10 days (acute), longer for chronic',
                'when_to_seek_help': 'If symptoms persist beyond 10 days or worsen'
            }
        }
        
        # Generate training data
        data = []
        for disease, info in disease_symptoms.items():
            # Generate positive cases (with the disease)
            for _ in range(100):  # 100 samples per disease
                sample = {symptom: 0 for symptom in symptoms}
                
                # Add primary symptoms with their probabilities
                for symptom, prob in zip(info['symptoms'], info['probability']):
                    if symptom in sample and np.random.random() < prob:
                        sample[symptom] = 1
                
                # Add some random symptoms (noise) - but less likely
                random_symptoms = np.random.choice(symptoms, size=np.random.randint(0, 2), replace=False)
                for symptom in random_symptoms:
                    if np.random.random() < 0.1:  # 10% chance for random symptoms
                        sample[symptom] = 1
                
                sample['disease'] = disease
                data.append(sample)
        
        return pd.DataFrame(data)
    
    def load_or_train_model(self):
        """Load existing model or train a new one"""
        model_path = 'disease_model.pkl'
        
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.model = model_data['model']
                    self.scaler = model_data.get('scaler')
                    self.symptoms_list = model_data['symptoms_list']
                    self.diseases_info = model_data['diseases_info']
                print("Model loaded successfully!")
                return
            except Exception as e:
                print(f"Error loading model: {e}")
        
        # Train new model
        print("Training new model...")
        self.train_model()
    
    def train_model(self):
        """Train the disease prediction model"""
        # Create sample data
        df = self.create_sample_data()
        
        # Prepare features and target
        self.symptoms_list = [col for col in df.columns if col != 'disease']
        X = df[self.symptoms_list]
        y = df['disease']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model with better parameters
        self.model = RandomForestClassifier(
            n_estimators=200, 
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model accuracy: {accuracy:.2f}")
        
        # Save model
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'symptoms_list': self.symptoms_list,
            'diseases_info': self.diseases_info
        }
        
        with open('disease_model.pkl', 'wb') as f:
            pickle.dump(model_data, f)
        
        print("Model trained and saved successfully!")
    
    def predict_disease(self, symptoms_input, age=None, gender=None, user_profile=None):
        """Predict disease based on symptoms and user profile"""
        if not self.model:
            return []
        
        # Convert symptoms to model input format
        symptom_vector = [0] * len(self.symptoms_list)
        
        for symptom in symptoms_input:
            # Normalize symptom name
            normalized_symptom = symptom.lower().replace(' ', '_').replace('-', '_')
            if normalized_symptom in self.symptoms_list:
                idx = self.symptoms_list.index(normalized_symptom)
                symptom_vector[idx] = 1
        
        # Scale the input
        if self.scaler:
            symptom_vector_scaled = self.scaler.transform([symptom_vector])
        else:
            symptom_vector_scaled = [symptom_vector]
        
        # Get predictions with probabilities
        probabilities = self.model.predict_proba(symptom_vector_scaled)[0]
        classes = self.model.classes_
        
        # Create predictions list
        predictions = []
        for i, prob in enumerate(probabilities):
            if prob > 0.05:  # Only include predictions with >5% probability
                disease = classes[i]
                confidence = prob * 100
                
                # Adjust confidence based on user profile if available
                if user_profile:
                    confidence = self.adjust_confidence_for_profile(disease, confidence, user_profile, age, gender)
                
                prediction = {
                    'disease': disease,
                    'confidence': min(confidence, 95),  # Cap at 95%
                    'probability': prob,
                    'data': self.diseases_info.get(disease, {
                        'description': 'Condition requires professional medical evaluation',
                        'severity': 'unknown',
                        'remedies': ['Consult a healthcare professional for proper diagnosis'],
                        'specialist': 'General Practitioner',
                        'urgency': 'medium',
                        'duration': 'Variable',
                        'when_to_seek_help': 'Consult a doctor for proper evaluation'
                    })
                }
                predictions.append(prediction)
        
        # Sort by confidence
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return predictions[:5]  # Return top 5 predictions
    
    def adjust_confidence_for_profile(self, disease, confidence, user_profile, age, gender):
        """Adjust confidence based on user profile data"""
        # Age-based adjustments
        if age:
            if disease in ['Hypertension', 'Type 2 Diabetes', 'Arthritis'] and age > 50:
                confidence *= 1.1
            elif disease in ['Common Cold', 'Influenza (Flu)'] and age < 30:
                confidence *= 1.05
        
        # Gender-based adjustments
        if gender:
            if disease == 'Migraine' and gender.lower() == 'female':
                confidence *= 1.1
        
        # Medical history adjustments
        medical_history = user_profile.get('medical_history', '').lower()
        if medical_history:
            if 'diabetes' in medical_history and disease == 'Type 2 Diabetes':
                confidence *= 1.2
            elif 'heart' in medical_history and disease == 'Hypertension':
                confidence *= 1.15
        
        return confidence

# Initialize the predictor
predictor = DiseasePredictor()

@app.route('/')
def home():
    """API home endpoint"""
    return jsonify({
        'message': 'MediClue Flask API is running!',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'predict': 'POST /api/predict - Predict disease based on symptoms',
            'symptoms': 'GET /api/symptoms - Get list of available symptoms',
            'hospitals': 'GET /api/hospitals - Get nearby hospitals',
            'profile': 'POST/GET /api/profile - Manage user profile',
            'history': 'GET /api/history - Get analysis history'
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """Predict disease based on symptoms"""
    try:
        data = request.get_json(silent=True)
        
        if not data or 'symptoms' not in data:
            return jsonify({'error': 'Symptoms are required'}), 400
        
        symptoms = data['symptoms']
        age = data.get('age')
        gender = data.get('gender')
        duration = data.get('duration')
        user_id = data.get('userId')
        user_profile = data.get('userProfile', {})
        
        if not symptoms:
            return jsonify({'error': 'At least one symptom is required'}), 400
        
        # Get predictions
        predictions = predictor.predict_disease(symptoms, age, gender, user_profile)
        
        # Store analysis session in database
        session_id = str(uuid.uuid4())
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO analysis_sessions 
            (session_id, user_id, symptoms, age, gender, duration, predictions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (session_id, user_id, json.dumps(symptoms), age, gender, duration, json.dumps(predictions)))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'predictions': predictions,
            'input_symptoms': symptoms,
            'patient_info': {
                'age': age,
                'gender': gender,
                'duration': duration
            },
            'timestamp': datetime.datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get list of available symptoms with descriptions"""
    symptoms_data = [
        {'id': '1', 'name': 'fever', 'description': 'Elevated body temperature', 'category': 'general'},
        {'id': '2', 'name': 'headache', 'description': 'Pain in the head or upper neck', 'category': 'neurological'},
        {'id': '3', 'name': 'cough', 'description': 'Sudden expulsion of air from the lungs', 'category': 'respiratory'},
        {'id': '4', 'name': 'fatigue', 'description': 'Feeling of tiredness or exhaustion', 'category': 'general'},
        {'id': '5', 'name': 'shortness of breath', 'description': 'Difficulty breathing', 'category': 'respiratory'},
        {'id': '6', 'name': 'nausea', 'description': 'Feeling of sickness with inclination to vomit', 'category': 'gastrointestinal'},
        {'id': '7', 'name': 'dizziness', 'description': 'Feeling faint, woozy, or unsteady', 'category': 'neurological'},
        {'id': '8', 'name': 'muscle pain', 'description': 'Pain in muscles', 'category': 'musculoskeletal'},
        {'id': '9', 'name': 'joint pain', 'description': 'Pain in joints', 'category': 'musculoskeletal'},
        {'id': '10', 'name': 'chest pain', 'description': 'Pain in the chest area', 'category': 'cardiovascular'},
        {'id': '11', 'name': 'sore throat', 'description': 'Pain or irritation in the throat', 'category': 'respiratory'},
        {'id': '12', 'name': 'runny nose', 'description': 'Nasal discharge', 'category': 'respiratory'},
        {'id': '13', 'name': 'vomiting', 'description': 'Forceful expulsion of stomach contents', 'category': 'gastrointestinal'},
        {'id': '14', 'name': 'diarrhea', 'description': 'Loose, watery bowel movements', 'category': 'gastrointestinal'},
        {'id': '15', 'name': 'abdominal pain', 'description': 'Pain in the stomach area', 'category': 'gastrointestinal'},
        {'id': '16', 'name': 'back pain', 'description': 'Pain in the back', 'category': 'musculoskeletal'},
        {'id': '17', 'name': 'skin rash', 'description': 'Changes in skin color or texture', 'category': 'dermatological'},
        {'id': '18', 'name': 'loss of appetite', 'description': 'Reduced desire to eat', 'category': 'general'},
        {'id': '19', 'name': 'weight loss', 'description': 'Unintentional reduction in body weight', 'category': 'general'},
        {'id': '20', 'name': 'night sweats', 'description': 'Excessive sweating during sleep', 'category': 'general'}
    ]
    
    return jsonify({
        'success': True,
        'symptoms': symptoms_data,
        'categories': ['general', 'respiratory', 'neurological', 'gastrointestinal', 'cardiovascular', 'musculoskeletal', 'dermatological']
    })

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    """Get nearby hospitals with filtering options"""
    specialty = request.args.get('specialty', '')
    city = request.args.get('city', '')
    
    hospitals = [
        {
            'id': 1,
            'name': 'Metropolitan Medical Center',
            'address': '123 Health Avenue, New York, NY 10001',
            'phone': '(212) 555-1234',
            'specialties': ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'General Practitioner'],
            'rating': 4.5,
            'distance': 2.3,
            'emergency': True,
            'coordinates': {'lat': 40.7128, 'lng': -74.0060}
        },
        {
            'id': 2,
            'name': 'Central City Hospital',
            'address': '456 Care Street, Chicago, IL 60601',
            'phone': '(312) 555-6789',
            'specialties': ['Orthopedics', 'General Surgery', 'Emergency Medicine', 'Pulmonologist'],
            'rating': 4.2,
            'distance': 3.1,
            'emergency': True,
            'coordinates': {'lat': 41.8781, 'lng': -87.6298}
        },
        {
            'id': 3,
            'name': 'Sunshine Health Clinic',
            'address': '789 Wellness Road, Los Angeles, CA 90001',
            'phone': '(213) 555-9876',
            'specialties': ['Family Medicine', 'Dermatology', 'Psychiatry', 'General Practitioner'],
            'rating': 4.8,
            'distance': 1.8,
            'emergency': False,
            'coordinates': {'lat': 34.0522, 'lng': -118.2437}
        },
        {
            'id': 4,
            'name': 'Advanced Care Institute',
            'address': '321 Medical Plaza, Boston, MA 02101',
            'phone': '(617) 555-4321',
            'specialties': ['Pulmonology', 'Rheumatology', 'Gastroenterology', 'Endocrinologist'],
            'rating': 4.6,
            'distance': 4.2,
            'emergency': False,
            'coordinates': {'lat': 42.3601, 'lng': -71.0589}
        },
        {
            'id': 5,
            'name': 'Heart & Vascular Institute',
            'address': '987 Cardiac Way, Houston, TX 77001',
            'phone': '(713) 555-2468',
            'specialties': ['Cardiology', 'Cardiovascular Surgery', 'Interventional Cardiology'],
            'rating': 4.7,
            'distance': 5.4,
            'emergency': True,
            'coordinates': {'lat': 29.7604, 'lng': -95.3698}
        },
        {
            'id': 6,
            'name': 'Neurological Sciences Center',
            'address': '246 Brain Street, Seattle, WA 98101',
            'phone': '(206) 555-1357',
            'specialties': ['Neurology', 'Neurosurgery', 'Psychiatry', 'Neurologist'],
            'rating': 4.4,
            'distance': 6.8,
            'emergency': False,
            'coordinates': {'lat': 47.6062, 'lng': -122.3321}
        },
        {
            'id': 7,
            'name': 'Women\'s Health Center',
            'address': '135 Wellness Circle, Phoenix, AZ 85001',
            'phone': '(602) 555-9753',
            'specialties': ['Gynecology', 'Obstetrics', 'Family Medicine', 'General Practitioner'],
            'rating': 4.3,
            'distance': 3.7,
            'emergency': False,
            'coordinates': {'lat': 33.4484, 'lng': -112.0740}
        },
        {
            'id': 8,
            'name': 'Emergency Care Center',
            'address': '654 Quick Response Ave, Miami, FL 33101',
            'phone': '(305) 555-7890',
            'specialties': ['Emergency Medicine', 'Urgent Care', 'General Practitioner'],
            'rating': 4.1,
            'distance': 0.9,
            'emergency': True,
            'coordinates': {'lat': 25.7617, 'lng': -80.1918}
        },
        {
            'id': 9,
            'name': 'ENT Specialists Clinic',
            'address': '432 Hearing Lane, Denver, CO 80201',
            'phone': '(303) 555-3456',
            'specialties': ['ENT Specialist', 'Otolaryngology', 'Audiology'],
            'rating': 4.5,
            'distance': 7.2,
            'emergency': False,
            'coordinates': {'lat': 39.7392, 'lng': -104.9903}
        }
    ]
    
    # Filter by specialty if provided
    if specialty:
        filtered_hospitals = []
        for hospital in hospitals:
            if any(specialty.lower() in spec.lower() for spec in hospital['specialties']):
                filtered_hospitals.append(hospital)
        hospitals = filtered_hospitals
    
    # Sort by distance (closest first)
    hospitals.sort(key=lambda x: x['distance'])
    
    return jsonify({
        'success': True,
        'hospitals': hospitals,
        'filter': {
            'specialty': specialty if specialty else 'all',
            'city': city if city else 'all'
        },
        'total_found': len(hospitals)
    })

@app.route('/api/profile', methods=['POST'])
def save_user_profile():
    """Save user profile data"""
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'User ID is required'}), 400
        
        user_id = data['user_id']
        profile_data = data.get('profile_data', {})
        
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        # Check if profile exists
        cursor.execute('SELECT user_id FROM user_profiles WHERE user_id = ?', (user_id,))
        exists = cursor.fetchone()
        
        if exists:
            # Update existing profile
            cursor.execute('''
                UPDATE user_profiles SET
                    first_name = ?, last_name = ?, email = ?, date_of_birth = ?,
                    gender = ?, height = ?, weight = ?, blood_type = ?,
                    allergies = ?, medications = ?, medical_history = ?,
                    emergency_contact_name = ?, emergency_contact_phone = ?,
                    emergency_contact_relation = ?, address = ?, city = ?,
                    state = ?, zip_code = ?, phone = ?, profile_completed = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (
                profile_data.get('firstName'), profile_data.get('lastName'),
                profile_data.get('email'), profile_data.get('dateOfBirth'),
                profile_data.get('gender'), profile_data.get('height'),
                profile_data.get('weight'), profile_data.get('bloodType'),
                profile_data.get('allergies'), profile_data.get('medications'),
                profile_data.get('medicalHistory'), profile_data.get('emergencyContactName'),
                profile_data.get('emergencyContactPhone'), profile_data.get('emergencyContactRelation'),
                profile_data.get('address'), profile_data.get('city'),
                profile_data.get('state'), profile_data.get('zipCode'),
                profile_data.get('phone'), True, user_id
            ))
        else:
            # Insert new profile
            cursor.execute('''
                INSERT INTO user_profiles (
                    user_id, first_name, last_name, email, date_of_birth,
                    gender, height, weight, blood_type, allergies,
                    medications, medical_history, emergency_contact_name,
                    emergency_contact_phone, emergency_contact_relation,
                    address, city, state, zip_code, phone, profile_completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, profile_data.get('firstName'), profile_data.get('lastName'),
                profile_data.get('email'), profile_data.get('dateOfBirth'),
                profile_data.get('gender'), profile_data.get('height'),
                profile_data.get('weight'), profile_data.get('bloodType'),
                profile_data.get('allergies'), profile_data.get('medications'),
                profile_data.get('medicalHistory'), profile_data.get('emergencyContactName'),
                profile_data.get('emergencyContactPhone'), profile_data.get('emergencyContactRelation'),
                profile_data.get('address'), profile_data.get('city'),
                profile_data.get('state'), profile_data.get('zipCode'),
                profile_data.get('phone'), True
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Profile saved successfully',
            'user_id': user_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile data"""
    try:
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM user_profiles WHERE user_id = ?', (user_id,))
        profile = cursor.fetchone()
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        # Convert to dictionary
        columns = [description[0] for description in cursor.description]
        profile_dict = dict(zip(columns, profile))
        
        conn.close()
        
        return jsonify({
            'success': True,
            'profile': profile_dict
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history/<user_id>', methods=['GET'])
def get_analysis_history(user_id):
    """Get user's analysis history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT session_id, symptoms, age, gender, duration, predictions, timestamp
            FROM analysis_sessions 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        sessions = cursor.fetchall()
        
        # Convert to list of dictionaries
        columns = [description[0] for description in cursor.description]
        history = []
        
        for session in sessions:
            session_dict = dict(zip(columns, session))
            # Parse JSON fields
            session_dict['symptoms'] = json.loads(session_dict['symptoms'])
            session_dict['predictions'] = json.loads(session_dict['predictions'])
            history.append(session_dict)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'history': history,
            'total_sessions': len(history)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_analysis_session(session_id):
    """Get specific analysis session details"""
    try:
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analysis_sessions WHERE session_id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Convert to dictionary
        columns = [description[0] for description in cursor.description]
        session_dict = dict(zip(columns, session))
        
        # Parse JSON fields
        session_dict['symptoms'] = json.loads(session_dict['symptoms'])
        session_dict['predictions'] = json.loads(session_dict['predictions'])
        
        conn.close()
        
        return jsonify({
            'success': True,
            'session': session_dict
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM user_profiles')
        profile_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM analysis_sessions')
        session_count = cursor.fetchone()[0]
        
        conn.close()
        
        # Test model
        model_status = 'loaded' if predictor.model is not None else 'not loaded'
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'database': {
                'profiles': profile_count,
                'sessions': session_count
            },
            'model': {
                'status': model_status,
                'symptoms_count': len(predictor.symptoms_list),
                'diseases_count': len(predictor.diseases_info)
            },
            'timestamp': datetime.datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get basic analytics (for admin purposes)"""
    try:
        days = request.args.get('days', 30, type=int)
        
        conn = sqlite3.connect('medical_data.db')
        cursor = conn.cursor()
        
        # Get analysis count by date
        cursor.execute('''
            SELECT DATE(timestamp) as date, COUNT(*) as count
            FROM analysis_sessions 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY DATE(timestamp)
            ORDER BY date
        '''.format(days))
        
        daily_stats = cursor.fetchall()
        
        # Get most common symptoms
        cursor.execute('''
            SELECT symptoms FROM analysis_sessions
            WHERE timestamp >= datetime('now', '-{} days')
        '''.format(days))
        
        all_symptoms = []
        for row in cursor.fetchall():
            symptoms = json.loads(row[0])
            all_symptoms.extend(symptoms)
        
        # Count symptom frequency
        from collections import Counter
        symptom_counts = Counter(all_symptoms)
        
        # Get most predicted diseases
        cursor.execute('''
            SELECT predictions FROM analysis_sessions
            WHERE timestamp >= datetime('now', '-{} days')
        '''.format(days))
        
        all_diseases = []
        for row in cursor.fetchall():
            predictions = json.loads(row[0])
            if predictions:
                # Get top prediction for each session
                all_diseases.append(predictions[0]['disease'])
        
        disease_counts = Counter(all_diseases)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'period_days': days,
            'daily_analyses': [{'date': date, 'count': count} for date, count in daily_stats],
            'top_symptoms': dict(symptom_counts.most_common(10)),
            'top_diseases': dict(disease_counts.most_common(10)),
            'total_analyses': len(all_diseases)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create backend directory if it doesn't exist
    os.makedirs('backend', exist_ok=True)
    
    print("Starting MediClue Flask API...")
    print("Available endpoints:")
    print("- GET / : API information")
    print("- POST /api/predict : Disease prediction")
    print("- GET /api/symptoms : Available symptoms")
    print("- GET /api/hospitals : Hospital listings")
    print("- POST /api/profile : Save user profile")
    print("- GET /api/profile/<user_id> : Get user profile")
    print("- GET /api/history/<user_id> : Get analysis history")
    print("- GET /api/session/<session_id> : Get session details")
    print("- GET /api/health : Health check")
    print("- GET /api/analytics : Analytics data")
    
    app.run(debug=True, host='0.0.0.0', port=5000)