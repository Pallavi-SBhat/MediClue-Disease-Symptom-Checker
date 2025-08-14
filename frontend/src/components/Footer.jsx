import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MediClue</h3>
            <p className="text-blue-100 mb-4">
              Helping you understand your symptoms and find the right care when you need it most.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-blue-100 hover:text-white transition-colors">Home</a></li>
              <li><a href="/symptom-checker" className="text-blue-100 hover:text-white transition-colors">Symptom Checker</a></li>
              <li><a href="/hospitals" className="text-blue-100 hover:text-white transition-colors">Find Hospitals</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-blue-100">Email: contact@mediclue.com</li>
              <li className="text-blue-100">Phone: +9000000000</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-blue-500 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-blue-100">© 2025 MediClue. All rights reserved.</p>
          <p className="text-blue-100 mt-4 sm:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-400" /> for better health
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;