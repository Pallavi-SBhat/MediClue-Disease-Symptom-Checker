import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not signed in, don't render anything — SignedOut in App.js will handle redirect
  if (!isSignedIn) {
    return null;
  }

  // If profile is required, check if it exists
  if (requireProfile) {
    let hasProfile = false;

    try {
      // First check Clerk unsafeMetadata (if you manage to save there)
      hasProfile = user?.unsafeMetadata?.profileCompleted === true;

      // If not found in Clerk, check localStorage
      if (!hasProfile) {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          hasProfile = parsedProfile.profileCompleted === true && parsedProfile.userId === user?.id;
        }
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      hasProfile = false;
    }

    // If no profile found, redirect to profile setup
    if (!hasProfile) {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  // If all checks pass, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;