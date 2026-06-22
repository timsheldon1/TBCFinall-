import { useState, useEffect } from 'react';
import api, { initAuthFromStorage, API_BASE } from '@/lib/api';
import { Package } from '@/types/package';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiPackage {
  id: string;
  _id: string;
  name: string;
  duration: string;
  location: string;
  image?: string;
  mainImage?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews?: number;
  numberOfReviews?: number;
  category: string;
  featured: boolean;
  groupSize: number;
  maxGuests: number;
  difficulty: string;
  highlights: string[];
  destinations: string[];
  itinerary?: unknown[];
  accommodationProperty?: { name: string; _id: string } | null;
  propertyId?: string;
}

interface UseBackendPackagesOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  featured?: boolean;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'duration';
  page?: number;
  limit?: number;
}

// Normalize media URLs to absolute URLs so frontend can load them reliably.
const normalizeMediaUrl = (value: unknown): string | null => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;

  // If already absolute (http/https) or data/blob/file URI, return as-is
  if (/^https?:\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s) || /^file:/i.test(s)) return s;

  // If the value already contains the API base, return it unchanged
  if (API_BASE && s.startsWith(API_BASE)) return s;

  if (s.startsWith('/')) return (API_BASE || '') + s;
  if (s.startsWith('uploads/') || s.startsWith('public/uploads/') || s.startsWith('uploads\\')) {
    return (API_BASE || '') + '/' + s.replace(/^public\//, '');
  }
  return (API_BASE ? API_BASE + '/' : '') + s;
};

/**
 * Hook to fetch packages from backend API with filtering and sorting
 * Replaces useSupabasePackages for backend-driven data
 */
export const useBackendPackages = (options?: UseBackendPackagesOptions) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initAuthFromStorage();
    fetchPackages(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);

  const fetchPackages = async (opts?: UseBackendPackagesOptions) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (opts?.search && opts.search !== '') {
        params.append('search', opts.search);
      }
      if (opts?.category && opts.category !== 'all') {
        params.append('category', opts.category);
      }
      if (opts?.minPrice !== undefined) {
        params.append('minPrice', opts.minPrice.toString());
      }
      if (opts?.maxPrice !== undefined) {
        params.append('maxPrice', opts.maxPrice.toString());
      }
      if (opts?.duration && opts.duration !== 'all') {
        params.append('duration', opts.duration);
      }
      if (opts?.featured !== undefined) {
        params.append('featured', opts.featured.toString());
      }
      if (opts?.sortBy) {
        params.append('sortBy', opts.sortBy);
      }
      if (opts?.page) {
        params.append('page', opts.page.toString());
      }
      if (opts?.limit) {
        params.append('limit', opts.limit.toString());
      }

    const endpoint = '/packages';
    const response = await api.get(endpoint, { params: Object.fromEntries(params) });

      if (response.data && response.data.success && response.data.packages) {
        // Transform API response to match Package interface
        const transformedPackages: Package[] = response.data.packages.map((pkg: ApiPackage) => ({
          id: pkg.id || pkg._id,
          name: pkg.name,
          description: pkg.name, // API doesn't have description, use name
          shortDescription: '',
          duration: pkg.duration,
          location: pkg.location,
          propertyId: pkg.propertyId || pkg.accommodationProperty?._id,
          price: pkg.price,
          originalPrice: pkg.originalPrice || pkg.price,
          rating: pkg.rating,
          reviews: pkg.reviews || pkg.numberOfReviews || 0,
          groupSize: pkg.groupSize,
          difficulty: pkg.difficulty as string,
          category: pkg.category,
          featured: pkg.featured,
          maxGuests: pkg.maxGuests,
          destinations: pkg.destinations || [],
          image: normalizeMediaUrl(pkg.image || pkg.mainImage || '') || '',
          gallery: Array.isArray((pkg as ApiPackage & { gallery?: unknown[] }).gallery) ? (pkg as ApiPackage & { gallery?: unknown[] }).gallery!.map((g: unknown) => normalizeMediaUrl(g) || '') : [],
          highlights: pkg.highlights || [],
          includes: [],
          excludes: [],
          itinerary: pkg.itinerary || [],
          bestTime: ''
        }));

        setPackages(transformedPackages);
        setPagination(response.data.pagination);
      } else {
        setPackages([]);
        setError(response.data.message || 'Failed to fetch packages');
      }
    } catch (err) {
      console.error('Error fetching packages from backend:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const getPackageById = async (id: string): Promise<Package | null> => {
    try {
  const response = await api.get(`/packages/${id}`);
      
      if (response.data.success && response.data.package) {
        const pkg = response.data.package;
        return {
          id: pkg.id || pkg._id,
          name: pkg.name,
          description: pkg.name,
          shortDescription: '',
          duration: pkg.duration,
          location: pkg.location,
          propertyId: pkg.propertyId || pkg.accommodationProperty?._id,
          price: pkg.price,
          originalPrice: pkg.originalPrice || pkg.price,
          rating: pkg.rating,
          reviews: pkg.reviews || pkg.numberOfReviews || 0,
          groupSize: pkg.groupSize,
          difficulty: pkg.difficulty,
          category: pkg.category,
          featured: pkg.featured,
          maxGuests: pkg.maxGuests,
          destinations: pkg.destinations || [],
          image: normalizeMediaUrl(pkg.image || pkg.mainImage || '') || '',
          gallery: Array.isArray(pkg.gallery) ? (pkg.gallery as string[]).map(g => normalizeMediaUrl(g) || '') : [],
          highlights: pkg.highlights || [],
          includes: [],
          excludes: [],
          itinerary: pkg.itinerary || [],
          bestTime: ''
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching package details:', err);
      return null;
    }
  };

  const addPackage = async (data: Partial<Package>): Promise<Package> => {
    try {
      setLoading(true);
      // Map frontend Package -> backend expected fields
      const payload = {
        name: data.name,
        duration: data.duration,
        location: data.location,
        accommodationProperty: data.propertyId,
        shortDescription: data.shortDescription,
        fullDescription: data.description,
        category: data.category,
        difficulty: data.difficulty,
        maxGuests: data.maxGuests,
        groupSize: data.groupSize,
        mainImage: data.image,
        destinations: data.destinations,
        galleryImages: data.gallery,
        highlights: data.highlights,
        includes: data.includes,
        excludes: data.excludes,
        bestTimeToVisit: data.bestTime,
        price: data.price,
        originalPrice: data.originalPrice,
        rating: data.rating,
        numberOfReviews: data.reviews,
        featured: data.featured,
        itinerary: data.itinerary
      } as Record<string, unknown>;

      const res = await api.post('/packages', payload);
      const created = res.data?.package ?? res.data;
      // Refresh list
      await fetchPackages(options);
      if (created) {
        const formatted: Package = {
          id: created.id || created._id,
          name: created.name,
          description: created.fullDescription || created.shortDescription || created.name,
          shortDescription: created.shortDescription || '',
          duration: created.duration || '',
          location: created.location || '',
          propertyId: created.propertyId || created.accommodationProperty?._id,
          destinations: created.destinations || [],
          image: created.image || created.mainImage || '',
          gallery: created.galleryImages || [],
          price: created.price || 0,
          originalPrice: created.originalPrice || created.price || 0,
          maxGuests: created.maxGuests || 1,
          difficulty: created.difficulty || 'easy',
          category: created.category || 'wildlife',
          featured: created.featured || false,
          groupSize: created.groupSize || '2-4 people',
          includes: created.includes || [],
          excludes: created.excludes || [],
          highlights: created.highlights || [],
          bestTime: created.bestTimeToVisit || '',
          rating: created.rating || 5,
          reviews: created.numberOfReviews || created.reviews || 0,
        };
        return formatted;
      }
      throw new Error('Failed to create package');
    } catch (err) {
      console.error('Error creating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      setLoading(true);
      const payload = {
        name: updates.name,
        duration: updates.duration,
        location: updates.location,
        accommodationProperty: updates.propertyId,
        shortDescription: updates.shortDescription,
        fullDescription: updates.description,
        category: updates.category,
        difficulty: updates.difficulty,
        maxGuests: updates.maxGuests,
        groupSize: updates.groupSize,
        mainImage: updates.image,
        destinations: updates.destinations,
        galleryImages: updates.gallery,
        highlights: updates.highlights,
        includes: updates.includes,
        excludes: updates.excludes,
        bestTimeToVisit: updates.bestTime,
        price: updates.price,
        originalPrice: updates.originalPrice,
        rating: updates.rating,
        numberOfReviews: updates.reviews,
        featured: updates.featured,
        itinerary: updates.itinerary
      } as Record<string, unknown>;

      const res = await api.put(`/packages/${id}`, payload);
      const updated = res.data?.package ?? res.data;
      await fetchPackages(options);
      return updated;
    } catch (err) {
      console.error('Error updating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.delete(`/packages/${id}`);
      await fetchPackages(options);
      return res.data;
    } catch (err) {
      console.error('Error deleting package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    packages,
    pagination,
    loading,
    error,
    refetch: () => fetchPackages(options),
    getPackageById,
    addPackage,
    updatePackage,
    deletePackage
  };
};
