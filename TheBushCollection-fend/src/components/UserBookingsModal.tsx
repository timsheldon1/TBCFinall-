import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign, Clock, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBackendBookings } from '@/hooks/useBackendBookings';

interface UserBookingsModalProps {
  children: React.ReactNode;
}

export default function UserBookingsModal({ children }: UserBookingsModalProps) {
  const { user } = useAuth();
  const { bookings, loading } = useBackendBookings();
  const [isOpen, setIsOpen] = useState(false);

  // If no user, don't render the modal
  if (!user) {
    return <>{children}</>;
  }

  // Filter bookings by current user's email (customer_email or guest_email)
  const userEmail = user.email?.toLowerCase();
  const userBookings = bookings.filter(booking => {
    const customerEmail = booking.customer_email?.toLowerCase();
    const guestEmail = booking.guest_email?.toLowerCase();
    return userEmail && (customerEmail === userEmail || guestEmail === userEmail);
  });

  // Debug logging
  console.log('🔍 UserBookingsModal Debug:', {
    userEmail,
    totalBookings: bookings.length,
    userBookingsCount: userBookings.length,
    sampleBookingEmails: bookings.slice(0, 3).map(b => ({
      id: b.id.slice(0, 8),
      customerEmail: b.customer_email,
      guestEmail: b.guest_email
    }))
  });

  // Separate upcoming and past bookings
  const getUpcomingBookings = () => {
    const today = new Date();
    return userBookings.filter(booking => {
      try {
        return new Date(booking.check_in) > today && booking.status !== 'cancelled';
      } catch {
        return false;
      }
    });
  };

  const getPastBookings = () => {
    const today = new Date();
    return userBookings.filter(booking => {
      try {
        return new Date(booking.check_out) < today || booking.status === 'cancelled';
      } catch {
        return false;
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">My Safari Bookings</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Showing bookings for: <strong>{user.email}</strong>
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any safari bookings associated with <strong>{user.email}</strong>.
              <br />
              Make sure you're logged in with the same email address used for your booking.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Can't find your booking?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your booking confirmation email for the exact email address used</li>
                <li>• Try logging in with the email address from your booking confirmation</li>
                <li>• Contact our support team if you need help locating your booking</li>
              </ul>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700">Upcoming Trips</h3>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{booking.property_name || 'Safari Property'}</h4>
                              {booking.status && getStatusBadge(booking.status)}
                            </div>
                            {(
                              booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName
                            ) && (
                              <p className="text-sm text-gray-600 mb-1">Room: {booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{booking.check_in ? formatDate(booking.check_in) : 'Date TBD'} - {booking.check_out ? formatDate(booking.check_out) : 'Date TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{(booking.adults || 0) + (booking.children || 0)} guests</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${booking.total_amount?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">Total Amount</div>
                          </div>
                        </div>

                        {booking.special_requirements && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Special Requirements:</strong> {booking.special_requirements}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  {pastBookings.some(b => b.status === 'cancelled') ? 'Past & Cancelled Trips' : 'Past Trips'}
                </h3>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{booking.property_name || 'Safari Property'}</h4>
                              {booking.status && getStatusBadge(booking.status)}
                            </div>
                            {booking.room_name && (
                              <p className="text-sm text-gray-600 mb-1">Room: {booking.room_name}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{booking.check_in ? formatDate(booking.check_in) : 'Date TBD'} - {booking.check_out ? formatDate(booking.check_out) : 'Date TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{(booking.adults || 0) + (booking.children || 0)} guests</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-600">
                              ${booking.total_amount?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">Total Amount</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
                    <div className="text-sm text-blue-800">Upcoming Trips</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{pastBookings.length}</div>
                    <div className="text-sm text-gray-800">Past Trips</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${userBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.total_amount || 0), 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-green-800">Total Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
