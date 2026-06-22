import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Users, DollarSign, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { toast } from 'sonner';

// Define the correct status types based on your database
type BookingStatus = 'inquiry' | 'confirmed' | 'deposit-paid' | 'fully-paid' | 'completed' | 'cancelled';

interface CalendarBooking {
  id: string;
  customerName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  total: number;
  guests: number;
}

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case 'inquiry':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'deposit-paid':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'fully-paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AdminCalendar() {
  const { bookings: supabaseBookings, loading } = useBackendBookings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<SafariBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  // Convert Supabase bookings to calendar format
  const calendarBookings: CalendarBooking[] = useMemo(() => {
    return supabaseBookings.map(booking => ({
      id: booking.id,
      customerName: booking.guest_name || 'Unknown Guest',
      propertyName: booking.safari_properties?.name || booking.property_name || 'Unknown Property',
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      status: booking.status as BookingStatus,
      total: booking.total_amount || 0,
      guests: booking.total_guests || (booking.adults + booking.children)
    }));
  }, [supabaseBookings]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return calendarBookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const isInDateRange = date >= checkIn && date <= checkOut;
      const matchesFilter = statusFilter === 'all' || booking.status === statusFilter;
      return isInDateRange && matchesFilter;
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewBooking = (booking: SafariBooking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Calendar</h1>
                <p className="text-gray-600">View booking schedule and availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Current Filter Indicator */}
            {statusFilter !== 'all' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Filter:</span>
                  <Badge className={getStatusColor(statusFilter)}>
                    {statusFilter === 'inquiry' && 'Inquiry'}
                    {statusFilter === 'confirmed' && 'Confirmed'}
                    {statusFilter === 'deposit-paid' && 'Deposit Paid'}
                    {statusFilter === 'fully-paid' && 'Fully Paid'}
                    {statusFilter === 'completed' && 'Completed'}
                    {statusFilter === 'cancelled' && 'Cancelled'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All Bookings
                </Button>
                <Button
                  variant={statusFilter === 'inquiry' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inquiry')}
                  className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  Inquiry
                </Button>
                <Button
                  variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('confirmed')}
                  className="bg-green-50 border-green-200 hover:bg-green-100"
                >
                  Confirmed
                </Button>
                <Button
                  variant={statusFilter === 'deposit-paid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('deposit-paid')}
                  className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                  Deposit Paid
                </Button>
                <Button
                  variant={statusFilter === 'fully-paid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('fully-paid')}
                  className="bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                >
                  Fully Paid
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                  className="bg-gray-50 border-gray-200 hover:bg-gray-100"
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('cancelled')}
                  className="bg-red-50 border-red-200 hover:bg-red-100"
                >
                  Cancelled
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map(day => {
                const dayBookings = getBookingsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[120px] p-2 border rounded-lg
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isTodayDate ? 'ring-2 ring-green-500' : ''}
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isTodayDate ? 'text-green-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {dayBookings.length > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {dayBookings.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map(booking => (
                        <div
                          key={booking.id}
                          onClick={() => {
                            const fullBooking = supabaseBookings.find(b => b.id === booking.id);
                            if (fullBooking) handleViewBooking(fullBooking);
                          }}
                          className={`
                            text-xs p-1 rounded cursor-pointer hover:opacity-80
                            ${getStatusColor(booking.status)}
                          `}
                        >
                          <div className="font-medium truncate" title={booking.customerName}>
                            {booking.customerName}
                          </div>
                          <div className="text-xs opacity-75">
                            {booking.propertyName}
                          </div>
                        </div>
                      ))}

                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-lg font-semibold">{selectedBooking.guest_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Property</label>
                  <p className="text-lg font-semibold">{selectedBooking.safari_properties?.name || selectedBooking.property_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-in</label>
                  <p className="text-lg">{new Date(selectedBooking.check_in).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Check-out</label>
                  <p className="text-lg">{new Date(selectedBooking.check_out).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedBooking.status as BookingStatus)}>
                  {selectedBooking.status}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedBooking.total_guests || (selectedBooking.adults + selectedBooking.children)} guests
                </Badge>
                <Badge variant="outline">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${selectedBooking.total_amount?.toFixed(2)}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}