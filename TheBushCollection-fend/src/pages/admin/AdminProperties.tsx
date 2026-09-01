import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Star, Users, Bed, Save, X, Image, Video, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import { toast } from 'sonner';

type Property = {
  id: string;
  name: string;
  location: string;
  type: string;
  category?: string;
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  reviews: number;
  priceRange: { min: number; max: number };
  price: number;
  maxGuests: number;
  minNights: number;
  fullyBooked: boolean;
  featured?: boolean;
  externalUrl?: string | null;
  rooms: Room[];
  safari_zone?: string;
};

type Room = {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  available: boolean;
  amenities: string[];
  images: string[];
  description?: string;
};

export default function AdminProperties() {
  const { properties, loading, error, addProperty, updateProperty, deleteProperty, addRoom, updateRoom, deleteRoom, refetch } = useBackendProperties();
  
  // No transformation needed - backend hook already returns formatted data
  const transformedProperties: Property[] = properties.map(prop => ({
    id: prop.id || prop._id || '',
    name: prop.name,
    location: prop.location || '',
  type: prop.type || 'lodge',
  category: (prop.category || 'bush').toLowerCase(),
    description: prop.description || '',
    images: prop.images || [],
    amenities: prop.amenities || [],
    rating: prop.rating || 4.5,
    reviewCount: prop.reviews || prop.numReviews || 0,
    reviews: prop.reviews || prop.numReviews || 0,
    priceRange: {
      min: prop.price || prop.basePricePerNight || 0,
      max: prop.price || prop.basePricePerNight || 0
    },
    price: prop.price || prop.basePricePerNight || 0,
    maxGuests: prop.maxGuests || 2,
    minNights: prop.minNights || 1,
    fullyBooked: false,
    featured: prop.featured || false,
    externalUrl: prop.externalUrl || null,
    rooms: (prop.rooms || []).map(room => ({
      id: room.id || room._id,
      name: room.name,
      type: room.type || '',
      maxGuests: room.maxGuests || room.max_guests || 2,
      price: room.price || 0,
      available: room.available !== false,
      amenities: room.amenities || [],
      images: room.images || [],
      description: room.description
    }))
  })) as Property[];

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});

  // New property form state
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    description: '',
    type: 'lodge',
    category: 'bush',
    featured: false,
    rating: 4.5,
    reviews: 0,
    price: 0,
    maxGuests: 2,
    minNights: 1,
    amenities: '',
    images: '',
    externalUrl: ''
  });

  // Edit property form state
  const [editPropertyForm, setEditPropertyForm] = useState({
    name: '',
    location: '',
    description: '',
    type: 'lodge',
    category: 'bush',
    featured: false,
    rating: 4.5,
    reviews: 0,
    price: 0,
    maxGuests: 2,
    minNights: 1,
    amenities: '',
    images: '',
    externalUrl: ''
  });

  // New room form state
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'tent',
    price: 0,
    maxGuests: 2,
    quantity: 1,
    description: '',
    amenities: '',
    images: ''
  });

  // Edit room form state
  const [editRoomForm, setEditRoomForm] = useState({
    name: '',
    type: 'tent',
    price: 0,
    maxGuests: 2,
    quantity: 1,
    description: '',
    amenities: '',
    images: ''
  });
  // Filter properties to exclude Nairobi hotels (which should only appear in Nairobi hotels section)
  const safariProperties = transformedProperties.filter(property =>
    property.safari_zone !== 'Nairobi'
  );

  // Filter properties based on search term
  const filteredProperties = safariProperties.filter(property =>
    (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lodge':
        return 'bg-blue-100 text-blue-800';
      case 'camp':
        return 'bg-green-100 text-green-800';
      case 'villa':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Validate media URLs (allow http(s) URLs and permissive data:image base64 URIs)
  const isValidMediaUrl = (url: string | undefined | null) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    try {
      // Allow standard http(s) URLs
      if (/^https?:\/\//i.test(trimmed)) return true;

      // Allow data:image URIs (be permissive: accept data:image/...;base64, even if base64 is chunked/newlined)
      if (trimmed.toLowerCase().startsWith('data:image/') && trimmed.toLowerCase().includes(';base64,')) return true;

      // Allow blob URLs
      if (trimmed.startsWith('blob:')) return true;

      // Allow certain signed storage URLs (quick heuristic)
      if (trimmed.includes('supabase.co') || trimmed.includes('storage.googleapis.com') || trimmed.includes('amazonaws.com')) return true;

      // Log rejected media for debugging
      console.warn('isValidMediaUrl: rejected media url', trimmed.slice(0, 200));
      return false;
    } catch (err) {
      return false;
    }
  };

  const nextImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleAddProperty = async () => {
    if (!newProperty.name || !newProperty.location || !newProperty.description || !newProperty.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amenitiesArray = newProperty.amenities.split(',').map(a => a.trim()).filter(a => a);
    let imagesArray = newProperty.images.split(',').map(i => i.trim()).filter(i => i);
    imagesArray = imagesArray.filter(isValidMediaUrl);

    const normalizedCategory = newProperty.category?.toLowerCase() === 'beach' ? 'beach' : 'bush';
    const propertyData = {
      name: newProperty.name,
      location: newProperty.location,
      description: newProperty.description,
      type: newProperty.type,
      category: normalizedCategory,
      featured: newProperty.featured,
      rating: newProperty.rating,
      reviews: newProperty.reviews,
      price: newProperty.price,
      maxGuests: newProperty.maxGuests,
      minNights: newProperty.minNights,
      amenities: amenitiesArray,
      images: imagesArray,
      externalUrl: newProperty.externalUrl || null,
    };

    try {
      const created = await addProperty(propertyData);
      toast.success('Property added successfully!');

      // Open Add Room dialog for the newly created property so the admin
      // can immediately add rooms to it.
      const createdId = (created && (created.id || created._id)) || '';
      if (createdId) {
        setSelectedPropertyId(createdId);
        setIsAddingRoom(true);
      }

      // Refresh list and reset the new property form
      refetch();
      setNewProperty({
        name: '',
        location: '',
        description: '',
        type: 'lodge',
        category: 'bush',
        featured: false,
        rating: 4.5,
        reviews: 0,
        price: 0,
        maxGuests: 2,
        minNights: 1,
        amenities: '',
        images: '',
        externalUrl: ''
      });
      setIsAddingProperty(false);
    } catch (error) {
      toast.error('Failed to add property');
      console.error(error);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setEditPropertyForm({
      name: property.name,
      location: property.location,
      description: property.description,
      type: property.type,
      category: property.category || 'bush',
      featured: property.featured,
      rating: property.rating,
      reviews: property.reviews,
      price: property.price,
      maxGuests: property.maxGuests,
      minNights: property.minNights || 1,
      amenities: property.amenities.join(', '),
      images: property.images.map(img => img.trim()).filter(img => img).join(', '),
      externalUrl: property.externalUrl || ''
    });
    setIsEditingProperty(true);
  };

  const handleEditRoom = (room: Room, property: Property) => {
    setEditingRoom(room);
    setSelectedProperty(property);
    setEditRoomForm({
      name: room.name,
      type: room.type,
      price: room.price,
      maxGuests: room.maxGuests,
      quantity: 1,
      description: room.description || '',
      amenities: room.amenities.map(a => a.trim()).filter(a => a).join(', '),
      images: room.images.map(img => img.trim()).filter(img => img).join(', ')
    });
    setIsEditingRoom(true);
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty || !editPropertyForm.name || !editPropertyForm.location || !editPropertyForm.description || !editPropertyForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amenitiesArray = editPropertyForm.amenities.split(',').map(a => a.trim()).filter(a => a);
    let imagesArray = editPropertyForm.images.split(',').map(i => i.trim()).filter(i => i);
    imagesArray = imagesArray.filter(isValidMediaUrl);

    const normalizedCategory = editPropertyForm.category?.toLowerCase() === 'beach' ? 'beach' : 'bush';
    const updatedData = {
      name: editPropertyForm.name,
      location: editPropertyForm.location,
      description: editPropertyForm.description,
      type: editPropertyForm.type,
      category: normalizedCategory,
      featured: editPropertyForm.featured,
      rating: editPropertyForm.rating,
      reviews: editPropertyForm.reviews,
      price: editPropertyForm.price,
      maxGuests: editingProperty.maxGuests,
      minNights: editPropertyForm.minNights,
      amenities: amenitiesArray,
      images: imagesArray.length > 0 ? imagesArray : (editingProperty.images || []).filter(isValidMediaUrl),
      externalUrl: editPropertyForm.externalUrl || null
    };

    try {
      console.debug('handleUpdateProperty: sending updatedData for', editingProperty.id, updatedData);
      const resp = await updateProperty(editingProperty.id, updatedData);
      console.debug('handleUpdateProperty: update response', resp);
      toast.success('Property updated successfully!');
      refetch();
      
      setIsEditingProperty(false);
      setEditingProperty(null);
    } catch (error) {
      toast.error('Failed to update property');
      console.error(error);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.type || !newRoom.price || !selectedPropertyId || !newRoom.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amenitiesArray = newRoom.amenities.split(',').map(a => a.trim()).filter(a => a);
    let imagesArray = newRoom.images.split(',').map(i => i.trim()).filter(i => i);
    imagesArray = imagesArray.filter(isValidMediaUrl);

    try {
      // Create multiple rooms based on quantity
      const roomPromises = Array.from({ length: newRoom.quantity }, (_, index) => {
        const roomData = {
          name: newRoom.name,
          type: newRoom.type,
          price: newRoom.price,
          maxGuests: newRoom.maxGuests,
          amenities: amenitiesArray,
          images: imagesArray,
          available: true,
        };
        return addRoom(selectedPropertyId, roomData);
      });

      await Promise.all(roomPromises);
      const roomWord = newRoom.quantity === 1 ? 'room' : 'rooms';
      toast.success(`${newRoom.quantity} ${roomWord} added successfully!`);
      refetch();
      
      // Reset form
      setNewRoom({
        name: '',
        type: 'tent',
        price: 0,
        maxGuests: 2,
        quantity: 1,
        description: '',
        amenities: '',
        images: ''
      });
      setIsAddingRoom(false);
      setSelectedPropertyId('');
    } catch (error) {
      toast.error('Failed to add rooms');
      console.error(error);
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom || !selectedProperty || !editRoomForm.name || !editRoomForm.type || !editRoomForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amenitiesArray = editRoomForm.amenities.split(',').map(a => a.trim()).filter(a => a);
    let imagesArray = editRoomForm.images.split(',').map(i => i.trim()).filter(i => i);
    imagesArray = imagesArray.filter(isValidMediaUrl);

    try {
      // Find all rooms with the same name
      const existingRooms = selectedProperty.rooms.filter(room => room.name === editingRoom.name);
      const currentQuantity = existingRooms.length;
      const newQuantity = editRoomForm.quantity;
      if (newQuantity > currentQuantity) {
        // Need to create additional rooms
        const roomsToCreate = newQuantity - currentQuantity;
        const roomPromises = Array.from({ length: roomsToCreate }, (_, index) => {
            const roomData = {
            name: `${editRoomForm.name}${roomsToCreate > 1 ? ` ${currentQuantity + index + 1}` : ''}`,
            type: editRoomForm.type,
            price: editRoomForm.price,
            maxGuests: editRoomForm.maxGuests,
            amenities: amenitiesArray,
              images: imagesArray.length > 0 ? imagesArray : (editingRoom.images || []).filter(isValidMediaUrl),
            available: true,
            description: editRoomForm.description
          };
          return addRoom(selectedProperty.id, roomData);
        });
        await Promise.all(roomPromises);
        toast.success(`Created ${roomsToCreate} additional ${editRoomForm.name} rooms`);
        refetch();
      } else if (newQuantity < currentQuantity) {
        // Need to delete some rooms
        const roomsToDelete = existingRooms.slice(newQuantity);
        await Promise.all(
          roomsToDelete.map(room => deleteRoom(room.id))
        );
        toast.success(`Deleted ${currentQuantity - newQuantity} ${editRoomForm.name} rooms`);
        refetch();
      }

      // Update the original room
      const updatedRoomData = {
        name: editRoomForm.name,
        type: editRoomForm.type,
        price: editRoomForm.price,
        maxGuests: editRoomForm.maxGuests,
        amenities: amenitiesArray,
        images: imagesArray.length > 0 ? imagesArray : (editingRoom.images || []).filter(isValidMediaUrl),
        description: editRoomForm.description
      };

      await updateRoom(editingRoom.id, updatedRoomData);
      toast.success('Room updated successfully!');
      
      // Refresh properties data to ensure updated room data is reflected
      refetch();
      
      setIsEditingRoom(false);
      setEditingRoom(null);
      setSelectedProperty(null);
    } catch (error) {
      toast.error('Failed to update room');
      console.error(error);
    }
  };

  const handleDeleteRoom = async (roomId: string, propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete room');
        console.error(error);
      }
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await deleteProperty(id);
        toast.success('Property deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete property');
        console.error(error);
      }
    }
  };

  const MediaCarousel = ({ images, propertyId }: { images: string[], propertyId: string }) => {
    const currentIndex = currentImageIndex[propertyId] || 0;
    const invalidImages: string[] = [];
    const validImages = images.filter(img => {
      const ok = isValidMediaUrl(img);
      if (!ok && img) invalidImages.push(img);
      return ok;
    });

    if (invalidImages.length > 0) {
      console.warn('MediaCarousel: filtered out invalid media URLs for property', propertyId, invalidImages);
    }
    
    if (!validImages || validImages.length === 0) {
      return (
        <div className="h-48 bg-gray-200 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-2" />
            <span className="text-sm">No media available</span>
          </div>
        </div>
      );
    }

    const currentMedia = validImages[currentIndex];
    const isCurrentVideo = isVideo(currentMedia);
    const isMicrosoftService = currentMedia && [
      'microsoftpersonalcontent.com',
      'southcentralus1-mediap.svc.ms',
      'mediap.svc.ms'
    ].some(host => currentMedia.toLowerCase().includes(host));

    console.log('MediaCarousel debug:', {
      propertyId,
      currentIndex,
      currentMedia,
      isCurrentVideo,
      isMicrosoftService,
      validImages
    });

    return (
      <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
        {isCurrentVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={(el) => {
                if (el && currentMedia) {
                  console.log('Admin video element created for:', currentMedia);
                }
              }}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              controls={false}
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                console.error('Admin video failed to load:', {
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
                console.log('Admin video loaded successfully:', currentMedia);
              }}
              onLoadStart={(e) => {
                console.log('Admin video load started:', currentMedia);
              }}
              onCanPlay={() => {
                console.log('Admin video can play:', currentMedia);
              }}
              onPlay={() => {
                console.log('Admin video started playing:', currentMedia);
              }}
              onPause={() => {
                console.log('Admin video paused:', currentMedia);
              }}
            >
              <source src={currentMedia} type="video/mp4" />
              <source src={currentMedia} type="video/webm" />
              <source src={currentMedia} type="video/ogg" />
              Your browser does not support the video tag.
            </video>

            {/* Hidden fallback for video errors */}
            <div className="video-fallback absolute inset-0 flex items-center justify-center bg-gray-200" style={{ display: 'none' }}>
              <div className="text-center text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">Video unavailable</span>
              </div>
            </div>

            {/* Click to Play Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
              onClick={(e) => {
                const container = e.currentTarget.closest('.relative');
                const video = container?.querySelector('video') as HTMLVideoElement;

                if (video) {
                  console.log('Admin play button clicked for video:', currentMedia);

                  if (video.paused) {
                    video.play().then(() => {
                      console.log('Admin video started playing successfully');
                    }).catch((error) => {
                      console.error('Failed to play admin video:', error);

                      // For Microsoft services, try opening in new tab as fallback
                      if (currentMedia && (currentMedia.includes('1drv.ms') || currentMedia.includes('sharepoint.com'))) {
                        console.log('Opening Microsoft video in new tab:', currentMedia);
                        window.open(currentMedia, '_blank');
                        return;
                      }

                      // Show fallback on play error
                      const fallbackDiv = container?.querySelector('.video-fallback') as HTMLElement | null;
                      if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                        e.currentTarget.classList.add('hidden');
                      }
                    });
                  } else {
                    video.pause();
                    console.log('Admin video paused');
                  }
                } else {
                  console.error('Admin video element not found for click handler');
                }
              }}
            >
              <div className="bg-black/60 rounded-full p-4 hover:bg-black/70 transition-colors">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Video Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                VIDEO
              </Badge>
            </div>
          </div>
        ) : (
          <img
            src={currentMedia}
            alt={`Property ${propertyId}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Media image failed to load, replacing with placeholder', { src: e.currentTarget.src, propertyId, currentMedia });
              e.currentTarget.removeAttribute('src');
              e.currentTarget.style.display = 'none';
              const container = e.currentTarget.closest('.relative');
              const fallback = container?.querySelector('.media-placeholder') as HTMLDivElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}

        {/* Fallback placeholder (hidden by default) */}
        <div className="media-placeholder absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg" style={{ display: 'none' }}>
          <div className="text-center text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-2" />
            <span className="text-sm">No media available</span>
          </div>
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
              onClick={() => prevImage(propertyId, validImages.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
              onClick={() => nextImage(propertyId, validImages.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white text-xs px-2 py-1">
              {currentIndex + 1} / {validImages.length}
            </Badge>
          </div>
        )}

        {/* Media Count Overlay */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {validImages.filter(img => !isVideo(img)).length > 0 && (
            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
              <Image className="h-3 w-3 mr-1" />
              {validImages.filter(img => !isVideo(img)).length}
            </Badge>
          )}
          {validImages.filter(img => isVideo(img)).length > 0 && (
            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
              <Video className="h-3 w-3 mr-1" />
              {validImages.filter(img => isVideo(img)).length}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link to="/admin" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
                <p className="text-gray-600 mt-1">Manage safari properties and rooms</p>
              </div>
            </div>
            <Dialog open={isAddingProperty} onOpenChange={setIsAddingProperty}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Property Name *</Label>
                      <Input
                        placeholder="Enter property name"
                        value={newProperty.name}
                        onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Input
                        placeholder="Enter location"
                        value={newProperty.location}
                        onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      placeholder="Enter property description"
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={newProperty.type} onValueChange={(value) => setNewProperty({...newProperty, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lodge">Lodge</SelectItem>
                          <SelectItem value="camp">Camp</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newProperty.category} onValueChange={(value) => setNewProperty({...newProperty, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bush">Bush</SelectItem>
                          <SelectItem value="beach">Beach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Base Price per Night *</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({...newProperty, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Guests</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newProperty.maxGuests}
                        onChange={(e) => setNewProperty({...newProperty, maxGuests: parseInt(e.target.value) || 2})}
                      />
                    </div>
                    <div>
                      <Label>Min Night Stay</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newProperty.minNights}
                        onChange={(e) => setNewProperty({...newProperty, minNights: parseInt(e.target.value) || 1})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum nights guests must book</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newProperty.rating}
                        onChange={(e) => setNewProperty({...newProperty, rating: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Number of Reviews</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newProperty.reviews}
                        onChange={(e) => setNewProperty({...newProperty, reviews: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Amenities (comma separated)</Label>
                    <Input
                      placeholder="WiFi, Pool, Restaurant, Spa"
                      value={newProperty.amenities}
                      onChange={(e) => setNewProperty({...newProperty, amenities: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Images & Videos (comma separated URLs)</Label>
                    <Textarea
                      placeholder="https://example.com/image1.jpg, https://example.com/video1.mp4, https://my.microsoftpersonalcontent.com/..."
                      value={newProperty.images}
                      onChange={(e) => setNewProperty({...newProperty, images: e.target.value})}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports images (.jpg, .png, .webp), videos (.mp4, .webm, .mov), YouTube, Vimeo, and Microsoft OneDrive/SharePoint links
                    </p>
                  </div>

                  <div>
                    <Label>External Booking URL (Optional)</Label>
                    <Input
                      placeholder="https://www.mwazaro.com/ (Redirect users to external site for booking)"
                      value={newProperty.externalUrl}
                      onChange={(e) => setNewProperty({...newProperty, externalUrl: e.target.value})}
                      type="url"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for normal internal booking flow. If set, users will be redirected to this URL when clicking View Details or Book Now.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newProperty.featured}
                      onChange={(e) => setNewProperty({...newProperty, featured: e.target.checked})}
                    />
                    <Label htmlFor="featured">Featured Property</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingProperty(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleAddProperty}>
                      <Save className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search properties by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative">
                <MediaCarousel images={property.images} propertyId={property.id} />
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className={getTypeColor(property.type)}>
                    {property.type}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {(property.category || 'bush').charAt(0).toUpperCase() + (property.category || 'bush').slice(1)}
                  </Badge>
                </div>
                
                {property.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-500 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {property.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{property.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({property.reviews} reviews)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${property.price}
                    </p>
                    <p className="text-xs text-gray-500">
                      {property.minNights > 1 ? `/ ${property.minNights} nights` : 'per night'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{Object.keys(
                      property.rooms.reduce((acc, room) => {
                        acc[room.name] = true;
                        return acc;
                      }, {} as Record<string, boolean>)
                    ).length} room types</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Up to {property.maxGuests} guests</span>
                    </div>
                    {property.minNights > 1 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        {property.minNights} night min
                      </span>
                    )}
                  </div>
                </div>

                {/* Room Management */}
                {property.rooms.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Rooms:</p>
                    <div className="space-y-2">
                      {/* Group rooms by name and show quantities */}
                      {Object.entries(
                        property.rooms.reduce((acc: Record<string, Room & { count: number; ids: string[] }>, room: Room) => {
                          if (!acc[room.name]) {
                            acc[room.name] = {
                              ...room,
                              count: 1,
                              ids: [room.id || '']
                            };
                          } else {
                            acc[room.name].count += 1;
                            acc[room.name].ids.push(room.id || '');
                          }
                          return acc;
                        }, {})
                      ).map(([roomName, roomData]: [string, Room & { count: number; ids: string[] }]) => (
                        <div key={roomName} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <div>
                            <span className="text-gray-600">{roomData.count > 1 ? `${roomData.count} x ` : ''}{roomName}</span>
                            <span className="text-gray-400 ml-2">(${roomData.price}/night)</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRoom(roomData, property)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={async () => {
                                if (window.confirm(`Delete all ${roomData.count} ${roomName} rooms?`)) {
                                  try {
                                    // Delete all rooms with this name
                                    await Promise.all(
                                      roomData.ids.map((id: string) => deleteRoom(id))
                                    );
                                    toast.success(`Deleted ${roomData.count} ${roomName} rooms`);
                                    refetch(); // Refresh the data
                                  } catch (error) {
                                    toast.error('Failed to delete rooms');
                                    console.error(error);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Dialog open={isAddingRoom && selectedPropertyId === property.id} onOpenChange={(open) => {
                  setIsAddingRoom(open);
                  if (!open) setSelectedPropertyId('');
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Room to {property.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                        <Label>Room Name *</Label>
                        <Input
                          placeholder="Enter room name"
                          value={newRoom.name}
                          onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label>Room Type *</Label>
                        <Input
                          type="text"
                          placeholder="e.g., Tent, Suite, Villa, Beachfront Room, etc."
                          value={newRoom.type}
                          onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                          className="mb-2"
                        />
                        <p className="text-xs text-gray-500 mb-3">Or select a preset:</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => setNewRoom({...newRoom, type: 'tent'})}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                          >
                            Tent
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoom({...newRoom, type: 'suite'})}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                          >
                            Suite
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoom({...newRoom, type: 'family-lodge'})}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                          >
                            Family Lodge
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoom({...newRoom, type: 'luxury-tent'})}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                          >
                            Luxury Tent
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price per Night *</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newRoom.price}
                            onChange={(e) => setNewRoom({...newRoom, price: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Max Guests</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newRoom.maxGuests}
                          onChange={(e) => setNewRoom({...newRoom, maxGuests: parseInt(e.target.value)})}
                        />
                      </div>

                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={newRoom.quantity}
                          onChange={(e) => setNewRoom({...newRoom, quantity: parseInt(e.target.value) || 1})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Number of identical rooms to create</p>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Room description"
                          value={newRoom.description}
                          onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Amenities (comma separated)</Label>
                        <Input
                          placeholder="King bed, Balcony, Mini bar"
                          value={newRoom.amenities}
                          onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Images & Videos (comma separated URLs)</Label>
                        <Textarea
                          placeholder="https://example.com/room1.jpg, https://example.com/room-video.mp4"
                          value={newRoom.images}
                          onChange={(e) => setNewRoom({...newRoom, images: e.target.value})}
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsAddingRoom(false);
                          setSelectedPropertyId('');
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddRoom}>
                          Add Room
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Property Dialog */}
        <Dialog open={isEditingProperty} onOpenChange={setIsEditingProperty}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Property: {editingProperty?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Name *</Label>
                  <Input
                    placeholder="Enter property name"
                    value={editPropertyForm.name}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Input
                    placeholder="Enter location"
                    value={editPropertyForm.location}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Enter property description"
                  value={editPropertyForm.description}
                  onChange={(e) => setEditPropertyForm({...editPropertyForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={editPropertyForm.type} onValueChange={(value) => setEditPropertyForm({...editPropertyForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lodge">Lodge</SelectItem>
                      <SelectItem value="camp">Camp</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editPropertyForm.category} onValueChange={(value) => setEditPropertyForm({...editPropertyForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bush">Bush</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Price per Night *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={editPropertyForm.price}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editPropertyForm.maxGuests}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, maxGuests: parseInt(e.target.value) || 2})}
                  />
                </div>
                <div>
                  <Label>Min Night Stay</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editPropertyForm.minNights}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, minNights: parseInt(e.target.value) || 1})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum nights guests must book</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editPropertyForm.rating}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, rating: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Number of Reviews</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editPropertyForm.reviews}
                    onChange={(e) => setEditPropertyForm({...editPropertyForm, reviews: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label>Amenities (comma separated)</Label>
                <Input
                  placeholder="WiFi, Pool, Restaurant, Spa"
                  value={editPropertyForm.amenities}
                  onChange={(e) => setEditPropertyForm({...editPropertyForm, amenities: e.target.value})}
                />
              </div>

              <div>
                <Label>Images & Videos (comma separated URLs)</Label>
                <Textarea
                  placeholder="https://example.com/image1.jpg, https://example.com/video1.mp4, https://my.microsoftpersonalcontent.com/..."
                  value={editPropertyForm.images}
                  onChange={(e) => setEditPropertyForm({...editPropertyForm, images: e.target.value})}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports images (.jpg, .png, .webp), videos (.mp4, .webm, .mov), YouTube, Vimeo, and Microsoft OneDrive/SharePoint links
                </p>
              </div>

              <div>
                <Label>External Booking URL (Optional)</Label>
                <Input
                  placeholder="https://www.mwazaro.com/ (Redirect users to external site for booking)"
                  value={editPropertyForm.externalUrl}
                  onChange={(e) => setEditPropertyForm({...editPropertyForm, externalUrl: e.target.value})}
                  type="url"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for normal internal booking flow. If set, users will be redirected to this URL when clicking View Details or Book Now.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editPropertyForm.featured}
                  onChange={(e) => setEditPropertyForm({...editPropertyForm, featured: e.target.checked})}
                />
                <Label htmlFor="editFeatured">Featured Property</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditingProperty(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateProperty}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Property
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={isEditingRoom} onOpenChange={setIsEditingRoom}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Room: {editingRoom?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Room Name *</Label>
                <Input
                  placeholder="Enter room name"
                  value={editRoomForm.name}
                  onChange={(e) => setEditRoomForm({...editRoomForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Room Type *</Label>
                <Input
                  type="text"
                  placeholder="e.g., Tent, Suite, Villa, Beachfront Room, etc."
                  value={editRoomForm.type}
                  onChange={(e) => setEditRoomForm({...editRoomForm, type: e.target.value})}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500 mb-3">Or select a preset:</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setEditRoomForm({...editRoomForm, type: 'tent'})}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                  >
                    Tent
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRoomForm({...editRoomForm, type: 'suite'})}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                  >
                    Suite
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRoomForm({...editRoomForm, type: 'family-lodge'})}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                  >
                    Family Lodge
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRoomForm({...editRoomForm, type: 'luxury-tent'})}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 text-left"
                  >
                    Luxury Tent
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price per Night *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={editRoomForm.price}
                    onChange={(e) => setEditRoomForm({...editRoomForm, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>Max Guests</Label>
                <Input
                  type="number"
                  min="1"
                  value={editRoomForm.maxGuests}
                  onChange={(e) => setEditRoomForm({...editRoomForm, maxGuests: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={editRoomForm.quantity}
                  onChange={(e) => setEditRoomForm({...editRoomForm, quantity: parseInt(e.target.value) || 1})}
                />
                <p className="text-xs text-gray-500 mt-1">Update quantity of this room type</p>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Room description"
                  value={editRoomForm.description}
                  onChange={(e) => setEditRoomForm({...editRoomForm, description: e.target.value})}
                />
              </div>

              <div>
                <Label>Amenities (comma separated)</Label>
                <Input
                  placeholder="King bed, Balcony, Mini bar"
                  value={editRoomForm.amenities}
                  onChange={(e) => setEditRoomForm({...editRoomForm, amenities: e.target.value})}
                />
              </div>

              <div>
                <Label>Images & Videos (comma separated URLs)</Label>
                <Textarea
                  placeholder="https://example.com/room1.jpg, https://example.com/room-video.mp4"
                  value={editRoomForm.images}
                  onChange={(e) => setEditRoomForm({...editRoomForm, images: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingRoom(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRoom}>
                  Update Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No properties have been added yet'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}