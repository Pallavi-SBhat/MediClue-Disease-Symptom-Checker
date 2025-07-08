import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SymptomChecker from './pages/SymptomChecker';
import ResultsPage from './pages/ResultsPage';
import HospitalsPage from './pages/HospitalsPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/symptom-checker" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/profile-setup" replace /> : <RegisterPage />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Layout />}>
          <Route 
            path="symptom-checker" 
            element={
              <ProtectedRoute requireProfile={true}>
                <SymptomChecker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="results" 
            element={
              <ProtectedRoute requireProfile={true}>
                <ResultsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="hospitals" 
            element={
              <ProtectedRoute requireProfile={true}>
                <HospitalsPage />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;