import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Search, Settings, Filter, Navigation } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState('');

  // Indian hospitals data (fallback and reference)
  const mockHospitals = [
    {
      id: 1,
      name: 'All India Institute of Medical Sciences (AIIMS)',
      address: 'Ansari Nagar, New Delhi, Delhi 110029',
      phone: '+91-11-2658-8500',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Emergency Medicine'],
      rating: 4.8,
      distance: 2.3,
      coordinates: { lat: 28.5672, lng: 77.2100 }
    },
    {
      id: 2,
      name: 'Apollo Hospital',
      address: 'Sarita Vihar, New Delhi, Delhi 110076',
      phone: '+91-11-2692-5858',
      specialties: ['Cardiothoracic Surgery', 'Neurosurgery', 'Transplant Surgery', 'Cancer Care'],
      rating: 4.6,
      distance: 3.1,
      coordinates: { lat: 28.5355, lng: 77.2951 }
    },
    {
      id: 3,
      name: 'Fortis Healthcare',
      address: 'Sector 62, Noida, Uttar Pradesh 201301',
      phone: '+91-120-471-8800',
      specialties: ['Orthopedics', 'Gastroenterology', 'Urology', 'Pulmonology'],
      rating: 4.4,
      distance: 1.8,
      coordinates: { lat: 28.6139, lng: 77.3910 }
    },
    {
      id: 4,
      name: 'Max Super Speciality Hospital',
      address: 'Saket, New Delhi, Delhi 110017',
      phone: '+91-11-2651-5050',
      specialties: ['Cardiology', 'Neurology', 'Cancer Care', 'Kidney Transplant'],
      rating: 4.5,
      distance: 4.2,
      coordinates: { lat: 28.5244, lng: 77.2066 }
    },
    {
      id: 5,
      name: 'Medanta - The Medicity',
      address: 'Sector 38, Gurugram, Haryana 122001',
      phone: '+91-124-414-1414',
      specialties: ['Heart Surgery', 'Liver Transplant', 'Robotic Surgery', 'Emergency Medicine'],
      rating: 4.7,
      distance: 0.9,
      coordinates: { lat: 28.4089, lng: 77.0426 }
    },
    {
      id: 6,
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      address: 'Andheri West, Mumbai, Maharashtra 400053',
      phone: '+91-22-4269-6969',
      specialties: ['Neurosciences', 'Cardiac Sciences', 'Cancer Care', 'Organ Transplant'],
      rating: 4.6,
      distance: 5.4,
      coordinates: { lat: 19.1136, lng: 72.8697 }
    },
    {
      id: 7,
      name: 'Christian Medical College (CMC)',
      address: 'ida Scudder Road, Vellore, Tamil Nadu 632004',
      phone: '+91-416-228-1000',
      specialties: ['Pediatric Surgery', 'Infectious Diseases', 'Community Health', 'Medical Education'],
      rating: 4.8,
      distance: 6.8,
      coordinates: { lat: 12.9249, lng: 79.1353 }
    },
    {
      id: 8,
      name: 'Sankara Nethralaya',
      address: 'College Road, Chennai, Tamil Nadu 600006',
      phone: '+91-44-2827-1616',
      specialties: ['Ophthalmology', 'Eye Surgery', 'Retinal Diseases', 'Corneal Transplant'],
      rating: 4.7,
      distance: 3.7,
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    {
      id: 9,
      name: 'Tata Memorial Hospital',
      address: 'Parel, Mumbai, Maharashtra 400012',
      phone: '+91-22-2417-7000',
      specialties: ['Oncology', 'Cancer Surgery', 'Radiation Therapy', 'Palliative Care'],
      rating: 4.5,
      distance: 7.2,
      coordinates: { lat: 19.0176, lng: 72.8562 }
    },
    {
      id: 10,
      name: 'PGIMER (Post Graduate Institute)',
      address: 'Sector 12, Chandigarh, Punjab 160012',
      phone: '+91-172-274-7585',
      specialties: ['Neurosurgery', 'Cardiothoracic Surgery', 'Advanced Laparoscopy', 'Medical Research'],
      rating: 4.6,
      distance: 8.9,
      coordinates: { lat: 30.7333, lng: 76.7794 }
    },
    {
      id: 11,
      name: 'Narayana Health City',
      address: 'Bommasandra, Bangalore, Karnataka 560099',
      phone: '+91-80-7122-2200',
      specialties: ['Pediatric Cardiac Surgery', 'Minimal Access Surgery', 'Organ Transplant', 'Critical Care'],
      rating: 4.4,
      distance: 12.1,
      coordinates: { lat: 12.8056, lng: 77.7419 }
    },
    {
      id: 12,
      name: 'Manipal Hospital',
      address: 'HAL Airport Road, Bangalore, Karnataka 560017',
      phone: '+91-80-2502-4444',
      specialties: ['Nephrology', 'Gastroenterology', 'Orthopedics', 'Emergency Medicine'],
      rating: 4.3,
      distance: 2.6,
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    {
      id: 13,
      name: 'Sir Ganga Ram Hospital',
      address: 'Rajinder Nagar, New Delhi, Delhi 110060',
      phone: '+91-11-4225-2525',
      specialties: ['Gastroenterology', 'Nephrology', 'Pulmonology', 'General Surgery'],
      rating: 4.4,
      distance: 5.8,
      coordinates: { lat: 28.6414, lng: 77.1899 }
    },
    {
      id: 14,
      name: 'Ruby Hall Clinic',
      address: 'Sassoon Road, Pune, Maharashtra 411001',
      phone: '+91-20-2611-2121',
      specialties: ['IVF & Fertility', 'Joint Replacement', 'Minimal Access Surgery', 'Emergency Care'],
      rating: 4.2,
      distance: 9.4,
      coordinates: { lat: 18.5196, lng: 73.8553 }
    },
    {
      id: 15,
      name: 'King Edward Memorial Hospital',
      address: 'Parel, Mumbai, Maharashtra 400012',
      phone: '+91-22-2410-7000',
      specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology'],
      rating: 4.1,
      distance: 4.3,
      coordinates: { lat: 19.0144, lng: 72.8479 }
    }
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Get current location name using reverse geocoding
  const getCurrentLocationName = async (lat, lng) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      return `${data.locality || data.city || ''}, ${data.principalSubdivision || ''}`.replace(/^,\s*/, '');
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Current Location';
    }
  };

  // Search for real nearby hospitals using Overpass API (OpenStreetMap)
  const searchNearbyHospitals = async (lat, lng, radiusKm = 10) => {
    try {
      setIsLoading(true);
      
      // Overpass API query for hospitals within radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusKm * 1000},${lat},${lng});
          way["amenity"="hospital"](around:${radiusKm * 1000},${lat},${lng});
          relation["amenity"="hospital"](around:${radiusKm * 1000},${lat},${lng});
          node["amenity"="clinic"](around:${radiusKm * 1000},${lat},${lng});
          way["amenity"="clinic"](around:${radiusKm * 1000},${lat},${lng});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const realHospitals = data.elements
          .filter(element => element.tags && element.tags.name)
          .map((element, index) => {
            const hospitalLat = element.lat || element.center?.lat;
            const hospitalLng = element.lon || element.center?.lon;
            const distance = calculateDistance(lat, lng, hospitalLat, hospitalLng);
            
            return {
              id: `real-${index}`,
              name: element.tags.name,
              address: [
                element.tags['addr:street'] && element.tags['addr:housenumber'] ? 
                  `${element.tags['addr:housenumber']} ${element.tags['addr:street']}` : '',
                element.tags['addr:city'] || '',
                element.tags['addr:postcode'] || ''
              ].filter(Boolean).join(', ') || 'Address not available',
              phone: element.tags.phone || element.tags['contact:phone'] || 'Phone not available',
              specialties: [
                element.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
                element.tags.healthcare || 'General Healthcare'
              ],
              rating: Math.floor(Math.random() * 2) + 4, // Random rating 4-5 (real data not available)
              distance: distance,
              coordinates: { lat: hospitalLat, lng: hospitalLng },
              type: element.tags.amenity
            };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20); // Limit to 20 results

        return realHospitals;
      }
      
      // Fallback to mock data if no real hospitals found
      return mockHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(lat, lng, hospital.coordinates.lat, hospital.coordinates.lng)
      })).sort((a, b) => a.distance - b.distance);
      
    } catch (error) {
      console.error('Error searching nearby hospitals:', error);
      // Fallback to mock data
      return mockHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(lat, lng, hospital.coordinates.lat, hospital.coordinates.lng)
      })).sort((a, b) => a.distance - b.distance);
    }
  };

  // Collect all unique specialties
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap(hospital => hospital.specialties))
  ).sort();

  useEffect(() => {
    const loadHospitals = async () => {
      // Check if specialty is passed from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const specialtyParam = urlParams.get('specialty');
      if (specialtyParam) {
        setSelectedSpecialty(specialtyParam);
      }
      
      // Start with mock data
      setHospitals(mockHospitals);
      setFilteredHospitals(mockHospitals);
      setIsLoading(false);
    };

    loadHospitals();

    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          setLocation({ lat: userLat, lng: userLng });
          setLocationPermission(true);
          
          // Get current location name
          const locationName = await getCurrentLocationName(userLat, userLng);
          setCurrentLocationName(locationName);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
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
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }

    setFilteredHospitals(results);
  }, [searchTerm, selectedSpecialty, hospitals]);

  const handleNearbySearch = async () => {
    if (!location.lat || !location.lng) {
      alert('Location access is required for nearby search');
      return;
    }

    setIsLoading(true);
    try {
      const nearbyHospitals = await searchNearbyHospitals(location.lat, location.lng, 15); // 15km radius
      setHospitals(nearbyHospitals);
      setFilteredHospitals(nearbyHospitals);
    } catch (error) {
      console.error('Error in nearby search:', error);
      // Fallback to sorted mock data
      const sorted = [...mockHospitals]
        .map(hospital => ({
          ...hospital,
          distance: calculateDistance(location.lat, location.lng, hospital.coordinates.lat, hospital.coordinates.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
      setHospitals(sorted);
      setFilteredHospitals(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" style={{clipPath: 'inset(0 50% 0 0)'}} />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
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
    <>
    <Navbar/>
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Healthcare Providers</h1>
        {currentLocationName && (
          <div className="flex items-center text-sm text-gray-600">
            <Navigation className="h-4 w-4 mr-1" />
            <span>{currentLocationName}</span>
          </div>
        )}
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
              className={`w-full py-3 px-4 rounded-lg border flex items-center justify-center transition-all ${
                locationPermission 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MapPin className={`h-4 w-4 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
              {isLoading ? 'Searching Nearby...' : 'Find Nearby (Real Data)'}
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
        
        {location.lat && location.lng && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Location access enabled • Searching within 15km radius
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Hospital List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isLoading ? 'Searching for healthcare providers...' : `${filteredHospitals.length} Healthcare Providers Found`}
        </h2>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Searching for nearby hospitals...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHospitals.length === 0 ? (
              <div className="text-center py-10">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No healthcare providers found matching your criteria.</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search filters or location settings.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-blue-600 mb-1">{hospital.name}</h3>
                        {hospital.type && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {hospital.type === 'hospital' ? 'Hospital' : 'Clinic'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(hospital.rating)}</div>
                        <span className="text-sm text-gray-600">({hospital.rating})</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-gray-700">
                          {hospital.address}
                          <div className="text-sm text-blue-600 font-medium mt-1">
                            📍 {hospital.distance} km away
                          </div>
                        </div>
                      </div>
                      
                      {hospital.phone !== 'Phone not available' && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-500 mr-2" />
                          <div className="text-gray-700">
                            <a href={`tel:${hospital.phone}`} className="hover:text-blue-600 transition-colors">
                              {hospital.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className={`text-xs py-1.5 px-3 rounded-full transition-colors ${
                              specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) && selectedSpecialty
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
                      >
                        🗺️ Get Directions
                      </a>
                      {hospital.phone !== 'Phone not available' && (
                        <a 
                          href={`tel:${hospital.phone}`}
                          className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
                        >
                          📞 Call Now
                        </a>
                      )}
                      <button
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`, '_blank')}
                        className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors text-center font-medium"
                      >
                        ℹ️ More Info
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default HospitalsPage;