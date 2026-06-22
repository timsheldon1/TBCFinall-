import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { useReviews } from '@/hooks/useReviews';
import { useBookingLookup } from '@/hooks/useBookingLookup';

interface ReviewFormProps {
  propertyId?: string;
  packageId?: string;
  bookingId?: string;
  initialBookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ propertyId, packageId, bookingId: initialBookingId, onSuccess, onCancel }: ReviewFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addReview } = useReviews();
  const { bookings, loading: bookingsLoading } = useBackendBookings();
  const { booking, loading: lookupLoading, error: lookupError, lookupBookingById, clearBooking } = useBookingLookup();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBookingId || '');
  const [bookingIdInput, setBookingIdInput] = useState<string>('');
  const [useBookingId, setUseBookingId] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter bookings for current user (completed or past bookings that can be reviewed)
  const isReviewable = (b: any) => {
    const status = (b.status || '').toLowerCase();
    const allowed = new Set([
      'completed',
      'fully-paid',
      'fully_paid',
      'confirmed',
      'deposit-paid',
      'deposit_paid'
    ]);
    if (allowed.has(status)) return true;
    // If status doesn't indicate completion, treat past check-out dates as reviewable
    try {
      const out = b.check_out ? new Date(b.check_out) : null;
      if (out && !isNaN(out.getTime())) {
        const now = new Date();
        if (out < now) return true;
      }
    } catch (e) {
      // ignore parse errors
    }
    return false;
  };

  const userBookings = bookings.filter(isReviewable);

  // Auto-select first booking if available and none selected
  useEffect(() => {
    if (userBookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(userBookings[0].id);
    }
  }, [userBookings, selectedBookingId]);

  const handleBookingIdLookup = async () => {
    if (!bookingIdInput.trim()) {
      toast({
        title: "Booking ID Required",
        description: "Please enter a booking ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      await lookupBookingById(bookingIdInput.trim());
      setUseBookingId(true);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const selectedBooking = useBookingId
    ? booking
    : userBookings.find(b => b.id === selectedBookingId);

  const resetForm = () => {
    setSelectedBookingId('');
    setBookingIdInput('');
    setRating(0);
    setHoveredRating(0);
    setTitle('');
    setComment('');
    clearBooking();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!selectedBooking) {
      toast({
        title: "Booking Required",
        description: "Please select a booking or enter a valid booking ID to review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment about your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Try to infer property_id or package_id from different possible booking shapes
      const bookingAny = selectedBooking as any;
      // First try common top-level keys (mapped shape)
      let inferredPropertyId = bookingAny?.property_id || bookingAny?.propertyId || bookingAny?.property_id || null;
      let inferredPackageId = bookingAny?.package_id || bookingAny?.packageId || null;

      // Check nested mapped fields (e.g., safari_properties) - these often only contain name, so look into the raw backend object
      if (!inferredPropertyId) {
        inferredPropertyId = bookingAny?.safari_properties?.id || bookingAny?.safari_properties?._id || bookingAny?.safari_properties?.property_id || null;
      }
      if (!inferredPackageId) {
        inferredPackageId = bookingAny?.safari_package?.id || bookingAny?.safari_package?._id || bookingAny?.safari_package_id || null;
      }

      // Lastly, inspect the raw backend object for the original property/package references
      const raw = bookingAny?._raw || bookingAny;
      if (!inferredPropertyId) {
        inferredPropertyId = raw?.property?._id || raw?.property?._id || raw?.property_id || raw?.propertyId || null;
      }
      if (!inferredPackageId) {
        inferredPackageId = raw?.package?._id || raw?.package?._id || raw?.package_id || raw?.packageId || null;
      }

      // Debug log (will help trace shapes during testing)
      // eslint-disable-next-line no-console
      console.debug('ReviewForm inferred ids', { inferredPropertyId, inferredPackageId, selectedBooking });

      // Ensure at least one identifier is present - backend requires either property_id or package_id
      if (!inferredPropertyId && !inferredPackageId) {
        toast({
          title: 'Booking Missing ID',
          description: 'Selected booking does not contain a property_id or package_id. Please choose another booking or enter the booking ID.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const reviewData: Record<string, unknown> = {
        user_id: user?.id || null,
        property_id: inferredPropertyId || null,
        package_id: inferredPackageId || null,
        booking_id: selectedBooking?.id,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        is_featured: false,
        is_approved: true,
      };

      // Debug log before sending
      // eslint-disable-next-line no-console
      console.debug('Submitting review', reviewData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await addReview(reviewData as any);

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review has been submitted successfully.",
      });

      resetForm();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error submitting review:', error);

      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique constraint') || errorMessage.includes('23505')) {
        toast({
          title: "Review Already Exists",
          description: "You have already submitted a review for this booking.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your review. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <Card className="w-full">
        <CardHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b">
          <CardTitle>Share Your Experience</CardTitle>
          <p className="text-sm text-gray-600">
            Tell others about your safari adventure and help future travelers make informed decisions.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : userBookings.length === 0 && !useBookingId ? (
            <Alert>
              <AlertDescription>
                You don't have any completed bookings to review yet. Complete a safari booking to leave a review!
                <br />
                <strong>Or use your booking ID:</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Selection Method */}
              {!useBookingId && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">How would you like to find your booking?</Label>
                  <div className="space-y-3">
                    {/* User Bookings - Only show if bookings available */}
                    {userBookings.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select from your bookings:</Label>
                        <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a booking..." />
                          </SelectTrigger>
                          <SelectContent>
                            {userBookings.map((booking) => (
                              <SelectItem key={booking.id} value={booking.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{booking.safari_properties?.name || booking.property_name}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}\n\n                    {/* Booking ID Input - Always show this */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {userBookings.length > 0 ? "Or enter your booking ID:" : "Enter your booking ID:"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter booking ID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                          value={bookingIdInput}
                          onChange={(e) => setBookingIdInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBookingIdLookup}
                          disabled={lookupLoading}
                        >
                          {lookupLoading ? 'Looking up...' : 'Find Booking'}
                        </Button>
                      </div>
                      {lookupError && (
                        <p className="text-sm text-red-600">{lookupError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Booking Display */}
              {selectedBooking && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Booking:</h3>
                  <p className="text-sm text-gray-600">
                    📍 {selectedBooking.safari_properties?.name || selectedBooking.property_name} •
                    📅 {new Date(selectedBooking.check_in).toLocaleDateString()} - {new Date(selectedBooking.check_out).toLocaleDateString()}
                    {((selectedBooking as Record<string, unknown>)?.guest_name || (selectedBooking as Record<string, unknown>)?.customer_name) && ` • 👤 ${(selectedBooking as Record<string, unknown>)?.guest_name || (selectedBooking as Record<string, unknown>)?.customer_name}`}
                  </p>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUseBookingId(false);
                        clearBooking();
                      }}
                    >
                      Change Booking
                    </Button>
                  </div>
                </div>
              )}

              {/* Rating Section */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Overall Rating *</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    const isFilled = starValue <= (hoveredRating || rating);

                    return (
                      <button
                        key={index}
                        type="button"
                        className="p-1 hover:scale-110 transition-transform"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoveredRating(starValue)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            isFilled
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-2">
                <Label htmlFor="title">Review Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Sum up your experience in a few words..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Comment Section */}
              <div className="space-y-2">
                <Label htmlFor="comment">Your Review *</Label>
                <Textarea
                  id="comment"
                  placeholder="Share details about your safari experience. What did you enjoy most? Any tips for future travelers?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-gray-500 text-right">
                  {comment.length}/1000 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting || rating === 0 || !comment.trim() || !selectedBooking}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
