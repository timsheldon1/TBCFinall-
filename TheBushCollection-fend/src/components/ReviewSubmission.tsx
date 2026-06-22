import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Star, Calendar, Building, Package, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormData {
  booking_id: string;
  rating: number;
  title: string;
  comment: string;
}

export default function ReviewSubmission() {
  const { user } = useAuth();
  const { addReview, canReviewBooking } = useReviews();
  const { bookings } = useBackendBookings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    booking_id: '',
    rating: 5,
    title: '',
    comment: ''
  });

  // Determine if a booking belongs to the current user by checking multiple possible shapes
  const bookingBelongsToUser = (b: any) => {
    if (!user) return false;
    // Direct user id fields
    if (b.user_id && String(b.user_id) === String(user.id)) return true;
    if (b._raw?.user && (String(b._raw.user._id || b._raw.user) === String(user.id))) return true;

    // Match by email (guest/customer email)
    const userEmail = (user.email || '').toLowerCase();
    const candidateEmails = new Set<string>();
    if (b.guest_email) candidateEmails.add(String(b.guest_email).toLowerCase());
    if (b.guestEmail) candidateEmails.add(String(b.guestEmail).toLowerCase());
    if (b._raw?.customerEmail) candidateEmails.add(String(b._raw.customerEmail).toLowerCase());
    if (b._raw?.customer?.email) candidateEmails.add(String(b._raw.customer.email).toLowerCase());
    if (b._raw?.guest?.email) candidateEmails.add(String(b._raw.guest.email).toLowerCase());
    if (b.customerEmail) candidateEmails.add(String(b.customerEmail).toLowerCase());
    if (candidateEmails.has(userEmail)) return true;

    // Match by guest name (best-effort)
    const name = (user.fullName || user.name || '').toLowerCase();
    if (name) {
      if ((b.guest_name || b.customerName || b._raw?.guest?.name || b._raw?.customer?.name) && String((b.guest_name || b.customerName || b._raw?.guest?.name || b._raw?.customer?.name)).toLowerCase().includes(name)) return true;
    }

    return false;
  };

  const now = new Date();
  const isPastCheckout = (b: any) => {
    try {
      const out = b.check_out ? new Date(b.check_out) : (b._raw?.check_out ? new Date(b._raw.check_out) : null);
      return out && !isNaN(out.getTime()) && out < now;
    } catch (e) {
      return false;
    }
  };

  const allowedStatuses = new Set(['completed', 'fully-paid', 'fully_paid', 'confirmed', 'deposit-paid', 'deposit_paid']);

  const getReviewableBookings = () =>
    bookings.filter((booking: any) =>
      bookingBelongsToUser(booking) &&
      booking.status !== 'cancelled' &&
      (allowedStatuses.has((booking.status || '').toLowerCase()) || isPastCheckout(booking)) &&
      canReviewBooking(booking.id, user?.id)
    );

  const reviewableBookings = getReviewableBookings();

  const alreadyReviewedBookings = bookings.filter((booking: any) =>
    bookingBelongsToUser(booking) && !canReviewBooking(booking.id, user?.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.booking_id || !formData.title || !formData.comment) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to submit a review');
      return;
    }

    try {
      const selectedBooking = bookings.find(b => b.id === formData.booking_id);
      if (!selectedBooking) {
        toast.error('Selected booking not found');
        return;
      }

      await addReview({
        user_id: user.id,
        booking_id: formData.booking_id,
        property_id: selectedBooking.property_id,
        package_id: selectedBooking.package_id,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        is_approved: false,
        is_featured: false
      });

      toast.success('Review submitted successfully! It will be published after approval.');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      booking_id: '',
      rating: 5,
      title: '',
      comment: ''
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 hover:text-yellow-400'
        }`}
        onClick={interactive ? () => onRatingChange?.(i + 1) : undefined}
      />
    ));
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please log in to submit reviews for your bookings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
        <p className="text-gray-600">Help other travelers by reviewing your safari experience</p>
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Available for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              {reviewableBookings.length} completed booking{reviewableBookings.length !== 1 ? 's' : ''} can be reviewed
            </p>
            {reviewableBookings.length === 0 ? (
              <p className="text-sm text-gray-500">Complete a safari to leave a review</p>
            ) : (
              <div className="space-y-2">
                {reviewableBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="text-xs bg-green-50 p-2 rounded">
                    <div className="font-medium">{booking.property_name || 'Safari Property'}</div>
                    <div className="text-gray-500">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {reviewableBookings.length > 3 && (
                  <p className="text-xs text-gray-500">+{reviewableBookings.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Star className="w-5 h-5" />
              Already Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              {alreadyReviewedBookings.length} booking{alreadyReviewedBookings.length !== 1 ? 's' : ''} already reviewed
            </p>
            {alreadyReviewedBookings.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews submitted yet</p>
            ) : (
              <div className="space-y-2">
                {alreadyReviewedBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="text-xs bg-blue-50 p-2 rounded">
                    <div className="font-medium">{booking.property_name || 'Safari Property'}</div>
                    <div className="text-gray-500">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </div>
                    <Badge className="mt-1 bg-green-500 text-white text-xs">Reviewed</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Multiple Bookings Notice */}
      {reviewableBookings.length > 1 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Multiple Bookings Available:</strong> You have {reviewableBookings.length} completed bookings that can be reviewed.
            You can submit one review per booking. Select which experience you'd like to review below.
          </AlertDescription>
        </Alert>
      )}

      {/* Review Submission Button */}
      {reviewableBookings.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Share Your Experience?</h3>
            <p className="text-gray-600 mb-4">
              Select a completed booking and tell us about your safari adventure
            </p>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Write a Review
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Your Review</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Booking Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="booking">Select Booking to Review *</Label>
                    <Select
                      value={formData.booking_id}
                      onValueChange={(value) => setFormData({ ...formData, booking_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a completed booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewableBookings.map(booking => (
                          <SelectItem key={booking.id} value={booking.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {booking.property_name || 'Safari Property'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label>Overall Rating *</Label>
                    <div className="flex gap-1">
                      {renderStars(formData.rating, true, (rating) =>
                        setFormData({ ...formData, rating })
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.rating} out of 5 stars
                    </p>
                  </div>

                  {/* Review Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Review Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Summarize your experience in a few words"
                      required
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment">Your Experience *</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Tell us about your safari experience, what you enjoyed, and any tips for future travelers..."
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {formData.comment.length}/500 characters (minimum 50 characters recommended)
                    </p>
                  </div>

                  {/* Review Guidelines */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Review Guidelines:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        <li>Reviews are subject to approval before publication</li>
                        <li>One review per booking is allowed</li>
                        <li>Keep reviews honest and helpful for other travelers</li>
                        <li>Focus on your actual safari experience</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

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
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600"
                      disabled={!formData.booking_id || !formData.title || !formData.comment}
                    >
                      Submit Review
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* No Reviewable Bookings */}
      {reviewableBookings.length === 0 && alreadyReviewedBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No Completed Bookings Yet</p>
              <p className="text-sm">Complete a safari experience to share your review</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Previous Reviews */}
      {alreadyReviewedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Previous Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alreadyReviewedBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{booking.property_name || 'Safari Property'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">Reviewed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
