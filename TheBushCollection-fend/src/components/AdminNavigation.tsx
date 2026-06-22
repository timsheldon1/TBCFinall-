import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building,
  Package,
  Settings,
  LogOut,
  BarChart3,
  PlaneIcon,
  Sparkles,
  Hotel,
  ImageIcon,
  Star,
  XCircle,
  Tags
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Arrivals/Departures', href: '/admin/arrivals', icon: PlaneIcon },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Building },
  { name: 'Nairobi Hotels', href: '/admin/nairobi-hotels', icon: Hotel },
  { name: 'Media Center', href: '/admin/media-center', icon: ImageIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Cancellations', href: '/admin/cancellations', icon: XCircle },
  { name: 'Packages', href: '/admin/packages', icon: Package },
  { name: 'Amenities', href: '/admin/amenities', icon: Sparkles },
  { name: 'Rate Calendar', href: '/admin/rate-calendar', icon: Tags },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Successfully signed out');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">The Bush Collection Admin</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
            
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                isActive
                  ? 'bg-orange-100 text-orange-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.email?.split('@')[0] || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'admin@safari.com'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
}