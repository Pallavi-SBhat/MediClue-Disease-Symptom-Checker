import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Search, Plus, Trash2, ArrowRight, User, AlertCircle } from 'lucide-react';

const SymptomChecker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [symptomsLoading, setSymptomsLoading] = useState(true);
  const navigate = useNavigate();

  // Get user data from Clerk with localStorage fallback
  const { user } = useUser();
  
  // Try to get profile from Clerk metadata first, then localStorage as fallback
  let userProfile = {};
  
  try {
    userProfile = user?.unsafeMetadata?.profile || {};
    
    // If no profile in Clerk, try localStorage
    if (Object.keys(userProfile).length === 0) {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        userProfile = parsedProfile.profile || {};
        console.log('Using profile from localStorage:', userProfile);
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    userProfile = {};
  }

  // Pre-fill form with user profile data
  useEffect(() => {
    if (userProfile.dateOfBirth) {
      const birthDate = new Date(userProfile.dateOfBirth);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      setAge(calculatedAge.toString());
    }
    if (userProfile.gender) {
      setGender(userProfile.gender);
    }
  }, [userProfile]);

  // Fetch available symptoms from Flask API
  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    try {
      setSymptomsLoading(true);
      setError('');
      
      // You can import these functions from the config file
      const response = await fetch('http://localhost:4000/api/symptoms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch symptoms: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.symptoms) {
        // Transform API data to match component expectations
        const transformedSymptoms = data.symptoms.map(symptom => ({
          id: symptom.id,
          name: symptom.name,
          description: symptom.description,
          category: symptom.category,
          bodyPart: symptom.category,
          severity: 'moderate', // Default as API doesn't provide this
          commonNames: [symptom.name], // Use name as common name
          keywords: [symptom.description.toLowerCase()] // Use description as keywords
        }));
        
        setAvailableSymptoms(transformedSymptoms);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      setError(`Failed to load symptoms: ${error.message}. Using offline symptom list.`);
      
      // Fallback to basic symptoms if API fails
      setAvailableSymptoms([
        { id: '1', name: 'headache', description: 'Pain in the head or upper neck', category: 'neurological' },
        { id: '2', name: 'fever', description: 'Elevated body temperature', category: 'general' },
        { id: '3', name: 'cough', description: 'Sudden expulsion of air from the lungs', category: 'respiratory' },
        { id: '4', name: 'fatigue', description: 'Feeling of tiredness or exhaustion', category: 'general' },
        { id: '5', name: 'nausea', description: 'Feeling of sickness with inclination to vomit', category: 'gastrointestinal' },
        { id: '6', name: 'dizziness', description: 'Feeling faint, woozy, or unsteady', category: 'neurological' },
        { id: '7', name: 'muscle pain', description: 'Pain in muscles', category: 'musculoskeletal' },
        { id: '8', name: 'shortness of breath', description: 'Difficulty breathing', category: 'respiratory' }
      ]);
    } finally {
      setSymptomsLoading(false);
    }
  };

  const getFilteredSymptoms = () => {
    if (searchTerm.length < 2) return [];
    
    const searchWords = searchTerm.toLowerCase().split(' ');
    
    return availableSymptoms.filter(symptom => {
      if (selectedSymptoms.includes(symptom.name)) return false;
      
      return searchWords.every(word => {
        const matchesName = symptom.name.toLowerCase().includes(word);
        const matchesDescription = symptom.description.toLowerCase().includes(word);
        const matchesCategory = symptom.category?.toLowerCase().includes(word);

        return matchesName || matchesDescription || matchesCategory;
      });
    });
  };

  const handleAddSymptom = (symptomName) => {
    if (!selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
      setSearchTerm('');
    }
  };

  const handleRemoveSymptom = (symptomName) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomName));
  };

  const handleNext = async () => {
    if (currentStep === 1 && selectedSymptoms.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2 && age && gender && duration) {
      setIsLoading(true);
      setError('');
      
      try {
        // Prepare data for API call
        const apiPayload = {
          symptoms: selectedSymptoms,
          age: parseInt(age),
          gender: gender,
          duration: duration,
          userId: user?.id,
          userProfile: userProfile
        };

        console.log('Sending API request:', apiPayload);

        // Call Flask API for disease prediction
        const response = await fetch('http://localhost:4000/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for session handling
          body: JSON.stringify(apiPayload)
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API response data:', result);
        
        if (result.success && result.predictions) {
          // Store results and navigate to results page
          const medicalData = {
            symptoms: selectedSymptoms,
            age: parseInt(age),
            gender,
            duration,
            userId: user?.id,
            userProfile: userProfile,
            predictions: result.predictions,
            sessionId: result.session_id,
            timestamp: result.timestamp || new Date().toISOString(),
            patientInfo: result.patient_info,
            inputSymptoms: result.input_symptoms
          };

          console.log('Storing medical data:', medicalData);
          sessionStorage.setItem('medicalData', JSON.stringify(medicalData));
          navigate('/results');
        } else {
          throw new Error(result.error || 'Invalid response from server');
        }
      } catch (error) {
        console.error('Error calling prediction API:', error);
        setError(`Analysis failed: ${error.message}. Please check your connection and try again.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredSymptoms = getFilteredSymptoms();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Header with user info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            AI-Powered Symptom Checker
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Welcome, {user?.firstName || 'User'}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            Describe your symptoms and get personalized health insights based on your profile
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className={`flex-1 h-2 ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-200'} rounded-l-full`}></div>
            <div className={`flex-1 h-2 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'} rounded-r-full`}></div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-sm font-medium text-blue-600">Symptoms</div>
            <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              Confirm Details
            </div>
          </div>
        </div>

        {/* Step 1: Symptom Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Loading state for symptoms */}
            {symptomsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading symptoms...</p>
              </div>
            ) : (
              <>
                {/* Symptom search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Describe your symptoms (e.g., 'headache', 'feeling tired', 'chest pain')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {filteredSymptoms.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSymptoms.map(symptom => (
                        <div 
                          key={symptom.id}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleAddSymptom(symptom.name)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium capitalize">{symptom.name}</div>
                              <div className="text-sm text-gray-600">{symptom.description}</div>
                              <div className="text-xs text-gray-500 mt-1 capitalize">
                                Category: {symptom.category}
                              </div>
                            </div>
                            <Plus className="h-5 w-5 text-blue-500 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Common symptoms quick add */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Quick Add Common Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSymptoms.slice(0, 8).map(symptom => (
                      <button
                        key={symptom.id}
                        onClick={() => handleAddSymptom(symptom.name)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                          selectedSymptoms.includes(symptom.name)
                            ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        disabled={selectedSymptoms.includes(symptom.name)}
                      >
                        {symptom.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Selected symptoms */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Selected Symptoms:</h3>
              {selectedSymptoms.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500 italic">
                    No symptoms selected yet. Start typing to search for symptoms.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your data is securely processed with your health profile
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSymptoms.map(symptom => (
                    <div 
                      key={symptom}
                      className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div>
                        <div className="font-medium capitalize">{symptom}</div>
                      </div>
                      <button 
                        onClick={() => handleRemoveSymptom(symptom)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Confirm Patient Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Please confirm your information for accurate health assessment. Some details are pre-filled from your profile.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your age"
              />
              {userProfile.dateOfBirth && (
                <p className="text-xs text-gray-500 mt-1">Calculated from your profile date of birth</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {userProfile.gender && (
                <p className="text-xs text-gray-500 mt-1">From your profile</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How long have you had these symptoms?</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select duration</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            {/* Show relevant medical history if available */}
            {(userProfile.medicalHistory || userProfile.allergies || userProfile.medications) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">From Your Medical Profile:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  {userProfile.medicalHistory && (
                    <p><strong>Medical History:</strong> {userProfile.medicalHistory}</p>
                  )}
                  {userProfile.allergies && (
                    <p><strong>Allergies:</strong> {userProfile.allergies}</p>
                  )}
                  {userProfile.medications && (
                    <p><strong>Medications:</strong> {userProfile.medications}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-10 flex justify-between">
          {currentStep === 2 ? (
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && selectedSymptoms.length === 0) || 
              (currentStep === 2 && (!age || !gender || !duration)) ||
              isLoading ||
              symptomsLoading
            }
            className={`px-6 py-3 bg-blue-500 text-white rounded-lg flex items-center ${
              ((currentStep === 1 && selectedSymptoms.length === 0) || 
              (currentStep === 2 && (!age || !gender || !duration)) ||
              isLoading ||
              symptomsLoading)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600 transition-colors'
            }`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block h-5 w-5 mr-2 border-t-2 border-white rounded-full"></span>
                AI Analyzing...
              </>
            ) : (
              <>
                {currentStep === 1 ? 'Next' : 'Get AI Analysis'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;