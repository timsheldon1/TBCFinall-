import { useState, useEffect } from 'react';
import slugify from '@/lib/slugify';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Users, Clock, Calendar, ArrowLeft, Check, X, ChevronLeft, ChevronRight, Image as ImageIcon, Building2 } from 'lucide-react';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { Package } from '@/types/package';
import PackageItinerary from '@/components/PackageItinerary';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { packages, loading, getPackageById } = useBackendPackages();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadPackage = async () => {
      console.log('PackageDetail - ID:', id, 'Packages:', packages.length);
      if (id && packages.length > 0) {
        // try local lookup by id or slug first
        const local = packages.find(p => p.id === id || (p as any).slug === id || slugify(p.name) === id);
        if (local) {
          setSelectedPackage(local);
          return;
        }
        const pkg = await getPackageById(id);
        console.log('Found package:', pkg);
        setSelectedPackage(pkg || null);
      }
    };
    loadPackage();
  }, [id, packages, getPackageById]);

  if (loading || packages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading package...</h1>
            <p className="text-gray-600">Please wait while we load the package details from the database.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Package not found</h1>
            <p className="text-gray-600 mb-4">
              Looking for package ID: {id}
            </p>
            <p className="text-gray-600 mb-6">
              Available packages: {packages.map(p => p.id).join(', ')}
            </p>
            <Link to="/packages">
              <Button>Browse Packages</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Wildlife Safari':
        return 'bg-yellow-100 text-yellow-800';
      case 'Adventure Safari':
        return 'bg-orange-100 text-orange-800';
      case 'Luxury Safari':
        return 'bg-purple-100 text-purple-800';
      case 'Water Safari':
        return 'bg-blue-100 text-blue-800';
      case 'Desert Safari':
        return 'bg-yellow-100 text-yellow-800';
      case 'Walking Safari':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'challenging':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedPackage.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedPackage.gallery.length) % selectedPackage.gallery.length);
  };

  const isVideo = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    if (videoExtensions.some(ext => lower.includes(ext))) return true;
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    if (videoHosts.some(h => lower.includes(h))) return true;
    const videoIndicators = ['/video/', '.video.', 'videoplayback', 'video=true', '1drv.ms', 'sharepoint.com', 'onedrive.live.com'];
    if (videoIndicators.some(ind => lower.includes(ind))) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/packages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96">
                  {selectedPackage.gallery.length > 0 ? (
                    <div className="relative h-full overflow-hidden rounded-t-lg">
                      {isVideo(selectedPackage.gallery[currentImageIndex]) ? (
                        <video
                          src={selectedPackage.gallery[currentImageIndex]}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={selectedPackage.gallery[currentImageIndex]}
                          alt={selectedPackage.name}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Navigation Arrows */}
                      {selectedPackage.gallery.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-10 w-10 p-0"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-10 w-10 p-0"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}

                      {/* Image Counter */}
                      {selectedPackage.gallery.length > 1 && (
                        <div className="absolute bottom-4 left-4">
                          <Badge variant="secondary" className="bg-black/70 text-white">
                            {currentImageIndex + 1} / {selectedPackage.gallery.length}
                          </Badge>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={getCategoryColor(selectedPackage.category)}>
                          {selectedPackage.category}
                        </Badge>
                        {selectedPackage.featured && (
                          <Badge className="bg-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <Badge className={getDifficultyColor(selectedPackage.difficulty)}>
                          {capitalizeFirst(selectedPackage.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {selectedPackage.gallery.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedPackage.gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedPackage.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Package Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedPackage.name}
                    </CardTitle>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedPackage.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{selectedPackage.groupSize}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedPackage.location}</span>
                      </div>
                    </div>
                    {selectedPackage.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPackage.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="text-lg font-semibold">{selectedPackage.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({selectedPackage.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Destinations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.destinations.map((destination, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {destination}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Package Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-700">
                  <Check className="h-5 w-5 mr-2" />
                  Package Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPackage.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Itinerary Button & Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="my-4 w-full md:w-auto">
                  View Detailed Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <PackageItinerary
                  itinerary={selectedPackage.itinerary || []}
                  packageName={selectedPackage.name}
                />
              </DialogContent>
            </Dialog>

            {/* Includes & What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-700">
                    <Check className="h-5 w-5 mr-2" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedPackage.includes.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {selectedPackage.excludes && selectedPackage.excludes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <X className="h-5 w-5 mr-2" />
                      What's Not Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPackage.excludes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book This Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                    <div className="text-lg text-gray-500 line-through mb-1">
                      ${selectedPackage.originalPrice.toLocaleString()}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    ${selectedPackage.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">per person</div>
                  {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                    <Badge variant="destructive" className="mt-2">
                      Save ${(selectedPackage.originalPrice - selectedPackage.price).toLocaleString()}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Package Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{selectedPackage.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Guests:</span>
                    <span className="font-medium">{selectedPackage.maxGuests} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge className={getDifficultyColor(selectedPackage.difficulty)} variant="outline">
                      {capitalizeFirst(selectedPackage.difficulty)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{selectedPackage.rating}</span>
                    </div>
                  </div>
                  {selectedPackage.bestTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Time:</span>
                      <span className="font-medium">{selectedPackage.bestTime}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Booking Buttons */}
                <div className="space-y-3">
                  <Link to={`/book?package=${selectedPackage.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6">
                      Book Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Contact for Custom Quote
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>✓ Free cancellation up to 48 hours</p>
                  <p>✓ Secure payment processing</p>
                  <p>✓ 24/7 customer support</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Package Details</h3>
              <p className="text-gray-400 mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/collections" className="hover:text-white">Properties</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-white">Travel Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 the bush collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}