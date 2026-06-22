import { useState, useEffect, useCallback } from 'react';
import api, { initAuthFromStorage, setAuthToken, API_BASE } from '@/lib/api';

export interface Property {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  location: string;
  description: string;
  type: string;
  category?: string;
  basePricePerNight?: number;
  price?: number;
  maxGuests: number;
  minNights?: number;
  rating: number;
  numReviews?: number;
  reviews?: number;
  amenities: string[];
  images: string[];
  videos?: string[];
  featured: boolean;
  externalUrl?: string | null;
  price_from?: number;
  safari_rooms?: Room[];
  rooms?: Room[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  price: number;
  max_guests?: number;
  maxGuests?: number;
  available: boolean;
  available_from?: string;
  booked_until?: string;
  availableFrom?: string;
  bookedUntil?: string;
  amenities: string[];
  images: string[];
  description?: string;
  property?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseBackendPropertiesOptions {
  search?: string;
  page?: number;
  limit?: number;
}

// use API_BASE from api.ts

// Normalize media URLs to absolute URLs so frontend can load them reliably.
const normalizeMediaUrl = (value: unknown): string | null => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;

  // If already absolute (http/https) or a blob/file URI, return as-is
  if (/^https?:\/\//i.test(s) || /^blob:/i.test(s) || /^file:/i.test(s)) return s;

  // If it's a data URI, validate it's a proper base64 image/data URL before returning
  if (/^data:/i.test(s)) {
    // Accept data:image/...;base64,BASE64DATA
    const dataImagePattern = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i;
    if (dataImagePattern.test(s)) return s;
    // otherwise treat as invalid media and return null so callers can fallback
    return null;
  }

  // If the value already contains the API base, return it unchanged
  if (API_BASE && s.startsWith(API_BASE)) return s;

  // If starts with a leading slash, join with API_BASE
  if (s.startsWith('/')) return (API_BASE || '') + s;

  // If starts with "uploads/" or "public/uploads/" treat as relative to server
  if (s.startsWith('uploads/') || s.startsWith('public/uploads/') || s.startsWith('uploads\\') ) {
    return (API_BASE || '') + '/' + s.replace(/^public\//, '');
  }

  // Otherwise, treat as a path on the server
  return (API_BASE ? API_BASE + '/' : '') + s;
};
export const useBackendProperties = (options?: UseBackendPropertiesOptions) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth header from localStorage (if present)
  useEffect(() => {
    initAuthFromStorage();
  }, []);

  const fetchProperties = useCallback(async (opts?: UseBackendPropertiesOptions) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();

      if (opts?.search && opts.search !== '') {
        params.append('search', opts.search);
      }
      if (opts?.page) {
        params.append('page', opts.page.toString());
      }
      if (opts?.limit) {
        params.append('limit', opts.limit.toString());
      }

  const endpoint = '/properties/collections';
  const response = await api.get(endpoint, { params: Object.fromEntries(params) });

      if (response.data.data) {
        // Transform API response to match Property interface
        const transformedProperties: Property[] = response.data.data.map((prop: Record<string, unknown>) => {
          // Transform rooms array if present
          const rooms = Array.isArray(prop.rooms) 
            ? (prop.rooms as Record<string, unknown>[]).map((room: Record<string, unknown>) => ({
                id: room._id || room.id,
                _id: room._id,
                name: room.name || '',
                type: room.roomType || room.type || '',
                price: room.pricePerNight || room.price || 0,
                max_guests: room.maxGuests || room.max_guests || 1,
                maxGuests: room.maxGuests || room.max_guests || 1,
                available: room.availableForBooking !== false,
                amenities: Array.isArray(room.amenities) ? room.amenities : [],
                images: Array.isArray(room.images) ? room.images : [],
                description: room.description || '',
                property: room.property || '',
              } as Room))
            : [];

          return {
            id: prop._id as string,
            _id: prop._id as string,
            name: prop.name as string,
            location: (prop.location as string) || '',
            description: (prop.description as string) || '',
            type: (prop.type as string) || 'lodge',
            category: ((prop.category as string) || 'bush').toLowerCase(),
            basePricePerNight: (prop.basePricePerNight as number) || 0,
            price: (prop.basePricePerNight as number) || 0,
            maxGuests: (prop.maxGuests as number) || 2,
            minNights: (prop.minNights as number) || 1,
            rating: (prop.rating as number) || 4.5,
            numReviews: (prop.numReviews as number) || 0,
            reviews: (prop.numReviews as number) || 0,
            amenities: Array.isArray(prop.amenities) ? prop.amenities as string[] : [],
            images: Array.isArray(prop.images) ? (prop.images as string[]).map(i => normalizeMediaUrl(i) || '') : [],
            videos: Array.isArray(prop.videos) ? (prop.videos as string[]).map(v => normalizeMediaUrl(v) || '') : [],
            featured: (prop.featured as boolean) || false,
            externalUrl: (prop.externalUrl as string | null) || null,
            rooms,
            createdAt: prop.createdAt as string,
            updatedAt: prop.updatedAt as string,
          };
        });

        setProperties(transformedProperties);
      } else {
        setProperties([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(message);
      console.error('Error fetching properties:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(options);
  }, [options, fetchProperties]);

  // Polling removed: frontend will no longer auto-refresh properties.

  const addProperty = async (propertyData: Partial<Property>) => {
    try {
      const toArray = (v: unknown) => {
        if (v === undefined || v === null) return [];
        if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
        return String(v).split(',').map(s => s.trim()).filter(Boolean);
      };

      const payload = {
        name: propertyData.name,
        location: propertyData.location,
        description: propertyData.description,
        type: propertyData.type,
        category: propertyData.category || 'bush',
        basePricePerNight: propertyData.price || propertyData.basePricePerNight,
        maxGuests: propertyData.maxGuests,
        minNights: propertyData.minNights || 1,
        rating: propertyData.rating,
        numReviews: propertyData.reviews || propertyData.numReviews,
        amenities: toArray(propertyData.amenities),
        images: toArray(propertyData.images),
        videos: toArray(propertyData.videos),
        featured: propertyData.featured,
        externalUrl: propertyData.externalUrl || null,
      };

  const response = await api.post(`/properties/admin/properties`, payload);
      
      if (response.data) {
        const newProp: Property = {
          id: (response.data._id as string) || '',
          _id: (response.data._id as string) || '',
          name: (propertyData.name as string) || '',
          location: (propertyData.location as string) || '',
          description: (propertyData.description as string) || '',
          type: (propertyData.type as string) || 'lodge',
          category: (propertyData.category as string) || 'bush',
          basePricePerNight: propertyData.price || propertyData.basePricePerNight,
          price: propertyData.price || propertyData.basePricePerNight,
          maxGuests: (propertyData.maxGuests as number) || 2,
          minNights: (propertyData.minNights as number) || 1,
          rating: (propertyData.rating as number) || 4.5,
          numReviews: (propertyData.reviews as number) || 0,
          reviews: (propertyData.reviews as number) || 0,
          amenities: (propertyData.amenities as string[]) || [],
          images: (propertyData.images as string[]) || [],
          videos: (propertyData.videos as string[]) || [],
          featured: (propertyData.featured as boolean) || false,
        };
        setProperties([...properties, newProp]);
        return newProp;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add property';
      console.error('Error adding property:', message);
      throw new Error(message);
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    try {
      const toArray = (v: unknown) => {
        if (v === undefined || v === null) return [];
        if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
        return String(v).split(',').map(s => s.trim()).filter(Boolean);
      };

      const payload = {
        name: propertyData.name,
        location: propertyData.location,
        description: propertyData.description,
        type: propertyData.type,
        category: propertyData.category || 'bush',
        basePricePerNight: propertyData.price || propertyData.basePricePerNight,
        maxGuests: propertyData.maxGuests,
        minNights: propertyData.minNights,
        rating: propertyData.rating,
        numReviews: propertyData.reviews || propertyData.numReviews,
        amenities: toArray(propertyData.amenities),
        images: toArray(propertyData.images),
        videos: toArray(propertyData.videos),
        featured: propertyData.featured,
        externalUrl: propertyData.externalUrl || null,
      };

  const response = await api.put(`/properties/admin/properties/${id}`, payload);
      
      if (response.data) {
        setProperties(properties.map(p => 
          (p.id === id || p._id === id) 
            ? { ...p, ...propertyData, price: propertyData.price || propertyData.basePricePerNight }
            : p
        ));
        return response.data;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update property';
      console.error('Error updating property:', message);
      throw new Error(message);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
  await api.delete(`/properties/admin/properties/${id}`);
      setProperties(properties.filter(p => (p.id !== id && p._id !== id)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete property';
      console.error('Error deleting property:', message);
      throw new Error(message);
    }
  };

  const getPropertyById = async (id: string) => {
    try {
  const response = await api.get(`/properties/property/${id}`);
      if (response.data) {
        const transformedProp: Property = {
          id: response.data._id,
          _id: response.data._id,
          name: response.data.name,
          location: response.data.location || '',
          description: response.data.description || '',
          type: response.data.type || 'lodge',
          category: (response.data.category || 'bush').toLowerCase(),
          basePricePerNight: response.data.basePricePerNight || 0,
          price: response.data.basePricePerNight || 0,
          maxGuests: response.data.maxGuests || 2,
          minNights: response.data.minNights || 1,
          rating: response.data.rating || 4.5,
          numReviews: response.data.numReviews || 0,
          reviews: response.data.numReviews || 0,
          amenities: Array.isArray(response.data.amenities) ? response.data.amenities : [],
          images: Array.isArray(response.data.images) ? (response.data.images as string[]).map(i => normalizeMediaUrl(i) || '') : [],
          videos: Array.isArray(response.data.videos) ? (response.data.videos as string[]).map(v => normalizeMediaUrl(v) || '') : [],
          featured: response.data.featured || false,
          externalUrl: (response.data.externalUrl as string | null) || null,
          rooms: response.data.rooms || [],
        };
        return transformedProp;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch property';
      console.error('Error fetching property:', message);
      throw new Error(message);
    }
  };

  const addRoom = async (propertyId: string, roomData: Partial<Room>) => {
    try {
      // Ensure auth header is set from storage in case this hook
      // was used before auth initialization completed
      try {
        initAuthFromStorage();
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) setAuthToken(token);
      } catch (e) {
        // ignore
      }
      const payload = {
        property: propertyId,
        name: roomData.name,
        type: roomData.type,
        price: roomData.price,
        max_guests: roomData.maxGuests || roomData.max_guests,
        amenities: roomData.amenities,
        images: roomData.images,
        description: roomData.description,
      };

      // Debug: log token/header state before request
      try {
        const debugToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        const authHeader = (api as unknown as { defaults?: { headers?: { common?: { Authorization?: string } } } }).defaults?.headers?.common?.Authorization;
        console.debug('[addRoom] token:', debugToken, 'axios Authorization header:', authHeader);
        console.debug('[addRoom] payload:', payload);
      } catch (e) {
        // ignore
      }

      const response = await api.post(`/rooms`, payload);
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add room';
      console.error('Error adding room:', message, err);
      throw new Error(message);
    }
  };

  const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
    try {
      try {
        initAuthFromStorage();
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) setAuthToken(token);
      } catch (e) {
        // ignore
      }
      // Allow arbitrary room fields to be updated (including availability, available_from, booked_until, etc.)
      const payload: Record<string, unknown> = {
        ...roomData,
      };

      // Normalize common naming differences
      if (typeof roomData.maxGuests === 'number' && !('max_guests' in payload)) {
        payload.max_guests = roomData.maxGuests;
      }

      // Backend expects `availableForBooking` (server Room model). Map `available` -> `availableForBooking`.
      if (typeof roomData.available === 'boolean' && !('availableForBooking' in payload)) {
        payload.availableForBooking = roomData.available;
        delete (payload as { available?: boolean }).available;
      }
  // Debug: log token/header state before request
  try {
    const debugToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const authHeader = (api as unknown as { defaults?: { headers?: { common?: { Authorization?: string } } } }).defaults?.headers?.common?.Authorization;
    console.debug('[updateRoom] token:', debugToken, 'axios Authorization header:', authHeader);
  } catch (e) {
    // ignore
  }

  const response = await api.put(`/rooms/${roomId}`, payload);

      // Optimistically update local properties state so UI reflects changes immediately
      try {
        setProperties((prev) => prev.map((prop) => {
          if (!prop.rooms) return prop;
          const rooms = prop.rooms.map((r) => {
            if (r.id === roomId || r._id === roomId) {
              return {
                ...r,
                ...roomData,
                // ensure boolean conversions
                available: typeof roomData.available === 'boolean' ? roomData.available : r.available,
                available_from: roomData.available_from ?? roomData.availableFrom ?? r.available_from,
                booked_until: roomData.booked_until ?? roomData.bookedUntil ?? r.booked_until,
              } as Room;
            }
            return r;
          });
          return { ...prop, rooms } as unknown as Property;
        }));
      } catch (e) {
        // ignore optimistic update errors
      }

      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update room';
      console.error('Error updating room:', message, err);
      throw new Error(message);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      try {
        initAuthFromStorage();
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) setAuthToken(token);
      } catch (e) {
        // ignore
      }
  try {
    const debugToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const authHeader = (api as unknown as { defaults?: { headers?: { common?: { Authorization?: string } } } }).defaults?.headers?.common?.Authorization;
    console.debug('[deleteRoom] token:', debugToken, 'axios Authorization header:', authHeader);
  } catch (e) {
    // ignore
  }

  await api.delete(`/rooms/${roomId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete room';
      console.error('Error deleting room:', message, err);
      throw new Error(message);
    }
  };

  const refetch = () => {
    fetchProperties(options);
  };

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    addRoom,
    updateRoom,
    deleteRoom,
    refetch,
  };
};

export const useBackendProperty = (id: string | undefined) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    initAuthFromStorage();

    api.get(`/properties/property/${id}`)
      .then(response => {
        if (cancelled) return;
        const prop = response.data;
        if (!prop) { setProperty(null); return; }

        const rooms: Room[] = Array.isArray(prop.rooms)
          ? (prop.rooms as Record<string, unknown>[]).map(room => ({
              id: (room._id || room.id) as string,
              _id: room._id as string,
              name: (room.name || '') as string,
              type: (room.roomType || room.type || '') as string,
              price: (room.pricePerNight || room.price || 0) as number,
              max_guests: (room.maxGuests || room.max_guests || 1) as number,
              maxGuests: (room.maxGuests || room.max_guests || 1) as number,
              available: room.availableForBooking !== false,
              amenities: Array.isArray(room.amenities) ? room.amenities as string[] : [],
              images: Array.isArray(room.images) ? room.images as string[] : [],
              description: (room.description || '') as string,
              property: (room.property || '') as string,
            }))
          : [];

        setProperty({
          id: prop._id,
          _id: prop._id,
          slug: prop.slug,
          name: prop.name,
          location: prop.location || '',
          description: prop.description || '',
          type: prop.type || 'lodge',
          category: (prop.category || 'bush').toLowerCase(),
          basePricePerNight: prop.basePricePerNight || 0,
          price: prop.basePricePerNight || 0,
          maxGuests: prop.maxGuests || 2,
          minNights: prop.minNights || 1,
          rating: prop.rating || 4.5,
          numReviews: prop.numReviews || 0,
          reviews: prop.numReviews || 0,
          amenities: Array.isArray(prop.amenities) ? prop.amenities as string[] : [],
          images: Array.isArray(prop.images)
            ? (prop.images as string[]).map(i => normalizeMediaUrl(i) || '')
            : [],
          videos: Array.isArray(prop.videos)
            ? (prop.videos as string[]).map(v => normalizeMediaUrl(v) || '')
            : [],
          featured: prop.featured || false,
          externalUrl: (prop.externalUrl as string | null) || null,
          rooms,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch property';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { property, loading, error };
};
