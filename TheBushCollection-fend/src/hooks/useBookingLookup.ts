import { useState } from 'react';
import api from '@/lib/api';

export interface BookingLookup {
  id: string;
  user_id?: string | null;
  property_id?: string | null;
  room_id?: string | null;
  package_id?: string | null;
  property_name?: string;
  room_name?: string;
  customer_name?: string;
  guest_email?: string;
  check_in: string;
  check_out: string;
  status: string;
  safari_properties?: {
    id: string;
    name: string;
    location: string;
  };
  safari_rooms?: {
    id: string;
    name: string;
    type: string;
  };
  safari_packages?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export function useBookingLookup() {
  const [booking, setBooking] = useState<BookingLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupBookingById = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/bookings/booking-confirmation/${bookingId}`);
      const data = res.data;
      if (!data) {
        throw new Error('Booking not found. Please check your booking ID and try again.');
      }

      // Map backend shape minimally to the BookingLookup type
      const mapped = {
        id: (data._id || data.id || data.bookingId) as string,
        user_id: data.customer || data.user_id || null,
        property_id: data.property?._id || data.property_id || null,
        room_id: data.rooms && data.rooms[0] ? data.rooms[0].roomId : data.room_id || null,
        package_id: data.package?._id || data.package_id || null,
        property_name: data.property?.name || data.property_name,
        room_name: data.room_name || (data.safari_rooms && data.safari_rooms.name) || (data.rooms && data.rooms[0] && (data.rooms[0].roomName || data.rooms[0].name || (data.rooms[0].roomId ? (typeof data.rooms[0].roomId === 'object' ? data.rooms[0].roomId.$oid : String(data.rooms[0].roomId)) : undefined))) || data.roomName || null,
        customer_name: data.customerName || data.guest_name || '',
        guest_email: data.customerEmail || data.guest_email || '',
        check_in: (data.checkInDate || data.check_in) as string,
        check_out: (data.checkOutDate || data.check_out) as string,
        status: (data.status || '') as string,
        safari_properties: data.property ? { id: data.property._id || data.property.id, name: data.property.name, location: data.property.location } : data.safari_properties,
        safari_rooms: data.rooms && data.rooms[0] ? { id: data.rooms[0].roomId, name: data.rooms[0].roomName, type: data.rooms[0].type } : data.safari_rooms,
        safari_packages: data.package ? { id: data.package._id || data.package.id, name: data.package.name } : data.safari_packages,
        created_at: (data.createdAt || data.created_at) as string
      } as BookingLookup;

      setBooking(mapped);
      return mapped;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setBooking(null);
      console.error('Error looking up booking:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isBookingReviewable = (booking: BookingLookup | null) => {
    if (!booking) return false;

    // Only allow reviews for completed bookings or past checkout date
    const now = new Date();
    const checkoutDate = new Date(booking.check_out);
    return checkoutDate < now || booking.status === 'completed';
  };

  const clearBooking = () => {
    setBooking(null);
    setError(null);
  };

  return {
    booking,
    loading,
    error,
    lookupBookingById,
    isBookingReviewable: isBookingReviewable(booking),
    clearBooking
  };
}
