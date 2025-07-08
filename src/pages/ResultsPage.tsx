import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ThumbsUp, MapPin, ArrowRight, Home, Brain, Activity } from 'lucide-react';

interface MedicalData {
  symptoms: string[];
  age: number;
  gender: string;
  duration: string;
  predictions: any[];
  timestamp: string;
}

const ResultsPage = () => {
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from session storage
    const storedData = sessionStorage.getItem('medicalData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setMedicalData(data);
    }
    setIsLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your results...</p>
      </div>
    );
  }

  if (!medicalData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No analysis data found</h2>
          <p className="text-gray-600 mb-6">
            You need to complete the symptom checker first to see results.
          </p>
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Health Analysis Results
            </h1>
            <p className="text-gray-500">
              Based on: {medicalData.symptoms.join(', ')}
            </p>
          </div>
        </div>

        {/* Patient Info Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Age:</span> {medicalData.age} years
            </div>
            <div>
              <span className="text-blue-600 font-medium">Gender:</span> {medicalData.gender}
            </div>
            <div>
              <span className="text-blue-600 font-medium">Duration:</span> {medicalData.duration}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">
                Medical Disclaimer
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                This analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-blue-600" />
            Potential Conditions
          </h2>
          
          {medicalData.predictions.length === 0 ? (
            <p className="text-gray-600">No matching conditions found for your symptoms.</p>
          ) : (
            <div className="space-y-6">
              {medicalData.predictions.map((prediction, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{prediction.disease}</h3>
                    <div className="flex space-x-2">
                      <div className="bg-blue-100 text-blue-800 text-sm font-medium py-1 px-3 rounded-full">
                        {Math.round(prediction.confidence)}% match
                      </div>
                      <div className={`text-sm font-medium py-1 px-3 rounded-full ${getSeverityColor(prediction.data.severity)}`}>
                        {prediction.data.severity}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{prediction.data.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {prediction.data.remedies.map((remedy: string, remedyIndex: number) => (
                          <li key={remedyIndex} className="text-sm">{remedy}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Medical Information:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Specialist:</span>
                          <span className="text-sm font-medium text-gray-800">{prediction.data.specialist}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Urgency:</span>
                          <span className={`text-sm font-medium py-1 px-2 rounded ${getUrgencyColor(prediction.data.urgency)}`}>
                            {prediction.data.urgency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Confidence: {Math.round(prediction.confidence)}%
                    </div>
                    <Link
                      to={`/hospitals?specialty=${encodeURIComponent(prediction.data.specialist)}`}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <MapPin className="mr-1 h-4 w-4" />
                      Find {prediction.data.specialist}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                <p className="text-sm text-gray-600">Keep track of any changes in your symptoms</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Consult a Doctor</h4>
                <p className="text-sm text-gray-600">Schedule an appointment with a healthcare provider</p>
              </div>
            </div>
          </div>
        </div>

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

        {/* Analysis Timestamp */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Analysis completed on {new Date(medicalData.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;