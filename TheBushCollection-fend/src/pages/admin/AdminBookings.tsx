import { useState } from 'react';
import {
  Calendar, Users, DollarSign, Search, Eye, Check, X, Clock,
  Download, FileText, Trash2, Plane, RefreshCw, CreditCard,
  CircleDollarSign, Bell, ChevronDown, ChevronUp, Building
} from 'lucide-react';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'inquiry' | 'confirmed' | 'deposit-paid' | 'fully-paid' | 'completed' | 'cancelled';

interface BookingRow {
  id: string; customerName: string; customerEmail: string; customerPhone: string;
  propertyName: string; roomName: string; checkIn?: string; checkOut?: string;
  guests?: number; nights?: number; total?: number; status?: BookingStatus | string;
  createdAt?: string; specialRequests?: string; airportTransfer?: unknown;
  depositPaid?: number; balanceDue?: number;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; pill: string; dot: string }> = {
  inquiry:       { label: 'Inquiry',      pill: 'bg-sky-50   text-sky-700   ring-1 ring-sky-200',     dot: 'bg-sky-400' },
  confirmed:     { label: 'Confirmed',    pill: 'bg-green-50 text-green-700 ring-1 ring-green-200',   dot: 'bg-green-400' },
  'deposit-paid':{ label: 'Deposit Paid', pill: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',dot: 'bg-violet-400' },
  'fully-paid':  { label: 'Fully Paid',   pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
  completed:     { label: 'Completed',    pill: 'bg-gray-100 text-gray-600  ring-1 ring-gray-200',    dot: 'bg-gray-400' },
  cancelled:     { label: 'Cancelled',    pill: 'bg-red-50   text-red-700   ring-1 ring-red-200',     dot: 'bg-red-400' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, pill: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminBookings() {
  const { bookings: supabaseBookings, loading, error, updateBooking, refetch, notifyBooking } = useBackendBookings();
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest'>('newest');
  const [selectedBooking, setSelectedBooking] = useState<SafariBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen]     = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getRoomName = (b?: SafariBooking | null) => b?.room_name || (b as any)?.safari_rooms?.name || (b as any)?.rooms?.[0]?.roomName || (b as any)?.rooms?.[0]?.name || (b as any)?.roomName || 'Unknown Room';

  const bookings: BookingRow[] = supabaseBookings.map(b => ({
    id: b.id,
    customerName:  b.guest_name     || 'Unknown Guest',
    customerEmail: b.guest_email    || '',
    customerPhone: b.guest_phone    || '',
    propertyName:  b.safari_properties?.name || b.property_name || 'Unknown Property',
    roomName:      getRoomName(b),
    checkIn:       b.check_in,
    checkOut:      b.check_out,
    guests:        b.total_guests || ((b.adults ?? 0) + (b.children ?? 0)),
    nights:        differenceInDays(new Date(b.check_out || new Date()), new Date(b.check_in || new Date())),
    total:         b.total_amount || 0,
    status:        b.status as BookingStatus,
    createdAt:     b.created_at,
    specialRequests: b.special_requirements || '',
    airportTransfer: b.transfer_details,
    depositPaid:   b.deposit_paid || 0,
    balanceDue:    b.balance_due  || 0,
  }));

  // ── Stats ──
  const totalRevenue = bookings.reduce((s, b) => {
    if (b.status === 'deposit-paid') return s + (b.depositPaid || 0);
    if (b.status === 'fully-paid')   return s + (b.total || 0);
    if (b.status === 'completed')    return s + ((b.depositPaid || 0) > 0 ? (b.depositPaid || 0) : (b.total || 0));
    return s;
  }, 0);

  const counts = {
    total:       bookings.length,
    inquiry:     bookings.filter(b => b.status === 'inquiry').length,
    confirmed:   bookings.filter(b => b.status === 'confirmed').length,
    'deposit-paid': bookings.filter(b => b.status === 'deposit-paid').length,
    'fully-paid':bookings.filter(b => b.status === 'fully-paid').length,
    completed:   bookings.filter(b => b.status === 'completed').length,
    cancelled:   bookings.filter(b => b.status === 'cancelled').length,
  };

  // ── Filtered & sorted ──
  const filtered = bookings
    .filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        b.customerName?.toLowerCase().includes(q) ||
        b.propertyName?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const tA = new Date(a.createdAt || '').getTime();
      const tB = new Date(b.createdAt || '').getTime();
      return sortOrder === 'newest' ? tB - tA : tA - tB;
    });

  // ── Handlers ──
  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    const cur = supabaseBookings.find(b => b.id === id);
    if (cur?.status === 'cancelled' && newStatus !== 'confirmed' && newStatus !== 'inquiry') {
      toast.error('Cannot edit cancelled booking. Reconfirm it first.');
      return;
    }
    try {
      if (!cur) { toast.error('Booking not found'); return; }
      const upd: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'fully-paid')   { upd.deposit_paid = cur.total_amount || 0; upd.balance_due = 0; }
      if (newStatus === 'deposit-paid') { const d = (cur.total_amount || 0) * 0.5; upd.deposit_paid = d; upd.balance_due = (cur.total_amount || 0) - d; }
      await updateBooking(id, upd);
      await refetch();
      const msgs: Record<string, string> = { inquiry: 'Set to inquiry', confirmed: 'Booking confirmed', 'deposit-paid': 'Deposit recorded', 'fully-paid': 'Full payment recorded', completed: 'Marked as completed', cancelled: 'Booking cancelled' };
      toast.success(msgs[newStatus]);
    } catch { toast.error('Failed to update booking status'); }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Delete this booking? This cannot be undone.')) {
      toast.info('Delete functionality coming soon');
      if (selectedBooking?.id === id) { setIsDetailsOpen(false); setSelectedBooking(null); }
    }
  };

  const openDetails = (id: string) => {
    const b = supabaseBookings.find(x => x.id === id);
    if (b) { setSelectedBooking(b); setIsDetailsOpen(true); }
  };

  const handleNotify = async (id: string) => {
    try {
      toast.info('Sending notification…');
      await notifyBooking(id, 'booking_created', true);
      toast.success('Notification sent');
    } catch { toast.error('Failed to send notification'); }
  };

  const handleExportCSV = () => { try { exportToCSV(filtered, 'safari-bookings'); toast.success('CSV exported'); } catch { toast.error('Export failed'); } };
  const handleExportPDF = () => { try { exportToPDF(filtered, 'safari-bookings'); toast.success('PDF export started'); } catch { toast.error('Export failed'); } };

  // Primary action per status (for table row)
  const primaryAction = (b: BookingRow) => {
    const s = b.status as BookingStatus;
    if (s === 'inquiry')      return { label: 'Confirm', icon: Check, cls: 'text-green-700 bg-green-50 hover:bg-green-100 ring-1 ring-green-200', cb: () => handleStatusUpdate(b.id, 'confirmed') };
    if (s === 'confirmed')    return { label: 'Deposit', icon: CreditCard, cls: 'text-violet-700 bg-violet-50 hover:bg-violet-100 ring-1 ring-violet-200', cb: () => handleStatusUpdate(b.id, 'deposit-paid') };
    if (s === 'deposit-paid') return { label: 'Full Pay', icon: CircleDollarSign, cls: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-200', cb: () => handleStatusUpdate(b.id, 'fully-paid') };
    if (s === 'fully-paid')   return { label: 'Complete', icon: Check, cls: 'text-gray-700 bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200', cb: () => handleStatusUpdate(b.id, 'completed') };
    if (s === 'completed')    return { label: 'Reopen',   icon: RefreshCw, cls: 'text-sky-700 bg-sky-50 hover:bg-sky-100 ring-1 ring-sky-200', cb: () => handleStatusUpdate(b.id, 'fully-paid') };
    if (s === 'cancelled')    return { label: 'Reconfirm', icon: Check, cls: 'text-green-700 bg-green-50 hover:bg-green-100 ring-1 ring-green-200', cb: () => handleStatusUpdate(b.id, 'confirmed') };
    return null;
  };

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading bookings…</p>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-sm">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-lg font-bold">!</span>
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">Failed to load bookings</p>
        <p className="text-xs text-gray-500 mb-3">{error}</p>
        <button onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    </div>
  );

  const statusFilterTabs = [
    { key: 'all',          label: 'All',          count: counts.total },
    { key: 'inquiry',      label: 'Inquiry',      count: counts.inquiry },
    { key: 'confirmed',    label: 'Confirmed',    count: counts.confirmed },
    { key: 'deposit-paid', label: 'Deposit Paid', count: counts['deposit-paid'] },
    { key: 'fully-paid',   label: 'Fully Paid',   count: counts['fully-paid'] },
    { key: 'completed',    label: 'Completed',    count: counts.completed },
    { key: 'cancelled',    label: 'Cancelled',    count: counts.cancelled },
  ];

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track all safari reservations</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl shadow-sm transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={handleExportCSV} disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={handleExportPDF} disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none">
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* ── Stats strip ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {[
            { label: 'Total',        value: counts.total,              accent: 'bg-gray-100   text-gray-600',   Icon: Calendar },
            { label: 'Inquiries',    value: counts.inquiry,            accent: 'bg-sky-50     text-sky-600',    Icon: Clock },
            { label: 'Confirmed',    value: counts.confirmed,          accent: 'bg-green-50   text-green-600',  Icon: Check },
            { label: 'Deposit Paid', value: counts['deposit-paid'],    accent: 'bg-violet-50  text-violet-600', Icon: CreditCard },
            { label: 'Fully Paid',   value: counts['fully-paid'],      accent: 'bg-emerald-50 text-emerald-600',Icon: CircleDollarSign },
            { label: 'Completed',    value: counts.completed,          accent: 'bg-gray-100   text-gray-600',   Icon: Check },
            { label: 'Revenue',      value: fmt(totalRevenue),         accent: 'bg-amber-50   text-amber-600',  Icon: DollarSign },
          ].map(({ label, value, accent, Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, property, email, or booking ID…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-gray-400"
              />
            </div>
            {/* Sort toggle */}
            <button onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
              {sortOrder === 'newest' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {statusFilterTabs.map(({ key, label, count }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                }`}>
                {label}
                <span className={`text-[10px] font-bold ${statusFilter === key ? 'text-white/70' : 'text-gray-400'}`}>{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Bookings table ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">All Bookings</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} {statusFilter !== 'all' ? `${STATUS_CFG[statusFilter]?.label ?? statusFilter} ` : ''}booking{filtered.length !== 1 ? 's' : ''}
                {searchTerm && <span className="ml-1">matching "{searchTerm}"</span>}
              </p>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Guest</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Property</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Dates</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Guests</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Transfer</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(b => {
                    const pa = primaryAction(b);
                    const PaIcon = pa?.icon;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                        {/* Guest */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-600">{b.customerName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[160px]">{b.customerName}</p>
                              <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{b.customerEmail || '—'}</p>
                            </div>
                          </div>
                        </td>
                        {/* Property */}
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-900 truncate max-w-[160px]">{b.propertyName}</p>
                          {b.roomName && b.roomName !== 'Unknown Room' && (
                            <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{b.roomName}</p>
                          )}
                        </td>
                        {/* Dates */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-gray-900">{fmtShort(b.checkIn)}</p>
                          <p className="text-[11px] text-gray-400">→ {fmtShort(b.checkOut)}{b.nights ? ` · ${b.nights}n` : ''}</p>
                        </td>
                        {/* Guests */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1 text-gray-600">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-medium">{b.guests || '—'}</span>
                          </div>
                        </td>
                        {/* Transfer */}
                        <td className="px-4 py-3.5 text-center">
                          {b.airportTransfer
                            ? <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"><Plane className="h-3 w-3" /><span className="text-[10px] font-medium">Yes</span></div>
                            : <span className="text-[10px] text-gray-300">—</span>
                          }
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusPill status={b.status || ''} />
                        </td>
                        {/* Total */}
                        <td className="px-4 py-3.5 text-right">
                          <p className="font-semibold text-gray-900">{fmt(b.total || 0)}</p>
                          {(b.depositPaid || 0) > 0 && (b.depositPaid || 0) < (b.total || 0) && (
                            <p className="text-[10px] text-emerald-600">{fmt(b.depositPaid || 0)} paid</p>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button onClick={() => openDetails(b.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-2.5 py-1.5 rounded-lg transition-all">
                              <Eye className="h-3 w-3" /> View
                            </button>
                            <button onClick={() => handleNotify(b.id)} title="Send notification"
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 bg-white transition-all">
                              <Bell className="h-3 w-3" />
                            </button>
                            {pa && PaIcon && (
                              <button onClick={pa.cb}
                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all ${pa.cls}`}>
                                <PaIcon className="h-3 w-3" />{pa.label}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No bookings yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'New reservations will appear here'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      {isDetailsOpen && selectedBooking && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[580px] bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* Drawer header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Booking Details</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">#{selectedBooking.id.slice(0, 16)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={selectedBooking.status || ''} />
                <button onClick={() => setIsDetailsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Cancelled warning */}
              {selectedBooking.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-800">Booking cancelled</p>
                    <p className="text-[11px] text-red-600 mt-0.5">Use "Reconfirm" below to reactivate</p>
                  </div>
                </div>
              )}

              {/* Guest */}
              <Section title="Guest Information" icon={<Users className="h-3.5 w-3.5" />}>
                <Field label="Name"  value={selectedBooking.guest_name || 'Unknown'} />
                <Field label="Email" value={selectedBooking.guest_email || 'Not provided'} />
                <Field label="Phone" value={selectedBooking.guest_phone || 'Not provided'} />
              </Section>

              {/* Stay */}
              <Section title="Stay Details" icon={<Building className="h-3.5 w-3.5" />}>
                <Field label="Property"  value={selectedBooking.safari_properties?.name || selectedBooking.property_name || 'Unknown'} />
                <Field label="Room"      value={getRoomName(selectedBooking)} />
                <Field label="Check-in"  value={fmtDate(selectedBooking.check_in)} />
                <Field label="Check-out" value={fmtDate(selectedBooking.check_out)} />
                <Field label="Duration"  value={`${differenceInDays(new Date(selectedBooking.check_out || new Date()), new Date(selectedBooking.check_in || new Date()))} nights`} />
                <Field label="Guests"    value={`${selectedBooking.total_guests || ((selectedBooking.adults ?? 0) + (selectedBooking.children ?? 0))} (${selectedBooking.adults ?? 0} adults, ${selectedBooking.children ?? 0} children)`} />
                {selectedBooking.transfer_details && (
                  <Field label="Airport Transfer" value={<span className="text-emerald-600 font-medium flex items-center gap-1"><Plane className="h-3 w-3" />Requested</span>} />
                )}
              </Section>

              {/* Payment */}
              <Section title="Payment" icon={<DollarSign className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 mb-1">Total</p>
                    <p className="text-base font-bold text-gray-900">{fmt(selectedBooking.total_amount || 0)}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 mb-1">Paid</p>
                    <p className="text-base font-bold text-emerald-700">{fmt(selectedBooking.deposit_paid || 0)}</p>
                  </div>
                  <div className={(selectedBooking.balance_due || 0) > 0 ? 'bg-amber-50 rounded-xl p-3 text-center' : 'bg-gray-50 rounded-xl p-3 text-center'}>
                    <p className={`text-[10px] mb-1 ${(selectedBooking.balance_due || 0) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Balance Due</p>
                    <p className={`text-base font-bold ${(selectedBooking.balance_due || 0) > 0 ? 'text-amber-700' : 'text-gray-500'}`}>{fmt(selectedBooking.balance_due || 0)}</p>
                  </div>
                </div>
              </Section>

              {/* Special requests */}
              {selectedBooking.special_requirements && (
                <Section title="Special Requests" icon={<FileText className="h-3.5 w-3.5" />}>
                  <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
                    {selectedBooking.special_requirements}
                  </p>
                </Section>
              )}

              {/* Booking meta */}
              <Section title="Booking Info" icon={<Calendar className="h-3.5 w-3.5" />}>
                <Field label="Booking ID"   value={<span className="font-mono text-xs">{selectedBooking.id}</span>} />
                <Field label="Created"      value={fmtDate(selectedBooking.created_at)} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {selectedBooking.status === 'cancelled' && (selectedBooking as any).cancellation_reason && (
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  <Field label="Cancellation Reason" value={(selectedBooking as any).cancellation_reason || (selectedBooking._raw as any)?.cancellationReason || 'Not provided'} />
                )}
              </Section>

            </div>

            {/* Drawer footer — action buttons */}
            <div className="border-t border-gray-100 px-6 py-4 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.status === 'inquiry' && (<>
                  <DrawerAction icon={Check}           label="Confirm Booking"   cls="text-green-700 bg-green-50 hover:bg-green-100 border-green-200"    onClick={() => { handleStatusUpdate(selectedBooking.id, 'confirmed');    setIsDetailsOpen(false); }} />
                  <DrawerAction icon={CreditCard}      label="Mark Deposit Paid" cls="text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200" onClick={() => { handleStatusUpdate(selectedBooking.id, 'deposit-paid'); setIsDetailsOpen(false); }} />
                  <DrawerAction icon={X} label="Cancel"          cls="text-red-600 bg-red-50 hover:bg-red-100 border-red-200"         onClick={() => { handleStatusUpdate(selectedBooking.id, 'cancelled');    setIsDetailsOpen(false); }} />
                </>)}
                {selectedBooking.status === 'confirmed' && (<>
                  <DrawerAction icon={CreditCard}      label="Mark Deposit Paid" cls="text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200" onClick={() => { handleStatusUpdate(selectedBooking.id, 'deposit-paid'); setIsDetailsOpen(false); }} />
                  <DrawerAction icon={CircleDollarSign} label="Mark Fully Paid"  cls="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" onClick={() => { handleStatusUpdate(selectedBooking.id, 'fully-paid');  setIsDetailsOpen(false); }} />
                  <DrawerAction icon={X} label="Cancel"          cls="text-red-600 bg-red-50 hover:bg-red-100 border-red-200"         onClick={() => { handleStatusUpdate(selectedBooking.id, 'cancelled');    setIsDetailsOpen(false); }} />
                </>)}
                {selectedBooking.status === 'deposit-paid' && (<>
                  <DrawerAction icon={CircleDollarSign} label="Mark Fully Paid"  cls="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" onClick={() => { handleStatusUpdate(selectedBooking.id, 'fully-paid');  setIsDetailsOpen(false); }} />
                  <DrawerAction icon={Check}           label="Mark Completed"    cls="text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200"           onClick={() => { handleStatusUpdate(selectedBooking.id, 'completed');   setIsDetailsOpen(false); }} />
                  <DrawerAction icon={X} label="Cancel"          cls="text-red-600 bg-red-50 hover:bg-red-100 border-red-200"         onClick={() => { handleStatusUpdate(selectedBooking.id, 'cancelled');    setIsDetailsOpen(false); }} />
                </>)}
                {selectedBooking.status === 'fully-paid' && (<>
                  <DrawerAction icon={Check}           label="Mark Completed"    cls="text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200"           onClick={() => { handleStatusUpdate(selectedBooking.id, 'completed');   setIsDetailsOpen(false); }} />
                  <DrawerAction icon={CreditCard}      label="Revert to Deposit" cls="text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200"   onClick={() => { handleStatusUpdate(selectedBooking.id, 'deposit-paid'); setIsDetailsOpen(false); }} />
                  <DrawerAction icon={X} label="Cancel"          cls="text-red-600 bg-red-50 hover:bg-red-100 border-red-200"         onClick={() => { handleStatusUpdate(selectedBooking.id, 'cancelled');    setIsDetailsOpen(false); }} />
                </>)}
                {selectedBooking.status === 'completed' && (
                  <DrawerAction icon={CircleDollarSign} label="Reopen Booking"   cls="text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200"               onClick={() => { handleStatusUpdate(selectedBooking.id, 'fully-paid');  setIsDetailsOpen(false); }} />
                )}
                {selectedBooking.status === 'cancelled' && (<>
                  <DrawerAction icon={Check}           label="Reconfirm Booking" cls="text-green-700 bg-green-50 hover:bg-green-100 border-green-200"       onClick={() => { handleStatusUpdate(selectedBooking.id, 'confirmed');    setIsDetailsOpen(false); }} />
                  <DrawerAction icon={Clock}           label="Set as Inquiry"    cls="text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200"               onClick={() => { handleStatusUpdate(selectedBooking.id, 'inquiry');     setIsDetailsOpen(false); }} />
                </>)}
                <DrawerAction icon={Bell}  label="Send Notification" cls="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200" onClick={() => handleNotify(selectedBooking.id)} />
                <DrawerAction icon={Trash2} label="Delete"           cls="text-red-600 bg-red-50 hover:bg-red-100 border-red-200"             onClick={() => handleDeleteBooking(selectedBooking.id)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drawer sub-components ────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-gray-400">{icon}</span>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 w-32">{label}</span>
      <span className="text-xs text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}

function DrawerAction({ icon: Icon, label, cls, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; cls: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${cls}`}>
      <Icon className="h-3 w-3" />{label}
    </button>
  );
}
