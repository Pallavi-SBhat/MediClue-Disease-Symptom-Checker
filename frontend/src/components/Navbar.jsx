import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { Stethoscope, Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { isSignedIn, user } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-blue-600">MediClue</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md font-medium transition-colors">
              Home
            </Link>
            
            {isSignedIn ? (
              <>
                <Link to="/symptom-checker" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md font-medium transition-colors">
                  Symptom Checker
                </Link>
                <Link to="/hospitals" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md font-medium transition-colors">
                  Find Hospitals
                </Link>
                
                {/* Clerk UserButton for user menu */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10"
                    }
                  }}
                />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Get Started
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            {isSignedIn && (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            )}
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {isSignedIn ? (
              <>
                <Link 
                  to="/symptom-checker" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Symptom Checker
                </Link>
                <Link 
                  to="/hospitals" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Hospitals
                </Link>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button 
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button 
                    className="block w-full text-left px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;