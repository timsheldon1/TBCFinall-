import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Property } from '@/hooks/useBackendProperties';

export type SafariBooking = {
  id: string;
  bookingId?: string;
  confirmationNumber?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  property_name?: string;
  package_id?: string;
  safari_properties?: { name?: string } | null;
  room_name?: string;
  check_in?: string;
  check_out?: string;
  total_guests?: number;
  adults?: number;
  children?: number;
  total_amount?: number;
  status?: string;
  created_at?: string;
  special_requirements?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transfer_details?: any;
  deposit_paid?: number;
  balance_due?: number;
  // Keep original backend object handy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _raw?: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendToUi = (b: any): SafariBooking => {
  const id = b._id || b.id || b.bookingId || b.bookingId;
  // Helper to extract room name from multiple backend shapes
  const extractRoomName = (src: any): string | undefined => {
    if (!src) return undefined;
    // rooms may be array of strings or objects
    if (Array.isArray(src.rooms) && src.rooms.length > 0) {
      const r = src.rooms[0];
      if (!r) return undefined;
      if (typeof r === 'string') return r;
      // Prefer explicit names, otherwise fall back to any roomId value (handle Mongo $oid)
      const roomIdVal = r.roomId ? (typeof r.roomId === 'object' ? r.roomId.$oid || String(r.roomId) : String(r.roomId)) : undefined;
      return r.roomName || r.room_name || r.name || roomIdVal || r.title || r.label || r.room?.name || r.room?.title || undefined;
    }
    // safari_rooms may be an array or object
    if (Array.isArray(src.safari_rooms) && src.safari_rooms.length > 0) {
      const r = src.safari_rooms[0];
      if (!r) return undefined;
      if (typeof r === 'string') return r;
      const roomIdVal = r.roomId ? (typeof r.roomId === 'object' ? r.roomId.$oid || String(r.roomId) : String(r.roomId)) : undefined;
      return r.name || r.roomName || r.room_name || roomIdVal || r.title || r.room?.name || undefined;
    }
    if (src.safari_rooms && typeof src.safari_rooms === 'object') {
      return src.safari_rooms.name || src.safari_rooms.roomName || src.safari_rooms.room_name || undefined;
    }
    // single room object or string
    if (typeof src.room === 'string') return src.room;
    if (src.room && typeof src.room === 'object') return src.room.name || src.room.roomName || src.room.room_name || src.room.title || undefined;
    // sometimes room info is nested under property
    if (src.property && src.property.rooms && Array.isArray(src.property.rooms) && src.property.rooms[0]) {
      const r = src.property.rooms[0];
      if (typeof r === 'string') return r;
      return r.name || r.roomName || r.room_name || r.title || undefined;
    }
    if (src.property && src.property.safari_rooms && Array.isArray(src.property.safari_rooms) && src.property.safari_rooms[0]) {
      const r = src.property.safari_rooms[0];
      if (typeof r === 'string') return r;
      return r.name || r.roomName || r.room_name || r.title || undefined;
    }
    // flat fields
    if (src.roomName) return src.roomName;
    if (src.room_name) return src.room_name;
    if (src.room_name) return src.room_name;
    return undefined;
  };
  const statusMap: Record<string, string> = {
    pending: 'inquiry',
    deposit_paid: 'deposit-paid',
    fully_paid: 'fully-paid',
    confirmed: 'confirmed',
    cancelled: 'cancelled'
  };

  const status = statusMap[b.status] || (b.status ? b.status.replace(/_/g, '-') : b.status);

  const total = b.costs?.total ?? b.total ?? 0;
  const amountPaid = b.amountPaid ?? b.deposit_paid ?? 0;
  const balance = Math.max(0, total - amountPaid);

  return {
    id,
    bookingId: b.bookingId,
    confirmationNumber: b.confirmationNumber || b.confirmation_number || undefined,
    guest_name: b.customerName || b.guest_name,
    guest_email: b.customerEmail || b.guest_email,
    guest_phone: b.customerPhone || b.guest_phone,
    property_name: b.property?.name || b.property_name || (b.safari_properties && b.safari_properties.name) || b.propertyName || b.property?.title,
    safari_properties: b.property ? { name: b.property.name } : (b.safari_properties || null),
    package_id: b.package?._id || b.packageId || b.package || b.package_id,
    room_name: extractRoomName(b) || undefined,
    check_in: b.checkInDate ? new Date(b.checkInDate).toISOString() : b.check_in,
    check_out: b.checkOutDate ? new Date(b.checkOutDate).toISOString() : b.check_out,
    total_guests: b.totalGuests ?? b.total_guests ?? (b.adults || 0) + (b.children || 0),
    adults: b.adults,
    children: b.children,
    total_amount: total,
    status,
    created_at: b.createdAt || b.created_at,
    special_requirements: b.specialRequests || b.special_requirements,
    transfer_details: b.airportTransfer || b.transfer_details,
    deposit_paid: amountPaid,
    balance_due: balance,
    _raw: b
  };
};

export const useBackendBookings = (externalProperties?: Property[]) => {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const properties = externalProperties ?? [];
  const [bookings, setBookings] = useState<SafariBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const fetchBookings = useCallback(async (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      // If auth is still initializing, wait briefly so we don't call user endpoints prematurely
      if (authLoading) {
        await new Promise((r) => setTimeout(r, 250));
      }

      // If user is not logged in and not admin, skip calling the user-only endpoint
      if (!isAdmin && !user) {
        setBookings([]);
        setTotal(null);
        return [] as SafariBooking[];
      }

      const path = isAdmin ? '/bookings/admin/bookings' : '/bookings/my';
      const res = await api.get(path, { params });
      // controller returns { data: bookings, total }
      const data = res.data?.data ?? res.data ?? [];
      const mapped = (Array.isArray(data) ? data : []).map(mapBackendToUi);
      // Helper to identify Mongo/ObjectId strings (24 hex chars) or $oid wrappers
      const looksLikeObjectId = (val: unknown) => {
        if (!val) return false;
        const s = String(val);
        if (/^\$oid\:/i.test(s)) return true;
        if (/^[a-fA-F0-9]{24}$/.test(s)) return true;
        return false;
      };

      // Resolve room IDs to names using cached properties to avoid Unknown Room
      const resolved = mapped.map((m) => {
        // If room_name exists and does not look like an ObjectId, consider it resolved
        if (m.room_name && !looksLikeObjectId(m.room_name)) return m;
        try {
          const raw = m._raw;
          // try extract roomId from common shapes
          const roomObj = raw?.rooms && Array.isArray(raw.rooms) ? raw.rooms[0] : undefined;
          const candidateRoomId = roomObj?.roomId ? (typeof roomObj.roomId === 'object' ? roomObj.roomId.$oid || String(roomObj.roomId) : String(roomObj.roomId)) : undefined;
          if (candidateRoomId && Array.isArray(properties)) {
            for (const prop of properties) {
              const rooms = (prop.rooms || prop.safari_rooms || []) as any[];
              if (!rooms) continue;
              for (const r of rooms) {
                const rId = r._id || r.id || r.roomId || r._id?._id || (r._id && r._id.$oid) || undefined;
                const rIdStr = rId ? (typeof rId === 'object' ? rId.$oid || String(rId) : String(rId)) : undefined;
                if (rIdStr === candidateRoomId) {
                  m.room_name = r.name || r.roomName || r.title || r.label || r.room_name || r.name;
                  // also set property name if missing
                  if (!m.property_name && prop.name) m.property_name = prop.name;
                  return m;
                }
              }
            }
          }
        } catch (e) {
          // ignore resolution errors
        }
        return m;
      });
      setBookings(resolved);
      if (res.data?.total !== undefined) setTotal(res.data.total);
      return mapped;
    } catch (err: unknown) {
      console.error('Failed to fetch bookings', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      return [] as SafariBooking[];
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading, user]);

  const getAdminBooking = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/admin/bookings/${id}`);
      return mapBackendToUi(res.data);
    } catch (err: unknown) {
      console.error('Failed to get booking', err);
      setError(err instanceof Error ? err.message : 'Failed to get booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookingConfirmation = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/booking-confirmation/${id}`);
      return res.data;
    } catch (err: unknown) {
      console.error('Failed to get booking confirmation', err);
      setError(err instanceof Error ? err.message : 'Failed to get booking confirmation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createBooking = async (payload: any) => {
    try {
      setLoading(true);
      const res = await api.post('/bookings/create', payload);
      // API returns { success: true, booking }
      const created = res.data?.booking ?? res.data;
      const mapped = created ? mapBackendToUi(created) : null;
      // Optionally refresh list
      await fetchBookings();
      return mapped ?? res.data;
    } catch (err: unknown) {
      console.error('Failed to create booking', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin actions
  const setDepositPaid = async (id: string) => {
    const res = await api.post(`/bookings/admin/bookings/${id}/deposit`);
    await fetchBookings();
    return res.data;
  };

  const setConfirmed = async (id: string) => {
    const res = await api.post(`/bookings/admin/bookings/${id}/confirm`);
    await fetchBookings();
    return res.data;
  };

  const setFullyPaid = async (id: string) => {
    const res = await api.post(`/bookings/admin/bookings/${id}/paid`);
    await fetchBookings();
    return res.data;
  };

  const reopenBooking = async (id: string) => {
    const res = await api.post(`/bookings/admin/bookings/${id}/reopen`);
    await fetchBookings();
    return res.data;
  };

  const cancelBooking = async (id: string, body?: Record<string, unknown>) => {
    // Use admin cancel endpoint when current user is an admin
    const path = isAdmin ? `/bookings/admin/bookings/${id}/cancel` : `/bookings/${id}/cancel`;
    const res = await api.post(path, body || {});
    await fetchBookings();
    return res.data;
  };

  // Provide a generic updateBooking that maps status updates to admin endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateBooking = async (id: string, updates: any) => {
    // Check for status changes and call appropriate endpoints
    if (updates.status) {
      const status = updates.status;
      if (status === 'deposit-paid' || status === 'deposit_paid') return setDepositPaid(id);
      if (status === 'fully-paid' || status === 'fully_paid') return setFullyPaid(id);
      if (status === 'confirmed') return setConfirmed(id);
      if (status === 'completed') {
        // Admin check-in / completed action
        const res = await api.post(`/bookings/admin/bookings/${id}/complete`);
        await fetchBookings();
        return res.data;
      }
      if (status === 'cancelled') return cancelBooking(id);
      if (status === 'inquiry' || status === 'pending') return reopenBooking(id);
    }

    // If there are other updates not covered by admin endpoints, attempt to PATCH the booking (if backend supports it)
    try {
      const res = await api.patch(`/bookings/admin/bookings/${id}`, updates);
      await fetchBookings();
      return res.data;
    } catch (err) {
      console.warn('PATCH not supported or failed, refetching bookings', err);
      await fetchBookings();
      throw err;
    }
  };

  useEffect(() => {
    // Initial load
    fetchBookings();
  }, [fetchBookings]);
  // Send/resend notification for a booking. asAdmin toggles admin vs user endpoint
  const notifyBooking = async (id: string, type = 'booking_created', asAdmin = false) => {
    const path = asAdmin ? `/bookings/admin/bookings/${id}/notify` : `/bookings/${id}/notify`;
    const res = await api.post(path, { type });
    await fetchBookings();
    return res.data;
  };

  return {
    bookings,
    loading,
    error,
    total,
    refetch: fetchBookings,
    fetchBookings,
    getAdminBooking,
    getBookingConfirmation,
    createBooking,
    setDepositPaid,
    setConfirmed,
    setFullyPaid,
    reopenBooking,
    cancelBooking,
    updateBooking,
    notifyBooking
  };
};

export default useBackendBookings;
