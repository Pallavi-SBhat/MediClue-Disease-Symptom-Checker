import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import HomePage from './pages/HomePage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SymptomChecker from './pages/SymptomChecker';
import ResultsPage from './pages/ResultsPage';
import HospitalsPage from './pages/HospitalsPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - Home page */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Profile setup route - accessible when signed in but no profile check needed */}
        <Route
          path="/profile-setup"
          element={
            <>
              <SignedIn>
                <ProfileSetupPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Protected routes requiring authentication AND profile completion */}
        <Route
          path="/symptom-checker"
          element={
            <>
              <SignedIn>
                <ProtectedRoute requireProfile={true}>
                  <SymptomChecker />
                </ProtectedRoute>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/results"
          element={
            <>
              <SignedIn>
                <ProtectedRoute requireProfile={true}>
                  <ResultsPage />
                </ProtectedRoute>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/hospitals"
          element={
            <>
              <SignedIn>
                <ProtectedRoute requireProfile={true}>
                  <HospitalsPage />
                </ProtectedRoute>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Catch all route - redirect to home or sign in */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;