import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowRight, Activity, Heart, Brain, Stethoscope, User } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  description: string;
  bodyPart: string;
  severity: string;
  commonNames?: string[];
  keywords?: string[];
}

const SymptomChecker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get user data
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userProfile = currentUser.profile || {};

  // Pre-fill form with user profile data
  React.useEffect(() => {
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

  // Mock symptoms data
  const mockSymptoms: Symptom[] = [
    { 
      id: '1', 
      name: 'headache', 
      description: 'Pain in the head or upper neck',
      bodyPart: 'head',
      severity: 'moderate',
      commonNames: ['head pain', 'migraine', 'head pressure'],
      keywords: ['pounding head', 'throbbing', 'skull pain', 'temple pain']
    },
    { 
      id: '2', 
      name: 'fever', 
      description: 'Elevated body temperature',
      bodyPart: 'whole body',
      severity: 'moderate',
      commonNames: ['high temperature', 'hot', 'temperature'],
      keywords: ['burning up', 'feel hot', 'sweating', 'chills']
    },
    { 
      id: '3', 
      name: 'cough', 
      description: 'Sudden expulsion of air from the lungs',
      bodyPart: 'respiratory',
      severity: 'mild',
      commonNames: ['chest cough', 'dry cough', 'wet cough'],
      keywords: ['hacking', 'throat tickle', 'chest congestion', 'phlegm']
    },
    { 
      id: '4', 
      name: 'fatigue', 
      description: 'Feeling of tiredness or exhaustion',
      bodyPart: 'whole body',
      severity: 'mild',
      commonNames: ['tired', 'exhausted', 'no energy', 'weakness'],
      keywords: ['sleepy', 'drained', 'worn out', 'lethargic', 'low energy']
    },
    { 
      id: '5', 
      name: 'shortness of breath', 
      description: 'Difficulty breathing',
      bodyPart: 'respiratory',
      severity: 'severe',
      commonNames: ['breathless', 'can\'t breathe', 'breathing difficulty'],
      keywords: ['hard to breathe', 'out of breath', 'gasping', 'wheezing']
    },
    { 
      id: '6', 
      name: 'nausea', 
      description: 'Feeling of sickness with an inclination to vomit',
      bodyPart: 'stomach',
      severity: 'moderate',
      commonNames: ['sick feeling', 'queasy', 'upset stomach'],
      keywords: ['want to throw up', 'stomach sick', 'feel sick', 'stomach upset']
    },
    { 
      id: '7', 
      name: 'dizziness', 
      description: 'Feeling faint, woozy, or unsteady',
      bodyPart: 'head',
      severity: 'moderate',
      commonNames: ['lightheaded', 'vertigo', 'spinning', 'unsteady'],
      keywords: ['room spinning', 'off balance', 'woozy', 'head spinning']
    },
    { 
      id: '8', 
      name: 'muscle pain', 
      description: 'Pain in muscles',
      bodyPart: 'whole body',
      severity: 'moderate',
      commonNames: ['muscle ache', 'body pain', 'sore muscles'],
      keywords: ['aching muscles', 'muscle soreness', 'body aches']
    },
    { 
      id: '9', 
      name: 'joint pain', 
      description: 'Pain in joints',
      bodyPart: 'whole body',
      severity: 'moderate',
      commonNames: ['joint ache', 'arthritis pain', 'stiff joints'],
      keywords: ['joint stiffness', 'joint swelling', 'joint ache']
    },
    { 
      id: '10', 
      name: 'chest pain', 
      description: 'Pain in the chest area',
      bodyPart: 'chest',
      severity: 'severe',
      commonNames: ['chest discomfort', 'chest pressure', 'heart pain'],
      keywords: ['chest tightness', 'chest burning', 'chest pressure']
    },
    { 
      id: '11', 
      name: 'sore throat', 
      description: 'Pain or irritation in the throat',
      bodyPart: 'throat',
      severity: 'mild',
      commonNames: ['throat pain', 'scratchy throat'],
      keywords: ['throat burning', 'swollen throat', 'throat irritation']
    },
    { 
      id: '12', 
      name: 'runny nose', 
      description: 'Nasal discharge',
      bodyPart: 'nose',
      severity: 'mild',
      commonNames: ['stuffy nose', 'congestion', 'blocked nose'],
      keywords: ['nasal congestion', 'nose blocked', 'sniffles']
    }
  ];

  const getFilteredSymptoms = () => {
    if (searchTerm.length < 2) return [];
    
    const searchWords = searchTerm.toLowerCase().split(' ');
    
    return mockSymptoms.filter(symptom => {
      if (selectedSymptoms.includes(symptom.name)) return false;
      
      return searchWords.every(word => {
        const matchesName = symptom.name.toLowerCase().includes(word);
        const matchesCommonNames = symptom.commonNames?.some(name => 
          name.toLowerCase().includes(word)
        );
        const matchesKeywords = symptom.keywords?.some(keyword => 
          keyword.toLowerCase().includes(word)
        );
        const matchesDescription = symptom.description.toLowerCase().includes(word);

        return matchesName || matchesCommonNames || matchesKeywords || matchesDescription;
      });
    });
  };

  const handleAddSymptom = (symptomName: string) => {
    if (!selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
      setSearchTerm('');
    }
  };

  const handleRemoveSymptom = (symptomName: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomName));
  };

  const handleNext = async () => {
    if (currentStep === 1 && selectedSymptoms.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2 && age && gender && duration) {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock predictions based on symptoms
      const predictions = generateMockPredictions(selectedSymptoms);
      
      // Store results and navigate
      sessionStorage.setItem('medicalData', JSON.stringify({
        symptoms: selectedSymptoms,
        age: parseInt(age),
        gender,
        duration,
        userId: currentUser.id,
        userProfile: userProfile,
        predictions,
        timestamp: new Date().toISOString()
      }));
      
      navigate('/results');
      setIsLoading(false);
    }
  };

  const generateMockPredictions = (symptoms: string[]) => {
    const diseaseDatabase = [
      {
        disease: 'Common Cold',
        triggerSymptoms: ['cough', 'runny nose', 'sore throat', 'fatigue'],
        data: {
          description: 'A viral infection of the upper respiratory tract',
          severity: 'mild',
          remedies: [
            'Rest and get plenty of sleep',
            'Drink lots of fluids',
            'Use a humidifier',
            'Take over-the-counter pain relievers'
          ],
          specialist: 'General Practitioner',
          urgency: 'low'
        }
      },
      {
        disease: 'Flu',
        triggerSymptoms: ['fever', 'headache', 'muscle pain', 'fatigue', 'cough'],
        data: {
          description: 'A contagious respiratory illness caused by influenza viruses',
          severity: 'moderate',
          remedies: [
            'Rest and stay hydrated',
            'Take antiviral medications if prescribed',
            'Use fever reducers',
            'Avoid contact with others'
          ],
          specialist: 'General Practitioner',
          urgency: 'medium'
        }
      },
      {
        disease: 'Migraine',
        triggerSymptoms: ['headache', 'nausea', 'dizziness'],
        data: {
          description: 'A type of headache characterized by severe pain',
          severity: 'moderate',
          remedies: [
            'Rest in a dark, quiet room',
            'Apply cold or warm compress',
            'Take prescribed migraine medications',
            'Practice relaxation techniques'
          ],
          specialist: 'Neurologist',
          urgency: 'medium'
        }
      },
      {
        disease: 'Gastroenteritis',
        triggerSymptoms: ['nausea', 'fatigue'],
        data: {
          description: 'Inflammation of the stomach and intestines',
          severity: 'mild',
          remedies: [
            'Stay hydrated with clear fluids',
            'Follow BRAT diet (Bananas, Rice, Applesauce, Toast)',
            'Rest and avoid dairy',
            'Take probiotics'
          ],
          specialist: 'Gastroenterologist',
          urgency: 'medium'
        }
      }
    ];

    const matches = diseaseDatabase.map(disease => {
      const matchCount = disease.triggerSymptoms.filter(symptom => 
        symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
      ).length;
      
      const confidence = Math.min((matchCount / disease.triggerSymptoms.length) * 100, 95);
      
      return {
        ...disease,
        confidence,
        probability: confidence / 100,
        matchCount
      };
    }).filter(disease => disease.matchCount > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return matches;
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
              <span className="text-blue-800 font-medium">Welcome, {currentUser.firstName || 'User'}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            Describe your symptoms and get personalized health insights based on your profile
          </p>
        </div>

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
                          <div className="text-xs text-gray-500 mt-1">
                            Also: {symptom.commonNames?.join(', ')}
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
                {['fever', 'headache', 'cough', 'fatigue', 'nausea'].map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => handleAddSymptom(symptom)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    disabled={selectedSymptoms.includes(symptom)}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

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
            {(userProfile.medicalConditions || userProfile.allergies || userProfile.medications) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">From Your Medical Profile:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  {userProfile.medicalConditions && (
                    <p><strong>Conditions:</strong> {userProfile.medicalConditions}</p>
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
              isLoading
            }
            className={`px-6 py-3 bg-blue-500 text-white rounded-lg flex items-center ${
              ((currentStep === 1 && selectedSymptoms.length === 0) || 
              (currentStep === 2 && (!age || !gender || !duration)) ||
              isLoading)
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