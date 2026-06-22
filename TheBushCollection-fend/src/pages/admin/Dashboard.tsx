import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Bed,
  Settings,
  BarChart3,
  UserCheck,
  CalendarDays,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { bookings } = useBookings();
  const { user } = useAuth();

  // Calculate stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => {
    // Include revenue from paid bookings (including completed ones that were previously paid)
    if (booking.status === 'deposit-paid') {
      return sum + (booking.depositPaid || 0);
    } else if (booking.status === 'fully-paid') {
      return sum + (booking.total || 0);
    } else if (booking.status === 'completed') {
      // For completed bookings, include the amount that was actually paid
      if (booking.depositPaid && booking.depositPaid > 0) {
        return sum + (booking.depositPaid || 0);
      } else {
        return sum + (booking.total || 0);
      }
    }
    // Don't include revenue from unpaid bookings (pending, confirmed, cancelled, inquiry)
    return sum;
  }, 0);

  // For demo purposes - in production, fetch from database based on admin permissions
  const totalProperties = 8; // This would be dynamic based on admin's managed properties
  const totalRooms = 24; // This would be dynamic based on admin's managed rooms

  // Get user-specific bookings count
  const userBookings = bookings.length; // In production, filter by admin's properties

  // Demo data indicator
  const isDemoData = true;

  // Debug logging
  console.log('Dashboard Revenue Calculation:', {
    bookings: bookings.map(b => ({
      id: b.id,
      status: b.status,
      total: b.total,
      depositPaid: b.depositPaid,
      balanceDue: b.balanceDue
    })),
    totalRevenue
  });
  
  // Recent bookings (last 5)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const quickActions = [
    {
      title: 'Manage Bookings',
      description: 'View and manage all customer bookings',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'bg-blue-500'
    },
    {
      title: 'Properties & Rooms',
      description: 'Manage safari properties and room types',
      icon: MapPin,
      href: '/admin/properties',
      color: 'bg-green-500'
    },
    {
      title: 'Package Management',
      description: 'Create and manage safari tour packages',
      icon: Package,
      href: '/admin/packages',
      color: 'bg-indigo-500'
    },
    {
      title: 'Customer Management',
      description: 'View customer information and history',
      icon: Users,
      href: '/admin/customers',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View booking trends and revenue analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'Admin'}!
            </h1>
            <p className="text-orange-100">
              Here's what's happening with your safari properties today.
            </p>
          </div>
          <div className="hidden md:block">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Admin Dashboard
            </Badge>
            {isDemoData && (
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 border-orange-300">
                Demo Data
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Link to="/admin/settings">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              View Website
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Revenue received from payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                Active safari locations
                {isDemoData && <span className="text-orange-600 ml-1">(Demo: 8 total)</span>}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                Across all properties
                {isDemoData && <span className="text-orange-600 ml-1">(Demo: 24 total)</span>}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.href}>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{action.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Bookings
                  <Link to="/admin/bookings">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-600">{booking.propertyName}</p>
                          <p className="text-xs text-gray-500">{booking.roomName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${booking.total.toFixed(2)}</p>
                          <Badge variant="secondary" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings yet</p>
                    <p className="text-sm">Bookings will appear here once customers start booking.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Booking System</p>
                    <p className="text-sm text-gray-600">Online & Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-gray-600">Ready for Integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Property Management</p>
                    <p className="text-sm text-gray-600">Active & Updated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}