import { Star, MapPin, Users, Calendar, Clock, Play } from 'lucide-react';
import slugify from '@/lib/slugify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Backend types (matching useBackendProperties)
type Room = {
  id?: string;
  _id?: string;
  name?: string;
  available?: boolean;
  available_from?: string | null;
  price?: number;
  max_guests?: number;
  maxGuests?: number;
};

type Property = {
  id?: string;
  _id?: string;
  name?: string;
  location?: string;
  description?: string;
  images?: string[];
  price?: number;
  basePricePerNight?: number;
  price_from?: number;
  rating?: number;
  reviews?: number;
  numReviews?: number;
  featured?: boolean;
  rooms?: Room[];
  safari_rooms?: Room[];
};

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Normalize property data from backend
  const propertyId = property.id || property._id;
  const propertyName = property.name || 'Property';
  const propertyLocation = property.location || 'Location unknown';
  const propertyDescription = property.description || '';
  const propertyPrice = property.price_from || property.basePricePerNight || property.price || 0;
  const propertyRating = property.rating || 4.5;
  const propertyReviews = property.reviews || property.numReviews || 0;
  const propertyFeatured = property.featured || false;
  const propertyImages = property.images || [];

  // Get rooms - backend may use 'rooms' or 'safari_rooms'
  const rooms = (property.rooms || property.safari_rooms || []) as Room[];
  const availableRooms = rooms.filter(room => room.available).length;
  const totalRooms = rooms.length;
  const fullyBooked = totalRooms > 0 && availableRooms === 0;

  // Find the earliest available date from unavailable rooms
  const getEarliestAvailableDate = () => {
    const unavailableRooms = rooms.filter(room => !room.available);
    const availableDates = unavailableRooms
      .map(room => room.available_from)
      .filter(date => date)
      .map(date => new Date(date!))
      .sort((a, b) => a.getTime() - b.getTime());

    return availableDates.length > 0 ? availableDates[0] : null;
  };

  const earliestAvailableDate = getEarliestAvailableDate();

  // Simplified and improved video detection function
  const isVideo = (url: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;

    const lowerUrl = url.toLowerCase();

    // Video file extensions (most reliable indicator)
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext));

    // Video hosting platforms
    const videoHosts = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'dailymotion.com'
    ];
    const isVideoHost = videoHosts.some(host => lowerUrl.includes(host));

    // Direct video indicators in URL
    const videoIndicators = [
      '/video/',
      '.video.',
      'videoplayback',
      'video=true'
    ];
    const hasVideoIndicator = videoIndicators.some(indicator => lowerUrl.includes(indicator));

    // Microsoft OneDrive/SharePoint video detection - be more inclusive
    const isMicrosoftVideo = lowerUrl.includes('1drv.ms') ||
                           lowerUrl.includes('onedrive.live.com') ||
                           (lowerUrl.includes('sharepoint.com') &&
                            (lowerUrl.includes('/video/') ||
                             lowerUrl.includes('&web=1') ||
                             lowerUrl.includes('redeem=')));

    return hasVideoExtension || isVideoHost || hasVideoIndicator || isMicrosoftVideo;
  };

  // Function to handle video play/pause with better error handling
  const handleVideoClick = (videoElement: HTMLVideoElement, fallbackDiv: HTMLDivElement | null) => {
    if (videoElement.paused || videoElement.ended) {
      // Try to play, but handle autoplay policy restrictions
      videoElement.play().then(() => {
        console.log('Video started playing successfully');
      }).catch((error) => {
        console.error('Failed to play video:', error);

        // If it's an AbortError (autoplay blocked), try again after a brief delay
        if (error.name === 'AbortError' && videoElement.readyState >= 2) {
          console.log('Retrying video play after autoplay block...');
          setTimeout(() => {
            videoElement.play().catch((retryError) => {
              console.error('Retry failed:', retryError);
              if (fallbackDiv) {
                fallbackDiv.classList.remove('hidden');
              }
            });
          }, 100);
        } else {
          // For other errors, show fallback
          if (fallbackDiv) {
            fallbackDiv.classList.remove('hidden');
          }
        }
      });
    } else {
      videoElement.pause();
      console.log('Video paused');
    }
  };

  const renderMedia = () => {
    const firstMedia = propertyImages && propertyImages[0];

    if (!firstMedia || typeof firstMedia !== 'string') {
      console.warn('PropertyCard: Invalid or missing media URL:', {
        propertyId,
        firstMedia,
        images: propertyImages
      });
      return {
        mediaContent: (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        ),
        isVideo: false
      };
    }

    const lowerUrl = firstMedia.toLowerCase();
    const videoCheck = isVideo(firstMedia);

    // Helper function to extract YouTube video ID
    const getYouTubeVideoId = (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return match ? match[1] : '';
    };

    console.log('PropertyCard media debug:', {
      propertyId,
      firstMedia,
      isVideo: videoCheck
    });

    let mediaContent;
    if (videoCheck) {
        // Special handling for YouTube videos (can't play directly due to CORS)
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        mediaContent = (
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
            {/* YouTube thumbnail as background */}
            <img
              src={`https://img.youtube.com/vi/${getYouTubeVideoId(firstMedia)}/maxresdefault.jpg`}
              alt={propertyName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default thumbnail if maxresdefault fails
                e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeVideoId(firstMedia)}/hqdefault.jpg`;
              }}
            />            {/* YouTube Play Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
              onClick={() => {
                window.open(firstMedia, '_blank');
              }}
            >
              <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        );
      } else if (lowerUrl.includes('1drv.ms') ||
                 lowerUrl.includes('onedrive.live.com') ||
                 lowerUrl.includes('sharepoint.com')) {
        // Special handling for external video services (OneDrive, etc.)
        mediaContent = (
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
            {/* Show video thumbnail or placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Play className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">External Video</span>
              </div>
            </div>

            {/* Click overlay to open video */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
              onClick={() => {
                window.open(firstMedia, '_blank');
              }}
            >
              <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                <Play className="h-8 w-8 text-gray-800" />
              </div>
            </div>
          </div>
        );
      } else {
        // Regular video handling (for direct video files)
        mediaContent = (
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                console.error('Video failed to load:', {
                  src: target.src,
                  error: target.error ? {
                    code: target.error.code,
                    message: target.error.message
                  } : 'Unknown error',
                  mediaUrl: firstMedia,
                  isVideo: videoCheck
                });
                target.style.display = 'none';
                const container = target.closest('.relative');
                const fallbackDiv = container?.querySelector('.video-fallback') as HTMLDivElement;
                if (fallbackDiv) {
                  fallbackDiv.classList.remove('hidden');
                }
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully:', firstMedia);
              }}
              onCanPlay={() => {
                // Try to autoplay when video can play (browser allows it)
                const video = document.querySelector(`video[src="${firstMedia}"]`) as HTMLVideoElement;
                if (video && video.paused) {
                  video.play().catch((error) => {
                    console.log('Autoplay blocked by browser policy:', error.message);
                    // Don't show error for autoplay blocks - user can click to play
                  });
                }
              }}
            >
              <source src={firstMedia} type="video/mp4" />
              <source src={firstMedia} type="video/webm" />
              Your browser does not support the video tag.
            </video>

            {/* Fallback for video errors */}
            <div className="video-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">Video unavailable</span>
              </div>
            </div>

            {/* Play/Pause Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
              onClick={(e) => {
                const container = e.currentTarget.closest('.relative');
                const video = container?.querySelector('video') as HTMLVideoElement;
                const fallbackDiv = container?.querySelector('.video-fallback') as HTMLDivElement;

                if (video) {
                  handleVideoClick(video, fallbackDiv);
                }
              }}
            >
              <div className="bg-black/60 rounded-full p-4 hover:bg-black/70 transition-colors">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        );
      }
    } else {
      // Handle image
      mediaContent = (
        <img
          src={firstMedia}
          alt={propertyName}
          className="w-full h-48 object-cover"
          onError={(e) => {
            console.error('Image failed to load:', firstMedia);
            e.currentTarget.src = '';
            e.currentTarget.alt = 'Image not available';
            e.currentTarget.classList.add('bg-gray-200');
          }}
        />
      );
    }

    return {
      mediaContent,
      isVideo: videoCheck
    };
  };

  const { mediaContent, isVideo: videoCheck } = renderMedia();

  const propertySlug = (property as any).slug || slugify(propertyName) || propertyId;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {mediaContent}

        {/* Property Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {videoCheck && (
            <Badge variant="secondary" className="bg-red-600 text-white text-xs">
              VIDEO
            </Badge>
          )}
          {propertyFeatured && (
            <Badge className="bg-orange-500">
              Featured
            </Badge>
          )}
        </div>

        {/* Availability Badges */}
        {fullyBooked && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Fully Booked
          </Badge>
        )}
        {!fullyBooked && availableRooms < totalRooms && totalRooms > 0 && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            Limited Availability
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{propertyName}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {propertyLocation}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium">{propertyRating}</span>
              <span className="text-gray-500 ml-1">({propertyReviews} reviews)</span>
            </div>
            {rooms.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                Up to {Math.max(...rooms.map(r => (r.maxGuests || r.max_guests || 0)))} guests
              </div>
            )}
          </div>

          {/* Room Availability Status */}
          <div className="space-y-2">
            {fullyBooked ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center text-red-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Fully Booked</span>
                </div>
                {earliestAvailableDate && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Available from {earliestAvailableDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : availableRooms < totalRooms ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-yellow-800">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Limited Availability</span>
                  </div>
                  <span className="text-yellow-700 text-sm">
                    {availableRooms} of {totalRooms} rooms available
                  </span>
                </div>
                {earliestAvailableDate && (
                  <div className="flex items-center text-yellow-600 text-sm mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>More rooms available from {earliestAvailableDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-green-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Available Now</span>
                </div>
                <span className="text-green-600 text-sm">
                  All {totalRooms} rooms available for booking
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{propertyDescription}</p>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-gray-900">${propertyPrice}</span>
              <span className="text-gray-600 text-sm ml-1">per night</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/property/${propertySlug}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <Link to={`/book?property=${propertyId}`}>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={fullyBooked}
                  size="sm"
                >
                  {fullyBooked ? 'Fully Booked' : 'Book Now'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
