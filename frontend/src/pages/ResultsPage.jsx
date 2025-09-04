import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ThumbsUp, MapPin, ArrowRight, Home, Brain, Activity, Clock, User } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ResultsPage = () => {
  const{user}=useUser();
  const [medicalData, setMedicalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchResults = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "12345" }) // pass whatever data
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setMedicalData(data);

      // 🔽 Save results to DB
      await fetch("http://localhost:4000/api/medical/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId:user.id , // replace with logged-in user
          age: data.patient_info?.age,
          gender: data.patient_info?.gender,
          symptoms: data.symptoms, 
          predictions: data.predictions,
          userProfile: data.userProfile,
        }),
      });
    } catch (err) {
      console.error(err);
      setError("Error loading analysis results");
    } finally {
      setIsLoading(false);
    }
  };

  fetchResults();
}, [user]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'severe':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your results...</p>
      </div>
    );
  }

  if (error || !medicalData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h2 className="text-lg font-bold text-red-800 mb-2">
                  {error || 'No analysis data found'}
                </h2>
                <p className="text-red-700 text-sm">
                  You need to complete the symptom checker first to see results.
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/symptom-checker"
            className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Symptom Checker
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              AI Health Analysis Results
            </h1>
            <p className="text-gray-500">
              Based on: {medicalData.symptoms?.join(', ')}
            </p>
            {medicalData.sessionId && (
              <p className="text-xs text-gray-400 mt-1">
                Session ID: {medicalData.sessionId}
              </p>
            )}
          </div>
        </div>

        {/* Patient Info Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Age:</span> {medicalData.patient_info.age} years
            </div>
            <div>
              <span className="text-blue-600 font-medium">Gender:</span> {medicalData.patient_info.gender}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-blue-600 font-medium">Duration:</span> {medicalData.patient_info.duration}
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            <span className="font-medium">Analysis Date:</span> {formatTimestamp(medicalData.timestamp)}
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">
                Medical Disclaimer
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                This AI analysis is for informational purposes only and should not replace professional medical advice.
                Always consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-blue-600" />
            AI Analysis Results
          </h2>

          {!medicalData.predictions || medicalData.predictions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No specific conditions identified</p>
                <p className="text-sm">
                  Based on your symptoms, our AI couldn't identify specific conditions with high confidence.
                  We recommend consulting with a healthcare professional for further evaluation.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {medicalData.predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {prediction.disease}
                    </h3>
                    <div className="flex space-x-2">
                      <div className="bg-blue-100 text-blue-800 text-sm font-medium py-1 px-3 rounded-full">
                        {Math.round(prediction.confidence)}% match
                      </div>
                      {prediction.data?.severity && (
                        <div className={`text-sm font-medium py-1 px-3 rounded-full ${getSeverityColor(prediction.data.severity)}`}>
                          {prediction.data.severity}
                        </div>
                      )}
                    </div>
                  </div>

                  {prediction.data?.description && (
                    <p className="text-gray-600 mb-4">{prediction.data.description}</p>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Remedies/Recommendations */}
                    {prediction.data?.remedies && prediction.data.remedies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {prediction.data.remedies.map((remedy, remedyIndex) => (
                            <li key={remedyIndex} className="text-sm">{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Medical Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Medical Information:</h4>
                      <div className="space-y-2">
                        {prediction.data?.specialist && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Specialist:</span>
                            <span className="text-sm font-medium text-gray-800">{prediction.data.specialist}</span>
                          </div>
                        )}
                        {prediction.data?.urgency && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Urgency:</span>
                            <span className={`text-sm font-medium py-1 px-2 rounded ${getUrgencyColor(prediction.data.urgency)}`}>
                              {prediction.data.urgency}
                            </span>
                          </div>
                        )}
                        {prediction.data?.duration && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Expected Duration:</span>
                            <span className="text-sm font-medium text-gray-800">{prediction.data.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* When to seek help */}
                  {prediction.data?.when_to_seek_help && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-800 mb-1">When to Seek Medical Help:</h4>
                      <p className="text-sm text-orange-700">{prediction.data.when_to_seek_help}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-500">
                      AI Confidence: {Math.round(prediction.confidence)}%
                      {prediction.probability && (
                        <span className="ml-2">
                          (Probability: {Math.round(prediction.probability * 100)}%)
                        </span>
                      )}
                    </div>
                    {prediction.data?.specialist && (
                      <Link
                        to={`/hospitals?specialty=${encodeURIComponent(prediction.data.specialist)}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <MapPin className="mr-1 h-4 w-4" />
                        Find {prediction.data.specialist}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Information (if available) */}
        {medicalData.userProfile && Object.keys(medicalData.userProfile).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Factors Considered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {medicalData.userProfile.medicalHistory && (
                <div>
                  <span className="text-gray-600 font-medium">Medical History:</span>
                  <p className="text-gray-800 mt-1">{medicalData.userProfile.medicalHistory}</p>
                </div>
              )}
              {medicalData.userProfile.allergies && (
                <div>
                  <span className="text-gray-600 font-medium">Known Allergies:</span>
                  <p className="text-gray-800 mt-1">{medicalData.userProfile.allergies}</p>
                </div>
              )}
              {medicalData.userProfile.medications && (
                <div>
                  <span className="text-gray-600 font-medium">Current Medications:</span>
                  <p className="text-gray-800 mt-1">{medicalData.userProfile.medications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <ThumbsUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Monitor Symptoms</h4>
                <p className="text-sm text-gray-600">Keep track of any changes in your symptoms over time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Consult a Healthcare Professional</h4>
                <p className="text-sm text-gray-600">Schedule an appointment for proper medical evaluation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/symptom-checker"
            className="bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="mr-2 h-5 w-5" />
            New Analysis
          </Link>
          <Link
            to="/hospitals"
            className="bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Find Healthcare Providers
          </Link>
        </div>

        {/* Analysis Summary Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Analysis completed on {formatTimestamp(medicalData.timestamp)}
            </p>
            {medicalData.sessionId && (
              <p className="text-xs text-gray-400">
                Reference ID: {medicalData.sessionId}
              </p>
            )}
            <p className="text-xs text-gray-400">
              This analysis was powered by AI and considers your symptoms, age, gender, and medical profile
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ResultsPage;