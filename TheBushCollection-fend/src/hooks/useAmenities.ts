import { useState, useEffect } from 'react';
import { Amenity } from '@/types/amenity';

// Mock data for amenities
const mockAmenities: Amenity[] = [
  {
    id: 'amenity-1',
    name: 'Game Drive',
    description: 'Professional guided safari game drive with experienced ranger',
    price: 150,
    category: 'activity',
    duration: '3 hours',
    availability: 'always',
    maxGuests: 8,
    isForExternalGuests: false,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'amenity-2',
    name: 'Spa Treatment',
    description: 'Relaxing full body massage and wellness treatment',
    price: 120,
    category: 'spa',
    duration: '90 minutes',
    availability: 'always',
    maxGuests: 1,
    isForExternalGuests: false,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'amenity-3',
    name: 'Fine Dining Experience',
    description: 'Multi-course gourmet dinner with wine pairing',
    price: 95,
    category: 'dining',
    duration: '2 hours',
    availability: 'always',
    maxGuests: 12,
    isForExternalGuests: false,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'amenity-4',
    name: 'Swimming Pool Access',
    description: 'Day access to resort swimming pool and facilities',
    price: 25,
    category: 'facility',
    duration: 'Full day',
    availability: 'always',
    maxGuests: 20,
    isForExternalGuests: true,
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'amenity-5',
    name: 'Airport Transfer',
    description: 'Private transfer to/from airport',
    price: 80,
    category: 'transport',
    duration: '1 hour',
    availability: 'always',
    maxGuests: 6,
    isForExternalGuests: false,
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'amenity-6',
    name: 'Bush Walk',
    description: 'Guided walking safari with nature expert',
    price: 75,
    category: 'activity',
    duration: '2 hours',
    availability: 'always',
    maxGuests: 6,
    isForExternalGuests: false,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useAmenities = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedAmenities = localStorage.getItem('safari-amenities');
      if (storedAmenities) {
        setAmenities(JSON.parse(storedAmenities));
      } else {
        setAmenities(mockAmenities);
        localStorage.setItem('safari-amenities', JSON.stringify(mockAmenities));
      }
      setLoading(false);
    }, 500);
  }, []);

  const addAmenity = (amenity: Omit<Amenity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAmenity: Amenity = {
      ...amenity,
      id: `amenity-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAmenities = [...amenities, newAmenity];
    setAmenities(updatedAmenities);
    localStorage.setItem('safari-amenities', JSON.stringify(updatedAmenities));
    return newAmenity;
  };

  const updateAmenity = (id: string, updates: Partial<Amenity>) => {
    const updatedAmenities = amenities.map(amenity =>
      amenity.id === id
        ? { ...amenity, ...updates, updatedAt: new Date().toISOString() }
        : amenity
    );
    setAmenities(updatedAmenities);
    localStorage.setItem('safari-amenities', JSON.stringify(updatedAmenities));
  };

  const deleteAmenity = (id: string) => {
    const updatedAmenities = amenities.filter(amenity => amenity.id !== id);
    setAmenities(updatedAmenities);
    localStorage.setItem('safari-amenities', JSON.stringify(updatedAmenities));
  };

  const getActiveAmenities = () => amenities.filter(amenity => amenity.active);
  
  const getFeaturedAmenities = () => amenities.filter(amenity => amenity.featured && amenity.active);

  const getAmenitiesByCategory = (category: Amenity['category']) => 
    amenities.filter(amenity => amenity.category === category && amenity.active);

  return {
    amenities,
    loading,
    error,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    getActiveAmenities,
    getFeaturedAmenities,
    getAmenitiesByCategory
  };
};