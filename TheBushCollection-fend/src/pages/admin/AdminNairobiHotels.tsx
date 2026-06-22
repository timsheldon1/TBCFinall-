import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Star, Hotel, Bed, Loader2, XCircle, RefreshCw, Plane, CheckCircle, XCircle as XCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties, Property, Room } from '@/hooks/useBackendProperties';
import { toast } from 'sonner';

export default function AdminNairobiHotels() {
  const { properties, loading, error, addProperty, updateProperty, deleteProperty, addRoom, updateRoom, deleteRoom, refetch } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Property | null>(null);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

  // Hotel form state
  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: 'Nairobi, Kenya',
    description: '',
    type: 'lodge',
    featured: false,
    rating: 4.5,
    reviews: 0,
    price_from: 0,
    amenities: '',
    images: '',
    safari_zone: 'Nairobi'
  });

  // Room form state
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'suite',
    price: 0,
    max_guests: 2,
    description: '',
    amenities: '',
    images: '',
    available: true
  });

  // Filter only Nairobi hotels
  const nairobiHotels = properties.filter(p => 
    (p.location || '').toLowerCase().includes('nairobi')
  );

  // Filter hotels based on search
  const filteredHotels = nairobiHotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddHotel = async () => {
    try {
      const amenitiesArray = hotelForm.amenities.split(',').map(a => a.trim()).filter(a => a);
      const imagesArray = hotelForm.images.split('\n').map(i => i.trim()).filter(i => i);

      const created = await addProperty({
        name: hotelForm.name,
        location: hotelForm.location,
        description: hotelForm.description,
        type: hotelForm.type,
        featured: hotelForm.featured,
        rating: hotelForm.rating,
        reviews: hotelForm.reviews,
        price_from: hotelForm.price_from,
        amenities: amenitiesArray,
        images: imagesArray,
        safari_zone: 'Nairobi'
      });

      toast.success('Nairobi hotel added successfully!');
      // If the backend returned the created hotel, open the Add Room dialog
      const createdId = (created && (created.id || created._id)) || '';
      if (createdId) {
        setSelectedHotelId(createdId);
        setIsRoomDialogOpen(true);
      }

      // Refresh and reset form
      refetch();
      resetHotelForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add hotel');
      console.error(error);
    }
  };

  const handleUpdateHotel = async () => {
    if (!editingHotel) return;

    try {
      const amenitiesArray = hotelForm.amenities.split(',').map(a => a.trim()).filter(a => a);
      const imagesArray = hotelForm.images.split('\n').map(i => i.trim()).filter(i => i);

      await updateProperty(editingHotel.id, {
        name: hotelForm.name,
        location: hotelForm.location,
        description: hotelForm.description,
        type: hotelForm.type,
        featured: hotelForm.featured,
        rating: hotelForm.rating,
        reviews: hotelForm.reviews,
        price_from: hotelForm.price_from,
        amenities: amenitiesArray,
        images: imagesArray,
        safari_zone: 'Nairobi'
      });

      toast.success('Hotel updated successfully!');
      resetHotelForm();
      setIsDialogOpen(false);
      setEditingHotel(null);
    } catch (error) {
      toast.error('Failed to update hotel');
      console.error(error);
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await deleteProperty(id);
        toast.success('Hotel deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete hotel');
        console.error(error);
      }
    }
  };

  const handleEditHotel = (hotel: Property) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description || '',
      type: hotel.type,
      featured: hotel.featured || false,
      rating: hotel.rating || 4.5,
      reviews: hotel.reviews || 0,
      price_from: hotel.price_from || hotel.price || 0,
      amenities: (hotel.amenities || []).join(', '),
      images: (hotel.images || []).join('\n'),
      safari_zone: 'Nairobi'
    });
    setIsDialogOpen(true);
  };

  const resetHotelForm = () => {
    setHotelForm({
      name: '',
      location: 'Nairobi, Kenya',
      description: '',
      type: 'lodge',
      featured: false,
      rating: 4.5,
      reviews: 0,
      price_from: 0,
      amenities: '',
      images: '',
      safari_zone: 'Nairobi'
    });
    setEditingHotel(null);
  };

  const handleAddRoom = async (hotelId?: string) => {
    const currentHotelId = hotelId || selectedHotelId;

    console.log('=== handleAddRoom START ===');
    console.log('hotelId parameter:', hotelId);
    console.log('selectedHotelId state:', selectedHotelId);
    console.log('currentHotelId to use:', currentHotelId);

    if (!currentHotelId) {
      toast.error('Please select a hotel first');
      console.error('No hotel ID available');
      return;
    }

    // Validate required fields
    console.log('=== VALIDATION CHECKS ===');
    console.log('roomForm.name:', roomForm.name);
    console.log('roomForm.type:', roomForm.type);
    console.log('roomForm.price:', roomForm.price);
    console.log('roomForm.max_guests:', roomForm.max_guests);

    if (!roomForm.name.trim()) {
      toast.error('Room name is required');
      console.error('Validation failed: Room name is required');
      return;
    }
    if (!roomForm.type) {
      toast.error('Room type is required');
      console.error('Validation failed: Room type is required');
      return;
    }
    if (roomForm.price <= 0) {
      toast.error('Price must be greater than 0');
      console.error('Validation failed: Price must be greater than 0');
      return;
    }
    if (roomForm.max_guests <= 0) {
      toast.error('Max guests must be greater than 0');
      console.error('Validation failed: Max guests must be greater than 0');
      return;
    }

    console.log('✅ All validations passed');

    console.log('Adding room with data:', {
      selectedHotelId,
      currentHotelId,
      name: roomForm.name,
      type: roomForm.type,
      price: roomForm.price,
      max_guests: roomForm.max_guests,
      description: roomForm.description,
      amenities: roomForm.amenities,
      images: roomForm.images,
      available: roomForm.available
    });

    try {
      const amenitiesArray = roomForm.amenities ? roomForm.amenities.split(',').map(a => a.trim()).filter(a => a) : [];
      const imagesArray = roomForm.images ? roomForm.images.split('\n').map(i => i.trim()).filter(i => i) : [];

      console.log('=== API CALL ===');
      console.log('Calling addRoom API with:', {
        hotelId: currentHotelId,
        roomData: {
          name: roomForm.name,
          type: roomForm.type,
          price: roomForm.price,
          max_guests: roomForm.max_guests,
          description: roomForm.description,
          amenities: amenitiesArray,
          images: imagesArray,
          available: roomForm.available
        }
      });

      const result = await addRoom(currentHotelId, {
        name: roomForm.name,
        type: roomForm.type,
        price: roomForm.price,
        max_guests: roomForm.max_guests,
        description: roomForm.description,
        amenities: amenitiesArray,
        images: imagesArray,
        available: roomForm.available
      } as any);

      console.log('✅ Room added successfully! Result:', result);
      toast.success('Room added successfully!');
      resetRoomForm(); // Clear hotel ID after successful addition
      setIsRoomDialogOpen(false);
    } catch (error) {
      console.error('❌ Error adding room:', error);
      toast.error(`Failed to add room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('=== handleAddRoom END ===');
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom || !selectedHotelId) return;

    try {
      const amenitiesArray = roomForm.amenities.split(',').map(a => a.trim()).filter(a => a);
      const imagesArray = roomForm.images.split('\n').map(i => i.trim()).filter(i => i);

      await updateRoom(editingRoom.id, {
        name: roomForm.name,
        type: roomForm.type,
        price: roomForm.price,
        max_guests: roomForm.max_guests,
        amenities: amenitiesArray,
        images: imagesArray,
        available: roomForm.available
      } as any);

      toast.success('Room updated successfully!');
      resetRoomForm();
      setIsRoomDialogOpen(false);
      setEditingRoom(null);
    } catch (error) {
      toast.error('Failed to update room');
      console.error(error);
    }
  };

  const handleEditRoom = (hotelId: string, room: Room) => {
    setSelectedHotelId(hotelId);
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      type: room.type,
      price: room.price,
      max_guests: room.max_guests || room.maxGuests || 2,
      description: room.description || '',
      amenities: (room.amenities || []).join(', '),
      images: (room.images || []).join('\n'),
      available: room.available !== false
    });
    setIsRoomDialogOpen(true);
  };

  const handleDeleteRoom = async (hotelId: string, roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete room');
        console.error(error);
      }
    }
  };

  const resetRoomForm = (clearHotelId: boolean = true) => {
    setRoomForm({
      name: '',
      type: 'suite',
      price: 0,
      max_guests: 2,
      description: '',
      amenities: '',
      images: '',
      available: true
    });
    setEditingRoom(null);
    if (clearHotelId) {
      setSelectedHotelId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Nairobi hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Hotels</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Nairobi Hotels</h1>
              </div>
              <p className="text-gray-600">Manage pre-safari accommodation in Nairobi</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetHotelForm} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHotel ? 'Edit Hotel' : 'Add New Nairobi Hotel'}
                </DialogTitle>
                <DialogDescription>
                  {editingHotel ? 'Update the details of this Nairobi hotel.' : 'Fill in the details below to add a new hotel in Nairobi for pre-safari accommodation.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    value={hotelForm.name}
                    onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                    placeholder="e.g., Nairobi Serena Hotel"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={hotelForm.location}
                    onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                    placeholder="Nairobi, Kenya"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={hotelForm.description}
                    onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the hotel and its benefits for pre-safari stays..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={hotelForm.type} onValueChange={(value) => setHotelForm({ ...hotelForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lodge">Lodge</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="tented-camp">Tented Camp</SelectItem>
                        <SelectItem value="luxury-camp">Luxury Camp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price_from">Price From (USD) *</Label>
                    <Input
                      id="price_from"
                      type="number"
                      value={hotelForm.price_from}
                      onChange={(e) => setHotelForm({ ...hotelForm, price_from: parseFloat(e.target.value) })}
                      placeholder="180"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={hotelForm.rating}
                      onChange={(e) => setHotelForm({ ...hotelForm, rating: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      type="number"
                      value={hotelForm.reviews}
                      onChange={(e) => setHotelForm({ ...hotelForm, reviews: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Textarea
                    id="amenities"
                    value={hotelForm.amenities}
                    onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                    rows={3}
                    placeholder="Airport Transfer, Free WiFi, Restaurant, Bar, Spa"
                  />
                </div>

                <div>
                  <Label htmlFor="images">Image URLs (one per line)</Label>
                  <Textarea
                    id="images"
                    value={hotelForm.images}
                    onChange={(e) => setHotelForm({ ...hotelForm, images: e.target.value })}
                    rows={3}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={hotelForm.featured}
                    onChange={(e) => setHotelForm({ ...hotelForm, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="featured">This is our property (can be booked from website)</Label>
                </div>

                <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Hotel Type:</span>
                    <Badge variant={hotelForm.featured ? "default" : "secondary"} className={
                      hotelForm.featured ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }>
                      {hotelForm.featured ? "✅ Our Property (Bookable)" : "ℹ️ Partner Hotel (Info Only)"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {hotelForm.featured
                      ? "Customers can book this hotel directly from the website."
                      : "This hotel will only show information and cannot be booked through our website."
                    }
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingHotel ? handleUpdateHotel : handleAddHotel}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {editingHotel ? 'Update Hotel' : 'Add Hotel'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Plane className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About Nairobi Hotels</h3>
                <p className="text-gray-700 text-sm">
                  These hotels provide comfortable overnight accommodation for clients arriving in Nairobi
                  before their safari begins. They typically offer airport transfers, early morning departures,
                  and amenities to help guests rest and prepare for their safari adventure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <Label htmlFor="search">Search Hotels</Label>
              <Input
                id="search"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nairobiHotels.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nairobiHotels.filter(h => h.featured).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotels List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredHotels.map((hotel) => {
            const isOurProperty = hotel.featured === true ||
              (hotel.name && (
                hotel.name.toLowerCase().includes('bush collection') ||
                hotel.name.toLowerCase().includes('the bush')
              ));

            return (
              <Card key={hotel.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                isOurProperty ? 'border-green-200 bg-green-50/30' : 'border-blue-200 bg-blue-50/30'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Hotel Image */}
                  <div className="relative">
                    {hotel.images && hotel.images.length > 0 ? (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Hotel className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className={isOurProperty ? 'bg-green-500' : 'bg-blue-500'}>
                        {isOurProperty ? 'Our Property' : 'Partner Hotel'}
                      </Badge>
                    </div>
                    {hotel.featured && (
                      <Badge className="absolute top-2 right-2 bg-orange-500">Featured</Badge>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                          {isOurProperty ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {hotel.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {hotel.rating} ({hotel.reviews} reviews)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isOurProperty && (
                          <>
                            <div className="text-2xl font-bold text-orange-600">
                              ${(hotel as any).price_from || (hotel as any).price || 0}
                            </div>
                            <div className="text-sm text-gray-500">per night</div>
                          </>
                        )}
                        {!isOurProperty && (
                          <div className="text-sm text-gray-500 italic">Price not available</div>
                        )}
                        <Badge variant="outline" className={`mt-1 ${
                          isOurProperty ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'
                        }`}>
                          {isOurProperty ? 'Bookable' : 'Info Only'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {hotel.description}
                    </p>

                    {/* Booking Status Info */}
                    <div className={`p-3 rounded-lg mb-4 ${
                      isOurProperty ? 'bg-green-100 border border-green-200' : 'bg-blue-100 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${
                          isOurProperty ? 'text-green-800' : 'text-blue-800'
                        }`}>
                          {isOurProperty ? '✅ Bookable Property' : 'ℹ️ Information Only'}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        isOurProperty ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {isOurProperty
                          ? 'This property can be booked directly from the website by customers.'
                          : 'This partner hotel provides information only and cannot be booked through our website.'
                        }
                      </p>
                    </div>

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.slice(0, 5).map((amenity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hotel.amenities.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hotel.amenities.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Rooms */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Bed className="h-4 w-4" />
                          Rooms ({((hotel as any).safari_rooms || (hotel as any).rooms || []).length})
                        </h4>
                        {isOurProperty && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedHotelId(hotel.id);
                              resetRoomForm(false); // Don't clear hotel ID when adding a room
                              setIsRoomDialogOpen(true);
                            }}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Room
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {((hotel as any).safari_rooms || (hotel as any).rooms || []).map((room: Room) => (
                          <div key={room.id} className={`flex items-center justify-between p-2 rounded ${
                            isOurProperty ? 'bg-green-50' : 'bg-blue-50'
                          }`}>
                            <div>
                              <div className="font-medium text-sm">{room.name}</div>
                              <div className="text-xs text-gray-500">
                                ${room.price} • Max {room.max_guests || room.maxGuests} guests
                              </div>
                            </div>
                            {isOurProperty && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditRoom(hotel.id, room)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteRoom(hotel.id, room.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditHotel(hotel)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Hotel
                      </Button>
                      {isOurProperty && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHotel(hotel.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredHotels.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Hotel className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No hotels found' : 'No Nairobi hotels yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Add your first Nairobi hotel to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hotel
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Room Dialog */}
        <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
              <DialogDescription>
                {editingRoom ? 'Update the details of this room.' : 'Fill in the details below to add a new room to this hotel.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="room-name">Room Name *</Label>
                  <Input
                    id="room-name"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    placeholder="e.g., Deluxe Room"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room-type">Room Type</Label>
                    <Select value={roomForm.type} onValueChange={(value) => setRoomForm({ ...roomForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="tent">Tent</SelectItem>
                        <SelectItem value="family-lodge">Family Lodge</SelectItem>
                        <SelectItem value="luxury-tent">Luxury Tent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="room-price">Price (USD) *</Label>
                    <Input
                      id="room-price"
                      type="number"
                      value={roomForm.price || 0}
                      onChange={(e) => setRoomForm({ ...roomForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="room-max-guests">Max Guests</Label>
                  <Input
                    id="room-max-guests"
                    type="number"
                    value={roomForm.max_guests || 1}
                    onChange={(e) => setRoomForm({ ...roomForm, max_guests: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <Label htmlFor="room-description">Description</Label>
                  <Textarea
                    id="room-description"
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="room-amenities">Amenities (comma-separated)</Label>
                  <Textarea
                    id="room-amenities"
                    value={roomForm.amenities}
                    onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                    rows={2}
                    placeholder="King Bed, City View, Mini Bar"
                  />
                </div>

                <div>
                  <Label htmlFor="room-images">Image URLs (one per line)</Label>
                  <Textarea
                    id="room-images"
                    value={roomForm.images}
                    onChange={(e) => setRoomForm({ ...roomForm, images: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="room-available"
                    checked={roomForm.available}
                    onChange={(e) => setRoomForm({ ...roomForm, available: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="room-available">Available for Booking</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4">
              <Button variant="outline" onClick={() => {
                console.log('Cancel button clicked');
                setIsRoomDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log('Add Room button clicked, calling handleAddRoom');
                  handleAddRoom(selectedHotelId);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
