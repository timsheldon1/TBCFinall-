import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

type Review = {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  property_id?: string;
  property_name?: string;
  package_id?: string;
  package_name?: string;
  booking_id?: string;
  booking_date?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
};

type ReviewInput = Partial<Review> & { rating: number };

export const useReviews = (propertyId?: string, packageId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (options?: { includePending?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | boolean> = {};
      // By default only fetch approved reviews for public views.
      if (!options?.includePending) params.is_approved = 'true';
      if (propertyId) params.property_id = propertyId;
      if (packageId) params.package_id = packageId;

      const res = await api.get('/reviews', { params });
      const data = res.data.reviews || res.data || [];
      
      // Map backend fields to frontend field names
      const mappedReviews = data.map((review: any) => ({
        id: review._id,
        user_id: review.user?._id || review.user,
        // Provide a `users` object compatible with existing UI components
        users: {
          full_name: review.user?.fullName || review.user_name || null,
          email: review.user?.email || review.user_email || null
        },
        user_name: review.user_name,
        property_id: review.property?._id || review.property,
        property_name: review.property_name,
        package_id: review.package?._id || review.package,
        package_name: review.package_name,
        booking_id: review.booking?._id || review.booking,
        booking_date: review.createdAt,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_approved: review.is_approved,
        is_featured: review.is_featured,
        created_at: review.createdAt
      }));
      
      setReviews(mappedReviews);
    } catch (err: unknown) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [propertyId, packageId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = async (review: ReviewInput) => {
    try {
      const payload = {
        user_id: review.user_id,
        user_name: review.user_name || 'Anonymous',
        user_email: review.user_email,
        property_id: review.property_id,
        package_id: review.package_id,
        booking_id: review.booking_id,
        rating: review.rating,
        title: review.title || '',
        comment: review.comment || ''
      };
      
      const res = await api.post('/reviews', payload);
      // Map response to frontend format
      const mappedReview = {
        id: res.data._id,
        user_id: res.data.user?._id || res.data.user,
        users: {
          full_name: res.data.user?.fullName || res.data.user_name || null,
          email: res.data.user?.email || res.data.user_email || null
        },
        user_name: res.data.user_name,
        property_id: res.data.property?._id || res.data.property,
        property_name: res.data.property_name,
        package_id: res.data.package?._id || res.data.package,
        package_name: res.data.package_name,
        booking_id: res.data.booking?._id || res.data.booking,
        rating: res.data.rating,
        title: res.data.title,
        comment: res.data.comment,
        is_approved: res.data.is_approved,
        is_featured: res.data.is_featured,
        created_at: res.data.createdAt
      };
      
      await fetchReviews();
      return mappedReview;
    } catch (err: unknown) {
      console.error('Failed to add review', err);
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      // Map frontend field names to backend field names
      const payload: any = {};
      if (updates.rating !== undefined) payload.rating = updates.rating;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.comment !== undefined) payload.comment = updates.comment;
      if (updates.is_approved !== undefined) payload.is_approved = updates.is_approved;
      if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
      
      await api.put(`/reviews/${id}`, payload);
      await fetchReviews();
    } catch (err: unknown) {
      console.error('Failed to update review', err);
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await api.delete(`/reviews/${id}`);
      await fetchReviews();
    } catch (err: unknown) {
      console.error('Failed to delete review', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });
    return distribution;
  };

  const getFeaturedReviews = () => reviews.filter(r => r.is_featured && r.is_approved);

  const getPropertyAverageRating = (id?: string) => {
    if (!id) return getAverageRating();
    const filtered = reviews.filter(r => r.property_id === id && r.is_approved);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / filtered.length) * 10) / 10;
  };

  const getReviewsByStatus = (approved: boolean) => reviews.filter(r => r.is_approved === approved);

  const canReviewBooking = (bookingId: string, userId?: string) => {
    // One review per booking
    return !reviews.some(r => r.booking_id === bookingId && r.user_id === userId);
  };

  return {
    reviews,
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    getAverageRating,
    getRatingDistribution,
    refetch: fetchReviews,
    getFeaturedReviews,
    getPropertyAverageRating,
    getReviewsByStatus,
    canReviewBooking,
  };
};
