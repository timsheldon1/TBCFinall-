import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, Mail, CheckCircle, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookingCancellation } from '@/hooks/useBookingCancellation';
import { useAuth } from '@/hooks/useAuth';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import UserBookingsModal from '@/components/UserBookingsModal';

interface SafariBooking {
  id: string;
  customer_name?: string;
  customer_email?: string;
  guest_email?: string;
  check_in: string;
  check_out: string;
  total_amount?: number;
  status: string;
  property_name?: string;
  room_name?: string;
  booking_type?: string;
  [key: string]: unknown;
}

interface CancellationRequestFormProps {
  booking?: SafariBooking;
  onRequestSuccess?: () => void;
  className?: string;
}

export default function CancellationRequestForm({
  booking,
  onRequestSuccess,
  className = ''
}: CancellationRequestFormProps) {
  const { requestCancellation, calculateRefund, loading } = useBookingCancellation();
  const { user } = useAuth();
  const { bookings: allBookings } = useBackendBookings();
  const [refundCalculation, setRefundCalculation] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  const [foundBookings, setFoundBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [formData, setFormData] = useState({
    booking_id: '',
    customer_name: '',
    customer_email: user?.email || '',
    reason: '',
    additional_notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate refund when selected booking changes
  useEffect(() => {
    if (selectedBooking) {
      calculateRefundAmount();
    }
  }, [selectedBooking]);

  const searchBookingsByEmail = () => {
    if (!user?.email) {
      setError('Please log in to search for your bookings.');
      return;
    }

    const emailLower = user.email.toLowerCase();
    const matchingBookings = allBookings.filter(booking => {
      const customerEmail = booking.customer_email?.toLowerCase();
      const guestEmail = booking.guest_email?.toLowerCase();
      return customerEmail === emailLower || guestEmail === emailLower;
    });

    setFoundBookings(matchingBookings);
    setSearchPerformed(true);

    // Auto-select if only one booking found
    if (matchingBookings.length === 1) {
      selectBooking(matchingBookings[0]);
    }
  };

  const selectBooking = (booking: any) => {
    // Check if the booking's check-out date is in the past
    const checkOutDate = new Date(booking.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (checkOutDate < today) {
      setError('This trip has already ended and cannot be cancelled.');
      setSelectedBooking(null);
      return;
    }

    setError(null);
    setSelectedBooking(booking);
    setFormData({
      booking_id: booking.id,
      customer_name: booking.customer_name || '',
      customer_email: searchEmail,
      reason: '',
      additional_notes: ''
    });
    calculateRefundAmount();
  };

  const calculateRefundAmount = async () => {
    if (!selectedBooking) return;
    try {
      const calculation = await calculateRefund(selectedBooking);
      setRefundCalculation(calculation);
    } catch (error) {
      console.error('Error calculating refund:', error);
      setRefundCalculation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooking || !formData.reason) {
      return;
    }

    try {
      const result = await requestCancellation(
        formData.booking_id,
        formData.reason,
        formData.customer_name,
        formData.customer_email
      );

      if (result.success) {
        setIsSubmitted(true);
        onRequestSuccess?.();
      }
    } catch (error) {
      console.error('Error submitting cancellation request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-green-600 font-medium">Confirmed</span>;
      case 'cancelled':
        return <span className="text-red-600 font-medium">Cancelled</span>;
      case 'pending':
        return <span className="text-yellow-600 font-medium">Pending</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your cancellation request has been submitted and is pending review by our team. Your booking will remain active until the request is approved by an administrator.
            </p>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Next Steps:</strong><br />
              • A confirmation email has been sent to {formData.customer_email}<br />
              • Our team will review your request (typically within 24-48 hours)<br />
              • If approved, you will receive a follow-up email with refund details and the booking status will be updated
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <div className="flex gap-3 justify-center">
              <UserBookingsModal>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  View My Bookings
                </Button>
              </UserBookingsModal>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Submit Another Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cancellation Request Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-auto pr-2 space-y-4">
        {/* Error Message */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Search */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="searchEmail">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="searchEmail"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="bg-gray-50"
              />
              <Button
                onClick={searchBookingsByEmail}
                disabled={!user?.email}
                className="flex-shrink-0"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Bookings
              </Button>
            </div>
            {!user?.email && (
              <p className="text-sm text-red-600 mt-1">
                Please <Link to="/login" className="underline">log in</Link> to search for your bookings
              </p>
            )}
          </div>
        </div>

        {/* Booking Details */}
        {booking && (
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Property:</span>
                  <p className="text-blue-900">{booking.property_name || 'Safari Property'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Booking ID:</span>
                  <p className="text-blue-900">#{booking.id}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Check-in:</span>
                  <p className="text-blue-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Check-out:</span>
                  <p className="text-blue-900">{new Date(booking.check_out).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Guests:</span>
                  <p className="text-blue-900">{booking.adults + booking.children} guests</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <p className="text-blue-900">{getStatusBadge(booking.status)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Refund Calculation Preview */}
        {refundCalculation && (
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Refund Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-700">Policy Applied:</span>
                <span className="font-medium text-green-900">{refundCalculation.policy.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Original Amount:</span>
                <span className="font-medium text-green-900">${booking?.total_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Refund ({refundCalculation.policy.refund_percentage}%):</span>
                <span className="font-medium text-green-600">
                  ${refundCalculation.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Processing Fee:</span>
                <span className="font-medium text-red-600">
                  -${refundCalculation.processingFee}
                </span>
              </div>
              <hr className="border-green-200" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-green-700">Total Refund:</span>
                <span className="text-green-600">
                  ${refundCalculation.totalRefund.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Selection */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Select Booking to Cancel</CardTitle>
            <p className="text-sm text-blue-700">
              We found multiple bookings under your account. Please select the booking you wish to cancel.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {foundBookings.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-gray-400 mb-3">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">No bookings found for <strong>{searchEmail}</strong></p>
                <p className="text-sm text-gray-500 mt-1">
                  Please check your email address and try again, or contact our support team for assistance.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    Found {foundBookings.length} booking{foundBookings.length !== 1 ? 's' : ''} for {searchEmail}
                  </p>
                  {foundBookings.length > 1 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Click to select which booking to cancel
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {foundBookings.map((foundBooking) => (
                    <div
                      key={foundBooking.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedBooking?.id === foundBooking.id
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => selectBooking(foundBooking)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{foundBooking.property_name || 'Safari Property'}</div>
                          <div className="text-sm text-gray-600">
                            {foundBooking.check_in && new Date(foundBooking.check_in).toLocaleDateString()} - {foundBooking.check_out && new Date(foundBooking.check_out).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Guests: {foundBooking.adults + foundBooking.children} • Status: {getStatusBadge(foundBooking.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${foundBooking.total_amount?.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Total Amount</div>
                          {selectedBooking?.id === foundBooking.id && (
                            <div className="text-xs text-green-600 font-medium mt-1">✓ Selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Booking Details */}
        {selectedBooking && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Selected Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Property:</span>
                  <p className="text-green-900">{selectedBooking.property_name || 'Safari Property'}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Booking ID:</span>
                  <p className="text-green-900">#{selectedBooking.id}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Check-in:</span>
                  <p className="text-green-900">{selectedBooking.check_in && new Date(selectedBooking.check_in).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Check-out:</span>
                  <p className="text-green-900">{selectedBooking.check_out && new Date(selectedBooking.check_out).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Guests:</span>
                  <p className="text-green-900">{selectedBooking.adults + selectedBooking.children} guests</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Status:</span>
                  <p className="text-green-900">{getStatusBadge(selectedBooking.status)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(null);
                    setFormData({
                      booking_id: '',
                      customer_name: '',
                      customer_email: user?.email || '',
                      reason: '',
                      additional_notes: ''
                    });
                    setRefundCalculation(null);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Change Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Refund Calculation Preview */}
        {refundCalculation && selectedBooking && (
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Refund Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-700">Policy Applied:</span>
                <span className="font-medium text-green-900">{refundCalculation.policy.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Original Amount:</span>
                <span className="font-medium text-green-900">${selectedBooking.total_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Refund ({refundCalculation.policy.refund_percentage}%):</span>
                <span className="font-medium text-green-600">
                  ${refundCalculation.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-700">Processing Fee:</span>
                <span className="font-medium text-red-600">
                  -${refundCalculation.processingFee}
                </span>
              </div>
              <hr className="border-green-200" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-green-700">Total Refund:</span>
                <span className="text-green-600">
                  ${refundCalculation.totalRefund.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Form */}
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Ready to submit your cancellation request?</p>
                  <p>Review the refund calculation above and select your reason for cancellation.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email Address *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                  disabled={!!user?.email}
                  title={user?.email ? "Email is auto-populated from your account" : ""}
                />
                {user?.email && (
                  <p className="text-xs text-gray-500">
                    Email from your account: {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Cancellation *</Label>
              <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal reasons</SelectItem>
                  <SelectItem value="emergency">Family emergency</SelectItem>
                  <SelectItem value="illness">Illness</SelectItem>
                  <SelectItem value="travel-restrictions">Travel restrictions</SelectItem>
                  <SelectItem value="weather">Weather conditions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Please provide any additional information that might help us process your request..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Policy Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Once you submit this cancellation request, it will be reviewed by our team.
            You will receive an email confirmation and another email once a decision has been made.
            Processing typically takes 24-48 hours.
          </AlertDescription>
        </Alert>

        </div>
        {/* Submit Button */}
        {selectedBooking && (
          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={!formData.reason || loading}
          >
            {loading ? 'Submitting Request...' : 'Submit Cancellation Request'}
          </Button>
        )}
        </form>
      </CardContent>
    </Card>
  );
}
