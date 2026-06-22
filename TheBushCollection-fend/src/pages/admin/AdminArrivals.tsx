import { useState, useEffect } from 'react';
import {
  format, parseISO, startOfDay, endOfDay, addDays, subDays,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isSameDay
} from 'date-fns';
import { exportMovementsToCSV, exportMovementsToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import {
  Users, MapPin, Car, Plane, Calendar,
  PrinterIcon, MessageSquare, Loader2,
  ChevronLeft, ChevronRight, RefreshCw,
  Download, FileText, LogIn, LogOut, XCircle
} from 'lucide-react';

type ViewMode = 'single' | 'week' | 'month';

interface GuestMovement {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  type: 'arrival' | 'departure';
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'delayed';
  transferType?: 'airport' | 'inter-camp' | 'self-drive';
  contactInfo: { phone?: string; email?: string };
  specialRequests?: string;
  adults: number;
  children: number;
  flightNumber?: string;
  arrivalTime?: string;
  departureTime?: string;
}

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',       dot: 'bg-amber-400' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  delayed:   { label: 'Delayed',   cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',             dot: 'bg-red-400' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TransferBadge({ type }: { type?: string }) {
  if (type === 'airport')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
        <Plane className="w-3 h-3" />Airport
      </span>
    );
  if (type === 'inter-camp')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
        <MapPin className="w-3 h-3" />Inter-Camp
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <Car className="w-3 h-3" />Self-Drive
    </span>
  );
}

function MovementCard({
  movement,
  onCheckIn,
  onCheckOut,
  onNotify,
  onPrint,
}: {
  movement: GuestMovement;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onNotify: () => void;
  onPrint: () => void;
}) {
  const initials = movement.guestName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isArrival = movement.type === 'arrival';

  return (
    <div className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-gray-600">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{movement.guestName}</span>
            <StatusPill status={movement.status} />
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isArrival ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {isArrival ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
              {isArrival ? 'Arrival' : 'Departure'}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span>{movement.propertyName}</span>
            {movement.roomName && movement.roomName !== 'Package Booking' && (
              <><span className="text-gray-300">·</span><span>{movement.roomName}</span></>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              {format(parseISO(movement.date), 'MMM dd, yyyy')} · {movement.time}
            </span>
            <TransferBadge type={movement.transferType} />
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              {movement.adults + movement.children} guests
            </span>
            {movement.flightNumber && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                <Plane className="w-3 h-3" />
                {movement.flightNumber}
              </span>
            )}
            {movement.specialRequests && (
              <span className="inline-flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Special request
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onNotify}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Send notification"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPrint}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Print voucher"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
          </button>
          {isArrival && movement.status === 'pending' && (
            <button
              onClick={onCheckIn}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <LogIn className="w-3 h-3" />Check In
            </button>
          )}
          {!isArrival && movement.status === 'pending' && (
            <button
              onClick={onCheckOut}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <LogOut className="w-3 h-3" />Check Out
            </button>
          )}
          {movement.status === 'completed' && (
            <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400">
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminArrivals() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  });
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [movements, setMovements] = useState<GuestMovement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<GuestMovement | null>(null);
  const [checkInModal, setCheckInModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'arrivals' | 'departures'>('timeline');

  const { bookings, loading, error, updateBooking, refetch } = useBackendBookings();

  useEffect(() => {
    switch (viewMode) {
      case 'single':
        setDateRange({ from: startOfDay(selectedDate), to: endOfDay(selectedDate) });
        break;
      case 'week':
        setDateRange({
          from: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          to: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });
        break;
      case 'month':
        setDateRange({ from: startOfMonth(selectedDate), to: endOfMonth(selectedDate) });
        break;
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    if (loading || bookings.length === 0) return;

    const filtered: GuestMovement[] = [];

    bookings.forEach(booking => {
      let propertyName = booking.safari_properties?.name || booking.property_name || 'Unknown Property';
      let roomName =
        booking.room_name ||
        (booking as any).safari_rooms?.name ||
        ((booking as any).rooms?.[0]?.roomName ?? (booking as any).rooms?.[0]?.name) ||
        (booking as any).roomName ||
        'Unknown Room';

      if (booking.package_id && booking.safari_packages) {
        propertyName = booking.safari_packages.destinations?.[0] || booking.safari_packages.name || 'Package Destination';
        roomName = 'Package Booking';
      }

      const guestName = booking.guest_name || booking.customer_name || booking.guest_email || 'Guest';
      const adults = booking.adults || 1;
      const children = booking.children || 0;

      if (booking.check_in) {
        try {
          const checkInDate = parseISO(booking.check_in);
          const inRange =
            isWithinInterval(checkInDate, { start: dateRange.from, end: dateRange.to }) ||
            (viewMode === 'single' && isSameDay(checkInDate, selectedDate));

          if (inRange) {
            let transferType: 'airport' | 'inter-camp' | 'self-drive' = 'self-drive';
            let flightNumber = '';
            let arrivalTime = '14:00';

            if (booking.transfer_details) {
              transferType = 'airport';
              flightNumber = booking.transfer_details.arrivalFlightNumber || '';
              arrivalTime = booking.transfer_details.arrivalTime || '14:00';
            }

            filtered.push({
              id: `arrival-${booking.id}`,
              bookingId: booking.id,
              guestName,
              propertyName,
              roomName,
              type: 'arrival',
              date: booking.check_in,
              time: arrivalTime,
              status: booking.status === 'completed' ? 'completed' : 'pending',
              transferType,
              contactInfo: {
                phone: booking.guest_phone || booking.customer_phone,
                email: booking.guest_email || booking.customer_email,
              },
              specialRequests: booking.special_requirements,
              adults,
              children,
              flightNumber,
              arrivalTime,
            });
          }
        } catch (e) {
          console.error('Error processing arrival:', e);
        }
      }

      if (booking.check_out) {
        try {
          const checkOutDate = parseISO(booking.check_out);
          const inRange =
            isWithinInterval(checkOutDate, { start: dateRange.from, end: dateRange.to }) ||
            (viewMode === 'single' && isSameDay(checkOutDate, selectedDate));

          if (inRange) {
            let transferType: 'airport' | 'inter-camp' | 'self-drive' = 'self-drive';
            let flightNumber = '';
            let departureTime = '11:00';

            if (booking.transfer_details) {
              transferType = 'airport';
              flightNumber = booking.transfer_details.departureFlightNumber || '';
              departureTime = booking.transfer_details.departureTime || '11:00';
            }

            filtered.push({
              id: `departure-${booking.id}`,
              bookingId: booking.id,
              guestName,
              propertyName,
              roomName,
              type: 'departure',
              date: booking.check_out,
              time: departureTime,
              status: booking.status === 'completed' ? 'completed' : 'pending',
              transferType,
              contactInfo: {
                phone: booking.guest_phone || booking.customer_phone,
                email: booking.guest_email || booking.customer_email,
              },
              specialRequests: booking.special_requirements,
              adults,
              children,
              flightNumber,
              departureTime,
            });
          }
        } catch (e) {
          console.error('Error processing departure:', e);
        }
      }
    });

    setMovements(
      filtered.sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.time.localeCompare(b.time);
      })
    );
  }, [bookings, loading, dateRange, selectedDate, viewMode]);

  const handleCheckIn = async (movementId: string) => {
    try {
      const movement = movements.find(m => m.id === movementId);
      if (!movement) return;
      await updateBooking(movement.bookingId, { status: 'completed', updated_at: new Date().toISOString() });
      setMovements(prev => prev.map(m => m.id === movementId ? { ...m, status: 'completed' } : m));
      toast.success('Guest checked in successfully!');
      setCheckInModal(false);
    } catch {
      toast.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (movementId: string) => {
    try {
      const movement = movements.find(m => m.id === movementId);
      if (!movement) return;
      await updateBooking(movement.bookingId, { status: 'completed', updated_at: new Date().toISOString() });
      setMovements(prev => prev.map(m => m.id === movementId ? { ...m, status: 'completed' } : m));
      toast.success('Guest checked out successfully!');
    } catch {
      toast.error('Failed to check out guest');
    }
  };

  const sendNotification = (movement: GuestMovement, type: 'sms' | 'email') => {
    toast.success(`${type.toUpperCase()} notification sent to ${movement.guestName}`);
  };

  const printVoucher = (movement: GuestMovement) => {
    const voucherNumber = `VC-${movement.bookingId}-${movement.id}`;
    const isArrival = movement.type === 'arrival';
    const html = `<!DOCTYPE html><html><head><title>Guest ${isArrival ? 'Welcome' : 'Departure'} Voucher</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#333;background:white}
        .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #16a34a;padding-bottom:20px}
        .header h1{color:#16a34a;margin:0;font-size:28px}
        .voucher-info{display:flex;justify-content:space-between;margin:20px 0;font-size:14px}
        .card{border:1px solid #e5e7eb;border-radius:8px;margin-bottom:20px;overflow:hidden}
        .card-header{background:#f0fdf4;padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#166534}
        .card-content{padding:16px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .info-item{margin-bottom:12px}
        .info-label{font-size:12px;color:#6b7280;margin-bottom:4px}
        .info-value{font-size:14px;font-weight:600;color:#1f2937}
        .transfer-info{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;padding-top:16px;border-top:1px solid #e5e7eb}
        .special-requests{background:#fef3c7;padding:12px;border-radius:6px;border:1px solid #f59e0b;margin:16px 0}
        .info-columns{display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:12px}
        .footer{margin-top:30px;text-align:center;font-size:10px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:15px}
        .company-info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:15px;font-size:11px;color:#6b7280}
        .status-badge{display:inline-block;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;background:#dcfce7;color:#166534}
        @media print{body{padding:0;margin:0}.no-print{display:none}}
      </style></head><body>
      <div class="header">
        <h1>The Bush Collection</h1>
        <p>Guest ${isArrival ? 'Welcome' : 'Departure'} Voucher</p>
        <div class="voucher-info">
          <div><div class="info-label">Voucher Number</div><div class="info-value">${voucherNumber}</div></div>
          <div style="text-align:right"><div class="info-label">Date Issued</div><div class="info-value">${format(new Date(), 'MMM dd, yyyy')}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Guest Information <span class="status-badge">${movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}</span></div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item"><div class="info-label">Guest Name</div><div class="info-value">${movement.guestName}</div></div>
            <div class="info-item"><div class="info-label">Total Guests</div><div class="info-value">${movement.adults + movement.children} (${movement.adults} adults, ${movement.children} children)</div></div>
            <div class="info-item"><div class="info-label">Contact Phone</div><div class="info-value">${movement.contactInfo.phone || 'Not provided'}</div></div>
            <div class="info-item"><div class="info-label">Contact Email</div><div class="info-value">${movement.contactInfo.email || 'Not provided'}</div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">${isArrival ? 'Arrival' : 'Departure'} Details</div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item"><div class="info-label">Property</div><div class="info-value">${movement.propertyName}</div></div>
            <div class="info-item"><div class="info-label">Room</div><div class="info-value">${movement.roomName}</div></div>
            <div class="info-item"><div class="info-label">Date</div><div class="info-value">${format(parseISO(movement.date), 'EEEE, MMM dd, yyyy')}</div></div>
            <div class="info-item"><div class="info-label">Time</div><div class="info-value">${movement.time}</div></div>
          </div>
          <div class="transfer-info">
            <div class="info-item"><div class="info-label">Transfer Type</div><div class="info-value">${movement.transferType || 'Self-drive'}</div></div>
            ${movement.flightNumber ? `<div class="info-item"><div class="info-label">Flight Number</div><div class="info-value">${movement.flightNumber}</div></div>` : ''}
          </div>
          ${movement.specialRequests ? `<div class="special-requests"><strong>Special Requests:</strong><br>${movement.specialRequests}</div>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="card-header">Important Information</div>
        <div class="card-content">
          <div class="info-columns">
            <div><strong>Check-in/Check-out Times</strong><br>Check-in: 2:00 PM<br>Check-out: 11:00 AM</div>
            <div><strong>Emergency Contact</strong><br>24/7 Support: +254 116072343<br>info@thebushcollection.africa</div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="company-info">
          <div><strong>The Bush Collection</strong><br>Creating unforgettable safari experiences</div>
          <div><strong>Contact</strong><br>+254 116072343<br>info@thebushcollection.africa</div>
          <div><strong>Address</strong><br>42 Claret Close, Silanga Road, Karen<br>P.O BOX 58671-00200, Nairobi</div>
        </div>
        <p>This voucher is valid only for the specified date and guest. Please present upon arrival.</p>
        <p>Generated on ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</p>
      </div>
    </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
      };
    } else {
      alert('Please allow popups to print vouchers');
    }
  };

  const goToToday = () => { setSelectedDate(new Date()); setViewMode('single'); };
  const goToTomorrow = () => { setSelectedDate(addDays(new Date(), 1)); setViewMode('single'); };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'single':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 7) : subDays(selectedDate, 7));
        break;
      case 'month': {
        const d = new Date(selectedDate);
        d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(d);
        break;
      }
    }
  };

  const getDateRangeLabel = () => {
    switch (viewMode) {
      case 'single': return format(selectedDate, 'MMM dd, yyyy');
      case 'week':   return `${format(dateRange.from, 'MMM dd')} – ${format(dateRange.to, 'MMM dd, yyyy')}`;
      case 'month':  return format(selectedDate, 'MMMM yyyy');
      default:       return format(selectedDate, 'MMM dd, yyyy');
    }
  };

  const arrivals   = movements.filter(m => m.type === 'arrival');
  const departures = movements.filter(m => m.type === 'departure');
  const tabMovements =
    activeTab === 'arrivals'   ? arrivals :
    activeTab === 'departures' ? departures :
    movements;

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50/60 flex items-center justify-center h-64 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading movements…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50/60 flex flex-col items-center justify-center h-64 gap-3">
        <XCircle className="h-9 w-9 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={refetch} className="text-sm text-gray-700 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/60 p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Arrivals &amp; Departures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage guest movements and transfers</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Export */}
          <button
            onClick={() => exportMovementsToCSV(movements, 'all', getDateRangeLabel())}
            disabled={movements.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />CSV
          </button>
          <button
            onClick={() => exportMovementsToPDF(movements, 'all', getDateRangeLabel())}
            disabled={movements.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />PDF
          </button>
          <button
            onClick={refetch}
            className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* View-mode pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['single', 'week', 'month'] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === m ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'single' ? 'Day' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors min-w-[160px] justify-center">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {getDateRangeLabel()}
              </button>
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={e => { if (e.target.value) setSelectedDate(new Date(e.target.value + 'T00:00:00')); }}
              />
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToTomorrow}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Arrivals',
            count: arrivals.length,
            sub: `${arrivals.filter(a => a.status === 'completed').length} checked in`,
            Icon: LogIn,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Departures',
            count: departures.length,
            sub: `${departures.filter(d => d.status === 'completed').length} checked out`,
            Icon: LogOut,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Airport Transfers',
            count: movements.filter(m => m.transferType === 'airport').length,
            sub: 'Scheduled',
            Icon: Plane,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'Inter-Camp Moves',
            count: movements.filter(m => m.transferType === 'inter-camp').length,
            sub: 'Between properties',
            Icon: MapPin,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
        ].map(({ label, count, sub, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{count}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main panel ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex">
            {([
              { key: 'timeline',   label: 'Timeline',   count: movements.length },
              { key: 'arrivals',   label: 'Arrivals',   count: arrivals.length },
              { key: 'departures', label: 'Departures', count: departures.length },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-gray-900 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-gray-900 after:rounded-t'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab !== 'timeline' && (
            <div className="flex gap-1 py-2">
              <button
                onClick={() => exportMovementsToCSV(activeTab === 'arrivals' ? arrivals : departures, activeTab, getDateRangeLabel())}
                disabled={tabMovements.length === 0}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Download className="w-3 h-3" />CSV
              </button>
              <button
                onClick={() => exportMovementsToPDF(activeTab === 'arrivals' ? arrivals : departures, activeTab, getDateRangeLabel())}
                disabled={tabMovements.length === 0}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <FileText className="w-3 h-3" />PDF
              </button>
            </div>
          )}
        </div>

        {/* Movement list */}
        <div className="divide-y divide-gray-50">
          {tabMovements.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">No movements for {getDateRangeLabel()}</p>
              <p className="text-xs text-gray-300 mt-1">Try a different date or view</p>
            </div>
          ) : (
            tabMovements.map(m => (
              <MovementCard
                key={m.id}
                movement={m}
                onCheckIn={() => { setSelectedMovement(m); setCheckInModal(true); }}
                onCheckOut={() => handleCheckOut(m.id)}
                onNotify={() => sendNotification(m, 'sms')}
                onPrint={() => printVoucher(m)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Check-in modal ── */}
      {checkInModal && selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setCheckInModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Confirm Check In</h3>
            <div className="space-y-0 text-sm mb-5 rounded-xl border border-gray-100 overflow-hidden">
              {[
                ['Guest',    selectedMovement.guestName],
                ['Property', selectedMovement.propertyName],
                ['Room',     selectedMovement.roomName],
                ['Date',     format(parseISO(selectedMovement.date), 'MMM dd, yyyy')],
                ...(selectedMovement.flightNumber ? [['Flight', selectedMovement.flightNumber]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-2.5 even:bg-gray-50">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCheckInModal(false)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckIn(selectedMovement.id)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Confirm Check In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
