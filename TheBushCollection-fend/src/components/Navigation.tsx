import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Settings, Calendar, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserBookingsModal from '@/components/UserBookingsModal';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNav, setShowNav]       = useState(true);
  const [scrolled, setScrolled]     = useState(false);   // ← NEW: tracks whether we've left the hero
  const lastScrollY = useRef(0);
  const location    = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialise on mount so SSR / fast-refresh don't flicker
    lastScrollY.current = window.scrollY;
    setScrolled(window.scrollY > 60);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide/show on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }

      // Transition background after 60px
      setScrolled(currentScrollY > 60);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  const navItems = [
    { path: '/',             label: 'Home'         },
    { path: '/about',        label: 'About'        },
    { path: '/packages',     label: 'Packages'     },
    { path: '/collections',  label: 'Collections'  },
    { path: '/media-center', label: 'Media Center' },
    { path: '/contact',      label: 'Contact'      },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Pages that have a dark hero the nav should float over
  const heroPages = ['/', '/about', '/packages', '/collections', '/media-center', '/contact', '/bush-properties', '/beach-properties'];
  const isHeroPage = heroPages.includes(location.pathname);

  return (
    <>
      {/*
        ─── FIXED nav ────────────────────────────────────────────────────────────
        • fixed = overlaps content, no layout shift
        • bg transitions: transparent on hero top → dark glass once scrolled
        • On non-hero pages it's always solid from the start
      */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          ${showNav ? 'translate-y-0' : '-translate-y-full'}
          ${
            scrolled || !isHeroPage
              ? 'bg-[#0e0c0a]/92 backdrop-blur-md border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.35)]'
              : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex justify-between items-center py-4">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1770803318/PNG-LOGO_1_xlw56b.png"
                alt="The Bush Collection"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-x-6 ml-10 flex-1 justify-center">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative py-1 text-[11px] tracking-[0.22em] uppercase font-light whitespace-nowrap transition-colors duration-300 ${
                      active ? 'text-white' : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-tbc-gold" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-x-3 flex-shrink-0 ml-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-white/10 px-2"
                    >
                      <div className="w-8 h-8 bg-tbc-gold rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-[#0e0c0a]" />
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <Star className="h-4 w-4" /><span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <UserBookingsModal>
                        <div className="flex items-center gap-2 w-full">
                          <Calendar className="h-4 w-4" /><span>My Bookings</span>
                        </div>
                      </UserBookingsModal>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /><span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" /><span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-white/25 text-white/60 bg-transparent hover:bg-transparent hover:border-white/50 hover:text-white transition-all text-[10px] tracking-[0.2em] uppercase font-light px-5"
                  >
                    Login
                  </Button>
                </Link>
              )}

              <Link to="/book">
                <Button className="rounded-none px-5 py-2 bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth font-medium transition-colors duration-200 text-[10px] tracking-[0.2em] uppercase">
                  Book Now
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-white/10"
              >
                {isMenuOpen
                  ? <X    className="h-6 w-6 text-white" />
                  : <Menu className="h-6 w-6 text-white" />
                }
              </Button>
            </div>
          </div>

          {/* Mobile menu drawer */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 border-t border-white/[0.07] mt-1">
              <div className="pt-4 space-y-0.5">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-2 py-3 text-[11px] tracking-[0.22em] uppercase font-light transition-colors duration-200 border-b border-white/[0.04] ${
                        active ? 'text-white' : 'text-white/45 hover:text-white/80'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                      {active && <span className="w-4 h-px bg-tbc-gold" />}
                    </Link>
                  );
                })}
              </div>
              <div className="px-2 pt-5 space-y-2">
                {!user && (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-none border-white/20 text-white/60 bg-transparent hover:bg-transparent hover:text-white text-[10px] tracking-[0.2em] uppercase font-light">
                      Login
                    </Button>
                  </Link>
                )}
                <Link to="/book" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-none bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth font-medium text-[10px] tracking-[0.2em] uppercase">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}