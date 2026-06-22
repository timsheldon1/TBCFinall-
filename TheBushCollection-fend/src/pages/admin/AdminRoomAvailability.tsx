import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Building, Bed, Users, MapPin, Edit, Check, X, Clock, AlertTriangle, Loader2, XCircle, RefreshCw } from 'lucide-react';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import { toast } from 'sonner';
import api from '@/lib/api';

type SupabaseRoom = {
  id: string;
  name: string;
  type: string;
  max_guests: number;
  price: number;
  available: boolean;
  available_from: string | null;
  booked_until: string | null;
  amenities: string[];
  images: string[];
};

type BookingRoom = {
  roomId?: string;
  [key: string]: unknown;
};

type BookingItem = {
  roomId?: string;
  rooms?: BookingRoom[];
  [key: string]: unknown;
};

export default function AdminRoomAvailability() {
  const { properties, loading, error, updateRoom, refetch } = useBackendProperties();
  type LocalProperty = { id: string; name: string; location?: string; rooms?: SupabaseRoom[] };
  const props = properties as unknown as LocalProperty[];
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [editingRoom, setEditingRoom] = useState<{ propertyId: string; roomId: string } | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    available: true,
    availableFrom: '',
    bookedUntil: ''
  });

  const filteredProperties = selectedProperty === 'all' 
    ? props 
    : props.filter(p => p.id === selectedProperty);

  // Check if there are any confirmed admin bookings that reference a room
  const checkCurrentBookings = useCallback(async (roomId: string) => {
    try {
      const res = await api.get<BookingItem[] | { data: BookingItem[] }>('/bookings/admin/bookings', { params: { status: 'confirmed' } });
  const resData = res.data;
  let rawData: BookingItem[] = [];
  if (Array.isArray(resData)) rawData = resData as BookingItem[];
  else if (resData && typeof resData === 'object' && 'data' in (resData as object)) rawData = (resData as { data: BookingItem[] }).data;
  const items: BookingItem[] = Array.isArray(rawData) ? rawData : [];

      const matches = items.filter((b: BookingItem) => {
        // support different shapes returned by backend
        if (typeof b.roomId === 'string' && b.roomId === roomId) return true;
        if (Array.isArray(b.rooms)) return b.rooms.some((r: BookingRoom) => typeof r.roomId === 'string' && r.roomId === roomId);
        return false;
      });

      return matches.length > 0;
    } catch (err) {
      console.error('Error checking bookings:', err);
      // On error, be conservative and assume no bookings to avoid blocking admin actions unnecessarily
      return false;
    }
  }, []);

  const handleEditAvailability = (propertyId: string, roomId: string, room: SupabaseRoom) => {
    setEditingRoom({ propertyId, roomId });
    setAvailabilityForm({
      available: !!room.available,
      availableFrom: room.available_from ?? '',
      bookedUntil: room.booked_until ?? ''
    });
  };

  const handleSaveAvailability = async () => {
    if (!editingRoom) return;

    try {
      // Check for existing bookings if marking room as unavailable
      if (!availabilityForm.available) {
        const hasBookings = await checkCurrentBookings(editingRoom.roomId);
        if (hasBookings) {
          toast.error('Cannot mark room as unavailable - there are active bookings');
          return;
        }
      }

      await updateRoom(editingRoom.roomId, {
        available: availabilityForm.available,
        available_from: availabilityForm.availableFrom || null,
        booked_until: availabilityForm.bookedUntil || null,
        updated_at: new Date().toISOString()
      } as unknown as Record<string, unknown>);

      const statusMessage = availabilityForm.available 
        ? 'Room marked as available' 
        : 'Room marked as unavailable';
      
      toast.success(statusMessage);
      setEditingRoom(null);
      setAvailabilityForm({ available: true, availableFrom: '', bookedUntil: '' });
    } catch (error) {
      toast.error('Failed to update room availability');
    }
  };

  const handleQuickToggle = async (propertyId: string, roomId: string, currentStatus: boolean) => {
    try {
      // Check for existing bookings if marking room as unavailable
      if (currentStatus) {
        const hasBookings = await checkCurrentBookings(roomId);
        if (hasBookings) {
          toast.error('Cannot mark room as unavailable - there are active bookings');
          return;
        }
      }

      await updateRoom(roomId, {
        available: !currentStatus,
        updated_at: new Date().toISOString()
      } as unknown as Record<string, unknown>);
      const message = !currentStatus ? 'Room marked as available' : 'Room marked as unavailable';
      toast.success(message);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  const getAvailabilityBadge = (room: SupabaseRoom) => {
    if (!room.available) {
      return <Badge className="bg-red-100 text-red-800">Unavailable</Badge>;
    }
    
    if (room.booked_until && new Date(room.booked_until) > new Date()) {
      return <Badge className="bg-orange-100 text-orange-800">Booked until {new Date(room.booked_until).toLocaleDateString()}</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Available</Badge>;
  };

  const getAvailabilityInfo = (room: SupabaseRoom) => {
    if (!room.available) {
      return <span className="text-sm text-red-600">Marked as unavailable</span>;
    }
    
    if (room.booked_until && new Date(room.booked_until) > new Date()) {
      return <span className="text-sm text-orange-600">Next available after {new Date(room.booked_until).toLocaleDateString()}</span>;
    }
    
    return <span className="text-sm text-green-600">Ready for booking</span>;
  };

  const totalRooms = props.reduce((sum, property) => sum + (property.rooms?.length || 0), 0);
  const availableRooms = props.reduce((sum, property) => 
    sum + (property.rooms?.filter((room: SupabaseRoom) => room.available).length || 0), 0
  );
  const unavailableRooms = totalRooms - availableRooms;
  const fullyBookedProperties = props.filter(p => {
    const rooms = p.rooms || [];
    return rooms.length > 0 && rooms.every((r: SupabaseRoom) => !r.available);
  }).length;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Loading Room Availability</h2>
          <p className="text-gray-600">Please wait while we fetch room data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Error loading room data: {error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Availability Management</h1>
          <p className="text-gray-600">Manage room availability and booking status across all properties</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
              </div>
              <Bed className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableRooms}</p>
              </div>
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">{unavailableRooms}</p>
              </div>
              <X className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fully Booked</p>
                <p className="text-2xl font-bold text-orange-600">{fullyBookedProperties}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="property-filter">Filter by Property:</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {props.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties and Rooms */}
      <div className="space-y-6">
        {filteredProperties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-orange-500" />
                  <div>
                    <CardTitle className="text-xl">{property.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                      {property.rooms && property.rooms.length > 0 && property.rooms.every(r => !r.available) && (
                        <Badge className="bg-red-100 text-red-800 ml-2">Fully Booked</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">
                    {(property.rooms || []).filter(r => r.available).length} / {(property.rooms || []).length} available
                  </p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(property.rooms || []).length > 0 ? ((property.rooms || []).filter(r => r.available).length / (property.rooms || []).length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(property.rooms || []).map((room) => (
                  <div key={room.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{room.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{room.type}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Up to {room.max_guests} guests</span>
                          </div>
                          <div className="font-medium text-green-600">
                            ${room.price}/night
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getAvailabilityBadge(room)}
                        </div>
                        <div>{getAvailabilityInfo(room)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={room.available}
                          onCheckedChange={() => handleQuickToggle(property.id, room.id, room.available)}
                        />
                        <span className="text-sm text-gray-600">
                          {room.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditAvailability(property.id, room.id, room)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Room Availability</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">{room.name}</h4>
                              <p className="text-sm text-gray-600">{property.name}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={availabilityForm.available}
                                onCheckedChange={(checked) => 
                                  setAvailabilityForm(prev => ({ ...prev, available: checked }))
                                }
                              />
                              <Label>Room is available for booking</Label>
                            </div>

                            {!availabilityForm.available && (
                              <>
                                <div>
                                  <Label htmlFor="availableFrom">Available From (Optional)</Label>
                                  <Input
                                    id="availableFrom"
                                    type="date"
                                    value={availabilityForm.availableFrom}
                                    onChange={(e) => 
                                      setAvailabilityForm(prev => ({ ...prev, availableFrom: e.target.value }))
                                    }
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    When will this room be available again?
                                  </p>
                                </div>

                                <div>
                                  <Label htmlFor="bookedUntil">Booked Until (Optional)</Label>
                                  <Input
                                    id="bookedUntil"
                                    type="date"
                                    value={availabilityForm.bookedUntil}
                                    onChange={(e) => 
                                      setAvailabilityForm(prev => ({ ...prev, bookedUntil: e.target.value }))
                                    }
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Until when is this room booked?
                                  </p>
                                </div>
                              </>
                            )}

                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleSaveAvailability} className="flex-1">
                                <Check className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>

              {(!property.rooms || property.rooms.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Bed className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No rooms configured for this property</p>
                  <p className="text-xs">Add rooms to manage their availability</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500">
              {selectedProperty === 'all' 
                ? 'No properties have been added yet.' 
                : 'The selected property was not found.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}