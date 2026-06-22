import {
  Users, Calendar, DollarSign, TrendingUp, Building, Package,
  Star, Clock, ArrowUpRight, ArrowDownRight, Minus,
  BarChart3, ChevronRight, PlaneIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { useBackendProperties } from '@/hooks/useBackendProperties';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  confirmed:     'bg-green-50  text-green-700  ring-1 ring-green-200',
  pending:       'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  'deposit-paid':'bg-blue-50   text-blue-700   ring-1 ring-blue-200',
  'fully-paid':  'bg-green-50  text-green-700  ring-1 ring-green-200',
  completed:     'bg-gray-100  text-gray-600   ring-1 ring-gray-200',
  cancelled:     'bg-red-50    text-red-700    ring-1 ring-red-200',
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('-', ' ')}
    </span>
  );
}

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendBadge({ change, type }: { change: string; type: 'positive' | 'negative' | 'neutral' }) {
  const Icon = type === 'positive' ? ArrowUpRight : type === 'negative' ? ArrowDownRight : Minus;
  const cls  = type === 'positive' ? 'text-green-600 bg-green-50' : type === 'negative' ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50';
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${cls}`}>
      <Icon className="h-3 w-3" />{change}
    </span>
  );
}

// ─── Revenue helper ───────────────────────────────────────────────────────────

function calcPaid(booking: { status: string; deposit_paid?: number; total_amount?: number }) {
  if (booking.status === 'deposit-paid') return booking.deposit_paid ?? 0;
  if (booking.status === 'fully-paid')   return booking.total_amount ?? 0;
  if (booking.status === 'completed')    return (booking.deposit_paid ?? 0) > 0 ? (booking.deposit_paid ?? 0) : (booking.total_amount ?? 0);
  return 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { bookings,   loading: bLoad, error: bErr } = useBackendBookings();
  const { properties, loading: pLoad, error: pErr } = useBackendProperties();

  /* ── Loading ── */
  if (bLoad || pLoad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (bErr || pErr) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-lg font-bold">!</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load dashboard</p>
          <p className="text-xs text-gray-500">{bErr || pErr}</p>
        </div>
      </div>
    );
  }

  /* ── Derived stats ── */
  const totalBookings   = bookings.length;
  const totalRevenue    = bookings.reduce((s, b) => s + calcPaid(b), 0);
  const confirmedCount  = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount    = bookings.filter(b => b.status === 'pending').length;
  const totalGuests     = bookings.reduce((s, b) => s + (b.total_guests || b.adults + b.children || 0), 0);
  const totalRooms      = properties.reduce((s, p) => s + (p.rooms?.length || 0), 0);
  const availableRooms  = properties.reduce((s, p) => s + (p.rooms?.filter(r => r.available).length || 0), 0);
  const occupiedRooms   = totalRooms - availableRooms;
  const occupancyRate   = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const todayRevenue    = bookings
    .filter(b => new Date(b.created_at || b.check_in).toDateString() === new Date().toDateString())
    .reduce((s, b) => s + calcPaid(b), 0);

  const kpis = [
    { label: 'Total Bookings',  value: totalBookings.toString(),      change: totalBookings  > 0 ? '+8%'  : '0%', type: totalBookings  > 0 ? 'positive' : 'neutral', Icon: Calendar,    accent: 'bg-blue-50   text-blue-600'   },
    { label: 'Revenue',         value: '$' + totalRevenue.toLocaleString(), change: totalRevenue > 0 ? '+12%' : '0%', type: totalRevenue > 0 ? 'positive' : 'neutral', Icon: DollarSign,  accent: 'bg-green-50  text-green-600'  },
    { label: 'Total Guests',    value: totalGuests.toString(),         change: totalGuests    > 0 ? '+15%' : '0%', type: totalGuests    > 0 ? 'positive' : 'neutral', Icon: Users,       accent: 'bg-purple-50 text-purple-600' },
    { label: 'Occupancy',       value: occupancyRate + '%',            change: occupancyRate  > 50 ? '+5%' : '-2%',type: occupancyRate  > 50 ? 'positive' : 'negative',Icon: TrendingUp,  accent: 'bg-orange-50 text-orange-500' },
  ] as const;

  const recentBookings = bookings
    .slice().sort((a, b) => new Date(b.created_at || b.check_in).getTime() - new Date(a.created_at || a.check_in).getTime())
    .slice(0, 6)
    .map(b => {
      const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
      return {
        id:       b.id,
        guest:    b.guest_name || 'Unknown Guest',
        email:    b.guest_email,
        property: b.property_name || b.safari_properties?.name || 'Unknown Property',
        room:     b.room_name,
        checkIn:  fmt(b.check_in),
        checkOut: fmt(b.check_out),
        guests:   b.total_guests || ((b.adults ?? 0) + (b.children ?? 0)) || null,
        total:    b.total_amount ?? 0,
        paid:     calcPaid(b),
        status:   b.status,
      };
    });

  const topProperties = properties
    .map(p => {
      const pBookings = bookings.filter(b => b.property_name === p.name || b.property_name === p._id);
      return { name: p.name, bookings: pBookings.length, revenue: pBookings.reduce((s, b) => s + calcPaid(b), 0), rating: p.rating };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  const maxPropertyBookings = topProperties[0]?.bookings || 1;

  const quickActions = [
    { label: 'Bookings',   sub: 'View & manage reservations', href: '/admin/bookings',          Icon: Calendar,   count: totalBookings,  badge: pendingCount > 0 ? `${pendingCount} pending` : null },
    { label: 'Properties', sub: 'Lodges, camps & rooms',       href: '/admin/properties',         Icon: Building,   count: properties.length, badge: null },
    { label: 'Packages',   sub: 'Safari packages & itineraries',href: '/admin/packages',          Icon: Package,    count: null, badge: null },
    { label: 'Arrivals',   sub: 'Today\'s check-ins',          href: '/admin/arrivals',           Icon: PlaneIcon,  count: null, badge: null },
    { label: 'Analytics',  sub: 'Revenue & performance',        href: '/admin/analytics',         Icon: BarChart3,  count: null, badge: null },
    { label: 'Reviews',    sub: 'Guest feedback',               href: '/admin/reviews',            Icon: Star,       count: null, badge: null },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{today}</p>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {confirmedCount} confirmed · {pendingCount > 0 && <span className="text-yellow-600 font-medium">{pendingCount} pending action</span>}
              {pendingCount === 0 && 'all bookings up to date'}
            </p>
          </div>
          <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-colors">
            All Bookings <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── KPI cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, change, type, Icon, accent }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
                  <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <TrendBadge change={change} type={type} />
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Occupancy bar ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Room Availability</p>
              <p className="text-xs text-gray-400">{availableRooms} of {totalRooms} rooms available</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{occupancyRate}%</p>
              <p className="text-xs text-gray-400">occupied</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${occupancyRate > 80 ? 'bg-red-400' : occupancyRate > 50 ? 'bg-green-500' : 'bg-blue-400'}`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-gray-400">
            <span>{occupiedRooms} occupied</span>
            <span>{availableRooms} free</span>
          </div>
        </div>

        {/* ── Main two-col ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent bookings – 2/3 */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Recent Bookings</p>
                <p className="text-xs text-gray-400">{totalBookings} total</p>
              </div>
              <Link to="/admin/bookings" className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-gray-600">{b.guest.charAt(0).toUpperCase()}</span>
                    </div>
                    {/* Guest + booking details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{b.guest}</p>
                        {b.guests && <span className="text-[11px] text-gray-400">{b.guests} guest{b.guests !== 1 ? 's' : ''}</span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{b.property}{b.room ? <span className="text-gray-400"> · {b.room}</span> : null}</p>
                      {(b.checkIn || b.checkOut) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {b.checkIn && <>Check-in: <span className="text-gray-600">{b.checkIn}</span></>}
                          {b.checkIn && b.checkOut && ' → '}
                          {b.checkOut && <>Check-out: <span className="text-gray-600">{b.checkOut}</span></>}
                        </p>
                      )}
                      {b.email && <p className="text-[11px] text-gray-400 mt-0.5">{b.email}</p>}
                    </div>
                    {/* Amount + Status */}
                    <div className="flex-shrink-0 text-right space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">
                        {b.total > 0 ? '$' + b.total.toLocaleString() : '—'}
                      </p>
                      {b.paid > 0 && b.paid < b.total && (
                        <p className="text-[11px] text-green-600">${b.paid.toLocaleString()} paid</p>
                      )}
                      <StatusPill status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No bookings yet</p>
                <p className="text-xs text-gray-400 mt-1">New reservations will appear here</p>
              </div>
            )}
          </div>

          {/* Top properties – 1/3 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Top Properties</p>
                <p className="text-xs text-gray-400">by bookings</p>
              </div>
              <Link to="/admin/properties" className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                Manage <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {topProperties.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {topProperties.map((p, i) => (
                  <div key={p.name} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-gray-300 w-4 tabular-nums">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[11px] text-yellow-500">
                            <Star className="h-3 w-3 fill-yellow-400 stroke-none" />{p.rating}
                          </span>
                          <span className="text-[11px] text-gray-400">{p.bookings} booking{p.bookings !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-green-600 flex-shrink-0">
                        {p.revenue > 0 ? '$' + p.revenue.toLocaleString() : '—'}
                      </p>
                    </div>
                    {/* mini progress bar */}
                    <div className="ml-7">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${(p.bookings / maxPropertyBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No properties yet</p>
                <p className="text-xs text-gray-400 mt-1">Add properties to track performance</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Secondary KPIs ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Pending */}
          <div className={`bg-white rounded-xl border shadow-sm p-5 ${pendingCount > 0 ? 'border-yellow-200' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">bookings require action</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5 text-yellow-500" style={{ width: 18, height: 18 }} />
              </div>
            </div>
            {pendingCount > 0 && (
              <Link to="/admin/bookings?status=pending"
                className="flex items-center justify-between w-full text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-2 rounded-lg transition-colors">
                Review pending <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Rooms */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available Rooms</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{availableRooms}</p>
                <p className="text-xs text-gray-400 mt-0.5">of {totalRooms} total rooms</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Building className="h-4.5 w-4.5 text-green-500" style={{ width: 18, height: 18 }} />
              </div>
            </div>
            <Link to="/admin/room-availability"
              className="flex items-center justify-between w-full text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              Manage availability <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Today's revenue */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today's Revenue</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">${todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">from today's bookings</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-4.5 w-4.5 text-blue-500" style={{ width: 18, height: 18 }} />
              </div>
            </div>
            <Link to="/admin/reports"
              className="flex items-center justify-between w-full text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              View full report <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Quick actions ──────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {quickActions.map(({ label, sub, href, Icon, count, badge }) => (
              <Link key={href} to={href}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  {badge && (
                    <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">{badge}</span>
                  )}
                  {count !== null && count !== undefined && !badge && (
                    <span className="text-[10px] font-semibold text-gray-400">{count}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
