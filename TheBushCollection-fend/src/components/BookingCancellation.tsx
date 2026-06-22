import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Calendar, DollarSign, AlertTriangle, Info, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useBookingCancellation } from '@/hooks/useBookingCancellation';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { useAuth } from '@/hooks/useAuth';

interface CancellationRequest {
  booking_id: string;
  reason: string;
  requested_by: string;
  cancellation_date: string;
  refund_amount: number;
  processing_fee: number;
  totalRefund: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_notes?: string;
}

interface CancellationDialogProps {
  booking: any;
  onCancellationSuccess?: () => void;
}

export function CancellationDialog({ booking, onCancellationSuccess }: CancellationDialogProps) {
  const { user } = useAuth();
  const { calculateRefund, cancelBooking, loading } = useBookingCancellation();
  const [isOpen, setIsOpen] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState<any>(null);
  const [formData, setFormData] = useState({
    reason: '',
    additional_notes: ''
  });

  useEffect(() => {
    if (isOpen && booking) {
      calculateRefundAmount();
    }
  }, [isOpen, booking]);

  const calculateRefundAmount = async () => {
    if (!booking) return;

    try {
      const calculation = await calculateRefund(booking);
      setRefundCalculation(calculation);
    } catch (error) {
      console.error('Error calculating refund:', error);
    }
  };

  const handleCancellation = async () => {
    if (!booking || !user?.id) return;

    try {
      const result = await cancelBooking(booking.id, formData.reason || 'Customer requested cancellation', user.id);

      if (result.success) {
        setIsOpen(false);
        onCancellationSuccess?.();
        toast.success(
          `Cancellation request submitted. Refund (est.): $${(result.refundAmount || 0).toFixed(2)}. Your booking remains active until approved.`
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to submit cancellation request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysUntilCheckIn = () => {
    if (!booking?.check_in) return 0;
    const today = new Date();
    const checkIn = new Date(booking.check_in);
    const diffTime = checkIn.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilCheckIn = getDaysUntilCheckIn();

  if (!booking) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        onClick={() => setIsOpen(true)}
      >
        Cancel Booking
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Cancel Booking Confirmation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Property:</span>
                <span className="font-medium">{booking.property_name || 'Safari Property'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-in:</span>
                <span className="font-medium">{new Date(booking.check_in).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-out:</span>
                <span className="font-medium">{new Date(booking.check_out).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Guests:</span>
                <span className="font-medium">{booking.adults + booking.children} guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium text-lg">${booking.total_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status:</span>
                {getStatusBadge(booking.status)}
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy & Refund Calculation */}
          {refundCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Refund Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Policy Applied:</span>
                  <span className="font-medium">{refundCalculation.policy.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days until check-in:</span>
                  <span className="font-medium">{daysUntilCheckIn} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Original Amount:</span>
                  <span className="font-medium">${booking.total_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Refund ({refundCalculation.policy.refund_percentage}%):</span>
                  <span className="font-medium text-green-600">
                    ${refundCalculation.refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing Fee:</span>
                  <span className="font-medium text-red-600">
                    -${refundCalculation.processingFee}
                  </span>
                </div>
                <hr />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Refund:</span>
                  <span className="text-green-600">
                    ${refundCalculation.totalRefund.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policy Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Cancellation Policy:</strong> {refundCalculation?.policy.description}
              <br />
              <span className="text-sm">
                Refunds are processed within 5-7 business days. Processing fees are non-refundable.
              </span>
            </AlertDescription>
          </Alert>

          {/* Cancellation Reason */}
          <div className="space-y-3">
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

            <Textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Once you submit this cancellation request, it will be reviewed by our team.
              You will receive a confirmation email with refund details. The room will be made available for other guests.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={!formData.reason || loading}
                >
                  {loading ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Booking Cancellation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                    <br /><br />
                    <strong>Refund Amount: ${refundCalculation?.totalRefund.toFixed(2) || '0.00'}</strong>
                    <br />
                    <span className="text-sm text-gray-600">
                      Policy: {refundCalculation?.policy.name}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancellation}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Cancel Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

// Main cancellation management component for user dashboard
export default function BookingCancellation({ className = '' }: any) {
  const { user } = useAuth();
  const { bookings } = useBackendBookings();
  const { cancelBooking, getCancellationHistory } = useBookingCancellation();

  const userBookings = bookings.filter(booking => booking.user_id === user?.id);
  const cancellationHistory = getCancellationHistory(user?.id || '');

  const getCancellableBookings = () => {
    return userBookings.filter(booking => {
      const today = new Date();
      return booking.status !== 'cancelled' &&
             new Date(booking.check_in) > today;
    });
  };

  const getPastBookings = () => {
    return userBookings.filter(booking => {
      const today = new Date();
      return new Date(booking.check_out) < today;
    });
  };

  const cancellableBookings = getCancellableBookings();
  const pastBookings = getPastBookings();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Management</h2>
        <p className="text-gray-600">View, modify, or cancel your safari bookings</p>
      </div>

      {/* Current Bookings */}
      {cancellableBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Bookings ({cancellableBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cancellableBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.property_name || 'Safari Property'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${booking.total_amount}</div>
                      <div className="text-sm text-gray-500">
                        {booking.adults + booking.children} guests
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">Active</Badge>
                      <span className="text-sm text-gray-600">
                        {Math.ceil((new Date(booking.check_in).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until check-in
                      </span>
                    </div>
                    <CancellationDialog
                      booking={booking}
                      onCancellationSuccess={() => window.location.reload()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Past Bookings ({pastBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.property_name || 'Safari Property'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${booking.total_amount}</div>
                      <Badge className="bg-gray-500 text-white">Completed</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Review this experience</span>
                    <Button size="sm" variant="outline">
                      Write Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation History */}
      {cancellationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Cancellation History ({cancellationHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cancellationHistory.map((request, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {bookings.find(b => b.id === request.booking_id)?.property_name || 'Safari Property'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Cancelled on {new Date(request.cancellation_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${request.totalRefund?.toFixed(2)} refund
                      </div>
                      <Badge className={
                        request.status === 'approved' ? 'bg-green-500 text-white' :
                        request.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="text-sm text-gray-600">
                      <strong>Reason:</strong> {request.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Bookings */}
      {userBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No Bookings Yet</p>
              <p className="text-sm">Book your first safari experience</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse Packages
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
