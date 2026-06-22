import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Users, Search, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import PropertyCard from '@/components/PropertyCard';
import ReviewsSection from '@/components/ReviewsSection';

export default function Index() {
  const { properties, loading, error } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading safari properties...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading properties</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Filter properties based on search and type
  // Filter properties based on search, type, and exclude Nairobi hotels
const filteredProperties = properties.filter(property => {
  const matchesSearch =
    (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.location || '').toLowerCase().includes(searchTerm.toLowerCase());

  const matchesType = selectedType === 'all' || property.type === selectedType;

  // Exclude Nairobi hotels
  const isNairobiHotel =
    property.location?.toLowerCase().includes('nairobi') ||
    property.name?.toLowerCase().includes('nairobi');

  return matchesSearch && matchesType && !isNairobiHotel;
});

// Featured properties excluding Nairobi hotels
const featuredProperties = properties.filter(
  property =>
    property.featured &&
    !property.location?.toLowerCase().includes('nairobi') &&
    !property.name?.toLowerCase().includes('nairobi')
);

// Filter out undefined/null types and get unique property types
const propertyTypes = [
  ...new Set(
    properties
      .map(p => p.type)
      .filter(
        (type): type is string =>
          type !== null && type !== undefined && typeof type === 'string'
      )
  ),
];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
<section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
  {/* Background Video */}
  <video
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="/images/16.mp4" type="video/mp4" /> 
    {/* fallback text */}
    Your browser does not support the video tag.
  </video>

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content */}
  <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
    <h1 className="text-5xl md:text-7xl font-bold mb-6">
      Discover Africa's
      <span className="block text-orange-400">Wild Beauty</span>
    </h1>
    <p className="text-xl md:text-2xl mb-8 text-gray-200">
      Embark on unforgettable safari adventures across Africa's most spectacular destinations
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/packages">
        <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
          Explore Packages
        </Button>
      </Link>
      <Link to="/book">
        <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-green px-8 py-3">
          Book Now
        </Button>
      </Link>
    </div>
  </div>
</section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Safari
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search through our collection of luxury safari accommodations
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search destinations or properties..."
                      className="pl-10 h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {propertyTypes.map((type, index) => (
                      <option key={type || `type-${index}`} value={type}>
                        {type && typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
                <Button size="lg" className="h-12 px-8">
                  <Filter className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Destinations
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked luxury safari experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Safari Destinations
            </h2>
            <p className="text-xl text-gray-600">
              {filteredProperties.length} properties available
            </p>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Stats Section */}
<section className="py-16 bg-orange-500 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <div className="text-4xl font-bold mb-2">
          {properties.filter(property => 
            !property.location?.toLowerCase().includes('nairobi')
          ).length}
        </div>
        <div className="text-orange-100">Safari Properties</div>
      </div>
      <div>
        <div className="text-4xl font-bold mb-2">
          {properties
            .filter(property => !property.location?.toLowerCase().includes('nairobi'))
            .reduce((sum, p) => sum + (p.safari_rooms?.length || 0), 0)}
        </div>
        <div className="text-orange-100">Total Safari Rooms</div>
      </div>
      <div>
        <div className="text-4xl font-bold mb-2">
          {properties
            .filter(property => !property.location?.toLowerCase().includes('nairobi'))
            .reduce((sum, p) => sum + (p.reviews || 0), 0)}
        </div>
        <div className="text-orange-100">Safari Reviews</div>
      </div>
      <div>
        <div className="text-4xl font-bold mb-2">
          {(() => {
            const safariProperties = properties.filter(property => 
              !property.location?.toLowerCase().includes('nairobi')
            );
            return safariProperties.length > 0 
              ? (safariProperties.reduce((sum, p) => sum + (p.rating || 0), 0) / safariProperties.length).toFixed(1)
              : '0.0';
          })()}
        </div>
        <div className="text-orange-100">Safari Rating</div>
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready for Your Safari Adventure?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Book your dream safari experience today and create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                Start Booking
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Safari Tours</h3>
              <p className="text-gray-400 mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/packages" className="hover:text-white">Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-white">Collections</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Kenya</li>
                <li>Tanzania</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}