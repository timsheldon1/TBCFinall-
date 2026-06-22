import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, AlertCircle, CheckCircle, User, DollarSign, Trash2, MapPin, Users, Download, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CancellationDialog } from '@/components/BookingCancellation';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import api from '@/lib/api';
import { useReviews } from '@/hooks/useReviews';

type UserBooking = SafariBooking & { property_name?: string; package_name?: string; package_id?: string };
import ReviewSubmission from '@/components/ReviewSubmission';
import { toast } from 'sonner';

export default function UserDashboard() {
  const { user } = useAuth();
  const { bookings, cancelBooking, notifyBooking } = useBackendBookings();
  const { reviews } = useReviews();
  const [activeTab, setActiveTab] = useState('bookings');

  // Backend returns bookings for authenticated user only
  const userBookings = bookings;

  const getUpcomingBookings = () => {
    const today = new Date();
    return userBookings.filter(booking =>
      new Date(booking.check_in) > today && booking.status !== 'cancelled'
    );
  };

  const getPastBookings = () => {
    const today = new Date();
    return userBookings.filter(booking =>
      new Date(booking.check_out) < today
    );
  };

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to access your dashboard.</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.fullName || user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your safari bookings and adventures
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{pastBookings.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Removed Total Spent card per request */}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews & Feedback</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingsTab bookings={bookings} cancelBooking={cancelBooking} notifyBooking={notifyBooking} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewSubmission />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-900">{user.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Bookings</div>
                      <div className="font-medium">{userBookings.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Upcoming</div>
                      <div className="font-medium text-blue-600">{upcomingBookings.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Completed</div>
                      <div className="font-medium text-green-600">{pastBookings.length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, cancelBooking, notifyBooking }: { bookings: UserBooking[]; cancelBooking: (id: string) => Promise<unknown>; notifyBooking: (id: string, type?: string, asAdmin?: boolean) => Promise<unknown> }) {
  const [cancellationLoading, setCancellationLoading] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [emailingReceipt, setEmailingReceipt] = useState<string | null>(null);

  const today = new Date();

  const upcomingBookings = bookings.filter(booking =>
    new Date(booking.check_in) > today && booking.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(booking =>
    new Date(booking.check_out) < today
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      deposit_paid: { color: 'bg-orange-100 text-orange-800', label: 'Deposit Paid' },
      fully_paid: { color: 'bg-green-100 text-green-800', label: 'Fully Paid' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellationLoading(bookingId);
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Cancel booking error:', error);
    } finally {
      setCancellationLoading(null);
    }
  };

  const handleDownloadReceipt = async (booking: SafariBooking) => {
    try {
      setDownloadingReceipt(booking.id);
      // Request PDF from server (server will generate PDF when ?format=pdf)
      const res = await api.get(`/bookings/receipt/${booking.bookingId}?format=pdf`, { responseType: 'blob' });
      if (!res || !res.data) throw new Error('No receipt returned');

      const contentType = res.headers && (res.headers['content-type'] || res.headers['Content-Type'] || '');
      // If server returned something that's not a PDF (e.g. JSON error), show it instead of saving a broken file
      if (!contentType.toLowerCase().includes('application/pdf')) {
        // attempt to read text from blob and show error
        const text = await new Response(res.data).text();
        console.error('Receipt endpoint returned non-PDF response:', { status: res.status, headers: res.headers, body: text });
        toast.error('Failed to generate PDF receipt: ' + (text?.substring(0, 200) || 'server error'));
        return;
      }

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `Receipt_${booking.bookingId}.pdf`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
      console.error('Receipt download error:', error);
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const handleResendNotification = async (booking: SafariBooking) => {
    try {
      toast.info('Resending confirmation...');
      await notifyBooking(booking.id, 'booking_created', false);
      toast.success('Confirmation resent');
    } catch (err) {
      console.error('Resend notification failed:', err);
      toast.error('Failed to resend confirmation');
    }
  };

  const handleEmailReceipt = async (booking: SafariBooking) => {
    try {
      setEmailingReceipt(booking.id);
      toast.info('Sending receipt to your email...');
      const bookingRef = booking.bookingId || booking.id;
      const res = await api.post(`/bookings/${bookingRef}/email`, {
        email: booking.guest_email,
      });
      if (res.data?.success) {
        toast.success('Receipt sent to your email!');
      } else {
        toast.error(res.data?.msg || 'Failed to email receipt');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } }; message?: string };
      const msg = err?.response?.data?.msg || err?.message || 'Failed to email receipt';
      toast.error(msg);
      console.error('Email receipt error:', error);
    } finally {
      setEmailingReceipt(null);
    }
  };

  const BookingCard = ({ booking, isPast }: { booking: UserBooking; isPast: boolean }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{booking.property_name || booking.package_name || 'Booking'}</h3>
            <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
          </div>
          <div>{getStatusBadge(booking.status)}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            {(booking.total_guests || booking.adults || booking.children) && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.total_guests ?? (booking.adults || 0) + (booking.children || 0)} {(booking.total_guests ?? (booking.adults || 0) + (booking.children || 0)) === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            )}
            <div className="flex items-center text-sm font-semibold text-green-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${(booking.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {!isPast && booking.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReceipt(booking)}
              disabled={downloadingReceipt === booking.id}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingReceipt === booking.id ? 'Downloading...' : 'Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEmailReceipt(booking)}
              disabled={emailingReceipt === booking.id}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailingReceipt === booking.id ? 'Sending...' : 'Email Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResendNotification(booking)}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend
            </Button>
            <CancellationDialog
              booking={booking}
              onCancellationSuccess={() => window.location.reload()}
            />
          </div>
        )}

        {isPast && booking.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReceipt(booking)}
              disabled={downloadingReceipt === booking.id}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingReceipt === booking.id ? 'Downloading...' : 'Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEmailReceipt(booking)}
              disabled={emailingReceipt === booking.id}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailingReceipt === booking.id ? 'Sending...' : 'Email Receipt'}
            </Button>
            <Link to={`/property/${booking._raw?.property?.slug || booking._raw?.property?._id || booking.package_id || ''}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Property & Review
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Start your journey by booking a property or package today</p>
          <Link to="/">
            <Button>Browse Properties</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Trips</h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              No upcoming bookings. <Link to="/" className="text-blue-600 hover:underline">Browse properties</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Past Trips</h2>
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              No past bookings yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// `notifyBooking` is supplied by the `useBackendBookings` hook; no local stub required.

