import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Calendar, User, Building, Package } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ReviewDisplayProps {
  propertyId?: string;
  packageId?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export default function ReviewDisplay({
  propertyId,
  packageId,
  limit = 10,
  showFilters = true,
  className = ''
}: ReviewDisplayProps) {
  const { reviews, loading, getFeaturedReviews, getPropertyAverageRating } = useReviews();
  const [filter, setFilter] = useState<'all' | 'featured' | 'recent'>('all');

  // Filter reviews based on props
  const filteredReviews = reviews.filter(review => {
    if (propertyId && review.property_id !== propertyId) return false;
    if (packageId && review.package_id !== packageId) return false;
    if (!review.is_approved) return false;

    return true;
  });

  // Apply additional filters
  const displayReviews = (() => {
    let reviewsToShow = [...filteredReviews];

    switch (filter) {
      case 'featured':
        reviewsToShow = reviewsToShow.filter(review => review.is_featured);
        break;
      case 'recent':
        reviewsToShow.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return reviewsToShow.slice(0, limit);
  })();

  const averageRating = getPropertyAverageRating(propertyId || '');
  const featuredReviews = getFeaturedReviews().filter(review =>
    (!propertyId || review.property_id === propertyId) &&
    (!packageId || review.package_id === packageId)
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 mb-2">
          <Star className="w-8 h-8 mx-auto mb-2" />
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Customer Reviews ({filteredReviews.length})
          </h3>
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
          )}
        </div>

        {showFilters && (
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Featured Reviews */}
      {filter === 'all' && featuredReviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600" />
            Featured Reviews
          </h4>
          <div className="grid gap-4">
            {featuredReviews.slice(0, 2).map(review => (
              <Card key={review.id} className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <Badge className="bg-purple-600 text-white">Featured</Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{review.user_name || 'Anonymous'}</span>
                    </div>
                    {review.property_name && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>{review.property_name}</span>
                      </div>
                    )}
                    {review.package_name && (
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{review.package_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Reviews */}
      <div className="space-y-4">
        {displayReviews.map(review => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  {review.is_featured && (
                    <Badge className="bg-purple-600 text-white text-xs">Featured</Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              {review.comment && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{review.user_name || 'Anonymous'}</span>
                </div>
                {review.property_name && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{review.property_name}</span>
                  </div>
                )}
                {review.package_name && (
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{review.package_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Booking: {review.booking_date ? new Date(review.booking_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / View All */}
      {displayReviews.length >= limit && filteredReviews.length > limit && (
        <div className="text-center pt-4">
          <Button variant="outline">
            View All Reviews ({filteredReviews.length})
          </Button>
        </div>
      )}

      {/* Write Review CTA */}
      {filteredReviews.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Share Your Experience</h4>
            <p className="text-sm text-gray-600 mb-3">
              Have you stayed with us? Help other travelers by sharing your safari experience.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Write a Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
