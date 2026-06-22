import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Home, User, Download, Copy } from 'lucide-react';
import { useBookingLookup } from '@/hooks/useBookingLookup';
import { toast } from 'sonner';

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { booking, loading, error, lookupBookingById } = useBookingLookup();

  const bookingId = searchParams.get('bookingId') || '';
  const totalFromParams = searchParams.get('total') || '';
  const [looked, setLooked] = useState(false);

  useEffect(() => {
    if (bookingId && !looked) {
      setLooked(true);
      lookupBookingById(bookingId).catch(() => {
        // Booking lookup failed – still show basic confirmation from URL params
      });
    }
  }, [bookingId, looked, lookupBookingById]);

  const copyBookingId = () => {
    const id = booking?.id || bookingId;
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success('Booking ID copied to clipboard');
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your reservation. A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            {/* Booking Reference */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="text-lg font-semibold font-mono text-gray-900">
                  {booking?.id || bookingId || '—'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyBookingId}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>

            <Separator className="my-4" />

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
              </div>
            ) : booking ? (
              <div className="space-y-4">
                {/* Property / Package */}
                {booking.property_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Property</span>
                    <span className="font-medium text-gray-900">{booking.property_name}</span>
                  </div>
                )}
                {booking.safari_packages?.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package</span>
                    <span className="font-medium text-gray-900">{booking.safari_packages.name}</span>
                  </div>
                )}
                {booking.room_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-medium text-gray-900">{booking.room_name}</span>
                  </div>
                )}

                {/* Guest */}
                {booking.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guest</span>
                    <span className="font-medium text-gray-900">{booking.customer_name}</span>
                  </div>
                )}
                {booking.guest_email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{booking.guest_email}</span>
                  </div>
                )}

                {/* Dates */}
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium text-gray-900">{formatDate(booking.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium text-gray-900">{formatDate(booking.check_out)}</span>
                </div>

                {/* Status */}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {booking.status || 'confirmed'}
                  </span>
                </div>

                {/* Total */}
                {totalFromParams && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total Paid</span>
                      <span className="font-bold text-green-700">USD {totalFromParams}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Fallback when lookup didn't return data */
              <div className="space-y-4">
                {totalFromParams && (
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total Paid</span>
                    <span className="font-bold text-green-700">USD {totalFromParams}</span>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-gray-500 text-center">
                    Booking details will appear in your dashboard shortly.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          <p className="font-medium mb-1">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>You'll receive a confirmation email with your booking details</li>
            <li>You can view and manage your bookings from your dashboard</li>
            <li>For any changes, contact us at least 48 hours before check-in</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
            onClick={() => navigate('/dashboard')}
          >
            <User className="w-4 h-4 mr-2" /> View My Bookings
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
