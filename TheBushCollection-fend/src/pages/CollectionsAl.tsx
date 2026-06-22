import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ArrowLeft, Search, Filter, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import PropertyCard from '@/components/PropertyCard';

const Collections = () => {
  const { properties, loading, error } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading safari collections...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading collections</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Get unique types and locations, filtering out undefined/null values
  const propertyTypes = [...new Set(properties.map(p => p.type).filter((type): type is string => type !== null && type !== undefined && typeof type === 'string'))];
  const locations = [...new Set(properties.map(p => p.location).filter((location): location is string => location !== null && location !== undefined && typeof location === 'string'))];

  // Filter out Nairobi locations for main collections (safari properties only)
  const safariLocations = locations.filter(location => 
    location && !location.toLowerCase().includes('nairobi')
  );

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || property.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  // Separate Nairobi hotels (for overnight stays before safari)
  const nairobiHotels = filteredProperties.filter(p => 
    (p.location || '').toLowerCase().includes('nairobi')
  );

  // Filter out Nairobi hotels from regular properties
  const nonNairobiProperties = filteredProperties.filter(p => 
    !(p.location || '').toLowerCase().includes('nairobi')
  );

  const safeCapitalize = (str: string | undefined) => {
    if (!str || typeof str !== 'string') return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Safari Collections
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover our curated collection of luxury safari accommodations across Africa's most breathtaking destinations. 
            From the vast plains of the Serengeti to the lush landscapes of the Maasai Mara, experience authentic wildlife encounters in unparalleled comfort and style.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search properties, locations, or descriptions..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {propertyTypes.map((type, index) => (
                      <option key={type || `type-${index}`} value={type}>
                        {safeCapitalize(type)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    {safariLocations.map((location, index) => (
                      <option key={location || `loc-${index}`} value={location}>
                        {location || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Collections Description Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm mb-4">
              Curated Excellence
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Safari Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Luxury Standards</h3>
              <p className="text-gray-600">
                Every property meets our rigorous standards for comfort, service, and authentic safari experiences.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prime Locations</h3>
              <p className="text-gray-600">
                Strategically located in the heart of wildlife-rich areas for optimal game viewing and immersion.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Hosts</h3>
              <p className="text-gray-600">
                Knowledgeable guides and staff dedicated to creating unforgettable wildlife encounters.
              </p>
            </div>
          </div>


        </div>
      </section>

      {/* All Properties Section - Not grouped by type */}
      {nonNairobiProperties.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  Featured Safari Properties
                </h3>
                
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nonNairobiProperties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nairobi Hotels Section - After Our Properties */}
      {nairobiHotels.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-800 px-4 py-2 text-sm mb-4">
                Pre-Safari Accommodation
              </Badge>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Nairobi Hotels
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comfortable overnight stays in Nairobi before your safari adventure begins.
                Rest and prepare for your journey into the wild.
              </p>
            </div>

            {/* The Bush Collection Owned Hotels */}
            {(() => {
              const ownedHotels = nairobiHotels.filter(hotel =>
                hotel.name && (
                  hotel.name.toLowerCase().includes('bush collection') ||
                  hotel.name.toLowerCase().includes('the bush') ||
                  hotel.featured === true // Using featured as a proxy for owned
                )
              );

              if (ownedHotels.length > 0) {
                return (
                  <div className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                      <h4 className="text-2xl font-bold text-gray-900">
                        Our Properties
                      </h4>
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        Bookable
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {ownedHotels.map((property) => (
                        <div key={property.id} className="relative">
                          <PropertyCard property={property} />
                          <div className="absolute top-4 right-4 z-10">
                            <Badge className="bg-green-500 text-white shadow-lg">
                              Our Property
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 right-4 z-10">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Partner Hotels */}
            {(() => {
              const partnerHotels = nairobiHotels.filter(hotel =>
                hotel.name && !(
                  hotel.name.toLowerCase().includes('bush collection') ||
                  hotel.name.toLowerCase().includes('the bush') ||
                  hotel.featured === true
                )
              );

              if (partnerHotels.length > 0) {
                return (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <h4 className="text-2xl font-bold text-gray-900">
                        Partner Hotels
                      </h4>
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                        Information Only
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {partnerHotels.map((property) => {
                        const isOurProperty = property.featured === true ||
                          (property.name && (
                            property.name.toLowerCase().includes('bush collection') ||
                            property.name.toLowerCase().includes('the bush')
                          ));

                        return (
                          <div key={property.id} className="relative">
                            <div className="overflow-hidden hover:shadow-lg transition-shadow bg-white rounded-lg">
                              <div className="relative">
                                <img
                                  src={property.images[0]}
                                  alt={property.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-blue-500 text-white">
                                    Partner Hotel
                                  </Badge>
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{property.name}</h3>
                                    <div className="flex items-center text-gray-600 text-sm mt-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {property.location}
                                    </div>
                                  </div>

                                    <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                      <span className="font-medium">{property.rating}</span>
                                      <span className="text-gray-500 ml-1">({property.numReviews || property.reviews || 0} reviews)</span>
                                    </div>
                                    {property.rooms && property.rooms.length > 0 && (
                                      <div className="flex items-center text-gray-600">
                                        <Users className="h-4 w-4 mr-1" />
                                        Up to {Math.max(...property.rooms.map(r => r.maxGuests || r.max_guests || 1))} guests
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>

                                    <div className="flex items-center justify-between pt-2">
                                    <div>
                                      {isOurProperty ? (
                                        <>
                                          <span className="text-2xl font-bold text-gray-900">${property.basePricePerNight || property.price || 0}</span>
                                          <span className="text-gray-600 text-sm ml-1">per night</span>
                                        </>
                                      ) : (
                                        <span className="text-sm text-gray-500 italic">Contact for pricing</span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        View Details
                                      </Button>
                                      <Button
                                        className="bg-gray-400 text-gray-600 cursor-not-allowed"
                                        size="sm"
                                        disabled
                                      >
                                        Not Bookable
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4 z-10">
                              <Badge className="bg-orange-500 text-white shadow-lg">
                                Nairobi
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-orange-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Why Stay in Nairobi?</h4>
                  <p className="text-gray-600 text-sm">
                    Most international flights arrive in Nairobi. Spending a night here allows you to rest,
                    adjust to the time zone, and start your safari refreshed. Our partner hotels offer
                    comfortable accommodations, airport transfers, and early morning departures to safari destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {nonNairobiProperties.length === 0 && nairobiHotels.length === 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse all properties
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLocation('all');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">{nonNairobiProperties.length}</div>
              <div className="text-blue-100">Safari Properties</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{nairobiHotels.length}</div>
              <div className="text-blue-100">Nairobi Hotels</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{safariLocations.length}</div>
              <div className="text-blue-100">Safari Destinations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {nonNairobiProperties.reduce((sum, p) => sum + (p.rooms?.length || 0), 0)}
              </div>
              <div className="text-blue-100">Safari Rooms</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {nonNairobiProperties.length > 0 ? (nonNairobiProperties.reduce((sum, p) => sum + (p.rating || 0), 0) / nonNairobiProperties.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Safari Collections</h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Curated luxury safari experiences across Africa's most spectacular destinations. 
                We partner with the finest lodges, camps, and safari properties to bring you unforgettable wildlife encounters in ultimate comfort and style.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Property Types</h4>
              <ul className="space-y-2 text-gray-400">
                {propertyTypes.map((type, index) => (
                  <li key={type || `type-${index}`}>
                    <button 
                      onClick={() => setSelectedType(type)}
                      className="hover:text-white"
                    >
                      {safeCapitalize(type)}s ({filteredProperties.filter(p => p.type === type && !(p.location || '').toLowerCase().includes('nairobi')).length})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                {safariLocations.slice(0, 6).map((location, index) => (
                  <li key={location || `location-${index}`}>
                    <button 
                      onClick={() => setSelectedLocation(location)}
                      className="hover:text-white"
                    >
                      {location || 'Unknown'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+254116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 The Bush Collections. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Collections;