import { useState, useEffect } from 'react';

export interface Room {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  available: boolean;
  availableFrom?: string;
  bookedUntil?: string;
  amenities: string[];
  images: string[];
}

export interface Property {
  id: string;
  name: string;
  location: string;
  type: string; // Added type field
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  fullyBooked: boolean;
  featured?: boolean; // Added featured field
  rooms: Room[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const STORAGE_KEY = 'safari-properties';

// Default properties with rooms
const defaultProperties: Property[] = [
  {
    id: '1',
    name: 'Serengeti Safari Lodge',
    location: 'Serengeti National Park, Tanzania',
    type: 'lodge',
    description: 'Experience the ultimate safari adventure in the heart of the Serengeti.',
    images: [
      '/assets/properties/serengeti-1.jpg',
      '/assets/properties/serengeti-2.jpg',
      '/assets/properties/serengeti-3.jpg'
    ],
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Game Drives'],
    rating: 4.8,
    reviewCount: 127,
    priceRange: { min: 450, max: 850 },
    fullyBooked: false,
    featured: true,
    rooms: [
      {
        id: 'room-1-1',
        name: 'Savanna Suite',
        type: 'Luxury Suite',
        maxGuests: 2,
        price: 650,
        available: true,
        amenities: ['King Bed', 'Private Balcony', 'Mini Bar', 'AC'],
        images: ['/assets/rooms/savanna-suite.jpg']
      },
      {
        id: 'room-1-2',
        name: 'Wildlife View Room',
        type: 'Standard Room',
        maxGuests: 4,
        price: 450,
        available: true,
        amenities: ['Twin Beds', 'Shared Balcony', 'AC'],
        images: ['/assets/rooms/wildlife-room.jpg']
      },
      {
        id: 'room-1-3',
        name: 'Presidential Safari Suite',
        type: 'Presidential Suite',
        maxGuests: 4,
        price: 850,
        available: true,
        amenities: ['King Bed', 'Living Room', 'Private Pool', 'Butler Service'],
        images: ['/assets/rooms/presidential-suite.jpg']
      }
    ],
    coordinates: { lat: -2.3333, lng: 34.8333 }
  },
  {
    id: '2',
    name: 'Masai Mara Adventure Camp',
    location: 'Masai Mara, Kenya',
    type: 'camp',
    description: 'Authentic safari experience with traditional Masai culture.',
    images: [
      '/assets/properties/masai-mara-1.jpg',
      '/assets/properties/masai-mara-2.jpg'
    ],
    amenities: ['Cultural Tours', 'Game Drives', 'Campfire', 'Traditional Meals'],
    rating: 4.6,
    reviewCount: 89,
    priceRange: { min: 280, max: 520 },
    fullyBooked: false,
    featured: true,
    rooms: [
      {
        id: 'room-2-1',
        name: 'Masai Tent',
        type: 'Safari Tent',
        maxGuests: 2,
        price: 380,
        available: true,
        amenities: ['Queen Bed', 'Shared Bathroom', 'Mosquito Net'],
        images: ['/assets/rooms/masai-tent.jpg']
      },
      {
        id: 'room-2-2',
        name: 'Family Safari Tent',
        type: 'Family Tent',
        maxGuests: 6,
        price: 520,
        available: true,
        amenities: ['Multiple Beds', 'Private Bathroom', 'Sitting Area'],
        images: ['/assets/rooms/family-tent.jpg']
      },
      {
        id: 'room-2-3',
        name: 'Warrior Lodge',
        type: 'Traditional Lodge',
        maxGuests: 3,
        price: 280,
        available: true,
        amenities: ['Traditional Decor', 'Shared Facilities', 'Cultural Experience'],
        images: ['/assets/rooms/warrior-lodge.jpg']
      }
    ],
    coordinates: { lat: -1.5, lng: 35.0 }
  },
  {
    id: '3',
    name: 'Ngorongoro Crater View',
    location: 'Ngorongoro Conservation Area, Tanzania',
    type: 'villa',
    description: 'Breathtaking views of the world\'s largest intact volcanic caldera.',
    images: [
      '/assets/properties/ngorongoro-1.jpg',
      '/assets/properties/ngorongoro-2.jpg'
    ],
    amenities: ['Crater Tours', 'Restaurant', 'Viewing Deck', 'WiFi'],
    rating: 4.7,
    reviewCount: 156,
    priceRange: { min: 320, max: 680 },
    fullyBooked: false,
    featured: false,
    rooms: [
      {
        id: 'room-3-1',
        name: 'Crater View Room',
        type: 'Standard Room',
        maxGuests: 2,
        price: 480,
        available: true,
        amenities: ['Double Bed', 'Crater View', 'Private Bathroom'],
        images: ['/assets/rooms/crater-view.jpg']
      },
      {
        id: 'room-3-2',
        name: 'Highlands Suite',
        type: 'Suite',
        maxGuests: 4,
        price: 680,
        available: true,
        amenities: ['King Bed', 'Sitting Area', 'Panoramic Views', 'Fireplace'],
        images: ['/assets/rooms/highlands-suite.jpg']
      },
      {
        id: 'room-3-3',
        name: 'Budget Crater Room',
        type: 'Budget Room',
        maxGuests: 2,
        price: 320,
        available: true,
        amenities: ['Twin Beds', 'Shared Bathroom', 'Basic Amenities'],
        images: ['/assets/rooms/budget-room.jpg']
      }
    ],
    coordinates: { lat: -3.2, lng: 35.5 }
  }
];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Load properties from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProperties = JSON.parse(stored);
        // Migrate old properties to include type and featured fields
        const migratedProperties = parsedProperties.map((prop: any, index: number) => ({
          ...prop,
          type: prop.type || (index === 0 ? 'lodge' : index === 1 ? 'camp' : 'villa'),
          featured: prop.featured !== undefined ? prop.featured : index < 2
        }));
        setProperties(migratedProperties);
        // Save migrated data back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedProperties));
      } else {
        // Initialize with default properties
        setProperties(defaultProperties);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProperties));
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties(defaultProperties);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save properties to localStorage whenever properties change
  const saveProperties = (updatedProperties: Property[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProperties));
      setProperties(updatedProperties);
    } catch (error) {
      console.error('Error saving properties:', error);
    }
  };

  // Update room availability
  const updateRoomAvailability = (
    propertyId: string,
    roomId: string,
    available: boolean,
    availableFrom?: string,
    bookedUntil?: string
  ) => {
    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        const updatedRooms = property.rooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              available,
              availableFrom: available ? undefined : availableFrom,
              bookedUntil: available ? undefined : bookedUntil
            };
          }
          return room;
        });

        // Update property fullyBooked status
        const availableRooms = updatedRooms.filter(room => room.available);
        const fullyBooked = availableRooms.length === 0;

        return {
          ...property,
          rooms: updatedRooms,
          fullyBooked
        };
      }
      return property;
    });

    saveProperties(updatedProperties);
  };

  // Add a new property
  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString()
    };
    const updatedProperties = [...properties, newProperty];
    saveProperties(updatedProperties);
  };

  // Update an existing property
  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    const updatedProperties = properties.map(property =>
      property.id === propertyId ? { ...property, ...updates } : property
    );
    saveProperties(updatedProperties);
  };

  // Delete a property
  const deleteProperty = (propertyId: string) => {
    const updatedProperties = properties.filter(property => property.id !== propertyId);
    saveProperties(updatedProperties);
  };

  // Add a room to a property
  const addRoom = (propertyId: string, room: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...room,
      id: `room-${propertyId}-${Date.now()}`
    };

    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        return {
          ...property,
          rooms: [...property.rooms, newRoom]
        };
      }
      return property;
    });

    saveProperties(updatedProperties);
  };

  // Update a room
  const updateRoom = (propertyId: string, roomId: string, updates: Partial<Room>) => {
    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        const updatedRooms = property.rooms.map(room =>
          room.id === roomId ? { ...room, ...updates } : room
        );
        return { ...property, rooms: updatedRooms };
      }
      return property;
    });

    saveProperties(updatedProperties);
  };

  // Delete a room
  const deleteRoom = (propertyId: string, roomId: string) => {
    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        const updatedRooms = property.rooms.filter(room => room.id !== roomId);
        return { ...property, rooms: updatedRooms };
      }
      return property;
    });

    saveProperties(updatedProperties);
  };

  // Get available properties (properties with at least one available room)
  const getAvailableProperties = () => {
    return properties.filter(property => 
      property.rooms.some(room => room.available)
    );
  };

  // Get available rooms for a specific property
  const getAvailableRooms = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.rooms.filter(room => room.available) : [];
  };

  // Check if a property is available for specific dates
  const isPropertyAvailable = (propertyId: string, checkIn: string, checkOut: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return false;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    return property.rooms.some(room => {
      if (!room.available) {
        // Check if room becomes available before check-in
        if (room.availableFrom) {
          const availableFromDate = new Date(room.availableFrom);
          return availableFromDate <= checkInDate;
        }
        return false;
      }
      return true;
    });
  };

  return {
    properties,
    loading,
    updateRoomAvailability,
    addProperty,
    updateProperty,
    deleteProperty,
    addRoom,
    updateRoom,
    deleteRoom,
    getAvailableProperties,
    getAvailableRooms,
    isPropertyAvailable,
    saveProperties
  };
}