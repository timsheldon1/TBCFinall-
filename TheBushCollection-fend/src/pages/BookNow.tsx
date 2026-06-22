import { useState, useEffect } from 'react';
import slugify from '@/lib/slugify';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  CalendarIcon, Users, MapPin, Star, ArrowLeft, Check, CreditCard, Shield,
  Plus, Minus, Play, ChevronLeft, ChevronRight, AlertTriangle,
  Plane, Banknote, Percent, ArrowUpRight,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSeasonalRates, SeasonalRate, MealPlan, getSeasonalRoomRate, SEASON_LABELS, MEAL_PLAN_LABELS } from '@/hooks/useSeasonalRates';
import { useBackendProperties, Property, Room } from '@/hooks/useBackendProperties';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { Package } from '@/types/package';
import { BookingAmenity } from '@/types/amenity';
import { toast } from 'sonner';
import { AmenitySelector } from '@/components/AmenitySelector';
import countryCodes from '@/data/countryCodes.json';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomBooking { roomId: string; quantity: number; guests: number; }
interface RoomBreakdownItem {
  roomName: string; quantity: number; guests: number;
  maxGuests: number; baseRate: number; extraGuestFee: number; extraGuests: number;
}
interface PropertyCosts {
  basePrice: number; extraGuestFees: number; amenitiesTotal: number;
  subtotal: number; serviceFee: number; taxes: number; total: number;
  nights: number; roomBreakdown: RoomBreakdownItem[];
}
interface PackageCosts {
  basePrice: number; amenitiesTotal: number; subtotal: number;
  serviceFee: number; taxes: number; total: number;
}
type Costs = PropertyCosts | PackageCosts;
type PaymentTerm = 'deposit' | 'full';
interface PaymentSchedule {
  depositAmount: number; balanceAmount: number;
  depositDueDate: string; balanceDueDate: string;
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls = 'bg-tbc-surface border-white/[0.08] text-white placeholder:text-white/20 focus:border-tbc-gold/40 rounded-none h-12 text-sm tracking-wide';
const labelCls = 'text-white/40 text-[9px] tracking-[0.35em] uppercase font-light block mb-2';
const sectionHead = (label: string, title: string) => (
  <div className="px-8 py-6 border-b border-white/[0.05]">
    <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light mb-1">{label}</p>
    <h3 className="text-lg font-extralight text-white/85">{title}</h3>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookNow() {
  const [searchParams] = useSearchParams();
  const { properties, loading: propertiesLoading } = useBackendProperties();
  const { packages, getPackageById, loading: packagesLoading } = useBackendPackages();

  const propertyId = searchParams.get('property');
  const roomId     = searchParams.get('room');
  const packageId  = searchParams.get('package');

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedRoom,     setSelectedRoom]     = useState<Room | null>(null);
  const [selectedPackage,  setSelectedPackage]  = useState<Package | null>(null);
  const [bookingType, setBookingType] = useState<'property' | 'package'>('property');
  const [isLoading,   setIsLoading]   = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [roomImageIndex, setRoomImageIndex] = useState<{[k: string]: number}>({});
  const [showPayment,    setShowPayment]    = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: '', checkOut: '', guests: 1,
    firstName: '', lastName: '', email: '',
    countryCode: '+1', phone: '', specialRequests: '',
    arrivalDate: '', arrivalTime: '', arrivalFlightNumber: '',
    departureDate: '', departureTime: '', departureFlightNumber: '',
    needsAirportTransfer: false,
  });

  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm>('deposit');
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);
  const [checkInDate,       setCheckInDate]       = useState<Date>();
  const [checkOutDate,      setCheckOutDate]      = useState<Date>();
  const [packageStartDate,  setPackageStartDate]  = useState<Date>();
  const [packageEndDate,    setPackageEndDate]    = useState<Date>();
  const [arrivalDate,       setArrivalDate]       = useState<Date>();
  const [departureDate,     setDepartureDate]     = useState<Date>();
  const [roomBookings,      setRoomBookings]      = useState<RoomBooking[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<BookingAmenity[]>([]);
  const [showAdditionalRooms, setShowAdditionalRooms] = useState(false);

  // ── Seasonal rate state ──────────────────────────────────────────────────────
  const [mealPlan, setMealPlan] = useState<MealPlan>('HB');
  const [currentSeason, setCurrentSeason] = useState<SeasonalRate | null>(null);
  const { getRateByDate } = useSeasonalRates();

  // ── Business logic (unchanged) ──────────────────────────────────────────────

  const extractDaysFromDuration = (duration: string) => {
    const m = duration.match(/(\d+)\s*Days?/i);
    return m ? parseInt(m[1]) : 1;
  };
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  useEffect(() => {
    if (packageStartDate && selectedPackage) {
      setPackageEndDate(addDays(packageStartDate, extractDaysFromDuration(selectedPackage.duration) - 1));
    }
  }, [packageStartDate, selectedPackage]);

  const updateRoomBooking = (rId: string, field: 'quantity' | 'guests', value: number) => {
    const room = selectedProperty?.rooms?.find(r => r.id === rId);
    if (!room?.available && field === 'quantity' && value > 0) { toast.error(`${room?.name || 'This room'} is currently unavailable.`); return; }
    if (field === 'quantity' && value > 0) {
      const avail = selectedProperty?.rooms?.filter(r => r.name === room?.name && r.available).length || 0;
      if (value > avail) { toast.error(`Only ${avail} ${room?.name} room${avail !== 1 ? 's' : ''} available.`); return; }
    }
    setRoomBookings(prev => prev.map(b => b.roomId === rId ? { ...b, [field]: Math.max(0, value) } : b));
  };

  const getActiveRoomBookings = () => roomBookings.filter(b => b.quantity > 0);
  const getRoomAvailability = (name: string) => selectedProperty?.rooms?.filter(r => r.name === name && r.available).length || 0;
  const getTotalGuests = () => roomBookings.reduce((t, b) => t + b.guests, 0);

  const calculateNights = () => {
    if (bookingType === 'package') {
      if (packageStartDate && packageEndDate) return Math.ceil((packageEndDate.getTime() - packageStartDate.getTime()) / (1000 * 3600 * 24)) + 1;
      return selectedPackage ? extractDaysFromDuration(selectedPackage.duration) : 0;
    }
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
  };

  const calculateRoomCosts = (booking: RoomBooking, room: Room, nights: number) => {
    // Seasonal rate: price is per room per night (SGL ≤1 guest, DBL 2+ guests per room)
    const guestsPerRoom = booking.quantity > 0 ? booking.guests / booking.quantity : booking.guests;
    const seasonalRate = getSeasonalRoomRate(currentSeason, room.name, guestsPerRoom, mealPlan);
    const propMinNights = selectedProperty?.minNights ?? 1;
    const total = seasonalRate != null
      ? seasonalRate * booking.quantity * nights                            // seasonal: per-room-per-night × rooms × nights
      : booking.quantity * room.price * (nights / propMinNights);          // fallback: price is total for minNights period
    return { baseRate: total, extraGuestFee: 0, total };
  };

  const calculateAmenitiesTotal = () => selectedAmenities.reduce((t, a) => t + a.totalPrice, 0);

  const calculatePropertyCosts = (): PropertyCosts => {
    const nights = calculateNights();
    const amenities = calculateAmenitiesTotal();
    if (!selectedProperty || nights <= 0) return { basePrice: 0, extraGuestFees: 0, amenitiesTotal: round2(amenities), subtotal: round2(amenities), serviceFee: 0, taxes: 0, total: round2(amenities), nights: 0, roomBreakdown: [] };
    let base = 0; let extraFees = 0; const roomBreakdown: RoomBreakdownItem[] = [];
    roomBookings.forEach(booking => {
      if (booking.quantity > 0) {
        const room = selectedProperty.rooms?.find((r: Room) => r.id === booking.roomId);
        if (room) {
          const c = calculateRoomCosts(booking, room, nights);
          base += c.baseRate; extraFees += c.extraGuestFee;
          roomBreakdown.push({ roomName: room.name, quantity: booking.quantity, guests: booking.guests, maxGuests: (room.max_guests || room.maxGuests) * booking.quantity, baseRate: c.baseRate, extraGuestFee: c.extraGuestFee, extraGuests: 0 });
        }
      }
    });
    const amenitiesTotal = calculateAmenitiesTotal();
    const sub = base + extraFees + amenitiesTotal;
    const fee = sub * 0.1; const tax = sub * 0.15;
    return { basePrice: round2(base), extraGuestFees: round2(extraFees), amenitiesTotal: round2(amenitiesTotal), subtotal: round2(sub), serviceFee: round2(fee), taxes: round2(tax), total: round2(sub + fee + tax), nights, roomBreakdown };
  };

  const calculatePackageCosts = (): PackageCosts => {
    if (!selectedPackage) { const a = round2(calculateAmenitiesTotal()); return { basePrice: 0, amenitiesTotal: a, subtotal: a, serviceFee: 0, taxes: 0, total: a }; }
    const base = selectedPackage.price * bookingData.guests;
    const am = calculateAmenitiesTotal();
    const sub = base + am; const fee = sub * 0.1; const tax = sub * 0.12;
    return { basePrice: round2(base), amenitiesTotal: round2(am), subtotal: round2(sub), serviceFee: round2(fee), taxes: round2(tax), total: round2(sub + fee + tax) };
  };

  const costs: Costs = bookingType === 'package' ? calculatePackageCosts() : calculatePropertyCosts();

  useEffect(() => {
    const total = costs.total; const checkIn = bookingType === 'package' ? packageStartDate : checkInDate;
    if (total > 0 && checkIn) {
      const today = new Date();
      const depDue = new Date(today); depDue.setDate(today.getDate() + 7);
      const balDue = new Date(checkIn); balDue.setDate(balDue.getDate() - 30);
      setPaymentSchedule({ depositAmount: round2(total * 0.3), balanceAmount: round2(total * 0.7), depositDueDate: depDue.toISOString().split('T')[0], balanceDueDate: (balDue <= today ? today : balDue).toISOString().split('T')[0] });
    }
  }, [costs.total, checkInDate, packageStartDate, bookingType]);

  useEffect(() => {
    if (initialized) return;
    if (packagesLoading || propertiesLoading) return;
    const load = async () => {
      if (packageId) {
        setBookingType('package');
        const pkg = await getPackageById(packageId);
        if (pkg) { setSelectedPackage(pkg); setBookingData(p => ({ ...p, guests: Math.min(p.guests, pkg.maxGuests || 10) })); }
      } else if (propertyId) {
        setBookingType('property');
        const prop = properties.find(p => { const id = p.id || p._id || ''; return id === propertyId || slugify(p.name) === propertyId; });
        if (prop?.externalUrl) { window.location.href = prop.externalUrl; return; }
        if (prop) {
          setSelectedProperty(prop);
          const rooms = prop.rooms || [];
          setRoomBookings(rooms.map((r: Room) => ({ roomId: r.id, quantity: roomId === r.id && r.available ? 1 : 0, guests: roomId === r.id && r.available ? 1 : 0 })));
          if (roomId) { const r = rooms.find((r: Room) => r.id === roomId); if (r) setSelectedRoom(r); }
          else if (rooms.length > 0) setSelectedRoom(rooms.find((r: Room) => r.available) || rooms[0]);
        }
      }
    };
    load();
    setIsLoading(false);
    setInitialized(true);
  }, [packageId, propertyId, roomId, packages, properties, getPackageById, initialized, packagesLoading, propertiesLoading]);

  // Fetch the seasonal rate for the selected check-in date
  useEffect(() => {
    if (!checkInDate || bookingType !== 'property') { setCurrentSeason(null); return; }
    const propId = selectedProperty?.id || selectedProperty?._id;
    getRateByDate(format(checkInDate, 'yyyy-MM-dd'), propId).then(season => {
      setCurrentSeason(season);
      if (season?.availableMealPlans?.length) {
        setMealPlan(p => season.availableMealPlans.includes(p) ? p : season.availableMealPlans[0]);
      }
      // Auto-advance checkout to satisfy minimum night stay
      const mn = season?.minNights ?? selectedProperty?.minNights ?? 1;
      if (mn > 1) {
        setCheckOutDate(prev => {
          const minOut = addDays(checkInDate, mn);
          return !prev || prev < minOut ? minOut : prev;
        });
      }
    });
  }, [checkInDate, selectedProperty, bookingType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (checkInDate && bookingType === 'property') setBookingData(p => ({ ...p, checkIn: format(checkInDate, 'yyyy-MM-dd') })); }, [checkInDate, bookingType]);
  useEffect(() => { if (checkOutDate && bookingType === 'property') setBookingData(p => ({ ...p, checkOut: format(checkOutDate, 'yyyy-MM-dd') })); }, [checkOutDate, bookingType]);
  useEffect(() => { if (packageStartDate && bookingType === 'package') setBookingData(p => ({ ...p, checkIn: format(packageStartDate, 'yyyy-MM-dd') })); }, [packageStartDate, bookingType]);
  useEffect(() => { if (packageEndDate && bookingType === 'package') setBookingData(p => ({ ...p, checkOut: format(packageEndDate, 'yyyy-MM-dd') })); }, [packageEndDate, bookingType]);
  useEffect(() => { if (arrivalDate) setBookingData(p => ({ ...p, arrivalDate: format(arrivalDate, 'yyyy-MM-dd') })); }, [arrivalDate]);
  useEffect(() => { if (departureDate) setBookingData(p => ({ ...p, departureDate: format(departureDate, 'yyyy-MM-dd') })); }, [departureDate]);

  const handleBooking = async () => {
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) { toast.error('Please fill in all required fields'); return; }
    if (bookingType === 'property') {
      if (!checkInDate || !checkOutDate) { toast.error('Please select check-in and check-out dates'); return; }
      if (getActiveRoomBookings().length === 0) { toast.error('Please select at least one room'); return; }
      const unavail = getActiveRoomBookings().filter(b => !selectedProperty?.rooms?.find(r => r.id === b.roomId)?.available);
      if (unavail.length > 0) { toast.error('Some selected rooms are no longer available.'); return; }
      if (checkInDate >= checkOutDate) { toast.error('Check-out must be after check-in'); return; }
      const mn = currentSeason?.minNights ?? selectedProperty?.minNights ?? 1;
      if (mn > 1 && calculateNights() < mn) { toast.error(`Minimum stay is ${mn} night${mn !== 1 ? 's' : ''}`); return; }
    } else if (bookingType === 'package') {
      if (!packageStartDate) { toast.error('Please select a start date'); return; }
    }
    if (bookingData.needsAirportTransfer) {
      if (!arrivalDate || !bookingData.arrivalTime) { toast.error('Please provide arrival date and time'); return; }
      if (!departureDate || !bookingData.departureTime) { toast.error('Please provide departure date and time'); return; }
    }
    setShowPayment(true);
  };

  const getCurrentAmountDue = () => selectedPaymentTerm === 'full' || !paymentSchedule ? costs.total : paymentSchedule.depositAmount;

  const bookingDetails = {
    propertyName: selectedProperty?.name || selectedPackage?.name || '',
    propertyLocation: selectedProperty?.location || selectedPackage?.location || '',
    roomName: selectedRoom?.name || 'Package Booking',
    checkIn: bookingType === 'package' ? (packageStartDate ? format(packageStartDate, 'yyyy-MM-dd') : '') : (checkInDate ? format(checkInDate, 'yyyy-MM-dd') : ''),
    checkOut: bookingType === 'package' ? (packageEndDate ? format(packageEndDate, 'yyyy-MM-dd') : '') : (checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : ''),
    guests: bookingType === 'property' ? getTotalGuests() : bookingData.guests,
    nights: calculateNights(),
    roomPrice: selectedRoom?.price || selectedPackage?.price || 0,
    selectedAmenities: selectedAmenities.map(ba => ({ amenity: ba.amenity, id: ba.amenity.id, name: ba.amenity.name, price: ba.amenity.price, quantity: ba.quantity })),
    totalAmount: costs.total,
    paymentTerm: selectedPaymentTerm,
    paymentSchedule,
    currentAmountDue: getCurrentAmountDue(),
    propertyId: bookingType === 'property' ? selectedProperty?.id : null,
    roomId: bookingType === 'property' ? selectedRoom?.id : null,
    packageId: bookingType === 'package' ? selectedPackage?.id : null,
    adults: bookingType === 'property' ? Math.max(1, getTotalGuests() - Math.floor(getTotalGuests() * 0.3)) : Math.max(1, bookingData.guests - Math.floor(bookingData.guests * 0.3)),
    children: bookingType === 'property' ? Math.floor(getTotalGuests() * 0.3) : Math.floor(bookingData.guests * 0.3),
    specialRequests: bookingData.specialRequests,
    airportTransfer: bookingData.needsAirportTransfer ? { arrivalDate: bookingData.arrivalDate, arrivalTime: bookingData.arrivalTime, arrivalFlightNumber: bookingData.arrivalFlightNumber, departureDate: bookingData.departureDate, departureTime: bookingData.departureTime, departureFlightNumber: bookingData.departureFlightNumber } : null,
  };

  const customerDetails = { name: `${bookingData.firstName} ${bookingData.lastName}`, email: bookingData.email, phone: `${bookingData.countryCode} ${bookingData.phone}` };

  // ── Image carousel helpers ──
  const isVideoUrl = (url: string) => url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
  const nextRoomImg = (rId: string, total: number) => setRoomImageIndex(p => ({ ...p, [rId]: ((p[rId] || 0) + 1) % total }));
  const prevRoomImg = (rId: string, total: number) => setRoomImageIndex(p => ({ ...p, [rId]: ((p[rId] || 0) - 1 + total) % total }));

  const RoomImageCarousel = ({ room }: { room: Room }) => {
    const idx = roomImageIndex[room.id] || 0;
    const imgs = room.images || [];
    if (!imgs.length) return (
      <div className="w-20 h-16 bg-tbc-surface flex items-center justify-center flex-shrink-0">
        <span className="text-white/15 text-[8px] tracking-widest uppercase">No img</span>
      </div>
    );
    return (
      <div className="relative w-20 h-16 overflow-hidden flex-shrink-0">
        {isVideoUrl(imgs[idx]) ? (
          <video src={imgs[idx]} className="w-full h-full object-cover" muted loop playsInline />
        ) : (
          <img src={imgs[idx]} alt={room.name} className="w-full h-full object-cover" />
        )}
        {imgs.length > 1 && (
          <>
            <button onClick={() => prevRoomImg(room.id, imgs.length)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-tbc-ink/60 text-white/70 w-5 h-5 flex items-center justify-center">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button onClick={() => nextRoomImg(room.id, imgs.length)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-tbc-ink/60 text-white/70 w-5 h-5 flex items-center justify-center">
              <ChevronRight className="w-3 h-3" />
            </button>
          </>
        )}
        {isVideoUrl(imgs[idx]) && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Play className="w-3 h-3 text-white/60" /></div>}
      </div>
    );
  };

  // ── Stepper ──
  const Stepper = ({ value, onDec, onInc, disableDec, disableInc }: { value: number; onDec: () => void; onInc: () => void; disableDec?: boolean; disableInc?: boolean }) => (
    <div className="flex items-center gap-0">
      <button type="button" onClick={onDec} disabled={disableDec} className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 disabled:opacity-25 transition-colors duration-200">
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-12 text-center text-white/80 text-sm font-light tabular-nums border-y border-white/[0.1] h-9 flex items-center justify-center">{value}</span>
      <button type="button" onClick={onInc} disabled={disableInc} className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 disabled:opacity-25 transition-colors duration-200">
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER: Payment page
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (showPayment) {
    return (
      <div className="min-h-screen bg-tbc-ink text-white">
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-12">
          <button onClick={() => setShowPayment(false)} className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] tracking-[0.3em] uppercase font-light transition-colors duration-300 mb-10">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
          </button>

          {/* Summary */}
          <div className="bg-tbc-earth border border-white/[0.06] mb-6">
            <div className="px-8 py-5 border-b border-white/[0.05]">
              <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light mb-1">Review</p>
              <h3 className="text-lg font-extralight text-white/85">Booking Summary</h3>
            </div>
            <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Property', value: bookingDetails.propertyName },
                { label: 'Room', value: bookingDetails.roomName },
                { label: 'Check-in', value: bookingDetails.checkIn || '—' },
                { label: 'Check-out', value: bookingDetails.checkOut || '—' },
                { label: 'Guests', value: String(bookingDetails.guests) },
                { label: 'Nights', value: String(bookingDetails.nights) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light mb-1">{item.label}</p>
                  <p className="text-white/80 text-sm font-light">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="px-8 py-5 border-t border-white/[0.05] flex items-baseline justify-between">
              <span className="text-white/40 text-sm font-light">Total</span>
              <span className="text-tbc-gold text-2xl font-extralight tabular-nums">${bookingDetails.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* PesaPal iframe */}
          <div className="bg-tbc-earth border border-white/[0.06]">
            <div className="px-8 py-5 border-b border-white/[0.05] flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-tbc-gold/60" />
              <div>
                <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light mb-0.5">Secure Payment</p>
                <h3 className="text-lg font-extralight text-white/85">Complete Payment via PesaPal</h3>
              </div>
            </div>
            <div className="p-6">
              <iframe
                src="https://store.pesapal.com/premiumbushcollectionsafricaltd"
                frameBorder="0"
                allowFullScreen
                className="w-full border border-white/[0.06]"
                style={{ minHeight: '700px' }}
                title="PesaPal Payment"
              />
              <p className="text-white/20 text-xs tracking-wide font-light mt-4 text-center">
                Secure payment powered by PesaPal
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER: Loading
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tbc-ink text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-px h-14 bg-gradient-to-b from-transparent to-tbc-gold/60 animate-pulse" />
          <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-light">Loading</p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER: Package not found
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (packageId && packages.length > 0 && !selectedPackage) {
    return (
      <div className="min-h-screen bg-tbc-ink text-white flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase mb-3 font-light">Not Found</p>
          <p className="text-white/35 text-sm font-light mb-10">The requested package could not be found.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/packages"><Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-8 py-5 text-xs tracking-[0.2em] uppercase font-medium">Browse Packages</Button></Link>
            <Link to="/collections"><Button className="bg-transparent border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-none px-8 py-5 text-xs tracking-[0.2em] uppercase font-light">Browse Properties</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER: No selection — landing page
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!selectedProperty && !selectedPackage) {
    return (
      <div className="min-h-screen bg-tbc-ink text-white overflow-x-hidden">
        <section className="relative h-screen min-h-[720px] overflow-hidden -mt-[80px]">
          <img
            src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774959102/Zaromwa-4631_h3ysfz.jpg"
            alt="Luxury bush camp safari experience"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tbc-ink/75 via-tbc-ink/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/90 via-transparent to-tbc-ink/25" />
          <div className="absolute inset-8 md:inset-12 border border-white/[0.07] pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 pb-24 md:pb-32 px-10 md:px-16 max-w-[1600px] mx-auto">
            <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-5">The Bush Collection</p>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extralight text-white leading-[0.92] tracking-tight mb-10">
              Discover Luxury<br />
              <span className="italic text-tbc-gold">Bush &amp; Beach Camps</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/packages">
                <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-10 py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300">
                  Safari Packages <ArrowUpRight className="ml-3 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/collections">
                <Button className="bg-transparent border border-white/20 hover:border-white/40 text-white/70 hover:text-white rounded-none px-10 py-6 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300">
                  View Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER: Main booking form
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const isExternalGuest = bookingType === 'property' && getActiveRoomBookings().length === 0;
  const maxGuestsForAmenities = bookingType === 'property' ? getTotalGuests() : bookingData.guests;
  const nights = calculateNights();

  const calendarPopover = (bg = 'bg-tbc-surface') =>
    `w-auto p-0 ${bg} border border-white/[0.1] [&_.rdp]:text-white [&_.rdp-day_button]:text-white/70 [&_.rdp-day_button:hover]:bg-tbc-gold/20 [&_.rdp-day_button.rdp-day_selected]:bg-tbc-gold [&_.rdp-day_button.rdp-day_selected]:text-tbc-earth [&_.rdp-nav_button]:text-white/50 [&_.rdp-head_cell]:text-white/30 [&_.rdp-caption]:text-white/80`;

  return (
    <div className="min-h-screen bg-tbc-ink text-white">

      {/* ── Page header ── */}
      <div className="bg-tbc-dark border-b border-white/[0.05] px-8 md:px-16 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
        <Link
          to={bookingType === 'package' ? '/packages' : '/collections'}
          className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase font-light transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {bookingType === 'package' ? 'Packages' : 'Collection'}
        </Link>
        <div className="text-center hidden sm:block">
          <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light">The Bush Collection</p>
          <p className="text-white/50 text-xs font-light tracking-wide mt-0.5">Reservation</p>
        </div>
        <div className="flex items-center gap-2 text-white/25 text-[9px] tracking-[0.2em] uppercase font-light">
          <Shield className="w-3 h-3 text-tbc-gold/40" />
          Secure Booking
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT — Form ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Property / Package header */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              <div className="px-8 py-7 flex items-start justify-between gap-6">
                <div>
                  <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light mb-3">
                    {bookingType === 'package' ? 'Safari Package' : 'Property'}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extralight text-white/90">
                    {bookingType === 'package' ? selectedPackage?.name : selectedProperty?.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-3 text-white/40">
                    <MapPin className="w-3.5 h-3.5 text-tbc-gold/50" />
                    <span className="text-sm font-light">
                      {bookingType === 'package'
                        ? (selectedPackage?.location || selectedPackage?.destinations?.slice(0, 2).join(', '))
                        : selectedProperty?.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-tbc-gold text-tbc-gold" />)}
                </div>
              </div>
            </div>

            {/* Package details */}
            {bookingType === 'package' && selectedPackage && (
              <div className="bg-tbc-earth border border-white/[0.06]">
                {sectionHead('Package', 'Package Details')}
                <div className="px-8 py-7 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Duration', value: selectedPackage.duration },
                      { label: 'Group Size', value: selectedPackage.groupSize },
                      { label: 'Difficulty', value: selectedPackage.difficulty },
                      { label: 'Category', value: selectedPackage.category },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light mb-1">{item.label}</p>
                        <p className="text-white/75 text-sm font-light capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light mb-4">Highlights</p>
                    <div className="space-y-2">
                      {selectedPackage.highlights.slice(0, 5).map((h, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Check className="w-3 h-3 text-tbc-gold/60 flex-shrink-0" />
                          <span className="text-white/55 text-sm font-light">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room selection */}
            {bookingType === 'property' && selectedProperty && (
              <div className="bg-tbc-earth border border-white/[0.06]">
                {sectionHead('Accommodation', 'Select Rooms & Guests')}
                <div className="px-8 py-7 space-y-6">
                  <p className="text-white/35 text-xs font-light tracking-wide">All guests pay the same per-person rate.</p>

                  {(selectedProperty.rooms || [])
                    .filter((r: Room) => { const b = roomBookings.find(b => b.roomId === r.id); return b && (b.quantity > 0 || r.id === roomId); })
                    .map((room: Room) => {
                      const booking = roomBookings.find(b => b.roomId === room.id);
                      if (!booking) return null;
                      const maxCap = room.max_guests * booking.quantity;
                      const extra = Math.max(0, booking.guests - maxCap);
                      return (
                        <div key={room.id} className={cn('border border-white/[0.07] p-6', !room.available && 'opacity-60')}>
                          {!room.available && (
                            <div className="mb-4 p-3 border border-white/[0.1] flex items-center gap-3">
                              <AlertTriangle className="w-4 h-4 text-tbc-gold/60 flex-shrink-0" />
                              <p className="text-white/50 text-xs font-light">This room is currently unavailable.</p>
                            </div>
                          )}
                          <div className="flex items-start gap-5 mb-6">
                            <RoomImageCarousel room={room} />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-white/85 text-base font-light mb-1">{room.name}</h4>
                                  <p className="text-white/35 text-xs flex items-center gap-1.5 font-light">
                                    <Users className="w-3 h-3" /> Max {room.maxGuests} guests per room
                                    {!room.available && <span className="ml-2 text-tbc-gold/50">· Unavailable</span>}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {room.amenities.slice(0, 3).map((a: string, i: number) => (
                                      <span key={i} className="text-[8px] tracking-[0.15em] uppercase font-light text-white/30 border border-white/[0.08] px-2 py-0.5">{a}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {(() => {
                                    const booking = roomBookings.find(b => b.roomId === room.id);
                                    const gpp = booking && booking.quantity > 0 ? booking.guests / booking.quantity : 1;
                                    const sr = getSeasonalRoomRate(currentSeason, room.name, gpp, mealPlan);
                                    const mn = currentSeason?.minNights ?? selectedProperty?.minNights ?? 1;
                                    if (sr != null) {
                                      const stayTotal = sr * mn;
                                      return mn > 1 ? (
                                        <>
                                          <p className="text-tbc-gold text-xl font-extralight tabular-nums">${stayTotal}</p>
                                          <p className="text-white/25 text-xs font-light">/ {mn} nights</p>
                                          <p className="text-white/20 text-[9px] font-light">${sr} / night</p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="text-tbc-gold text-xl font-extralight tabular-nums">${sr}</p>
                                          <p className="text-white/25 text-xs font-light">per room / night</p>
                                        </>
                                      );
                                    }
                                    const pmn = selectedProperty?.minNights ?? 1;
                                    return (
                                      <>
                                        <p className="text-tbc-gold text-xl font-extralight tabular-nums">${room.price}</p>
                                        <p className="text-white/25 text-xs font-light">
                                          {pmn > 1 ? `/ ${pmn} nights` : '/ night'}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelCls}>Number of Rooms</label>
                              <div className="flex items-center gap-4">
                                <Stepper
                                  value={booking.quantity}
                                  onDec={() => updateRoomBooking(room.id, 'quantity', booking.quantity - 1)}
                                  onInc={() => updateRoomBooking(room.id, 'quantity', booking.quantity + 1)}
                                  disableDec={booking.quantity <= 0 || !room.available}
                                  disableInc={!room.available || booking.quantity >= getRoomAvailability(room.name)}
                                />
                                <span className="text-white/25 text-xs font-light">{getRoomAvailability(room.name)} available</span>
                              </div>
                            </div>
                            {booking.quantity > 0 && room.available && (
                              <div>
                                <label className={labelCls}>Total Guests</label>
                                <div className="flex items-center gap-4">
                                  <Stepper
                                    value={booking.guests}
                                    onDec={() => updateRoomBooking(room.id, 'guests', booking.guests - 1)}
                                    onInc={() => updateRoomBooking(room.id, 'guests', booking.guests + 1)}
                                    disableDec={booking.guests <= 0}
                                  />
                                  {extra > 0 && <span className="text-white/35 text-xs font-light">{extra} extra guest{extra !== 1 ? 's' : ''}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* Add more rooms */}
                  <div className="pt-2 border-t border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setShowAdditionalRooms(!showAdditionalRooms)}
                      className="group flex items-center gap-2 text-white/35 hover:text-tbc-gold text-[10px] tracking-[0.3em] uppercase font-light transition-colors duration-300"
                    >
                      <Plus className="w-3 h-3" />
                      {showAdditionalRooms ? 'Hide additional rooms' : 'Add another room'}
                    </button>

                    {showAdditionalRooms && (() => {
                      const grouped = (selectedProperty.rooms || [])
                        .filter(r => r.available)
                        .reduce((acc, r) => {
                          const g = acc.find(x => x.name === r.name);
                          if (g) g.availableCount++;
                          else acc.push({ name: r.name, type: r.type, maxGuests: r.max_guests, price: r.price, availableCount: 1, sampleRoomId: r.id });
                          return acc;
                        }, [] as Array<{ name: string; type: string; maxGuests: number; price: number; availableCount: number; sampleRoomId: string }>)
                        .filter(g => { const b = roomBookings.find(b => { const r = selectedProperty.rooms?.find(r => r.id === b.roomId); return r?.name === g.name; }); return !b || b.quantity === 0; });

                      return grouped.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {grouped.map(g => (
                            <div key={g.name} className="flex items-center justify-between p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-200">
                              <div>
                                <p className="text-white/75 text-sm font-light">{g.name}</p>
                                <p className="text-white/30 text-xs mt-0.5">
                                  <Users className="w-3 h-3 inline mr-1" />Up to {g.maxGuests} guests · ${g.price}/night · {g.availableCount} available
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => { updateRoomBooking(g.sampleRoomId, 'quantity', 1); setShowAdditionalRooms(false); }}
                                className="text-tbc-gold text-[9px] tracking-[0.25em] uppercase font-light border border-tbc-gold/30 px-4 py-2 hover:bg-tbc-gold/10 transition-colors duration-200"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-white/20 text-xs tracking-[0.2em] uppercase font-light">No additional rooms available</p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Booking dates */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              {sectionHead('Dates', bookingType === 'property' ? 'Check-in & Check-out' : 'Trip Dates')}
              <div className="px-8 py-7 space-y-6">
                {bookingType === 'property' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Check-in</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white hover:bg-tbc-surface hover:text-white hover:border-tbc-gold/30 font-light text-sm tracking-wide', !checkInDate && 'text-white/25')}>
                            <CalendarIcon className="mr-3 h-4 w-4 text-tbc-gold/40" />
                            {checkInDate ? format(checkInDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={calendarPopover()}>
                          <Calendar mode="single" selected={checkInDate} onSelect={d => setCheckInDate(d as Date | undefined)} disabled={d => d < new Date()} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className={labelCls}>Check-out</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white hover:bg-tbc-surface hover:text-white hover:border-tbc-gold/30 font-light text-sm tracking-wide', !checkOutDate && 'text-white/25')}>
                            <CalendarIcon className="mr-3 h-4 w-4 text-tbc-gold/40" />
                            {checkOutDate ? format(checkOutDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={calendarPopover()}>
                          <Calendar mode="single" selected={checkOutDate} onSelect={d => setCheckOutDate(d as Date | undefined)}
                            disabled={d => {
                              const mn = currentSeason?.minNights ?? selectedProperty?.minNights ?? 1;
                              const earliest = checkInDate ? addDays(checkInDate, mn) : new Date();
                              return d < earliest;
                            }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className={labelCls}>Trip Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white hover:bg-tbc-surface hover:text-white hover:border-tbc-gold/30 font-light text-sm tracking-wide', !packageStartDate && 'text-white/25')}>
                            <CalendarIcon className="mr-3 h-4 w-4 text-tbc-gold/40" />
                            {packageStartDate ? format(packageStartDate, 'PPP') : 'Select start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={calendarPopover()}>
                          <Calendar mode="single" selected={packageStartDate} onSelect={d => setPackageStartDate(d as Date | undefined)} disabled={d => d < new Date()} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {packageEndDate && (
                      <div>
                        <label className={labelCls}>Trip End Date (Auto-calculated)</label>
                        <div className="h-12 bg-tbc-surface border border-white/[0.06] flex items-center px-4 gap-3">
                          <CalendarIcon className="w-4 h-4 text-tbc-gold/40" />
                          <span className="text-white/60 text-sm font-light">{format(packageEndDate, 'PPP')}</span>
                          <span className="text-white/20 text-xs font-light ml-auto">Based on {selectedPackage?.duration}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className={labelCls}>Number of Guests</label>
                      <Select value={bookingData.guests.toString()} onValueChange={v => setBookingData({ ...bookingData, guests: parseInt(v) })}>
                        <SelectTrigger className="h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white/80 focus:border-tbc-gold/40 text-sm font-light">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-tbc-surface border-white/[0.1]">
                          {[...Array(Math.min(8, selectedPackage?.maxGuests || 8))].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()} className="text-white/75 focus:bg-tbc-gold/20 focus:text-white">
                              {i + 1} Guest{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Season & Meal Plan — only shown for property bookings after date selection */}
            {bookingType === 'property' && checkInDate && (
              <div className="bg-tbc-earth border border-white/[0.06]">
                {sectionHead('Rate', 'Season & Meal Plan')}
                <div className="px-8 py-7 space-y-5">
                  {/* Season indicator */}
                  {currentSeason ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 border border-tbc-gold/20 bg-tbc-gold/5">
                        <div className="flex-1">
                          <p className="text-tbc-gold text-[9px] tracking-[0.3em] uppercase font-light mb-1">Active Season</p>
                          <p className="text-white/80 text-sm font-light">{currentSeason.name}</p>
                          <p className="text-white/35 text-xs font-light mt-0.5">{SEASON_LABELS[currentSeason.seasonType]}</p>
                        </div>
                        <div className="text-right text-xs text-white/30 font-light space-y-0.5">
                          {currentSeason.dateRanges.map((dr, i) => (
                            <p key={i}>{format(new Date(dr.startDate), 'dd MMM')} – {format(new Date(dr.endDate), 'dd MMM yyyy')}</p>
                          ))}
                        </div>
                      </div>
                      {(currentSeason.minNights ?? 1) > 1 && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-white/[0.08] bg-white/[0.02]">
                          <CalendarIcon className="w-3.5 h-3.5 text-tbc-gold/50 flex-shrink-0" />
                          <p className="text-white/50 text-xs font-light">
                            Minimum stay: <span className="text-white/75 font-normal">{currentSeason.minNights} nights</span>
                            {' · '}Prices shown as total for minimum stay period
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border border-white/[0.07] text-white/30 text-sm font-light space-y-2">
                      <p>No seasonal rate configured for this date — standard room pricing applies.</p>
                      {(selectedProperty?.minNights ?? 1) > 1 && (
                        <p className="flex items-center gap-2 text-white/40">
                          <CalendarIcon className="w-3.5 h-3.5 text-tbc-gold/50 flex-shrink-0" />
                          Minimum stay: <span className="text-white/60 font-normal">{selectedProperty!.minNights} nights</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Meal plan selector */}
                  {currentSeason && (
                    <div>
                      <label className={labelCls}>Meal Plan</label>
                      <div className="flex gap-3 mt-2">
                        {(['BB', 'HB'] as MealPlan[]).map(plan => {
                          const available = currentSeason.availableMealPlans.includes(plan);
                          const active = mealPlan === plan;
                          return (
                            <button
                              key={plan}
                              type="button"
                              disabled={!available}
                              onClick={() => available && setMealPlan(plan)}
                              className={cn(
                                'flex-1 p-4 border text-left transition-colors duration-200',
                                active ? 'border-tbc-gold/50 bg-tbc-gold/10' : 'border-white/[0.08]',
                                available ? 'hover:border-white/20 cursor-pointer' : 'opacity-30 cursor-not-allowed'
                              )}
                            >
                              <p className={cn('text-sm font-light', active ? 'text-tbc-gold' : 'text-white/65')}>{plan}</p>
                              <p className="text-white/30 text-xs font-light mt-0.5">{MEAL_PLAN_LABELS[plan]}</p>
                              {!available && <p className="text-white/20 text-[9px] uppercase tracking-wider mt-1">Not available this season</p>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Airport transfer */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              {sectionHead('Optional', 'Airport Transfer')}
              <div className="px-8 py-7 space-y-6">
                <p className="text-white/35 text-xs font-light tracking-wide">Help us manage your transfers and daily guest movements.</p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn('w-5 h-5 border flex items-center justify-center transition-colors duration-200', bookingData.needsAirportTransfer ? 'border-tbc-gold bg-tbc-gold/15' : 'border-white/[0.15] group-hover:border-white/30')}>
                    {bookingData.needsAirportTransfer && <Check className="w-3 h-3 text-tbc-gold" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={bookingData.needsAirportTransfer} onChange={e => setBookingData({ ...bookingData, needsAirportTransfer: e.target.checked })} />
                  <span className="text-white/55 text-sm font-light tracking-wide">I need airport transfer service</span>
                </label>

                {bookingData.needsAirportTransfer && (
                  <div className="space-y-8 pt-6 border-t border-white/[0.05]">
                    {[
                      { title: 'Arrival Details', dateState: arrivalDate, setDate: setArrivalDate, timeKey: 'arrivalTime' as const, flightKey: 'arrivalFlightNumber' as const, timeLabel: 'Arrival Time', flightLabel: 'Arrival Flight (Optional)', flightPlaceholder: 'e.g., KQ101' },
                      { title: 'Departure Details', dateState: departureDate, setDate: setDepartureDate, timeKey: 'departureTime' as const, flightKey: 'departureFlightNumber' as const, timeLabel: 'Departure Time', flightLabel: 'Departure Flight (Optional)', flightPlaceholder: 'e.g., KQ102' },
                    ].map(section => (
                      <div key={section.title}>
                        <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-light mb-4">{section.title}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelCls}>Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className={cn('w-full justify-start text-left h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white hover:bg-tbc-surface hover:text-white hover:border-tbc-gold/30 font-light text-sm', !section.dateState && 'text-white/25')}>
                                  <CalendarIcon className="mr-3 h-4 w-4 text-tbc-gold/40" />
                                  {section.dateState ? format(section.dateState, 'MMM dd') : 'Select'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className={calendarPopover()}>
                                <Calendar mode="single" selected={section.dateState} onSelect={d => section.setDate(d as Date | undefined)} disabled={d => d < new Date()} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <label className={labelCls}>{section.timeLabel}</label>
                            <Input type="time" value={bookingData[section.timeKey]} onChange={e => setBookingData({ ...bookingData, [section.timeKey]: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>{section.flightLabel}</label>
                            <Input value={bookingData[section.flightKey]} onChange={e => setBookingData({ ...bookingData, [section.flightKey]: e.target.value })} placeholder={section.flightPlaceholder} className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3 p-4 border border-tbc-gold/15 bg-tbc-gold/5">
                      <Plane className="w-4 h-4 text-tbc-gold/50 mt-0.5 flex-shrink-0" />
                      <p className="text-white/40 text-xs font-light leading-relaxed">Our team will arrange airport pickup and drop-off based on your flight schedule. Transfer costs are included in most packages or available as an add-on service.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              {sectionHead('Add-ons', 'Enhance Your Experience')}
              <div className="px-8 py-7">
                <AmenitySelector selectedAmenities={selectedAmenities} onAmenityChange={setSelectedAmenities} isExternalGuest={isExternalGuest} maxGuests={maxGuestsForAmenities} />
              </div>
            </div>

            {/* Payment terms */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              {sectionHead('Payment', 'Payment Terms')}
              <div className="px-8 py-7 space-y-4">
                <RadioGroup value={selectedPaymentTerm} onValueChange={(v: PaymentTerm) => setSelectedPaymentTerm(v)} className="space-y-3">
                  {/* Deposit */}
                  <label className={cn('flex items-start gap-4 p-5 border cursor-pointer transition-colors duration-200', selectedPaymentTerm === 'deposit' ? 'border-tbc-gold/40 bg-tbc-gold/5' : 'border-white/[0.07] hover:border-white/[0.15]')}>
                    <RadioGroupItem value="deposit" id="deposit" className="mt-0.5 border-white/30 text-tbc-gold" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Percent className="w-4 h-4 text-tbc-gold/60" />
                        <span className="text-white/80 text-sm font-light">30% Deposit Now, 70% Balance Later</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                        {[
                          ['Non-refundable deposit', `$${paymentSchedule?.depositAmount.toFixed(2) || '0.00'}`],
                          ['Deposit due', paymentSchedule ? format(new Date(paymentSchedule.depositDueDate), 'MMM dd, yyyy') : 'N/A'],
                          ['Balance amount', `$${paymentSchedule?.balanceAmount.toFixed(2) || '0.00'}`],
                          ['Balance due', paymentSchedule ? format(new Date(paymentSchedule.balanceDueDate), 'MMM dd, yyyy') : 'N/A'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between col-span-1 gap-2">
                            <span className="text-white/30 font-light">{k}</span>
                            <span className="text-white/65 font-light tabular-nums">{v}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-white/22 text-[10px] font-light mt-3 leading-relaxed">30% non-refundable deposit payable within 7 days. Balance due 30 days prior to arrival.</p>
                    </div>
                  </label>

                  {/* Full payment */}
                  <label className={cn('flex items-start gap-4 p-5 border cursor-pointer transition-colors duration-200', selectedPaymentTerm === 'full' ? 'border-tbc-gold/40 bg-tbc-gold/5' : 'border-white/[0.07] hover:border-white/[0.15]')}>
                    <RadioGroupItem value="full" id="full" className="mt-0.5 border-white/30 text-tbc-gold" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Banknote className="w-4 h-4 text-tbc-gold/60" />
                        <span className="text-white/80 text-sm font-light">Pay Full Amount Now</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/30 font-light">Total amount</span>
                        <span className="text-tbc-gold font-light tabular-nums">${costs.total.toFixed(2)}</span>
                      </div>
                      <p className="text-white/22 text-[10px] font-light mt-3 leading-relaxed">Required immediately for bookings within 30 days of arrival.</p>
                    </div>
                  </label>
                </RadioGroup>

                {/* Payment schedule */}
                {paymentSchedule && selectedPaymentTerm === 'deposit' && (
                  <div className="pt-4 border-t border-white/[0.05] space-y-2">
                    <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase font-light mb-3">Payment Schedule</p>
                    {[
                      { label: 'First Payment — 30% Deposit', amount: paymentSchedule.depositAmount, due: paymentSchedule.depositDueDate, note: 'Non-refundable', highlight: true },
                      { label: 'Second Payment — 70% Balance', amount: paymentSchedule.balanceAmount, due: paymentSchedule.balanceDueDate, note: new Date(paymentSchedule.balanceDueDate) <= new Date() ? 'Due immediately' : 'Due later', highlight: false },
                    ].map(item => (
                      <div key={item.label} className={cn('flex items-center justify-between p-4 border', item.highlight ? 'border-tbc-gold/20 bg-tbc-gold/5' : 'border-white/[0.06]')}>
                        <div>
                          <p className="text-white/65 text-sm font-light">{item.label}</p>
                          <p className="text-white/25 text-xs font-light mt-0.5">Due: {format(new Date(item.due), 'MMM dd, yyyy')} · {item.note}</p>
                        </div>
                        <p className={cn('text-lg font-extralight tabular-nums', item.highlight ? 'text-tbc-gold' : 'text-white/60')}>${item.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guest information */}
            <div className="bg-tbc-earth border border-white/[0.06]">
              {sectionHead('Guest', 'Your Information')}
              <div className="px-8 py-7 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-tbc-gold">*</span></label>
                    <Input value={bookingData.firstName} onChange={e => setBookingData({ ...bookingData, firstName: e.target.value })} placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-tbc-gold">*</span></label>
                    <Input value={bookingData.lastName} onChange={e => setBookingData({ ...bookingData, lastName: e.target.value })} placeholder="Last name" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address <span className="text-tbc-gold">*</span></label>
                  <Input type="email" value={bookingData.email} onChange={e => setBookingData({ ...bookingData, email: e.target.value })} placeholder="your@email.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <div className="flex gap-0">
                    <Select value={bookingData.countryCode} onValueChange={v => setBookingData({ ...bookingData, countryCode: v })}>
                      <SelectTrigger className="w-36 h-12 rounded-none bg-tbc-surface border-white/[0.08] text-white/70 focus:border-tbc-gold/40 text-sm font-light">
                        <SelectValue>
                          {countryCodes.find(c => c.code === bookingData.countryCode) && (
                            <div className="flex items-center gap-2">
                              <img src={countryCodes.find(c => c.code === bookingData.countryCode)?.flagImage} alt="flag" className="h-4 w-7 object-contain" onError={e => { e.currentTarget.style.display = 'none'; }} />
                              <span>{bookingData.countryCode}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-tbc-surface border-white/[0.1] max-h-64 w-72">
                        {countryCodes.map(c => (
                          <SelectItem key={`${c.code}-${c.country}`} value={c.code} className="text-white/75 focus:bg-tbc-gold/20 focus:text-white">
                            <div className="flex items-center gap-3">
                              <img src={c.flagImage} alt={c.name} className="h-4 w-7 object-contain flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
                              <span className="font-light">{c.name}</span>
                              <span className="text-white/30 text-xs">{c.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="tel" value={bookingData.phone} onChange={e => setBookingData({ ...bookingData, phone: e.target.value })} placeholder="Phone number" className={cn(inputCls, 'flex-1 border-l-0')} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Special Requests</label>
                  <Textarea value={bookingData.specialRequests} onChange={e => setBookingData({ ...bookingData, specialRequests: e.target.value })} placeholder="Dietary requirements, accessibility needs, special occasions…" rows={4} className="bg-tbc-surface border-white/[0.08] text-white placeholder:text-white/20 focus:border-tbc-gold/40 rounded-none text-sm font-light tracking-wide resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Sticky Summary ── */}
          <div className="lg:col-span-1 sticky top-8 self-start">
            <div className="bg-tbc-dark border border-white/[0.06]">
              <div className="px-7 py-6 border-b border-white/[0.05]">
                <p className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light mb-1">Summary</p>
                <h3 className="text-lg font-extralight text-white/85">Booking Summary</h3>
              </div>

              <div className="px-7 py-6 space-y-4">
                {/* Item name */}
                <div>
                  <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">{bookingType === 'package' ? 'Package' : 'Property'}</p>
                  <p className="text-white/75 text-sm font-light">{bookingType === 'package' ? selectedPackage?.name : selectedProperty?.name}</p>
                </div>

                {/* Season + meal plan badge */}
                {bookingType === 'property' && currentSeason && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Season</p>
                      <p className="text-tbc-gold/80 text-xs font-light">{SEASON_LABELS[currentSeason.seasonType]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Meal Plan</p>
                      <p className="text-white/55 text-xs font-light">{mealPlan} — {MEAL_PLAN_LABELS[mealPlan]}</p>
                    </div>
                  </div>
                )}

                {bookingType === 'property' ? (
                  <>
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Dates</p>
                      <p className="text-white/65 text-sm font-light">
                        {checkInDate && checkOutDate ? `${nights} night${nights !== 1 ? 's' : ''}` : '—'}
                      </p>
                      {(() => { const mn = currentSeason?.minNights ?? selectedProperty?.minNights ?? 1; return mn > 1 ? <p className="text-white/30 text-[10px] font-light">{mn}-night minimum</p> : null; })()}
                    </div>
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Total Guests</p>
                      <p className="text-white/65 text-sm font-light">{getTotalGuests() || '—'}</p>
                    </div>
                    {getActiveRoomBookings().length > 0 && 'roomBreakdown' in costs && (costs as PropertyCosts).roomBreakdown?.length > 0 && (
                      <div>
                        <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-2">Rooms</p>
                        {(costs as PropertyCosts).roomBreakdown.map((r, i) => (
                          <div key={i} className="flex justify-between text-xs text-white/40 font-light mb-1">
                            <span>{r.roomName} ×{r.quantity}</span>
                            <span>{r.guests} guests</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Duration</p>
                      <p className="text-white/65 text-sm font-light">{selectedPackage?.duration}</p>
                    </div>
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Dates</p>
                      <p className="text-white/65 text-sm font-light">
                        {packageStartDate && packageEndDate ? `${format(packageStartDate, 'MMM dd')} – ${format(packageEndDate, 'MMM dd, yyyy')}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1">Guests</p>
                      <p className="text-white/65 text-sm font-light">{bookingData.guests}</p>
                    </div>
                  </>
                )}

                {bookingData.needsAirportTransfer && (
                  <div>
                    <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-1 flex items-center gap-1.5"><Plane className="w-3 h-3" /> Transfer</p>
                    {arrivalDate && <p className="text-white/40 text-xs font-light">Arrival: {format(arrivalDate, 'MMM dd')} {bookingData.arrivalTime && `at ${bookingData.arrivalTime}`}</p>}
                    {departureDate && <p className="text-white/40 text-xs font-light">Departure: {format(departureDate, 'MMM dd')} {bookingData.departureTime && `at ${bookingData.departureTime}`}</p>}
                  </div>
                )}

                {selectedAmenities.length > 0 && (
                  <div>
                    <p className="text-white/22 text-[8px] tracking-[0.3em] uppercase font-light mb-2">Add-ons</p>
                    {selectedAmenities.map((a, i) => (
                      <div key={i} className="flex justify-between text-xs font-light mb-1">
                        <span className="text-white/40">{a.amenity.name} ×{a.quantity}</span>
                        <span className="text-white/55 tabular-nums">${a.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="px-7 py-5 border-t border-white/[0.05] space-y-2.5">
                {bookingType === 'property' ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 font-light">
                      Accommodation ({getTotalGuests()} guest{getTotalGuests() !== 1 ? 's' : ''}, {nights} night{nights !== 1 ? 's' : ''}
                      {(currentSeason?.minNights ?? selectedProperty?.minNights ?? 1) > 1 ? ` · min ${currentSeason?.minNights ?? selectedProperty?.minNights}` : ''})
                    </span>
                    <span className="text-white/65 font-light tabular-nums">${('basePrice' in costs ? costs.basePrice : 0).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 font-light">Package ({bookingData.guests} guests)</span>
                    <span className="text-white/65 font-light tabular-nums">${('basePrice' in costs ? costs.basePrice : 0).toFixed(2)}</span>
                  </div>
                )}
                {costs.amenitiesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 font-light">Add-ons</span>
                    <span className="text-white/65 font-light tabular-nums">${costs.amenitiesTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-light">Service fee (10%)</span>
                  <span className="text-white/65 font-light tabular-nums">${costs.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-light">Taxes ({bookingType === 'package' ? '12%' : '15%'})</span>
                  <span className="text-white/65 font-light tabular-nums">${costs.taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="px-7 py-5 border-t border-white/[0.05] space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/50 text-sm font-light">Total</span>
                  <span className="text-white/85 text-xl font-extralight tabular-nums">${costs.total.toFixed(2)}</span>
                </div>
                {selectedPaymentTerm === 'deposit' && paymentSchedule && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/35 font-light">Deposit (30%)</span>
                      <span className="text-tbc-gold/80 font-light tabular-nums">${paymentSchedule.depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/35 font-light">Balance (70%)</span>
                      <span className="text-white/45 font-light tabular-nums">${paymentSchedule.balanceAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-px bg-white/[0.05]" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-white/65 text-sm font-light">Due Now</span>
                      <span className="text-tbc-gold text-xl font-extralight tabular-nums">${paymentSchedule.depositAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {selectedPaymentTerm === 'full' && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/65 text-sm font-light">Due Now</span>
                    <span className="text-tbc-gold text-xl font-extralight tabular-nums">${costs.total.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="px-7 pb-7">
                <Button
                  onClick={handleBooking}
                  disabled={
                    !bookingData.firstName || !bookingData.lastName || !bookingData.email ||
                    (bookingType === 'property' && (!checkInDate || !checkOutDate)) ||
                    (bookingType === 'property' && getActiveRoomBookings().length === 0) ||
                    (bookingType === 'package' && !packageStartDate) ||
                    (bookingData.needsAirportTransfer && (!arrivalDate || !bookingData.arrivalTime || !departureDate || !bookingData.departureTime))
                  }
                  className="w-full bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  {selectedPaymentTerm === 'deposit' ? 'Pay Deposit Now' : 'Pay Full Amount'}
                </Button>

                <div className="flex items-start gap-2 mt-4">
                  <Shield className="w-3 h-3 text-tbc-gold/30 mt-0.5 flex-shrink-0" />
                  <p className="text-white/18 text-[9px] font-light leading-relaxed tracking-wide">
                    30 days prior: 50% forfeited · 29–15 days: 75% forfeited · 14 days &amp; no-shows: 100% forfeited. Rates subject to availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
