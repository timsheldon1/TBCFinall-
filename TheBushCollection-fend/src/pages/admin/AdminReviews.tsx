import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Star, Eye, EyeOff, Check, X, Edit2, Trash2, Filter, Calendar, User, Building, Package, AlertTriangle } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ReviewFormData {
  user_id: string;
  property_id: string;
  package_id: string;
  booking_id: string;
  rating: number;
  title: string;
  comment: string;
}

interface Review {
  id: string;
  user_id?: string;
  user_name?: string;
  property_id?: string;
  property_name?: string;
  package_id?: string;
  package_name?: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AdminReviews() {
  const { reviews, loading, updateReview, deleteReview, refetch: fetchReviews, getReviewsByStatus } = useReviews();
  // On admin view, fetch all reviews including pending so admin can manage them
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    (async () => {
      try {
        await fetchReviews({ includePending: true } as any);
      } catch (err) {
        console.error('Failed to fetch pending reviews on admin page', err);
      }
    })();
  }, []);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    user_id: '',
    property_id: '',
    package_id: '',
    booking_id: '',
    rating: 5,
    title: '',
    comment: ''
  });

  const handleApprove = async (reviewId: string, approved: boolean) => {
    try {
      await updateReview(reviewId, { is_approved: approved });
      toast.success(approved ? 'Review approved successfully' : 'Review rejected');
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleFeature = async (reviewId: string, featured: boolean) => {
    try {
      await updateReview(reviewId, { is_featured: featured });
      toast.success(featured ? 'Review featured successfully' : 'Review unfeatured');
    } catch (error) {
      toast.error('Failed to update review feature status');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      user_id: review.user_id || '',
      property_id: review.property_id || '',
      package_id: review.package_id || '',
      booking_id: review.booking_id || '',
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview) {
      try {
        await updateReview(editingReview.id, formData);
        toast.success('Review updated successfully');
        setIsDialogOpen(false);
        setEditingReview(null);
      } catch (error) {
        toast.error('Failed to update review');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      property_id: '',
      package_id: '',
      booking_id: '',
      rating: 5,
      title: '',
      comment: ''
    });
    setEditingReview(null);
  };

  const filteredReviews = () => {
    switch (filter) {
      case 'approved':
        return getReviewsByStatus(true);
      case 'pending':
        return getReviewsByStatus(false);
      case 'featured':
        return reviews.filter(review => review.is_featured && review.is_approved);
      default:
        return reviews;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getReviewStatusBadge = (review: Review) => {
    if (!review.is_approved) {
      return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
    }
    if (review.is_featured) {
      return <Badge className="bg-purple-500 text-white">Featured</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Approved</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600">Manage customer reviews and feedback</p>
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: string) => setFilter(value as 'all' | 'approved' | 'pending' | 'featured')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews ({reviews.length})</SelectItem>
              <SelectItem value="pending">Pending ({getReviewsByStatus(false).length})</SelectItem>
              <SelectItem value="approved">Approved ({getReviewsByStatus(true).length})</SelectItem>
              <SelectItem value="featured">Featured ({reviews.filter(r => r.is_featured).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{getReviewsByStatus(false).length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.is_featured).length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReviews().map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getReviewStatusBadge(review)}
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="flex gap-1">
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(review.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Review Title */}
              {review.title && (
                <h3 className="font-semibold text-gray-900">{review.title}</h3>
              )}

              {/* Review Comment */}
              {review.comment && (
                <p className="text-sm text-gray-700 line-clamp-3">{review.comment}</p>
              )}

              {/* Review Details */}
              <div className="space-y-2 text-xs text-gray-500">
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
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>

                {review.booking_id && (
                  <div className="text-xs text-blue-600">
                    Booking ID: {review.booking_id}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!review.is_approved ? (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id, true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(review.id, false)}
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                )}

                {review.is_approved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeature(review.id, !review.is_featured)}
                    className={review.is_featured ? "border-purple-500 text-purple-600" : ""}
                  >
                    {review.is_featured ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Feature
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews().length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Star className="w-12 h-12 mx-auto mb-2" />
              <p>No reviews found</p>
              {filter !== 'all' && (
                <p className="text-sm">Try changing the filter or check back later</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter review title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Review Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Enter review comment"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Update Review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
