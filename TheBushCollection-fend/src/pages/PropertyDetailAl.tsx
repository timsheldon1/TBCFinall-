import { useState } from 'react';
import slugify from '@/lib/slugify';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Play,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useBackendProperties } from '@/hooks/useBackendProperties';

interface AmenityIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

interface Room {
  id: string;
  name: string;
  description: string;
  type: string;
  maxGuests: number;
  price: number;
  available: boolean;
  bookedUntil?: string;
  availableFrom?: string;
  amenities: string[];
  images?: string[];
}

interface GroupedRoom {
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  availableCount: number;
  totalCount: number;
  amenities: string[];
  images?: string[];
  description: string;
  sampleRoomId: string; // ID of one of the rooms in this group for booking
}

const amenityIcons: AmenityIconMap = {
  'Free WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Utensils,
  'Coffee': Coffee,
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { properties, loading, error } = useBackendProperties();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [roomImageIndexes, setRoomImageIndexes] = useState<{[key: string]: number}>({});
  const [roomQuantities, setRoomQuantities] = useState<{[key: string]: number}>({});

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading property</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const property = properties.find(p => {
    const pId = p.id || (p as any)._id;
    const pSlug = (p as any).slug || '';
    return pId === id || pSlug === id || slugify(p.name) === id;
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Map backend rooms to expected format and group by name
  const rooms = (property.rooms || []).map(room => ({
    id: room.id,
    name: room.name,
    description: room.description || `${room.name} - ${room.type} room accommodating up to ${room.maxGuests || room.max_guests} guests with modern amenities and stunning views`,
    type: room.type,
    maxGuests: room.maxGuests || room.max_guests,
    price: room.price,
    available: room.available,
    bookedUntil: room.booked_until || undefined,
    availableFrom: room.available_from || undefined,
    amenities: room.amenities || [],
    images: room.images || []
  }));

  // Group rooms by name
  const groupedRooms = rooms.reduce((acc, room) => {
    const existingGroup = acc.find(group => group.name === room.name);

    if (existingGroup) {
      existingGroup.totalCount++;
      if (room.available) {
        existingGroup.availableCount++;
      }
      // Update other properties if this room has more complete data
      if (room.images && room.images.length > 0) {
        existingGroup.images = room.images;
      }
      if (room.amenities && room.amenities.length > 0) {
        existingGroup.amenities = room.amenities;
      }
    } else {
      acc.push({
        name: room.name,
        type: room.type,
        maxGuests: room.maxGuests,
        price: room.price,
        availableCount: room.available ? 1 : 0,
        totalCount: 1,
        amenities: room.amenities || [],
        images: room.images || [],
        description: room.description,
        sampleRoomId: room.id
      });
    }

    return acc;
  }, [] as GroupedRoom[]);

  const availableRoomGroups = groupedRooms.filter(group => group.availableCount > 0);
  const unavailableRoomGroups = groupedRooms.filter(group => group.availableCount === 0);

  // Enhanced video detection function
  const isVideo = (url: string) => {
    if (!url || typeof url !== 'string') return false;

    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    const videoHosts = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'dailymotion.com'
    ];

    // Microsoft services that should be treated as images, not videos
    const microsoftImageServices = [
      'microsoftpersonalcontent.com',
      'southcentralus1-mediap.svc.ms',
      'mediap.svc.ms'
    ];

    // Check for video file extensions
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));

    // Check for video hosting platforms (excluding Microsoft services)
    const isVideoHost = videoHosts.some(host => url.toLowerCase().includes(host));

    // Check for Microsoft services (treat as images, not videos)
    const isMicrosoftService = microsoftImageServices.some(host => url.toLowerCase().includes(host));

    // Check for explicit video indicators
    const hasVideoIndicator = url.toLowerCase().includes('video');

    // Return true only for actual video hosts, not Microsoft services
    return hasVideoExtension || (isVideoHost && !isMicrosoftService) || (hasVideoIndicator && !isMicrosoftService);
  };

  const nextRoomImage = (roomId: string, totalImages: number) => {
    setRoomImageIndexes(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages
    }));
  };

  const prevRoomImage = (roomId: string, totalImages: number) => {
    setRoomImageIndexes(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Handle room quantity changes
  const updateRoomQuantity = (roomName: string, quantity: number) => {
    setRoomQuantities(prev => ({
      ...prev,
      [roomName]: Math.max(0, Math.min(quantity, groupedRooms.find(g => g.name === roomName)?.availableCount || 0))
    }));
  };

  const getRoomQuantity = (roomName: string) => {
    return roomQuantities[roomName] || 0;
  };

  // Room Image Carousel Component
  const RoomImageCarousel = ({ room, size = 'large' }: { room: Room, size?: 'small' | 'large' }) => {
    const currentIndex = roomImageIndexes[room.id] || 0;
    const images = room.images || [];
    
    if (images.length === 0) {
      return (
        <div className={`${size === 'small' ? 'w-24 h-20' : 'w-full h-48'} bg-gray-200 rounded-lg flex items-center justify-center`}>
          <div className="text-center text-gray-500">
            <ImageIcon className={`${size === 'small' ? 'h-4 w-4' : 'h-8 w-8'} mx-auto mb-1`} />
            <span className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>No image</span>
          </div>
        </div>
      );
    }

    const currentMedia = images[currentIndex];
    const isCurrentVideo = isVideo(currentMedia);

    return (
      <div className={`relative ${size === 'small' ? 'w-24 h-20' : 'w-full h-48'} rounded-lg overflow-hidden bg-gray-100`}>
        {isCurrentVideo ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              controls={size === 'large'}
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                console.error('PropertyDetail video failed to load:', {
                  src: target.src,
                  error: target.error,
                  mediaUrl: currentMedia
                });

                // Hide video and show fallback
                target.style.display = 'none';
                const container = target.closest('.relative');
                const fallbackDiv = container?.querySelector('.video-fallback') as HTMLDivElement;
                if (fallbackDiv && fallbackDiv.classList) {
                  fallbackDiv.classList.remove('hidden');
                }
              }}
              onLoadedData={(e) => {
                console.log('PropertyDetail video loaded successfully:', currentMedia);
              }}
              onLoadStart={(e) => {
                console.log('PropertyDetail video load started:', currentMedia);
              }}
              onCanPlay={() => {
                console.log('PropertyDetail video can play:', currentMedia);
              }}
              onPlay={() => {
                console.log('PropertyDetail video started playing:', currentMedia);
              }}
              onPause={() => {
                console.log('PropertyDetail video paused:', currentMedia);
              }}
            >
              <source src={currentMedia} type="video/mp4" />
              <source src={currentMedia} type="video/webm" />
              <source src={currentMedia} type="video/ogg" />
              Your browser does not support the video tag.
            </video>

            {/* Hidden fallback for video errors */}
            <div className="video-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <Play className={`${size === 'small' ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-2`} />
                <span className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>Video unavailable</span>
              </div>
            </div>

            {/* Click to Play Overlay for small size or when no controls */}
            {size === 'small' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-1">
                  <Play className="h-3 w-3 text-white" />
                </div>
              </div>
            )}

            {/* Click to Play Overlay for large size without controls */}
            {size === 'large' && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
                onClick={(e) => {
                  const container = e.currentTarget.closest('.relative');
                  const video = container?.querySelector('video') as HTMLVideoElement;

                  if (video) {
                    console.log('PropertyDetail play button clicked for video:', currentMedia);

                    if (video.paused) {
                      video.play().then(() => {
                        console.log('PropertyDetail video started playing successfully');
                      }).catch((error) => {
                        console.error('Failed to play PropertyDetail video:', error);

                        // For Microsoft services, try opening in new tab as fallback
                        if (currentMedia && (currentMedia.includes('1drv.ms') || currentMedia.includes('sharepoint.com'))) {
                          console.log('Opening Microsoft video in new tab:', currentMedia);
                          window.open(currentMedia, '_blank');
                          return;
                        }

                        // Show fallback on play error
                        const fallbackDiv = container?.querySelector('.video-fallback');
                        if (fallbackDiv && fallbackDiv.classList) {
                          fallbackDiv.classList.remove('hidden');
                          e.currentTarget.classList.add('hidden');
                        }
                      });
                    } else {
                      video.pause();
                      console.log('PropertyDetail video paused');
                    }
                  } else {
                    console.error('PropertyDetail video element not found for click handler');
                  }
                }}
              >
                <div className="bg-black/60 rounded-full p-4 hover:bg-black/70 transition-colors">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={currentMedia}
            alt={room.name}
            className="w-full h-full object-cover cursor-pointer"
            onError={(e) => {
              e.currentTarget.src = size === 'small' 
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA5NiA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI0NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Q0E5QjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDQwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzlDQTlCNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 ${
                size === 'small' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                prevRoomImage(room.id, images.length);
              }}
            >
              <ChevronLeft className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 ${
                size === 'small' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                nextRoomImage(room.id, images.length);
              }}
            >
              <ChevronRight className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {images.length > 1 && (
          <div className={`absolute ${size === 'small' ? 'bottom-1 right-1' : 'bottom-2 right-2'}`}>
            <Badge variant="secondary" className={`bg-black/70 text-white ${size === 'small' ? 'text-xs px-1 py-0' : 'text-xs'}`}>
              {currentIndex + 1}/{images.length}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // Room Details Dialog with Large Image Gallery
  const RoomDetailsDialog = ({ room }: { room: Room }) => {
    const isRoomAvailable = room.available;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{room.name}</span>
              <Badge className={isRoomAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isRoomAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Detailed information about {room.name} including amenities, pricing, and availability
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Large Room Image Gallery */}
            <RoomImageCarousel room={room} size="large" />
            
            {/* Room Details */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-lg mb-1">{room.name}</h4>
                <p className="text-gray-600 text-sm">{room.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Room Type:</span>
                  <p className="text-gray-600">{room.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Guests:</span>
                  <p className="text-gray-600">{room.maxGuests} guests</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <p className="text-green-600 font-semibold">${room.price}/night</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className={isRoomAvailable ? 'text-green-600' : 'text-red-600'}>
                    {isRoomAvailable ? 'Available Now' : 'Currently Unavailable'}
                  </p>
                </div>
              </div>

              {/* Availability Info */}
              {!isRoomAvailable && (room.bookedUntil || room.availableFrom) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center text-orange-800 mb-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Availability Information</span>
                  </div>
                  <div className="text-orange-700 text-sm space-y-1">
                    {room.bookedUntil && (
                      <p>Booked until: {new Date(room.bookedUntil).toLocaleDateString()}</p>
                    )}
                    {room.availableFrom && (
                      <p>Available from: {new Date(room.availableFrom).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Room Amenities */}
              <div>
                <span className="font-medium text-gray-700">Room Amenities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {isRoomAvailable && (
                <Link to={`/book?property=${property.id}&room=${room.id}`} className="flex-1">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Book This Room
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  function isValidImageUrl(url: string): boolean {
    return typeof url === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-5 w-5 mr-2" />
                {property.location}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {availableRoomGroups.length === 0 && groupedRooms.length > 0 && (
                <Badge className="bg-red-100 text-red-800 px-3 py-1">
                  Fully Booked
                </Badge>
              )}
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-semibold">{property.rating}</span>
                <span className="text-gray-500 ml-1">({property.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={property.images[selectedImageIndex]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Coffee;
                    return (
                      <div key={amenity} className="flex items-center">
                        <Icon className="h-5 w-5 text-orange-500 mr-3" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Gallery with Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Rooms & Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Available Room Groups */}
                  {availableRoomGroups.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Available Room Types ({availableRoomGroups.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableRoomGroups.map((roomGroup) => (
                          <div key={roomGroup.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            {/* Room Image */}
                            <div className="mb-3">
                              <RoomImageCarousel room={{
                                id: roomGroup.sampleRoomId,
                                name: roomGroup.name,
                                images: roomGroup.images,
                                amenities: roomGroup.amenities,
                                description: roomGroup.description,
                                type: roomGroup.type,
                                maxGuests: roomGroup.maxGuests,
                                price: roomGroup.price,
                                available: true
                              }} size="small" />
                            </div>

                            {/* Room Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-gray-900">{roomGroup.name}</h5>
                                <Badge className="bg-green-100 text-green-800">{roomGroup.availableCount} available</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{roomGroup.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-3 w-3 mr-1" />
                                  Up to {roomGroup.maxGuests} guests
                                </div>
                                <p className="text-lg font-bold text-green-600">${roomGroup.price}/night</p>
                              </div>

                              {/* Quantity Selector */}
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateRoomQuantity(roomGroup.name, getRoomQuantity(roomGroup.name) - 1)}
                                    disabled={getRoomQuantity(roomGroup.name) <= 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{getRoomQuantity(roomGroup.name)}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateRoomQuantity(roomGroup.name, getRoomQuantity(roomGroup.name) + 1)}
                                    disabled={getRoomQuantity(roomGroup.name) >= roomGroup.availableCount}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max: {roomGroup.availableCount}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-2">
                                <RoomDetailsDialog room={{
                                  id: roomGroup.sampleRoomId,
                                  name: roomGroup.name,
                                  images: roomGroup.images,
                                  amenities: roomGroup.amenities,
                                  description: roomGroup.description,
                                  type: roomGroup.type,
                                  maxGuests: roomGroup.maxGuests,
                                  price: roomGroup.price,
                                  available: true
                                }} />
                                <Link to={`/book?property=${property.id}&room=${roomGroup.sampleRoomId}&quantity=${getRoomQuantity(roomGroup.name)}`}>
                                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                    Book {getRoomQuantity(roomGroup.name) > 0 ? `${getRoomQuantity(roomGroup.name)} Room${getRoomQuantity(roomGroup.name) > 1 ? 's' : ''}` : 'Select'}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unavailable Room Groups */}
                  {unavailableRoomGroups.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Currently Unavailable ({unavailableRoomGroups.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unavailableRoomGroups.map((roomGroup) => (
                          <div key={roomGroup.name} className="border rounded-lg p-4 bg-gray-50">
                            {/* Room Image */}
                            <div className="mb-3">
                              <RoomImageCarousel room={{
                                id: roomGroup.sampleRoomId,
                                name: roomGroup.name,
                                images: roomGroup.images,
                                amenities: roomGroup.amenities,
                                description: roomGroup.description,
                                type: roomGroup.type,
                                maxGuests: roomGroup.maxGuests,
                                price: roomGroup.price,
                                available: false
                              }} size="small" />
                            </div>

                            {/* Room Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-gray-900">{roomGroup.name}</h5>
                                <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{roomGroup.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-3 w-3 mr-1" />
                                  Up to {roomGroup.maxGuests} guests
                                </div>
                                <p className="text-lg font-bold text-gray-500">${roomGroup.price}/night</p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-2">
                                <RoomDetailsDialog room={{
                                  id: roomGroup.sampleRoomId,
                                  name: roomGroup.name,
                                  images: roomGroup.images,
                                  amenities: roomGroup.amenities,
                                  description: roomGroup.description,
                                  type: roomGroup.type,
                                  maxGuests: roomGroup.maxGuests,
                                  price: roomGroup.price,
                                  available: false
                                }} />
                                <Button size="sm" disabled className="opacity-50">
                                  Unavailable
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedRooms.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No rooms available for this property.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book Your Stay</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${property.price_from}
                    </div>
                    <div className="text-sm text-gray-600">from/night</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  Up to {groupedRooms.length > 0 ? Math.max(...groupedRooms.map(r => r.maxGuests)) : 0} guests
                </div>

                {/* Availability Summary */}
                <div className="border rounded-lg p-3">
                  {availableRoomGroups.length === 0 && groupedRooms.length > 0 ? (
                    <div className="text-center">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="font-semibold text-red-800">Fully Booked</p>
                      <p className="text-sm text-red-600">All rooms are currently unavailable</p>
                    </div>
                  ) : availableRoomGroups.length < groupedRooms.length ? (
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-yellow-800">Limited Availability</p>
                      <p className="text-sm text-yellow-600">
                        {availableRoomGroups.length} of {groupedRooms.length} room types available
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">Available Now</p>
                      <p className="text-sm text-green-600">All room types ready for booking</p>
                    </div>
                  )}
                </div>

                <Link to={`/book?property=${property.id}`}>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={availableRoomGroups.length === 0}
                  >
                    {availableRoomGroups.length === 0 ? 'Fully Booked' : 'Book Now'}
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}