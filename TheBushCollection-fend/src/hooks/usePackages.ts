import { useState, useEffect } from 'react';
import { Package } from '@/types/package';

const defaultPackages: Package[] = [
  {
    id: 'serengeti-classic',
    name: 'Classic Serengeti Safari',
    description: 'Experience the iconic Serengeti National Park with professional guides, luxury accommodations, and unforgettable wildlife encounters. Witness the Great Migration and explore the endless plains of Tanzania.',
    shortDescription: 'Epic 5-day Serengeti adventure with luxury accommodations',
    duration: '5 Days / 4 Nights',
    location: 'Serengeti National Park, Tanzania',
    price: 2850,
    originalPrice: 3200,
    rating: 4.9,
    reviews: 234,
    groupSize: '2-8 people',
    difficulty: 'Easy',
    category: 'Wildlife Safari',
    featured: true,
    maxGuests: 8,
    destinations: ['Serengeti National Park', 'Ngorongoro Crater', 'Lake Manyara'],
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Witness the Great Migration',
      'Big Five game viewing',
      'Professional safari guide',
      'Luxury tented accommodation',
      'All meals included'
    ],
    includes: [
      'Airport transfers',
      'Professional guide',
      'Game drives',
      'Accommodation',
      'All meals',
      'Park fees'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Gratuities'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Serengeti Entry', description: 'Arrive at Kilimanjaro Airport, transfer to Serengeti, afternoon game drive' },
      { day: 2, title: 'Full Day Game Drive', description: 'Early morning and evening game drives, witness wildlife at waterholes' },
      { day: 3, title: 'Migration Experience', description: 'Follow the Great Migration, photography opportunities' },
      { day: 4, title: 'Cultural Visit', description: 'Visit local Maasai village, traditional lunch, evening game drive' },
      { day: 5, title: 'Departure', description: 'Morning game drive, transfer to airport for departure' }
    ],
    bestTime: 'June - October'
  },
  {
    id: 'masai-mara-adventure',
    name: 'Masai Mara Adventure',
    description: 'Explore the world-famous Masai Mara with hot air balloon rides, cultural experiences, and exceptional wildlife viewing opportunities in Kenya\'s premier game reserve.',
    shortDescription: 'Thrilling 4-day Masai Mara experience with balloon safari',
    duration: '4 Days / 3 Nights',
    location: 'Masai Mara, Kenya',
    price: 2200,
    originalPrice: 2500,
    rating: 4.8,
    reviews: 189,
    groupSize: '2-6 people',
    difficulty: 'Moderate',
    category: 'Adventure Safari',
    featured: true,
    maxGuests: 6,
    destinations: ['Masai Mara National Reserve', 'Mara River', 'Oloololo Escarpment'],
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Hot air balloon safari',
      'Maasai cultural experience',
      'River crossing viewing',
      'Bush camping experience',
      'Photography workshop'
    ],
    includes: [
      'Hot air balloon ride',
      'Bush camping',
      'Cultural visits',
      'Photography guide',
      'All meals',
      'Transportation'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Optional activities'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Setup', description: 'Arrive in Masai Mara, set up camp, evening orientation' },
      { day: 2, title: 'Balloon Safari', description: 'Hot air balloon ride at sunrise, champagne breakfast, game drive' },
      { day: 3, title: 'Cultural Immersion', description: 'Visit Maasai village, traditional ceremonies, bush dinner' },
      { day: 4, title: 'Final Game Drive', description: 'Early morning photography session, departure' }
    ],
    bestTime: 'July - October'
  },
  {
    id: 'kruger-luxury',
    name: 'Kruger Luxury Experience',
    description: 'Indulge in the ultimate luxury safari experience in South Africa\'s premier game reserve. Stay in 5-star lodges with private vehicles, spa treatments, and gourmet dining.',
    shortDescription: 'Premium 6-day luxury safari with 5-star accommodations',
    duration: '6 Days / 5 Nights',
    location: 'Kruger National Park, South Africa',
    price: 4200,
    originalPrice: 4800,
    rating: 4.9,
    reviews: 156,
    groupSize: '2-4 people',
    difficulty: 'Easy',
    category: 'Luxury Safari',
    featured: true,
    maxGuests: 4,
    destinations: ['Kruger National Park', 'Sabi Sands Game Reserve', 'Blyde River Canyon'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Private game vehicle',
      '5-star luxury lodge',
      'Spa treatments',
      'Wine tasting',
      'Big Five guarantee'
    ],
    includes: [
      'Luxury accommodation',
      'Private vehicle & guide',
      'All meals & drinks',
      'Spa treatments',
      'Wine experiences',
      'Airport transfers'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal shopping',
      'Additional spa services'
    ],
    itinerary: [
      { day: 1, title: 'Luxury Arrival', description: 'VIP airport transfer, luxury lodge check-in, welcome dinner' },
      { day: 2, title: 'Big Five Quest', description: 'Private game drives, spa treatment, fine dining' },
      { day: 3, title: 'Bush Walk & Wine', description: 'Guided bush walk, wine tasting, sunset drive' },
      { day: 4, title: 'Photography Day', description: 'Professional photography guide, editing workshop' },
      { day: 5, title: 'Conservation Experience', description: 'Visit conservation center, farewell dinner' },
      { day: 6, title: 'Departure', description: 'Final game drive, luxury transfer to airport' }
    ],
    bestTime: 'April - September'
  },
  {
    id: 'botswana-delta',
    name: 'Okavango Delta Explorer',
    description: 'Discover the pristine wilderness of Botswana\'s Okavango Delta through mokoro canoe excursions, island camping, and unique water-based wildlife viewing.',
    shortDescription: 'Unique 7-day water safari in pristine delta wilderness',
    duration: '7 Days / 6 Nights',
    location: 'Okavango Delta, Botswana',
    price: 3800,
    originalPrice: 4200,
    rating: 4.7,
    reviews: 98,
    groupSize: '2-6 people',
    difficulty: 'Moderate',
    category: 'Water Safari',
    featured: false,
    maxGuests: 6,
    destinations: ['Okavango Delta', 'Moremi Game Reserve', 'Chief\'s Island'],
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Mokoro canoe excursions',
      'Water-based game viewing',
      'Bird watching paradise',
      'Traditional fishing',
      'Island camping'
    ],
    includes: [
      'Mokoro excursions',
      'Island accommodation',
      'Fishing equipment',
      'Bird watching guide',
      'All meals',
      'Charter flights'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal gear',
      'Gratuities'
    ],
    itinerary: [
      { day: 1, title: 'Delta Entry', description: 'Charter flight to delta, mokoro orientation' },
      { day: 2, title: 'Water Channels', description: 'Explore water channels, wildlife viewing from mokoro' },
      { day: 3, title: 'Island Life', description: 'Island walks, traditional fishing, bird watching' },
      { day: 4, title: 'Deep Delta', description: 'Venture into deeper channels, overnight island camping' },
      { day: 5, title: 'Wildlife Focus', description: 'Early morning game viewing, photography session' },
      { day: 6, title: 'Cultural Exchange', description: 'Meet local communities, traditional crafts' },
      { day: 7, title: 'Departure', description: 'Final mokoro ride, charter flight departure' }
    ],
    bestTime: 'May - September'
  },
  {
    id: 'namibia-desert',
    name: 'Namibian Desert Adventure',
    description: 'Experience the dramatic landscapes of the Namib Desert, climb the famous red dunes of Sossusvlei, and encounter desert-adapted wildlife in this challenging adventure.',
    shortDescription: 'Epic 8-day desert adventure with dune climbing and stargazing',
    duration: '8 Days / 7 Nights',
    location: 'Namib Desert, Namibia',
    price: 3200,
    originalPrice: 3600,
    rating: 4.6,
    reviews: 142,
    groupSize: '2-8 people',
    difficulty: 'Challenging',
    category: 'Desert Safari',
    featured: false,
    maxGuests: 8,
    destinations: ['Sossusvlei', 'Deadvlei', 'Skeleton Coast', 'Himba Villages'],
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Sossusvlei dune climbing',
      'Desert-adapted wildlife',
      'Stargazing experiences',
      'Himba tribe visit',
      'Desert camping'
    ],
    includes: [
      'Desert camping gear',
      'Specialized guide',
      'Stargazing equipment',
      'Cultural visits',
      'All meals',
      '4WD transportation'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal camping gear',
      'Optional excursions'
    ],
    itinerary: [
      { day: 1, title: 'Desert Entry', description: 'Arrive in Windhoek, transfer to Namib Desert' },
      { day: 2, title: 'Sossusvlei Dunes', description: 'Climb famous red dunes, sunrise photography' },
      { day: 3, title: 'Desert Wildlife', description: 'Search for desert-adapted animals' },
      { day: 4, title: 'Himba Culture', description: 'Visit Himba village, cultural exchange' },
      { day: 5, title: 'Skeleton Coast', description: 'Explore dramatic coastline, seal colonies' },
      { day: 6, title: 'Stargazing Night', description: 'Professional astronomy session, night photography' },
      { day: 7, title: 'Desert Survival', description: 'Learn desert survival skills, bush craft' },
      { day: 8, title: 'Departure', description: 'Return to Windhoek, departure' }
    ],
    bestTime: 'April - October'
  },
  {
    id: 'zambia-walking',
    name: 'Zambian Walking Safari',
    description: 'Experience Africa on foot with this challenging walking safari in South Luangwa National Park. Learn tracking skills and enjoy intimate wildlife encounters.',
    shortDescription: 'Authentic 5-day walking safari with expert guides',
    duration: '5 Days / 4 Nights',
    location: 'South Luangwa, Zambia',
    price: 2400,
    originalPrice: 2700,
    rating: 4.5,
    reviews: 87,
    groupSize: '4-6 people',
    difficulty: 'Challenging',
    category: 'Walking Safari',
    featured: false,
    maxGuests: 6,
    destinations: ['South Luangwa National Park', 'Luangwa River', 'Mfuwe'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    highlights: [
      'Multi-day walking safari',
      'Bush camping',
      'Tracking skills training',
      'Night game drives',
      'River activities'
    ],
    includes: [
      'Professional walking guide',
      'Bush camping equipment',
      'Tracking training',
      'Night drives',
      'All meals',
      'Safety equipment'
    ],
    excludes: [
      'International flights',
      'Travel insurance',
      'Personal hiking gear',
      'Medical kit'
    ],
    itinerary: [
      { day: 1, title: 'Walking Orientation', description: 'Safety briefing, first walking safari' },
      { day: 2, title: 'Deep Bush Walk', description: 'Full day walking, animal tracking' },
      { day: 3, title: 'River Camp', description: 'Walk to river camp, fishing, hippo viewing' },
      { day: 4, title: 'Night Safari', description: 'Night walking safari, nocturnal animals' },
      { day: 5, title: 'Final Walk', description: 'Morning walk, return to base, departure' }
    ],
    bestTime: 'May - October'
  }
];

// Custom event to notify components of package updates
const PACKAGE_UPDATE_EVENT = 'packagesUpdated';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    // Load packages from localStorage or use defaults
    const savedPackages = localStorage.getItem('safari-packages');
    if (savedPackages) {
      try {
        const parsed = JSON.parse(savedPackages);
        setPackages(parsed);
      } catch (error) {
        console.error('Error parsing saved packages:', error);
        setPackages(defaultPackages);
        localStorage.setItem('safari-packages', JSON.stringify(defaultPackages));
      }
    } else {
      setPackages(defaultPackages);
      localStorage.setItem('safari-packages', JSON.stringify(defaultPackages));
    }

    // Listen for package updates from other components
    const handlePackageUpdate = () => {
      const updatedPackages = localStorage.getItem('safari-packages');
      if (updatedPackages) {
        try {
          const parsed = JSON.parse(updatedPackages);
          setPackages(parsed);
        } catch (error) {
          console.error('Error parsing updated packages:', error);
        }
      }
    };

    window.addEventListener(PACKAGE_UPDATE_EVENT, handlePackageUpdate);
    return () => window.removeEventListener(PACKAGE_UPDATE_EVENT, handlePackageUpdate);
  }, []);

  const savePackages = (newPackages: Package[]) => {
    setPackages(newPackages);
    localStorage.setItem('safari-packages', JSON.stringify(newPackages));
    // Notify other components about the update
    window.dispatchEvent(new CustomEvent(PACKAGE_UPDATE_EVENT));
  };

  const addPackage = (packageData: Omit<Package, 'id'>) => {
    const newPackage: Package = {
      ...packageData,
      id: Date.now().toString(),
      gallery: packageData.gallery || [packageData.image],
      excludes: packageData.excludes || [],
      bestTime: packageData.bestTime || '',
      description: packageData.description || packageData.shortDescription || '',
      shortDescription: packageData.shortDescription || packageData.description || ''
    };
    const updatedPackages = [...packages, newPackage];
    savePackages(updatedPackages);
    return newPackage;
  };

  const updatePackage = (id: string, updatedPackage: Partial<Package>) => {
    const updatedPackages = packages.map(pkg =>
      pkg.id === id ? { 
        ...pkg, 
        ...updatedPackage,
        gallery: updatedPackage.gallery || pkg.gallery || [updatedPackage.image || pkg.image],
        excludes: updatedPackage.excludes || pkg.excludes || [],
        bestTime: updatedPackage.bestTime || pkg.bestTime || '',
        description: updatedPackage.description || pkg.description || pkg.shortDescription || '',
        shortDescription: updatedPackage.shortDescription || pkg.shortDescription || pkg.description || ''
      } : pkg
    );
    savePackages(updatedPackages);
  };

  const deletePackage = (id: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    savePackages(updatedPackages);
  };

  const getFeaturedPackages = () => {
    return packages.filter(pkg => pkg.featured);
  };

  const getPackagesByCategory = (category: string) => {
    return packages.filter(pkg => pkg.category === category);
  };

  const getPackageById = (id: string) => {
    return packages.find(pkg => pkg.id === id);
  };

  return {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    getFeaturedPackages,
    getPackagesByCategory,
    getPackageById
  };
};