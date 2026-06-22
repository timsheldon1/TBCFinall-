export interface Package {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  duration: string;
  location: string;
  propertyId?: string; // The property where guests will stay
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  groupSize: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: string;
  featured: boolean;
  maxGuests: number;
  destinations: string[];
  image: string;
  gallery: string[];
  highlights: string[];
  includes: string[];
  excludes?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
  }>;
  bestTime?: string;
}

// Separate type for itinerary data that matches the safari_itineraries table
export interface ItineraryDay {
  id: string;
  packageId?: string;
  bookingId?: string;
  dayNumber: number;
  title?: string;
  location?: string;
  activities?: string[];
  accommodation?: string;
  meals?: string[];
  notes?: string;
  createdAt: string;
  image?: string; // Add image field for itinerary day
}

// Type for the form component (matches current form structure)
export interface ItineraryDayForm {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  image?: string; // URL of an image for the day
}