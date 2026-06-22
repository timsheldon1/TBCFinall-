export interface Amenity {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'activity' | 'dining' | 'spa' | 'transport' | 'facility';
  duration?: string; // e.g., "2 hours", "Full day"
  availability: 'always' | 'seasonal' | 'on-request';
  maxGuests?: number;
  isForExternalGuests?: boolean; // For amenities like pool that external guests pay for
  image?: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAmenity {
  amenityId: string;
  amenity: Amenity;
  quantity: number;
  totalPrice: number;
  selectedDate?: string;
  selectedTime?: string;
  guestCount?: number;
}