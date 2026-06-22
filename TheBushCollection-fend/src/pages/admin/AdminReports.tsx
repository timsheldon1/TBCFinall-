import { useState, useEffect } from 'react';
import {
  Download, FileText, Users, Calendar, DollarSign,
  Globe, TrendingUp, Clock, RefreshCw, Building
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import { differenceInDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  averageBookingValue: number;
  revenueGrowth: number;
  bookingGrowth: number;
  occupancyData?: OccupancyData;
  guestAnalytics?: GuestAnalytics;
  revenueData?: RevenueData;
  propertyData?: PropertyData[];
}

interface OccupancyData {
  byProperty: Array<{
    property: string; occupancyRate: number; occupiedNights: number;
    totalNights: number; revenue: number; bookings: number;
    averageRate: number; averageStay: number; revenuePerBooking: number; peakDays: string;
  }>;
  overall: { occupancyRate: number; totalOccupied: number; totalAvailable: number; averageStay: number };
}

interface GuestAnalytics {
  byCountry: Array<{
    country: string; bookings: number; revenue: number; guests: number;
    totalNights: number; averageBookingValue: number; averageStay: number;
    averageGroupSize: number; revenuePerGuest: number;
  }>;
  topCountries: Array<{
    country: string; bookings: number; revenue: number; guests: number;
    totalNights: number; averageBookingValue: number; averageStay: number;
    averageGroupSize: number; revenuePerGuest: number;
  }>;
  totalCountries: number;
  demographics: { totalGuests: number; totalRevenue: number; averageGroupSize: number; revenuePerGuest: number; topMarkets: string };
}

interface RevenueData {
  trends: Array<{ date: string; revenue: number; bookings: number; averageBookingValue: number; formattedDate: string }>;
  bySource: Array<{ source: string; revenue: number; bookings: number; averageValue: number }>;
  totalRevenue: number;
  averageDailyRevenue: number;
}

interface PropertyData {
  property: string; bookings: number; revenue: number; guests: number;
  totalNights: number; averageBookingValue: number; averageStay: number;
  revenuePerNight: number; averageRating: number; occupancyRate: number;
}

// ─── Country codes ────────────────────────────────────────────────────────────

const countryCodeMap: { [key: string]: { name: string; flag: string } } = {
  '+1': { name: 'United States/Canada', flag: '🇺🇸' }, '+44': { name: 'United Kingdom', flag: '🇬🇧' },
  '+33': { name: 'France', flag: '🇫🇷' }, '+49': { name: 'Germany', flag: '🇩🇪' },
  '+39': { name: 'Italy', flag: '🇮🇹' }, '+34': { name: 'Spain', flag: '🇪🇸' },
  '+31': { name: 'Netherlands', flag: '🇳🇱' }, '+41': { name: 'Switzerland', flag: '🇨🇭' },
  '+43': { name: 'Austria', flag: '🇦🇹' }, '+32': { name: 'Belgium', flag: '🇧🇪' },
  '+45': { name: 'Denmark', flag: '🇩🇰' }, '+46': { name: 'Sweden', flag: '🇸🇪' },
  '+47': { name: 'Norway', flag: '🇳🇴' }, '+358': { name: 'Finland', flag: '🇫🇮' },
  '+351': { name: 'Portugal', flag: '🇵🇹' }, '+30': { name: 'Greece', flag: '🇬🇷' },
  '+48': { name: 'Poland', flag: '🇵🇱' }, '+420': { name: 'Czech Republic', flag: '🇨🇿' },
  '+36': { name: 'Hungary', flag: '🇭🇺' }, '+7': { name: 'Russia', flag: '🇷🇺' },
  '+86': { name: 'China', flag: '🇨🇳' }, '+81': { name: 'Japan', flag: '🇯🇵' },
  '+82': { name: 'South Korea', flag: '🇰🇷' }, '+91': { name: 'India', flag: '🇮🇳' },
  '+61': { name: 'Australia', flag: '🇦🇺' }, '+64': { name: 'New Zealand', flag: '🇳🇿' },
  '+27': { name: 'South Africa', flag: '🇿🇦' }, '+254': { name: 'Kenya', flag: '🇰🇪' },
  '+255': { name: 'Tanzania', flag: '🇹🇿' }, '+256': { name: 'Uganda', flag: '🇺🇬' },
  '+250': { name: 'Rwanda', flag: '🇷🇼' }, '+20': { name: 'Egypt', flag: '🇪🇬' },
  '+212': { name: 'Morocco', flag: '🇲🇦' }, '+234': { name: 'Nigeria', flag: '🇳🇬' },
  '+233': { name: 'Ghana', flag: '🇬🇭' }, '+55': { name: 'Brazil', flag: '🇧🇷' },
  '+52': { name: 'Mexico', flag: '🇲🇽' }, '+54': { name: 'Argentina', flag: '🇦🇷' },
  '+971': { name: 'UAE', flag: '🇦🇪' }, '+966': { name: 'Saudi Arabia', flag: '🇸🇦' },
  '+60': { name: 'Malaysia', flag: '🇲🇾' }, '+65': { name: 'Singapore', flag: '🇸🇬' },
  '+66': { name: 'Thailand', flag: '🇹🇭' },
};

const COUNTRY_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">${(payload[0].value as number).toLocaleString()}</p>
      {payload[1] && <p className="text-[11px] text-gray-500 mt-0.5">{payload[1].value} booking{payload[1].value !== 1 ? 's' : ''}</p>}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function OccupancyBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? 'bg-emerald-400' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = rate >= 70 ? 'text-emerald-700' : rate >= 40 ? 'text-amber-700' : 'text-red-600';
  const bg = rate >= 70 ? 'bg-emerald-50' : rate >= 40 ? 'bg-amber-50' : 'bg-red-50';
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${bg} ${textColor} w-9 text-center`}>{rate}%</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [reportType, setReportType] = useState('occupancy');
  const [timeRange, setTimeRange] = useState('30');
  const [reportData, setReportData] = useState<ReportData>({
    totalBookings: 0, totalRevenue: 0, totalGuests: 0, averageBookingValue: 0,
    revenueGrowth: 0, bookingGrowth: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { bookings: supabaseBookings, loading, error, refetch } = useBackendBookings();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = supabaseBookings.map((booking: SafariBooking) => ({
    id: booking.id,
    customerName: booking.guest_name || 'Unknown Guest',
    customerEmail: booking.guest_email || '',
    customerPhone: booking.guest_phone || '',
    propertyName: booking.safari_properties?.name || booking.property_name || 'Unknown Property',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roomName: booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms?.[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName || 'Unknown Room',
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guests: booking.total_guests || ((booking.adults ?? 0) + (booking.children ?? 0)),
    nights: differenceInDays(new Date(booking.check_out || new Date()), new Date(booking.check_in || new Date())),
    total: booking.total_amount || 0,
    status: booking.status as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: (booking as any).booking_type || 'Direct Booking',
    depositPaid: booking.deposit_paid || 0,
    balanceDue: booking.balance_due || 0,
    createdAt: booking.created_at,
  }));

  useEffect(() => {
    if (supabaseBookings.length > 0) generateReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, reportType, supabaseBookings]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcPaid = (b: any) => {
    if (b.status === 'deposit-paid') return b.depositPaid || 0;
    if (b.status === 'fully-paid')   return b.total || 0;
    if (b.status === 'completed')    return (b.depositPaid || 0) > 0 ? (b.depositPaid || 0) : (b.total || 0);
    return 0;
  };

  const generateReportData = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 864e5);
    const current = bookings.filter(b => new Date(b.createdAt || b.checkIn || '') >= daysAgo);

    const data: ReportData = {
      totalBookings: current.length,
      totalRevenue: current.reduce((s, b) => s + calcPaid(b), 0),
      totalGuests: current.reduce((s, b) => s + (b.guests || 0), 0),
      averageBookingValue: 0,
      revenueGrowth: 0, bookingGrowth: 0,
    };
    data.averageBookingValue = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;

    const prevEnd = new Date(); prevEnd.setDate(prevEnd.getDate() - parseInt(timeRange));
    const prevStart = new Date(); prevStart.setDate(prevStart.getDate() - parseInt(timeRange) * 2);
    const prev = bookings.filter(b => { const d = new Date(b.createdAt || b.checkIn || ''); return d >= prevStart && d <= prevEnd; });
    const prevRev = prev.reduce((s, b) => s + calcPaid(b), 0);
    data.revenueGrowth = prevRev > 0 ? ((data.totalRevenue - prevRev) / prevRev) * 100 : 0;
    data.bookingGrowth = prev.length > 0 ? ((data.totalBookings - prev.length) / prev.length) * 100 : 0;

    if (reportType === 'occupancy') data.occupancyData = calculateOccupancyReport(current);
    if (reportType === 'guest')     data.guestAnalytics = calculateGuestReport(current);
    if (reportType === 'revenue')   data.revenueData    = calculateRevenueReport(current);
    if (reportType === 'property')  data.propertyData   = calculatePropertyReport(current);

    setReportData(data);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateOccupancyReport = (bks: any[]): OccupancyData => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: Record<string, any> = {};
    bks.forEach(b => {
      const n = b.propertyName;
      if (!stats[n]) stats[n] = { total: 0, occupied: 0, revenue: 0, bookings: 0, peakDays: [] };
      if (b.checkIn && b.checkOut) {
        const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 864e5);
        stats[n].occupied += nights;
        stats[n].revenue  += calcPaid(b);
        stats[n].bookings += 1;
        const day = new Date(b.checkIn).toLocaleDateString('en-US', { weekday: 'long' });
        if (!stats[n].peakDays.includes(day)) stats[n].peakDays.push(day);
      }
      stats[n].total = Math.max(stats[n].total, parseInt(timeRange));
    });
    const byProperty = Object.entries(stats).map(([property, d]) => ({
      property,
      occupancyRate: d.total > 0 ? Math.round((d.occupied / d.total) * 100) : 0,
      occupiedNights: d.occupied, totalNights: d.total, revenue: d.revenue, bookings: d.bookings,
      averageRate: d.occupied > 0 ? Math.round(d.revenue / d.occupied) : 0,
      averageStay: d.bookings > 0 ? Math.round(d.occupied / d.bookings * 10) / 10 : 0,
      revenuePerBooking: d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0,
      peakDays: d.peakDays.slice(0, 3).join(', ') || 'N/A',
    })).sort((a, b) => b.occupancyRate - a.occupancyRate);
    const totalOccupied  = byProperty.reduce((s, p) => s + p.occupiedNights, 0);
    const totalAvailable = byProperty.reduce((s, p) => s + p.totalNights, 0);
    return {
      byProperty,
      overall: {
        occupancyRate: totalAvailable > 0 ? Math.round((totalOccupied / totalAvailable) * 100) : 0,
        totalOccupied, totalAvailable,
        averageStay: byProperty.length > 0 ? Math.round(byProperty.reduce((s, p) => s + p.averageStay, 0) / byProperty.length * 10) / 10 : 0,
      },
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateGuestReport = (bks: any[]): GuestAnalytics => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cs: Record<string, any> = {};
    bks.forEach(b => {
      const phone = b.customerPhone;
      if (!phone) return;
      let code = '+1';
      for (const c of Object.keys(countryCodeMap).sort((a, b) => b.length - a.length)) {
        if (phone.trim().startsWith(c)) { code = c; break; }
      }
      const info = countryCodeMap[code] || { name: 'Unknown', flag: '🌍' };
      const key  = `${info.flag} ${info.name}`;
      if (!cs[key]) cs[key] = { count: 0, revenue: 0, guests: 0, totalNights: 0 };
      const nights = b.checkIn && b.checkOut ? Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 864e5) : 1;
      cs[key].count++;
      cs[key].revenue    += calcPaid(b);
      cs[key].guests     += b.guests || 0;
      cs[key].totalNights += nights;
    });
    const sorted = Object.entries(cs).map(([country, s]) => ({
      country, bookings: s.count, revenue: s.revenue, guests: s.guests, totalNights: s.totalNights,
      averageBookingValue: s.count > 0 ? s.revenue / s.count : 0,
      averageStay: s.count > 0 ? s.totalNights / s.count : 0,
      averageGroupSize: s.count > 0 ? s.guests / s.count : 0,
      revenuePerGuest: s.guests > 0 ? s.revenue / s.guests : 0,
    })).sort((a, b) => b.revenue - a.revenue);
    const tg = sorted.reduce((s, c) => s + c.guests, 0);
    const tr = sorted.reduce((s, c) => s + c.revenue, 0);
    const tb = sorted.reduce((s, c) => s + c.bookings, 0);
    return {
      byCountry: sorted, topCountries: sorted.slice(0, 10), totalCountries: sorted.length,
      demographics: {
        totalGuests: tg, totalRevenue: tr,
        averageGroupSize: Math.round((tb > 0 ? tg / tb : 0) * 10) / 10,
        revenuePerGuest: tg > 0 ? Math.round(tr / tg) : 0,
        topMarkets: sorted.slice(0, 5).map(c => c.country.split(' ')[0]).join(', '),
      },
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateRevenueReport = (bks: any[]): RevenueData => {
    const daily: Record<string, { revenue: number; bookings: number }> = {};
    bks.forEach(b => {
      const d = new Date(b.createdAt || b.checkIn || '').toISOString().split('T')[0];
      if (!daily[d]) daily[d] = { revenue: 0, bookings: 0 };
      daily[d].revenue += calcPaid(b);
      daily[d].bookings++;
    });
    const trends = Object.entries(daily)
      .map(([date, d]) => ({
        date, revenue: d.revenue, bookings: d.bookings,
        averageBookingValue: d.bookings > 0 ? d.revenue / d.bookings : 0,
        formattedDate: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const src = bks.reduce((acc: Record<string, any>, b) => {
      const s = b.source || 'Direct Booking';
      if (!acc[s]) acc[s] = { revenue: 0, bookings: 0 };
      acc[s].revenue += calcPaid(b);
      acc[s].bookings++;
      return acc;
    }, {});
    const totalRevenue = bks.reduce((s, b) => s + calcPaid(b), 0);
    return {
      trends,
      bySource: Object.entries(src).map(([source, d]: [string, { revenue: number; bookings: number }]) => ({
        source, revenue: d.revenue, bookings: d.bookings, averageValue: d.bookings > 0 ? d.revenue / d.bookings : 0,
      })).sort((a, b) => b.revenue - a.revenue),
      totalRevenue,
      averageDailyRevenue: trends.length > 0 ? trends.reduce((s, d) => s + d.revenue, 0) / trends.length : 0,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculatePropertyReport = (bks: any[]): PropertyData[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: Record<string, any> = {};
    bks.forEach(b => {
      const n = b.propertyName;
      if (!stats[n]) stats[n] = { bookings: 0, revenue: 0, guests: 0, totalNights: 0, ratings: [] };
      const nights = b.checkIn && b.checkOut ? Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 864e5) : 1;
      stats[n].bookings++;
      stats[n].revenue    += calcPaid(b);
      stats[n].guests     += b.guests || 0;
      stats[n].totalNights += nights;
    });
    return Object.entries(stats).map(([property, s]) => ({
      property, bookings: s.bookings, revenue: s.revenue, guests: s.guests, totalNights: s.totalNights,
      averageBookingValue: s.bookings > 0 ? s.revenue / s.bookings : 0,
      averageStay: s.bookings > 0 ? s.totalNights / s.bookings : 0,
      revenuePerNight: s.totalNights > 0 ? s.revenue / s.totalNights : 0,
      averageRating: 0,
      occupancyRate: Math.min(100, (s.totalNights / parseInt(timeRange)) * 100),
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const exportToCSV = async () => {
    setIsGenerating(true);
    try {
      let csv = ''; let filename = '';
      if (reportType === 'occupancy' && reportData.occupancyData) {
        filename = `occupancy-report-${timeRange}days.csv`;
        csv = 'Property,Occupancy Rate (%),Occupied Nights,Total Nights,Revenue,Bookings,Avg Rate,Avg Stay,Rev/Booking,Peak Days\n';
        reportData.occupancyData.byProperty.forEach(p => {
          csv += `"${p.property}",${p.occupancyRate},${p.occupiedNights},${p.totalNights},${p.revenue},${p.bookings},${p.averageRate},${p.averageStay},${p.revenuePerBooking},"${p.peakDays}"\n`;
        });
      } else if (reportType === 'guest' && reportData.guestAnalytics) {
        filename = `guest-analytics-${timeRange}days.csv`;
        csv = 'Country,Bookings,Revenue,Guests,Total Nights,Avg Booking Value,Avg Stay,Avg Group Size,Revenue per Guest\n';
        reportData.guestAnalytics.byCountry.forEach(c => {
          csv += `"${c.country}",${c.bookings},${c.revenue},${c.guests},${c.totalNights},${c.averageBookingValue.toFixed(2)},${c.averageStay.toFixed(1)},${c.averageGroupSize.toFixed(1)},${c.revenuePerGuest.toFixed(2)}\n`;
        });
      } else if (reportType === 'revenue' && reportData.revenueData) {
        filename = `revenue-report-${timeRange}days.csv`;
        csv = 'Date,Revenue,Bookings,Avg Booking Value\n';
        reportData.revenueData.trends.forEach(d => {
          csv += `${d.formattedDate},${d.revenue},${d.bookings},${d.averageBookingValue.toFixed(2)}\n`;
        });
      } else if (reportType === 'property' && reportData.propertyData) {
        filename = `property-performance-${timeRange}days.csv`;
        csv = 'Property,Bookings,Revenue,Guests,Total Nights,Avg Booking Value,Avg Stay,Rev/Night,Occupancy Rate\n';
        reportData.propertyData.forEach(p => {
          csv += `"${p.property}",${p.bookings},${p.revenue},${p.guests},${p.totalNights},${p.averageBookingValue.toFixed(2)},${p.averageStay.toFixed(1)},${p.revenuePerNight.toFixed(2)},${p.occupancyRate.toFixed(1)}\n`;
        });
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.visibility = 'hidden';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch { toast.error('Failed to export CSV'); } finally { setIsGenerating(false); }
  };

  const exportToPDF = async () => {
    setIsGenerating(true);
    try {
      const html = `<html><head><title>${reportType} Report</title><style>body{font-family:Arial,sans-serif;margin:20px}h1{color:#333;border-bottom:2px solid #333;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}</style></head><body><h1>${reportType.charAt(0).toUpperCase()+reportType.slice(1)} Report</h1><p>Period: Last ${timeRange} days &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</p><p>Total Bookings: ${reportData.totalBookings} &nbsp;|&nbsp; Total Revenue: $${(reportData.totalRevenue||0).toLocaleString()} &nbsp;|&nbsp; Guests: ${reportData.totalGuests}</p></body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType}-report-${timeRange}days.html`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success('PDF report exported successfully');
    } catch { toast.error('Failed to export PDF'); } finally { setIsGenerating(false); }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading reports…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-lg font-bold">!</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load reports</p>
          <p className="text-xs text-gray-500 mb-3">{error}</p>
          <button onClick={refetch}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Bookings',   value: reportData.totalBookings.toString(),    growth: reportData.bookingGrowth, Icon: Calendar,   accent: 'bg-sky-50 text-sky-500' },
    { label: 'Total Revenue',    value: fmt(reportData.totalRevenue),           growth: reportData.revenueGrowth, Icon: DollarSign,  accent: 'bg-indigo-50 text-indigo-500' },
    { label: 'Total Guests',     value: reportData.totalGuests.toString(),      growth: 0,                        Icon: Users,       accent: 'bg-emerald-50 text-emerald-500' },
    { label: 'Avg Booking Value',value: fmt(reportData.averageBookingValue),    growth: 0,                        Icon: TrendingUp,  accent: 'bg-amber-50 text-amber-500' },
  ];

  const REPORT_TABS = [
    ['occupancy', 'Occupancy'],
    ['guest',     'Guest Analytics'],
    ['revenue',   'Revenue'],
    ['property',  'Properties'],
  ] as [string, string][];

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Detailed business reports and data exports</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refetch}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl shadow-sm transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={exportToCSV} disabled={isGenerating || bookings.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={exportToPDF} disabled={isGenerating || bookings.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none">
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* ── Report type + period ───────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {REPORT_TABS.map(([val, label]) => (
              <button key={val} onClick={() => setReportType(val)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${reportType === val ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
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
          {kpis.map(({ label, value, growth, Icon, accent }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {growth !== 0 && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-lg ${growth > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {growth > 0 ? '+' : ''}{Math.abs(growth).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Empty state ────────────────────────────────────────── */}
        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No booking data available</p>
            <p className="text-xs text-gray-400">Reports will appear once bookings are in the system</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* OCCUPANCY REPORT                                       */}
        {/* ══════════════════════════════════════════════════════ */}
        {bookings.length > 0 && reportType === 'occupancy' && reportData.occupancyData && (
          <div className="space-y-6">

            {/* Overall stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Overall Occupancy', value: `${reportData.occupancyData.overall.occupancyRate}%`, accent: 'bg-indigo-50 text-indigo-500', Icon: TrendingUp },
                { label: 'Nights Occupied',   value: reportData.occupancyData.overall.totalOccupied.toString(), accent: 'bg-sky-50 text-sky-500', Icon: Calendar },
                { label: 'Nights Available',  value: reportData.occupancyData.overall.totalAvailable.toString(), accent: 'bg-emerald-50 text-emerald-500', Icon: Clock },
                { label: 'Avg Stay',          value: `${reportData.occupancyData.overall.averageStay} nights`, accent: 'bg-amber-50 text-amber-500', Icon: Building },
              ].map(({ label, value, accent, Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent} mb-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Property occupancy bars */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-900 mb-1">Property Occupancy Rates</p>
              <p className="text-xs text-gray-400 mb-5">Nights occupied vs available in period</p>
              {reportData.occupancyData.byProperty.length > 0 ? (
                <div className="space-y-5">
                  {reportData.occupancyData.byProperty.map((prop) => (
                    <div key={prop.property}>
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{prop.property}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {prop.occupiedNights} nights · {prop.bookings} booking{prop.bookings !== 1 ? 's' : ''} · avg {prop.averageStay} nights stay
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{fmt(prop.revenue)}</p>
                          <p className="text-[11px] text-gray-400">{fmt(prop.averageRate)}/night</p>
                        </div>
                      </div>
                      <OccupancyBar rate={prop.occupancyRate} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400">No occupancy data for this period</div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* GUEST ANALYTICS REPORT                                 */}
        {/* ══════════════════════════════════════════════════════ */}
        {bookings.length > 0 && reportType === 'guest' && reportData.guestAnalytics && (
          <div className="space-y-6">

            {/* Overview tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Guests',      value: reportData.guestAnalytics.demographics.totalGuests.toString(), Icon: Users,    accent: 'bg-sky-50 text-sky-500' },
                { label: 'Avg Group Size',    value: `${reportData.guestAnalytics.demographics.averageGroupSize}`,  Icon: Users,    accent: 'bg-indigo-50 text-indigo-500' },
                { label: 'Revenue per Guest', value: fmt(reportData.guestAnalytics.demographics.revenuePerGuest),   Icon: DollarSign, accent: 'bg-emerald-50 text-emerald-500' },
                { label: 'Countries',         value: reportData.guestAnalytics.totalCountries.toString(),           Icon: Globe,    accent: 'bg-amber-50 text-amber-500' },
              ].map(({ label, value, Icon, accent }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent} mb-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Donut + ranked list */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

              {/* Donut */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">Bookings by Country</p>
                <p className="text-xs text-gray-400 mb-4">Top {Math.min(reportData.guestAnalytics.topCountries.length, 8)} markets</p>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={reportData.guestAnalytics.topCountries.slice(0, 8)}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        dataKey="bookings" paddingAngle={3} startAngle={90} endAngle={-270}>
                        {reportData.guestAnalytics.topCountries.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, _n, p) => [`${v} bookings`, p.payload.country]}
                        contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,.08)', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{reportData.guestAnalytics.totalCountries}</p>
                      <p className="text-[11px] text-gray-400">countries</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {reportData.guestAnalytics.topCountries.slice(0, 6).map((c, i) => (
                    <div key={c.country} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
                      <span className="text-xs text-gray-600 flex-1 truncate">{c.country}</span>
                      <span className="text-xs font-semibold text-gray-900">{c.bookings}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by country bars */}
              <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">Revenue by Country</p>
                <p className="text-xs text-gray-400 mb-5">Top markets by revenue collected</p>
                {reportData.guestAnalytics.topCountries.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.guestAnalytics.topCountries.slice(0, 8).map((c, i) => {
                      const maxRev = reportData.guestAnalytics!.topCountries[0]?.revenue || 1;
                      return (
                        <div key={c.country}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-gray-200 w-4">#{i + 1}</span>
                              <span className="text-sm font-medium text-gray-900 truncate">{c.country}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                              <span className="text-[11px] text-gray-400">{c.bookings} booking{c.bookings !== 1 ? 's' : ''}</span>
                              <span className="text-sm font-semibold text-gray-900 w-20 text-right">{fmt(c.revenue)}</span>
                            </div>
                          </div>
                          <div className="ml-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                              style={{ width: `${Math.max((c.revenue / maxRev) * 100, c.revenue > 0 ? 2 : 0)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-400">No country data for this period</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* REVENUE REPORT                                         */}
        {/* ══════════════════════════════════════════════════════ */}
        {bookings.length > 0 && reportType === 'revenue' && reportData.revenueData && (
          <div className="space-y-6">

            {/* Revenue stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Collected', value: fmt(reportData.revenueData.totalRevenue), accent: 'bg-indigo-50 text-indigo-500', Icon: DollarSign },
                { label: 'Daily Average',   value: fmt(reportData.revenueData.averageDailyRevenue), accent: 'bg-sky-50 text-sky-500', Icon: TrendingUp },
                { label: 'Days with Revenue', value: reportData.revenueData.trends.filter(d => d.revenue > 0).length.toString(), accent: 'bg-emerald-50 text-emerald-500', Icon: Calendar },
              ].map(({ label, value, accent, Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent} mb-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Revenue trend area chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Daily Revenue Trend</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paid amounts per day in selected period</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{fmt(reportData.revenueData.totalRevenue)}</p>
              </div>
              {reportData.revenueData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={reportData.revenueData.trends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)} width={48} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                      fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-60 text-sm text-gray-400">No daily revenue data for this period</div>
              )}
            </div>

            {/* Revenue by source */}
            {reportData.revenueData.bySource.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">Revenue by Source</p>
                <p className="text-xs text-gray-400 mb-5">Booking channels and their contribution</p>
                <div className="space-y-4">
                  {reportData.revenueData.bySource.map((s, i) => {
                    const maxSrcRev = reportData.revenueData!.bySource[0]?.revenue || 1;
                    const srcColors = ['bg-indigo-400','bg-sky-400','bg-emerald-400','bg-amber-400','bg-violet-400'];
                    return (
                      <div key={s.source}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${srcColors[i % srcColors.length]}`} />
                            <span className="text-sm font-medium text-gray-900">{s.source}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <span className="text-[11px] text-gray-400">{s.bookings} booking{s.bookings !== 1 ? 's' : ''}</span>
                            <span className="text-sm font-semibold text-gray-900 w-20 text-right">{fmt(s.revenue)}</span>
                          </div>
                        </div>
                        <div className="ml-5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${srcColors[i % srcColors.length]} transition-all duration-700`}
                            style={{ width: `${Math.max((s.revenue / maxSrcRev) * 100, s.revenue > 0 ? 2 : 0)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* PROPERTY PERFORMANCE REPORT                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {bookings.length > 0 && reportType === 'property' && reportData.propertyData && (
          <div className="space-y-6">

            {/* Property ranked list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-900 mb-1">Property Performance</p>
              <p className="text-xs text-gray-400 mb-5">Ranked by revenue for selected period</p>
              {reportData.propertyData.length > 0 ? (
                <div className="space-y-5">
                  {reportData.propertyData.map((prop, i) => {
                    const maxRev = reportData.propertyData![0]?.revenue || 1;
                    return (
                      <div key={prop.property}>
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-xs font-bold text-gray-200 w-4 flex-shrink-0 mt-1">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">{prop.property}</p>
                              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(prop.revenue)}</p>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                              <span className="text-[11px] text-gray-400">{prop.bookings} booking{prop.bookings !== 1 ? 's' : ''}</span>
                              <span className="text-[11px] text-gray-400">{prop.guests} guests</span>
                              <span className="text-[11px] text-gray-400">{prop.totalNights} nights</span>
                              <span className="text-[11px] text-gray-400">avg {prop.averageStay.toFixed(1)} nights/stay</span>
                              <span className="text-[11px] text-gray-400">{fmt(prop.revenuePerNight)}/night</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-7 space-y-1.5">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                              style={{ width: `${Math.max((prop.revenue / maxRev) * 100, prop.revenue > 0 ? 2 : 0)}%` }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Occupancy</span>
                            <OccupancyBar rate={Math.round(prop.occupancyRate)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">No property data for this period</div>
              )}
            </div>

            {/* Summary stats row */}
            {reportData.propertyData.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Properties', value: reportData.propertyData.length.toString(),  Icon: Building,  accent: 'bg-indigo-50 text-indigo-500' },
                  { label: 'Total Nights Sold',  value: reportData.propertyData.reduce((s, p) => s + p.totalNights, 0).toString(), Icon: Calendar, accent: 'bg-sky-50 text-sky-500' },
                  { label: 'Total Guests',       value: reportData.propertyData.reduce((s, p) => s + p.guests, 0).toString(),      Icon: Users,    accent: 'bg-emerald-50 text-emerald-500' },
                  { label: 'Top Property',       value: reportData.propertyData[0]?.property?.split(' ').slice(0, 2).join(' ') || '—', Icon: TrendingUp, accent: 'bg-amber-50 text-amber-500' },
                ].map(({ label, value, Icon, accent }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent} mb-2.5`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
