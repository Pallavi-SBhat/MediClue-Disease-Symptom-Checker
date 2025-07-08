import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Search, Settings, Filter } from 'lucide-react';

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  specialties: string[];
  rating: number;
  distance: number;
  coordinates: { lat: number; lng: number };
}

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Mock hospitals data
  const mockHospitals: Hospital[] = [
    {
      id: 1,
      name: 'Metropolitan Medical Center',
      address: '123 Health Avenue, New York, NY 10001',
      phone: '(212) 555-1234',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics'],
      rating: 4.5,
      distance: 2.3,
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      name: 'Central City Hospital',
      address: '456 Care Street, Chicago, IL 60601',
      phone: '(312) 555-6789',
      specialties: ['Orthopedics', 'General Surgery', 'Emergency Medicine'],
      rating: 4.2,
      distance: 3.1,
      coordinates: { lat: 41.8781, lng: -87.6298 }
    },
    {
      id: 3,
      name: 'Sunshine Health Clinic',
      address: '789 Wellness Road, Los Angeles, CA 90001',
      phone: '(213) 555-9876',
      specialties: ['Family Medicine', 'Dermatology', 'Psychiatry'],
      rating: 4.8,
      distance: 1.8,
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    {
      id: 4,
      name: 'Advanced Care Institute',
      address: '321 Medical Plaza, Boston, MA 02101',
      phone: '(617) 555-4321',
      specialties: ['Pulmonology', 'Rheumatology', 'Gastroenterology'],
      rating: 4.6,
      distance: 4.2,
      coordinates: { lat: 42.3601, lng: -71.0589 }
    },
    {
      id: 5,
      name: 'Emergency Care Center',
      address: '654 Quick Response Ave, Miami, FL 33101',
      phone: '(305) 555-7890',
      specialties: ['Emergency Medicine', 'Urgent Care', 'General Practitioner'],
      rating: 4.1,
      distance: 0.9,
      coordinates: { lat: 25.7617, lng: -80.1918 }
    },
    {
      id: 6,
      name: 'Heart & Vascular Institute',
      address: '987 Cardiac Way, Houston, TX 77001',
      phone: '(713) 555-2468',
      specialties: ['Cardiology', 'Cardiovascular Surgery', 'Interventional Cardiology'],
      rating: 4.7,
      distance: 5.4,
      coordinates: { lat: 29.7604, lng: -95.3698 }
    },
    {
      id: 7,
      name: 'Neurological Sciences Center',
      address: '246 Brain Street, Seattle, WA 98101',
      phone: '(206) 555-1357',
      specialties: ['Neurology', 'Neurosurgery', 'Psychiatry'],
      rating: 4.4,
      distance: 6.8,
      coordinates: { lat: 47.6062, lng: -122.3321 }
    },
    {
      id: 8,
      name: 'Women\'s Health Center',
      address: '135 Wellness Circle, Phoenix, AZ 85001',
      phone: '(602) 555-9753',
      specialties: ['Gynecology', 'Obstetrics', 'Family Medicine'],
      rating: 4.3,
      distance: 3.7,
      coordinates: { lat: 33.4484, lng: -112.0740 }
    }
  ];

  // Collect all unique specialties
  const allSpecialties = Array.from(
    new Set(mockHospitals.flatMap(hospital => hospital.specialties))
  ).sort();

  useEffect(() => {
    const loadHospitals = () => {
      // Check if specialty is passed from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const specialtyParam = urlParams.get('specialty');
      if (specialtyParam) {
        setSelectedSpecialty(specialtyParam);
        const filtered = mockHospitals.filter(hospital => 
          hospital.specialties.includes(specialtyParam)
        );
        setHospitals(filtered);
        setFilteredHospitals(filtered);
      } else {
        setHospitals(mockHospitals);
        setFilteredHospitals(mockHospitals);
      }
      setIsLoading(false);
    };

    loadHospitals();

    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission(true);
        },
        () => {
          setLocationPermission(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    let results = hospitals;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(hospital => 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      results = results.filter(hospital => 
        hospital.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredHospitals(results);
  }, [searchTerm, selectedSpecialty, hospitals]);

  const handleNearbySearch = () => {
    if (!location.lat || !location.lng) {
      alert('Location access is required for nearby search');
      return;
    }

    setIsLoading(true);
    // Sort by distance (closest first)
    const sorted = [...mockHospitals].sort((a, b) => a.distance - b.distance);
    setHospitals(sorted);
    setFilteredHospitals(sorted);
    setIsLoading(false);
  };

  // Function to render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  // Function to get browser-specific instructions
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      return 'Click the location icon (🔒) in the address bar and select "Allow"';
    } else if (userAgent.includes('firefox')) {
      return 'Click the location icon (🔒) in the address bar and select "Allow Location Access"';
    } else if (userAgent.includes('safari')) {
      return 'Go to Safari > Preferences > Websites > Location and allow access for this website';
    }
    return 'Check your browser settings to enable location access for this website';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Healthcare Providers</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <button
              onClick={handleNearbySearch}
              disabled={!locationPermission || isLoading}
              className={`w-full py-3 px-4 rounded-lg border flex items-center justify-center ${
                locationPermission 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Find Nearby'}
            </button>
          </div>
        </div>
        
        {locationPermission === false && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Location access required for nearby search</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  To find hospitals near you: <br />
                  {getBrowserInstructions()}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  Refresh page after enabling location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hospital List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isLoading ? 'Loading hospitals...' : `${filteredHospitals.length} Healthcare Providers Found`}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHospitals.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No healthcare providers found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-blue-600">{hospital.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(hospital.rating)}</div>
                        <span className="text-sm text-gray-600">({hospital.rating})</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div className="text-gray-700">
                          {hospital.address}
                          <span className="text-sm text-blue-600 ml-2">
                            ({hospital.distance} km away)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="text-gray-700">
                          <a href={`tel:${hospital.phone}`} className="hover:text-blue-600">
                            {hospital.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className={`text-xs py-1 px-2 rounded-full ${
                              specialty === selectedSpecialty 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        Get Directions
                      </a>
                      <a 
                        href={`tel:${hospital.phone}`}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center"
                      >
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsPage;