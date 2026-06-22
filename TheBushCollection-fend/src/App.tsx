import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, Component, ReactNode } from 'react';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { ThemeProvider } from './components/ThemeProvider';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-tbc-earth flex items-center justify-center px-8">
          <div className="text-center max-w-md">
            <div className="w-[1px] h-12 bg-tbc-gold/30 mx-auto mb-8" />
            <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-4">Something went wrong</p>
            <p className="text-white/40 text-sm font-light mb-8">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth text-xs tracking-[0.2em] uppercase font-medium px-8 py-3 transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Eagerly load the homepage — it's the first thing every visitor sees
import Index from './pages/Index';

// All other pages load on demand
const Collections           = lazy(() => import('./pages/Collections'));
const PropertyDetail        = lazy(() => import('./pages/PropertyDetail'));
const RoomDetail            = lazy(() => import('./pages/RoomDetail'));
const Packages              = lazy(() => import('./pages/Packages'));
const PackageDetail         = lazy(() => import('./pages/PackageDetail'));
const BookNow               = lazy(() => import('./pages/BookNow'));
const Payment               = lazy(() => import('./pages/Payment'));
const BookingConfirmation   = lazy(() => import('./pages/BookingConfirmation'));
const About                 = lazy(() => import('./pages/About'));
const Contact               = lazy(() => import('./pages/Contact'));
const MediaCenter           = lazy(() => import('./pages/MediaCenter'));
const FAQ                   = lazy(() => import('./pages/FAQ'));
const Login                 = lazy(() => import('./pages/Login'));
const Signup                = lazy(() => import('./pages/Signup'));
const ForgotPassword        = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword         = lazy(() => import('./pages/ResetPassword'));
const CancellationRequest   = lazy(() => import('./pages/CancellationRequest'));
const UserDashboard         = lazy(() => import('./pages/UserDashboard'));
const AdminLogin            = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAnalytics        = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminReports          = lazy(() => import('./pages/admin/AdminReports'));
const AdminBookings         = lazy(() => import('./pages/admin/AdminBookings'));
const AdminArrivals         = lazy(() => import('./pages/admin/AdminArrivals'));
const AdminCalendar         = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminCustomers        = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminProperties       = lazy(() => import('./pages/admin/AdminProperties'));
const AdminNairobiHotels    = lazy(() => import('./pages/admin/AdminNairobiHotels'));
const AdminMediaCenter      = lazy(() => import('./pages/admin/AdminMediaCenter'));
const AdminReviews          = lazy(() => import('./pages/admin/AdminReviews'));
const AdminCancellationManagement = lazy(() => import('./pages/admin/AdminCancellationManagement'));
const AdminRoomAvailability = lazy(() => import('./pages/admin/AdminRoomAvailability'));
const AdminPackages         = lazy(() => import('./pages/admin/AdminPackages'));
const AdminAmenities        = lazy(() => import('./pages/admin/AdminAmenities'));
const AdminSettings         = lazy(() => import('./pages/admin/AdminSettings'));
const AdminRateCalendar     = lazy(() => import('./pages/admin/AdminRateCalendar'));
const NotFound              = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-tbc-earth">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border border-tbc-gold/30" />
      <div className="absolute inset-0 rounded-full border-t border-tbc-gold animate-spin" />
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // treat data as fresh for 5 minutes
      gcTime:    10 * 60 * 1000, // keep unused data in cache for 10 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin/login';

  // Admin protected routes

  if (isAdminRoute && !isAdminLogin) {
    return (
      <AdminLayout>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/arrivals" element={
            <ProtectedRoute adminOnly>
              <AdminArrivals />
            </ProtectedRoute>
          } />
          <Route path="/admin/calendar" element={
            <ProtectedRoute adminOnly>
              <AdminCalendar />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute adminOnly>
              <AdminCustomers />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute adminOnly>
              <AdminProperties />
            </ProtectedRoute>
          } />
          <Route path="/admin/nairobi-hotels" element={
            <ProtectedRoute adminOnly>
              <AdminNairobiHotels />
            </ProtectedRoute>
          } />
          <Route path="/admin/media-center" element={
            <ProtectedRoute adminOnly>
              <AdminMediaCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute adminOnly>
              <AdminReviews />
            </ProtectedRoute>
          } />
          <Route path="/admin/cancellations" element={
            <ProtectedRoute adminOnly>
              <AdminCancellationManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/room-availability" element={
            <ProtectedRoute adminOnly>
              <AdminRoomAvailability />
            </ProtectedRoute>
          } />
          <Route path="/admin/packages" element={
            <ProtectedRoute adminOnly>
              <AdminPackages />
            </ProtectedRoute>
          } />
          <Route path="/admin/amenities" element={
            <ProtectedRoute adminOnly>
              <AdminAmenities />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/rate-calendar" element={
            <ProtectedRoute adminOnly>
              <AdminRateCalendar />
            </ProtectedRoute>
          } />
        </Routes>
        </Suspense>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {!isAdminRoute && <Navigation />}

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/property/:propertyId/room/:roomSlug" element={<RoomDetail />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/book" element={<BookNow />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/media-center" element={<MediaCenter />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cancellation-request" element={<CancellationRequest />} />
          <Route path="/profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Add Chatbot to all non-admin pages */}
      {!isAdminRoute && <Chatbot />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="safari-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppErrorBoundary>
              <AppContent />
            </AppErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;