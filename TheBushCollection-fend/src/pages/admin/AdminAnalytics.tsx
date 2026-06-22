import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Calendar, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, Star
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useBackendBookings, SafariBooking } from '@/hooks/useBackendBookings';
import { useBackendProperties } from '@/hooks/useBackendProperties';

// ─── Types ────────────────────────────────────────────────────────────────────

type Property = {
  id?: string;
  _id?: string;
  name: string;
  rooms?: Array<{ id?: string; _id?: string; name: string }>;
};

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  averageBookingValue: number;
  revenueGrowth: number;
  bookingGrowth: number;
  revenueTrends: Array<{ date: string; revenue: number }>;
  propertyPerformance: Array<{
    property: string; bookings: number; revenue: number;
    guests: number; averageBookingValue: number; averageRating: number;
  }>;
  bookingStatus: Array<{ status: string; count: number; percentage: number }>;
  guestDemographics: Array<{ category: string; count: number; percentage: number }>;
  packagePerformance: Array<{
    packageId: string; packageName: string; bookings: number; revenue: number;
    guests: number; averageBookingValue: number; averageRating: number;
  }>;
}

// ─── Chart Colors ─────────────────────────────────────────────────────────────

const STATUS_PALETTE: Record<string, string> = {
  'Confirmed':    '#10b981',
  'Inquiry':      '#6366f1',
  'Deposit-paid': '#0ea5e9',
  'Fully-paid':   '#22c55e',
  'Completed':    '#64748b',
  'Cancelled':    '#ef4444',
  'Pending':      '#f59e0b',
};
const FALLBACK_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#64748b','#8b5cf6'];

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">${(payload[0].value as number).toLocaleString()}</p>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3.5 py-2.5 min-w-[150px]">
      <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[11px] text-gray-500">{p.name}</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-900">${(p.value as number).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30');
  const { bookings: allBookings, loading: bookingsLoading, error: bookingsError } = useBackendBookings();
  const { properties, loading: propertiesLoading, error: propertiesError } = useBackendProperties();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0, totalRevenue: 0, totalGuests: 0, averageBookingValue: 0,
    revenueGrowth: 0, bookingGrowth: 0, revenueTrends: [], propertyPerformance: [],
    bookingStatus: [], guestDemographics: [], packagePerformance: [],
  });

  const getPropertyName = (booking: SafariBooking, props: Property[]) => {
    if (booking.property_name) return booking.property_name;
    if (booking.safari_properties?.name) return booking.safari_properties.name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomNameCandidate = booking.room_name || (booking as any).safari_rooms?.name ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((booking as any).rooms?.[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (booking as any).roomName;
    if (roomNameCandidate) {
      const matched = props.find(p => p.rooms?.some(r => r.name.toLowerCase() === String(roomNameCandidate).toLowerCase()));
      return matched ? matched.name : 'Unknown Property';
    }
    return 'Unknown Property';
  };

  const calcPaid = (booking: SafariBooking) => {
    if (booking.status === 'deposit-paid') return booking.deposit_paid ?? 0;
    if (booking.status === 'fully-paid')   return booking.total_amount ?? 0;
    if (booking.status === 'completed')    return (booking.deposit_paid ?? 0) > 0 ? (booking.deposit_paid ?? 0) : (booking.total_amount ?? 0);
    return 0;
  };

  const calculateAnalytics = useCallback((current: SafariBooking[], all: SafariBooking[], props: Property[]) => {
    const data: AnalyticsData = {
      totalBookings: current.length,
      totalRevenue: current.reduce((s, b) => s + calcPaid(b), 0),
      totalGuests: current.reduce((s, b) => s + (b.total_guests || (b.adults ?? 0) + (b.children ?? 0)), 0),
      averageBookingValue: 0,
      revenueGrowth: 0, bookingGrowth: 0,
      revenueTrends: [], propertyPerformance: [], bookingStatus: [],
      guestDemographics: [], packagePerformance: [],
    };
    data.averageBookingValue = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;

    // Growth vs previous period
    const prevEnd = new Date(); prevEnd.setDate(prevEnd.getDate() - parseInt(timeRange));
    const prevStart = new Date(); prevStart.setDate(prevStart.getDate() - parseInt(timeRange) * 2);
    const prev = all.filter(b => { const d = new Date(b.created_at || b.check_in || ''); return d >= prevStart && d <= prevEnd; });
    const prevRev = prev.reduce((s, b) => s + calcPaid(b), 0);
    data.revenueGrowth   = prevRev > 0 ? ((data.totalRevenue - prevRev) / prevRev) * 100 : 0;
    data.bookingGrowth   = prev.length  > 0 ? ((data.totalBookings - prev.length) / prev.length) * 100 : 0;

    // Daily revenue trends
    const daily: Record<string, number> = {};
    current.forEach(b => {
      const d = new Date(b.created_at || b.check_in || '').toISOString().split('T')[0];
      daily[d] = (daily[d] || 0) + calcPaid(b);
    });
    data.revenueTrends = Object.entries(daily)
      .map(([date, revenue]) => ({ date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Property performance
    const propStats: Record<string, { bookings: number; revenue: number; guests: number; ratings: number[] }> = {};
    current.forEach(b => {
      const name = getPropertyName(b, props);
      if (!propStats[name]) propStats[name] = { bookings: 0, revenue: 0, guests: 0, ratings: [] };
      propStats[name].bookings++;
      propStats[name].revenue += calcPaid(b);
      propStats[name].guests  += b.total_guests || (b.adults ?? 0) + (b.children ?? 0);
    });
    data.propertyPerformance = Object.entries(propStats)
      .map(([property, s]) => ({
        property, bookings: s.bookings, revenue: s.revenue, guests: s.guests,
        averageBookingValue: s.bookings > 0 ? s.revenue / s.bookings : 0,
        averageRating: s.ratings.length ? s.ratings.reduce((a, r) => a + r, 0) / s.ratings.length : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Booking status
    const statusCount = current.reduce((acc, b) => {
      const s = b.status || 'confirmed';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    data.bookingStatus = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / data.totalBookings) * 100),
    }));

    // Guest group sizes
    const sizes = current.reduce((acc, b) => {
      const n = b.total_guests || (b.adults ?? 0) + (b.children ?? 0) || 1;
      const cat = n === 1 ? 'Solo' : n <= 2 ? 'Couple' : n <= 4 ? 'Small Group' : 'Large Group';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    data.guestDemographics = Object.entries(sizes).map(([category, count]) => ({
      category, count, percentage: Math.round((count / data.totalBookings) * 100),
    }));

    // Package performance
    const pkgStats: Record<string, { name: string; bookings: number; revenue: number; guests: number; ratings: number[] }> = {};
    current.forEach(b => {
      const id = b.package_id || 'unknown';
      if (!pkgStats[id]) pkgStats[id] = { name: 'Package ' + id, bookings: 0, revenue: 0, guests: 0, ratings: [] };
      pkgStats[id].bookings++;
      pkgStats[id].revenue += calcPaid(b);
      pkgStats[id].guests  += b.total_guests || 0;
    });
    data.packagePerformance = Object.entries(pkgStats)
      .map(([packageId, s]) => ({
        packageId, packageName: s.name, bookings: s.bookings, revenue: s.revenue, guests: s.guests,
        averageBookingValue: s.bookings > 0 ? s.revenue / s.bookings : 0,
        averageRating: s.ratings.length ? s.ratings.reduce((a, r) => a + r, 0) / s.ratings.length : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setAnalytics(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const runCalculation = useCallback(() => {
    try {
      const daysAgo = new Date(Date.now() - parseInt(timeRange) * 864e5);
      const filtered = allBookings.filter(b => new Date(b.created_at || b.check_in || '') >= daysAgo);
      calculateAnalytics(filtered, allBookings, properties);
    } catch { /* silent */ }
  }, [timeRange, allBookings, properties, calculateAnalytics]);

  useEffect(() => {
    if (!bookingsLoading && !propertiesLoading) runCalculation();
  }, [timeRange, allBookings, properties, bookingsLoading, propertiesLoading, runCalculation]);

  // Monthly income for year-over-year chart
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      current: 0,
      previous: 0,
    }));
    allBookings.forEach(b => {
      const d = new Date(b.created_at || b.check_in || '');
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const amt = calcPaid(b);
      if (yr === currentYear)     months[mo].current  += amt;
      if (yr === currentYear - 1) months[mo].previous += amt;
    });
    return months;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBookings]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  // ── Loading ──
  if (bookingsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading analytics…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (bookingsError || propertiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-lg font-bold">!</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load analytics</p>
          <p className="text-xs text-gray-500">{bookingsError || propertiesError}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Bookings', value: analytics.totalBookings.toString(),
      growth: analytics.bookingGrowth, Icon: Calendar,
      accent: 'bg-sky-50 text-sky-500',
    },
    {
      label: 'Total Revenue', value: fmt(analytics.totalRevenue),
      growth: analytics.revenueGrowth, Icon: DollarSign,
      accent: 'bg-indigo-50 text-indigo-500',
    },
    {
      label: 'Total Guests', value: analytics.totalGuests.toString(),
      growth: 0, Icon: Users,
      accent: 'bg-emerald-50 text-emerald-500',
    },
    {
      label: 'Avg Booking Value', value: fmt(analytics.averageBookingValue),
      growth: 0, Icon: TrendingUp,
      accent: 'bg-amber-50 text-amber-500',
    },
  ];

  const maxPropRevenue = analytics.propertyPerformance[0]?.revenue || 1;

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Performance overview for your safari bookings</p>
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {([['7','7d'],['30','30d'],['90','90d'],['365','1yr']] as [string,string][]).map(([val, label]) => (
              <button key={val} onClick={() => setTimeRange(val)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${timeRange === val ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, growth, Icon, accent }) => {
            const up = growth > 0; const down = growth < 0;
            const TrendIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
            const trendCls  = up ? 'text-emerald-600 bg-emerald-50' : down ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50';
            return (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {growth !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-lg ${trendCls}`}>
                      <TrendIcon className="h-3 w-3" />{Math.abs(growth).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Revenue Area Chart ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-gray-900">Revenue Trend</p>
              <p className="text-xs text-gray-400 mt-0.5">Paid amounts over selected period</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{fmt(analytics.totalRevenue)}</p>
              <p className="text-xs text-gray-400">total collected</p>
            </div>
          </div>
          {analytics.revenueTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.revenueTrends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)} width={48} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                  fill="url(#revenueGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No revenue data for this period</div>
          )}
        </div>

        {/* ── Status Donut + Property Performance ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Booking Status Donut */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Booking Status</p>
            <p className="text-xs text-gray-400 mb-4">Distribution across all statuses</p>
            {analytics.bookingStatus.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={analytics.bookingStatus} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        dataKey="count" paddingAngle={3} startAngle={90} endAngle={-270}>
                        {analytics.bookingStatus.map((entry, i) => (
                          <Cell key={entry.status}
                            fill={STATUS_PALETTE[entry.status] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, _n, props) => [`${v} (${props.payload.percentage}%)`, props.payload.status]}
                        contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,.08)', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{analytics.totalBookings}</p>
                      <p className="text-[11px] text-gray-400">total</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  {analytics.bookingStatus.map((s, i) => (
                    <div key={s.status} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_PALETTE[s.status] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
                      <span className="text-xs text-gray-600 flex-1">{s.status}</span>
                      <span className="text-xs font-semibold text-gray-900">{s.count}</span>
                      <span className="text-[11px] text-gray-400 w-8 text-right">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">No status data</div>
            )}
          </div>

          {/* Property Performance */}
          <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Property Performance</p>
            <p className="text-xs text-gray-400 mb-5">Ranked by revenue collected</p>
            {analytics.propertyPerformance.length > 0 ? (
              <div className="space-y-4">
                {analytics.propertyPerformance.slice(0, 6).map((p, i) => (
                  <div key={p.property}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-gray-200 w-4 flex-shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{p.property}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                        <span className="text-[11px] text-gray-400">{p.bookings} booking{p.bookings !== 1 ? 's' : ''}</span>
                        <span className="text-sm font-semibold text-gray-900 w-20 text-right">{fmt(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="ml-[26px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                        style={{ width: `${Math.max((p.revenue / maxPropRevenue) * 100, p.revenue > 0 ? 2 : 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">No property data for this period</div>
            )}
          </div>
        </div>

        {/* ── Monthly YoY + Guest Sizes ──────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Year-over-year monthly line chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Monthly Revenue</p>
                <p className="text-xs text-gray-400 mt-0.5">Year-over-year comparison</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-indigo-500 rounded" />This year</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t border-dashed border-gray-300" />Last year</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)} width={44} />
                <Tooltip content={<MonthlyTooltip />} />
                <Line type="monotone" dataKey="current" name="This Year"
                  stroke="#6366f1" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="previous" name="Last Year"
                  stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 4" dot={false}
                  activeDot={{ r: 3, fill: '#94a3b8', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Guest Group Sizes + Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Guest Profiles</p>
            <p className="text-xs text-gray-400 mb-5">Booking group size breakdown</p>

            {analytics.guestDemographics.length > 0 ? (
              <div className="space-y-4 mb-6">
                {analytics.guestDemographics.map((g, i) => {
                  const colors = ['bg-indigo-400','bg-emerald-400','bg-sky-400','bg-amber-400'];
                  return (
                    <div key={g.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{g.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{g.count} bookings</span>
                          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{g.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                          style={{ width: `${g.percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400 mb-4">No demographic data</div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 mb-0.5">Avg group size</p>
                <p className="text-base font-bold text-gray-900">
                  {(analytics.totalGuests / Math.max(analytics.totalBookings, 1)).toFixed(1)} guests
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 mb-0.5">Revenue per guest</p>
                <p className="text-base font-bold text-gray-900">
                  {fmt(analytics.totalRevenue / Math.max(analytics.totalGuests, 1))}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 mb-0.5">Properties active</p>
                <p className="text-base font-bold text-gray-900">{analytics.propertyPerformance.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 mb-0.5">Top property</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {analytics.propertyPerformance[0]?.property?.split(' ').slice(0, 2).join(' ') || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Package Performance ────────────────────────────────── */}
        {analytics.packagePerformance.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">Package Performance</p>
            <p className="text-xs text-gray-400 mb-5">Bookings and revenue by safari package</p>
            <div className="space-y-4">
              {analytics.packagePerformance.slice(0, 6).map((pkg, i) => {
                const maxPkgRev = analytics.packagePerformance[0]?.revenue || 1;
                return (
                  <div key={pkg.packageId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-gray-200 w-4 flex-shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{pkg.packageName}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                        <span className="text-[11px] text-gray-400">{pkg.bookings} booking{pkg.bookings !== 1 ? 's' : ''}</span>
                        {pkg.averageRating > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] text-yellow-500">
                            <Star className="h-3 w-3 fill-yellow-400 stroke-none" />{pkg.averageRating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900 w-20 text-right">{fmt(pkg.revenue)}</span>
                      </div>
                    </div>
                    <div className="ml-[26px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sky-400 transition-all duration-700"
                        style={{ width: `${Math.max((pkg.revenue / maxPkgRev) * 100, pkg.revenue > 0 ? 2 : 0)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
