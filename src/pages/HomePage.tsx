import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, MapPin, BookOpen, Shield, UserCheck, Heart, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Understand Your Symptoms, Find Your Care
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10">
            MediClue helps you identify potential health issues based on your symptoms 
            and connects you with the care you need.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/symptom-checker" 
                  className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Check Symptoms
                </Link>
                <Link 
                  to="/hospitals" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Hospitals
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
                <Link 
                  to="/login" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Section for Authenticated Users */}
      {isAuthenticated && (
        <div className="py-12 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome back, {currentUser.firstName || 'User'}! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              Your health journey continues. What would you like to do today?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/symptom-checker" 
                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Symptom Check
              </Link>
              <Link 
                to="/hospitals" 
                className="bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Find Healthcare
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Features Section for Non-Authenticated Users */}
      {!isAuthenticated && (
        <div className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Why Choose MediClue?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your health data is encrypted and kept completely private</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Care</h3>
                <p className="text-gray-600">Get recommendations tailored to your health profile</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Save your symptoms and track your health over time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            How MediClue Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Create Account</h3>
              <p className="text-gray-600">
                Sign up and complete your health profile for personalized recommendations.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Health Profile</h3>
              <p className="text-gray-600">
                Provide your medical history and personal details for accurate analysis.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Enter Symptoms</h3>
              <p className="text-gray-600">
                Describe your symptoms using our intelligent symptom checker.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">4. Get Analysis</h3>
              <p className="text-gray-600">
                Receive AI-powered analysis and find nearby healthcare providers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Our Health Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Advanced Symptom Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Our advanced algorithm analyzes your symptoms and provides potential 
                  causes based on your personal health profile and medical databases.
                </p>
                {isAuthenticated ? (
                  <Link 
                    to="/symptom-checker" 
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Start Assessment
                  </Link>
                ) : (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Hospital Finder</h3>
                <p className="text-gray-600 mb-6">
                  Locate the best hospitals and specialists near you based on your condition, 
                  location, and specific healthcare needs.
                </p>
                {isAuthenticated ? (
                  <Link 
                    to="/hospitals" 
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Find Care
                  </Link>
                ) : (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Take Control of Your Health Today
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            {isAuthenticated 
              ? "Continue your health journey with personalized symptom analysis and expert recommendations."
              : "Join thousands of users who trust MediClue for their health assessments. Create your secure account and start your health journey."
            }
          </p>
          
          {isAuthenticated ? (
            <Link 
              to="/symptom-checker" 
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center"
            >
              <Heart className="mr-2 h-5 w-5" />
              Start Your Assessment
            </Link>
          ) : (
            <>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5 text-green-300" />
                  <span className="font-medium">Secure • Private • HIPAA Compliant</span>
                </div>
              </div>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Get Started Now
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;