// Basic types
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Booking Status Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'checked_in' | 'checked_out' | 'deleted';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'refunded' | 'failed';

export interface Amenity {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface PaymentSchedule {
  deposit_amount: number;
  balance_amount: number;
  deposit_due_date: string;
  balance_due_date: string;
}

// Base booking interface that matches Supabase schema
export interface BaseBooking {
  // Required fields
  property_id: string | null;
  room_id?: string | null;
  package_id?: string | null;
  booking_type: 'property-stay' | 'safari-package';
  check_in: string;
  check_out: string;
  total_guests: number;
  adults: number;
  children?: number;
  children_ages?: number[];
  special_requirements?: string | null;
  
  // Guest information
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  
  // Payment information
  status: BookingStatus;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  total_amount: number;
  deposit_paid: number;
  balance_due: number;
  payment_schedule?: PaymentSchedule | null;
  
  // Optional fields
  guide_requests?: Record<string, any> | null;
  vehicle_preferences?: Record<string, any> | null;
  property_name?: string;
  room_name?: string;
  
  // System fields
  created_at?: string;
  updated_at?: string;
}

export interface BookingCreateInput extends Omit<BaseBooking, 'created_at' | 'updated_at'> {
  // Additional fields or overrides for create can go here
}

// For updating existing bookings
export type BookingUpdateInput = Partial<Omit<BaseBooking, 'id' | 'created_at'>> & {
  updated_at?: string;
};

// For response data
export interface BookingResponse {
  data: BaseBooking | null;
  error: Error | null;
}

// For querying bookings
export interface BookingQuery {
  id?: string;
  user_id?: string;
  guest_email?: string;
  property_id?: string;
  status?: BookingStatus;
  booking_reference?: string;
  check_in?: string;
  check_out?: string;
}

// Legacy types for backward compatibility
export interface LegacySafariBooking extends BaseBooking {
  id?: string;
  booking_reference?: string;
  user_id?: string;
  deposit_amount?: number;
  balance_amount?: number;
  deposit_paid_flag?: boolean;
  balance_paid_flag?: boolean;
  transfer_details?: Record<string, any>;
  selected_amenities?: Amenity[];
  cancelled_at?: string;
  cancellation_reason?: string;
}

// Alias for backward compatibility
export type NewSafariBooking = LegacySafariBooking;

export interface NewBookingRequest extends Omit<BaseBooking, 'created_at' | 'updated_at'> {
  // Additional fields specific to new booking requests
}
