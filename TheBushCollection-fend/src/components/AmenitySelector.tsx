import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, Minus, Clock, Users, MapPin, Utensils, 
  Waves, Car, Sparkles, DollarSign 
} from 'lucide-react';
import { useAmenities } from '@/hooks/useAmenities';
import { Amenity, BookingAmenity } from '@/types/amenity';

const categoryIcons = {
  activity: MapPin,
  dining: Utensils,
  spa: Sparkles,
  transport: Car,
  facility: Waves
};

const categoryColors = {
  activity: 'bg-green-100 text-green-800',
  dining: 'bg-orange-100 text-orange-800',
  spa: 'bg-purple-100 text-purple-800',
  transport: 'bg-blue-100 text-blue-800',
  facility: 'bg-cyan-100 text-cyan-800'
};

interface AmenitySelectorProps {
  selectedAmenities: BookingAmenity[];
  onAmenityChange: (amenities: BookingAmenity[]) => void;
  isExternalGuest?: boolean;
  maxGuests?: number;
}

export function AmenitySelector({ 
  selectedAmenities, 
  onAmenityChange, 
  isExternalGuest = false,
  maxGuests = 2 
}: AmenitySelectorProps) {
  const { getActiveAmenities } = useAmenities();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activeAmenities = getActiveAmenities().filter(amenity => {
    // Show amenities for external guests if they're marked as such
    if (isExternalGuest && !amenity.isForExternalGuests) {
      return amenity.category !== 'facility'; // Allow most amenities except facilities like pool
    }
    return true;
  });

  const categories = [
    { id: 'all', name: 'All Amenities', icon: Sparkles },
    { id: 'activity', name: 'Activities', icon: MapPin },
    { id: 'dining', name: 'Dining', icon: Utensils },
    { id: 'spa', name: 'Spa & Wellness', icon: Sparkles },
    { id: 'transport', name: 'Transport', icon: Car },
    { id: 'facility', name: 'Facilities', icon: Waves }
  ];

  const filteredAmenities = selectedCategory === 'all' 
    ? activeAmenities 
    : activeAmenities.filter(amenity => amenity.category === selectedCategory);

  const getAmenityQuantity = (amenityId: string) => {
    const selected = selectedAmenities.find(item => item.amenityId === amenityId);
    return selected ? selected.quantity : 0;
  };

  const updateAmenityQuantity = (amenity: Amenity, quantity: number) => {
    const updatedAmenities = [...selectedAmenities];
    const existingIndex = updatedAmenities.findIndex(item => item.amenityId === amenity.id);

    if (quantity === 0) {
      if (existingIndex > -1) {
        updatedAmenities.splice(existingIndex, 1);
      }
    } else {
      const bookingAmenity: BookingAmenity = {
        amenityId: amenity.id,
        amenity,
        quantity,
        totalPrice: amenity.price * quantity,
        guestCount: Math.min(maxGuests, amenity.maxGuests || maxGuests)
      };

      if (existingIndex > -1) {
        updatedAmenities[existingIndex] = bookingAmenity;
      } else {
        updatedAmenities.push(bookingAmenity);
      }
    }

    onAmenityChange(updatedAmenities);
  };

  const getTotalAmenitiesPrice = () => {
    return selectedAmenities.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Select Amenities</h3>
          <p className="text-sm text-gray-600">Add extra experiences to your stay</p>
        </div>
        {selectedAmenities.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amenities</p>
            <p className="text-xl font-bold text-green-600">${getTotalAmenitiesPrice()}</p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAmenities.map((amenity) => {
          const CategoryIcon = categoryIcons[amenity.category];
          const quantity = getAmenityQuantity(amenity.id);
          const isMaxReached = amenity.maxGuests && quantity >= amenity.maxGuests;

          return (
            <Card key={amenity.id} className={`transition-all ${quantity > 0 ? 'ring-2 ring-orange-200 bg-orange-50' : 'hover:shadow-md'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-semibold">{amenity.name}</h4>
                      <Badge className={`${categoryColors[amenity.category]} text-xs`}>
                        {amenity.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${amenity.price}</p>
                    {amenity.isForExternalGuests && (
                      <Badge variant="outline" className="text-xs">External</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{amenity.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    {amenity.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{amenity.duration}</span>
                      </div>
                    )}
                    {amenity.maxGuests && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Max {amenity.maxGuests}</span>
                      </div>
                    )}
                  </div>
                  {amenity.availability !== 'always' && (
                    <Badge variant="secondary" className="text-xs">
                      {amenity.availability}
                    </Badge>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAmenityQuantity(amenity, Math.max(0, quantity - 1))}
                      disabled={quantity === 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAmenityQuantity(amenity, quantity + 1)}
                      disabled={isMaxReached}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {quantity > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="font-bold text-green-600">${amenity.price * quantity}</p>
                    </div>
                  )}
                </div>

                {isMaxReached && (
                  <p className="text-xs text-amber-600 mt-2">Maximum quantity reached</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAmenities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No amenities available in this category</p>
          </CardContent>
        </Card>
      )}

      {/* Selected Amenities Summary */}
      {selectedAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Selected Amenities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedAmenities.map((item) => (
                <div key={item.amenityId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.amenity.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.amenity.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">${item.totalPrice}</p>
                </div>
              ))}
              <div className="border-t pt-3 flex items-center justify-between">
                <p className="font-bold">Total Amenities:</p>
                <p className="text-xl font-bold text-green-600">${getTotalAmenitiesPrice()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}