import { useState, useEffect } from 'react';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  propertyName: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'deposit-paid' | 'fully-paid' | 'completed' | 'inquiry';
  createdAt: string;
  specialRequests?: string;
  depositPaid?: number;
  balanceDue?: number;
  amenities?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface BookingData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  propertyName: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  total: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'deposit-paid' | 'fully-paid' | 'completed' | 'inquiry';
  specialRequests?: string;
  depositPaid?: number;
  balanceDue?: number;
  amenities?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

// Mock bookings data with more realistic data including amenities
const mockBookings: Booking[] = [
  {
    id: 'BK001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '+1 (555) 123-4567',
    propertyName: 'Serengeti Lodge',
    roomName: 'Luxury Safari Suite',
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    guests: 2,
    nights: 5,
    pricePerNight: 250,
    total: 1437.50,
    status: 'deposit-paid',
    createdAt: '2024-01-10T10:30:00Z',
    specialRequests: 'Vegetarian meals preferred, celebrating anniversary',
    depositPaid: 718.75, // 50% deposit
    balanceDue: 718.75,
    amenities: [
      { id: 'AM001', name: 'Game Drive', price: 150, quantity: 2 },
      { id: 'AM002', name: 'Spa Treatment', price: 120, quantity: 1 }
    ]
  },
  {
    id: 'BK002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    customerPhone: '+1 (555) 987-6543',
    propertyName: 'Masai Mara Camp',
    roomName: 'Traditional Tent',
    checkIn: '2024-02-22',
    checkOut: '2024-02-25',
    guests: 4,
    nights: 3,
    pricePerNight: 180,
    total: 621.00,
    status: 'fully-paid',
    createdAt: '2024-01-08T14:15:00Z',
    specialRequests: 'Family with two children (ages 8 and 12)',
    depositPaid: 621.00,
    balanceDue: 0,
    amenities: [
      { id: 'AM003', name: 'Fine Dining', price: 95, quantity: 4 }
    ]
  },
  {
    id: 'BK003',
    customerName: 'Mike Wilson',
    customerEmail: 'mike.wilson@email.com',
    customerPhone: '+1 (555) 456-7890',
    propertyName: 'Ngorongoro View',
    roomName: 'Crater View Suite',
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 2,
    nights: 4,
    pricePerNight: 320,
    total: 1472.00,
    status: 'confirmed',
    createdAt: '2024-01-05T09:45:00Z',
    specialRequests: 'Honeymoon package requested',
    depositPaid: 0,
    balanceDue: 1472.00,
    amenities: [
      { id: 'AM001', name: 'Game Drive', price: 150, quantity: 2 },
      { id: 'AM002', name: 'Spa Treatment', price: 120, quantity: 2 }
    ]
  }
];

const STORAGE_KEY = 'safari-bookings';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const loadBookings = () => {
      try {
        const storedBookings = localStorage.getItem(STORAGE_KEY);
        if (storedBookings) {
          const parsedBookings = JSON.parse(storedBookings);
          // Merge with mock bookings, avoiding duplicates
          const allBookings = [...mockBookings];
          parsedBookings.forEach((stored: Booking) => {
            // Add missing payment fields if they don't exist (for backward compatibility)
            const enhancedBooking = {
              ...stored,
              depositPaid: stored.depositPaid || 0,
              balanceDue: stored.balanceDue || stored.total || 0,
              status: stored.status || 'confirmed'
            };
            
            if (!allBookings.find(booking => booking.id === stored.id)) {
              allBookings.push(enhancedBooking);
            }
          });
          setBookings(allBookings);
        } else {
          setBookings(mockBookings);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings(mockBookings);
      }
    };

    loadBookings();
  }, []);

  // Save bookings to localStorage whenever bookings change
  const saveBookings = (updatedBookings: Booking[]) => {
    try {
      // Only save non-mock bookings to localStorage
      const newBookings = updatedBookings.filter(booking => 
        !mockBookings.find(mock => mock.id === booking.id)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
    } catch (error) {
      console.error('Error saving bookings:', error);
    }
  };

  const addBooking = async (bookingData: BookingData): Promise<Booking> => {
    const newBooking: Booking = {
      id: 'BK' + Date.now().toString().slice(-6),
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone || '',
      propertyName: bookingData.propertyName,
      roomName: bookingData.roomName || 'Standard Room',
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      nights: bookingData.nights,
      pricePerNight: bookingData.pricePerNight,
      total: bookingData.total,
      status: bookingData.status || 'confirmed',
      createdAt: new Date().toISOString(),
      specialRequests: bookingData.specialRequests || '',
      depositPaid: bookingData.depositPaid || 0,
      balanceDue: bookingData.balanceDue || bookingData.total || 0,
      amenities: bookingData.amenities || []
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    saveBookings(updatedBookings);
    
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status }
        : booking
    );
    setBookings(updatedBookings);
    saveBookings(updatedBookings);
  };

  const updateBooking = (bookingId: string, updatedBooking: Booking) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? updatedBooking
        : booking
    );
    setBookings(updatedBookings);
    saveBookings(updatedBookings);
  };

  const deleteBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    saveBookings(updatedBookings);
  };

  const getBookingById = (bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  };

  const clearAllBookings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBookings(mockBookings);
  };

  return {
    bookings,
    addBooking,
    updateBookingStatus,
    updateBooking,
    deleteBooking,
    getBookingById,
    clearAllBookings
  };
}