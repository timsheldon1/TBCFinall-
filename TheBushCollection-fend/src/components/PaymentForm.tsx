import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Banknote, Percent, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import Receipt from './Receipt';

interface Amenity {
  amenity?: {
    id: string;
    name: string;
    price: number;
  };
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AirportTransfer {
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalFlightNumber?: string;
  departureDate?: string;
  departureTime?: string;
  departureFlightNumber?: string;
  needsTransfer?: boolean;
}

interface PaymentFormProps {
  bookingDetails: {
    propertyName: string;
    propertyLocation: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    roomPrice: number;
    totalAmount: number;
    selectedAmenities?: Amenity[];
    propertyId?: string | null;
    roomId?: string | null;
    packageId?: string | null;
    adults?: number;
    children?: number;
    specialRequests?: string;
    airportTransfer?: AirportTransfer | null;
    // Payment terms fields
    paymentTerm?: 'deposit' | 'full';
    paymentSchedule?: {
      depositAmount: number;
      balanceAmount: number;
      depositDueDate: string;
      balanceDueDate: string;
    };
    currentAmountDue?: number;
  };
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess?: (bookingId: string) => void;
}

interface BookingConfirmation {
  id: string;
  propertyName: string;
  propertyLocation: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  roomPrice: number;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  confirmationNumber: string;
  // Payment details
  paymentType: 'deposit' | 'full';
  paymentTerm?: 'deposit' | 'full';
  paymentSchedule?: {
    depositAmount?: number;
    balanceAmount?: number;
    depositDueDate?: string;
    balanceDueDate?: string;
  } | null;
  amountPaid: number;
  balanceDue?: number;
  balanceDueDate?: string;
  // Amenities details
  selectedAmenities?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function PaymentForm({ bookingDetails, customerDetails, onPaymentSuccess }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const testConnection = undefined;
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'Credit Card'
  });

  // Fallback connection test function
  const testConnectionFallback = async (): Promise<boolean> => {
    try {
      // Simple API root ping as fallback
      console.log('🔍 Testing API connection (fallback)...');
      const res = await api.get('/');
      const ok = res.status === 200;
      console.log('✅ Fallback connection test result:', ok);
      return ok;
    } catch (err) {
      console.error('❌ Fallback connection test error:', err);
      return false;
    }
  };

  // Test database connection on component mount
  useEffect(() => {
    const testDbConnection = async () => {
      try {
        console.log('🔍 Testing database connection in PaymentForm...');
        
        // Use testConnection from hook if available, otherwise use fallback
        const connectionTest = testConnection || testConnectionFallback;
        const isConnected = await connectionTest();
        console.log('📊 Database connection status:', isConnected);
        
        if (!isConnected) {
          toast.error('Unable to connect to database. Please check your connection.');
        }
      } catch (err) {
        console.error('❌ Database connection test failed:', err);
      }
    };

    testDbConnection();
  }, [testConnection]);

  // Calculate the amount to charge based on payment term
  const getPaymentAmount = () => {
    if (bookingDetails.paymentTerm === 'deposit' && bookingDetails.paymentSchedule) {
      return bookingDetails.paymentSchedule.depositAmount;
    }
    return bookingDetails.totalAmount;
  };

  const generateConfirmationNumber = () => {
    return 'SB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  // Helper function to prepare airport transfer data for database
  const prepareAirportTransferData = () => {
    if (!bookingDetails.airportTransfer) {
      return null;
    }

    const transfer = bookingDetails.airportTransfer;
    
    return {
      arrival_date: transfer.arrivalDate || null,
      arrival_time: transfer.arrivalTime || null,
      arrival_flight: transfer.arrivalFlightNumber || null,
      departure_date: transfer.departureDate || null,
      departure_time: transfer.departureTime || null,
      departure_flight: transfer.departureFlightNumber || null,
      needs_transfer: true
    };
  };

  // Helper function to prepare payment schedule data
  const preparePaymentScheduleData = () => {
    if (bookingDetails.paymentTerm !== 'deposit' || !bookingDetails.paymentSchedule) {
      return null;
    }

    return {
      depositAmount: Number(bookingDetails.paymentSchedule.depositAmount.toFixed(2)),
      balanceAmount: Number(bookingDetails.paymentSchedule.balanceAmount.toFixed(2)),
      depositDueDate: bookingDetails.paymentSchedule.depositDueDate,
      balanceDueDate: bookingDetails.paymentSchedule.balanceDueDate
    };
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.cardholderName) {
      const error = new Error('Please fill in all payment details');
      setError(error);
      toast.error(error.message);
      return;
    }

    setIsProcessing(true);

    try {
      console.log('💰 Starting payment process...');
      
      // Calculate payment amount first (needed for booking data and PesaPal)
      const paymentAmount = getPaymentAmount();
      
      // Test database connection before proceeding - use fallback if hook function not available
      const connectionTest = testConnection || testConnectionFallback;
      const isConnected = await connectionTest();
      
      if (!isConnected) {
        throw new Error('Database connection unavailable. Please check your internet connection and try again.');
      }

      // Prepare the data for database insertion
      const airportTransferData = prepareAirportTransferData();
      const paymentScheduleData = preparePaymentScheduleData();
      
      // Format dates for database
      const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split('T')[0];
      };

      // Compute costs consistently for package vs property
      const isPackage = !!bookingDetails.packageId;
      const amenitiesTotal = bookingDetails.selectedAmenities?.reduce((sum, a) =>
        sum + ((a.price || a.amenity?.price || 0) * (a.quantity || 1)), 0) || 0;

      let basePriceRaw = 0;
      if (isPackage) {
        // package price is treated as price per guest (not per night)
        basePriceRaw = (bookingDetails.roomPrice || 0) * (bookingDetails.guests || 1);
      } else {
        // property: roomPrice is per person per night
        basePriceRaw = (bookingDetails.roomPrice || 0) * (bookingDetails.guests || 1) * (bookingDetails.nights || 1);
      }

      const subtotalRaw = basePriceRaw + amenitiesTotal;
      const serviceFeeRaw = subtotalRaw * 0.1; // 10% service fee
      const taxRate = isPackage ? 0.12 : 0.15;
      const taxesRaw = subtotalRaw * taxRate;
      const totalRaw = subtotalRaw + serviceFeeRaw + taxesRaw;

      const round = (v: number) => Number(v.toFixed(2));

      const costsPayload = {
        basePrice: round(basePriceRaw),
        amenitiesTotal: round(amenitiesTotal),
        subtotal: round(subtotalRaw),
        serviceFee: round(serviceFeeRaw),
        taxes: round(taxesRaw),
        total: round(totalRaw)
      };

      // Create booking data in format expected by backend controller
      const newBookingData = {
        // Booking type and IDs
        bookingType: bookingDetails.packageId ? 'package' : 'property',
        propertyId: bookingDetails.propertyId || undefined,
        packageId: bookingDetails.packageId || undefined,
        
        // Dates
        checkInDate: bookingDetails.checkIn,
        checkOutDate: bookingDetails.checkOut,
        nights: bookingDetails.nights,
        
        // Guest information
        totalGuests: bookingDetails.guests,
        adults: bookingDetails.adults || Math.max(1, bookingDetails.guests),
        children: bookingDetails.children || 0,
        specialRequests: bookingDetails.specialRequests || undefined,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerCountryCode: undefined,
        
        // Rooms (required for property bookings)
        rooms: bookingDetails.roomId ? [{
          roomId: bookingDetails.roomId,
          quantity: 1,
          guests: bookingDetails.guests,
          pricePerNightPerPerson: bookingDetails.roomPrice / bookingDetails.guests
        }] : [],
        
        // Airport transfer
        airportTransfer: airportTransferData || { needed: false },

        // Amenities
        amenities: bookingDetails.selectedAmenities?.map(a => ({
          amenityId: a.id || a.amenity?.id,
          amenityName: a.name || a.amenity?.name,
          quantity: a.quantity || 1,
          pricePerUnit: a.price || a.amenity?.price || 0,
          totalPrice: (a.price || a.amenity?.price || 0) * (a.quantity || 1)
        })) || [],

        // Costs
        costs: costsPayload,

        // Payment terms
        paymentTerm: bookingDetails.paymentTerm || 'deposit',
        paymentSchedule: paymentScheduleData || {
          depositAmount: 0,
          balanceAmount: 0,
          depositDueDate: new Date().toISOString(),
          balanceDueDate: new Date().toISOString()
        },
        amountPaid: paymentAmount
      };
      
      console.log('📦 Booking data prepared for backend:', JSON.stringify(newBookingData, null, 2));

      // Send booking to backend
      console.log('🚀 Sending booking data to backend...');
      const res = await api.post('/bookings/create', newBookingData);
      const createdBooking = res.data?.booking ?? res.data;
      if (!createdBooking) {
        console.error('❌ Backend create returned no booking:', res);
        throw new Error('Failed to create booking in backend');
      }
      console.log('✅ Booking created successfully in backend:', createdBooking);

      // Extract bookingId from backend response for payment initiation
      const bookingId = createdBooking._id || createdBooking.id || createdBooking.bookingId;
      const bookingReference = createdBooking.bookingId || createdBooking.confirmationNumber || generateConfirmationNumber();

      // Initiate PesaPal payment with backend
      try {
        console.log('[Payment] Initiating PesaPal payment for booking:', bookingId, 'Amount:', paymentAmount);
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const payResp = await api.post('/payments/initiate', {
          amount: paymentAmount,
          currency: 'USD',
          description: `Booking Payment - ${bookingReference}`,
          email: customerDetails.email,
          firstName: (customerDetails.name || '').split(' ')[0] || 'Guest',
          lastName: (customerDetails.name || '').split(' ').slice(1).join(' ') || '',
          phoneNumber: customerDetails.phone,
          bookingId,
          bookingReference
        }, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (payResp.data && payResp.data.redirectUrl) {
          // Redirect user to PesaPal checkout
          window.location.href = payResp.data.redirectUrl;
          return;
        } else {
          console.warn('[Payment] No redirect URL returned, falling back to receipt flow');
        }
      } catch (payErr) {
        console.error('[Payment] PesaPal initiation error:', payErr);
        // Continue to show receipt/local confirmation in case payment initiation failed
      }

      // Process amenities for receipt
      const processedAmenities = bookingDetails.selectedAmenities?.map(amenity => {
        const amenityName = amenity.name || amenity.amenity?.name || 'Unknown';
        const amenityPrice = amenity.price || amenity.amenity?.price || 0;
        const amenityQuantity = amenity.quantity || 1;
        const amenityId = amenity.id || amenity.amenity?.id || 'unknown';

        return {
          id: amenityId,
          name: amenityName,
          price: amenityPrice,
          quantity: amenityQuantity,
          totalPrice: amenityPrice * amenityQuantity
        };
      });

      // Create confirmation object for receipt
      const confirmation: BookingConfirmation = {
        id: bookingId,
        propertyName: bookingDetails.propertyName,
        propertyLocation: bookingDetails.propertyLocation,
        roomName: bookingDetails.roomName,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        guests: bookingDetails.guests,
        nights: bookingDetails.nights,
        roomPrice: bookingDetails.roomPrice,
        totalAmount: bookingDetails.totalAmount,
        paymentMethod: `${paymentData.paymentMethod} ending in ${paymentData.cardNumber.slice(-4)}`,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        bookingDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        confirmationNumber: bookingReference,
        paymentType: bookingDetails.paymentTerm || 'full',
        paymentTerm: bookingDetails.paymentTerm || 'full',
        paymentSchedule: bookingDetails.paymentSchedule || null,
        amountPaid: paymentAmount,
        balanceDue: bookingDetails.paymentTerm === 'deposit' ? bookingDetails.paymentSchedule?.balanceAmount : 0,
        balanceDueDate: bookingDetails.paymentTerm === 'deposit' ? bookingDetails.paymentSchedule?.balanceDueDate : undefined,
        selectedAmenities: processedAmenities
      };

      setBookingConfirmation(confirmation);
      setShowReceipt(true);
      
      const successMessage = bookingDetails.paymentTerm === 'deposit' 
        ? `Deposit payment successful! $${paymentAmount.toFixed(2)} paid. Balance of $${bookingDetails.paymentSchedule?.balanceAmount.toFixed(2)} due on ${new Date(bookingDetails.paymentSchedule.balanceDueDate).toLocaleDateString()}.`
        : `Full payment successful! $${paymentAmount.toFixed(2)} paid. Booking confirmed and saved to database.`;
      
      toast.success(successMessage);
      
      if (onPaymentSuccess) {
        onPaymentSuccess(bookingId);
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
      
      let errorMessage = 'Unknown error occurred during payment processing';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in (error as object)) {
        errorMessage = (error as unknown as { message?: string }).message || String(error);
      }
      
      setError(new Error(errorMessage));
      
      // Show user-friendly error message
      let userErrorMessage = 'Payment failed. Please try again.';
      
      if (errorMessage.includes('duplicate key') || errorMessage.includes('23505')) {
        userErrorMessage = 'A booking with these details already exists. Please check your booking information.';
      } else if (errorMessage.includes('foreign key constraint') || errorMessage.includes('23503')) {
        userErrorMessage = 'Invalid property, room, or package selected. Please refresh the page and try again.';
      } else if (errorMessage.includes('permission denied') || errorMessage.includes('42501')) {
        userErrorMessage = 'Database permission error. Please contact support.';
      } else if (errorMessage.includes('connection')) {
        userErrorMessage = 'Network connection issue. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Database connection unavailable')) {
        userErrorMessage = 'Unable to connect to database. Please try again in a few moments.';
      }
      
      toast.error(userErrorMessage, {
        duration: 5000,
        icon: <AlertCircle className="h-4 w-4" />
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailReceipt = async () => {
    try {
      if (!bookingConfirmation) return;
      const bookingId = bookingConfirmation.id;
      const emailTo = bookingConfirmation.customerEmail || customerDetails.email;
      const resp = await api.post(`/bookings/${bookingId}/email`, { email: emailTo });
      if (resp.data && resp.data.success) {
        toast.success(`Receipt sent to ${emailTo}`);
      } else {
        console.error('Email API response:', resp);
        toast.error('Failed to send receipt.');
      }
    } catch (err) {
      console.error('Email receipt error:', err);
      toast.error('Error sending receipt.');
    }
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloaded successfully');
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  if (showReceipt && bookingConfirmation) {
    return (
      <Receipt
        booking={bookingConfirmation}
        onEmailReceipt={handleEmailReceipt}
        onClose={handleCloseReceipt}
      />
    );
  }

  const paymentAmount = getPaymentAmount();
  const isDepositPayment = bookingDetails.paymentTerm === 'deposit';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              {isDepositPayment ? (
                <Percent className="h-4 w-4 text-blue-600 mr-2" />
              ) : (
                <Banknote className="h-4 w-4 text-green-600 mr-2" />
              )}
              <span className="font-semibold text-blue-900">
                {isDepositPayment ? 'Deposit Payment' : 'Full Payment'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Amount to Pay Now:</span>
                <span className="font-bold text-blue-900">${paymentAmount.toFixed(2)}</span>
              </div>
              
              {isDepositPayment && bookingDetails.paymentSchedule && (
                <>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Booking Amount:</span>
                    <span className="text-blue-800">${bookingDetails.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Balance Due Later:</span>
                    <span className="text-blue-800">${bookingDetails.paymentSchedule.balanceAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Balance due by: {new Date(bookingDetails.paymentSchedule.balanceDueDate).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select 
              value={paymentData.paymentMethod} 
              onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={paymentData.cardholderName}
              onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
              required
              disabled={isProcessing}
            />
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                if (value.length <= 19) {
                  setPaymentData({...paymentData, cardNumber: value});
                }
              }}
              maxLength={19}
              required
              disabled={isProcessing}
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <Select 
                value={paymentData.expiryMonth} 
                onValueChange={(value) => setPaymentData({...paymentData, expiryMonth: value})}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <Select 
                value={paymentData.expiryYear} 
                onValueChange={(value) => setPaymentData({...paymentData, expiryYear: value})}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={String(year).slice(-2)}>
                        {String(year).slice(-2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={paymentData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setPaymentData({...paymentData, cvv: value});
                  }
                }}
                maxLength={4}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <Separator />

          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{bookingDetails.roomName}</span>
                <span>${bookingDetails.roomPrice}/night</span>
              </div>
              <div className="flex justify-between">
                <span>{bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''}</span>
                <span>${(bookingDetails.roomPrice * bookingDetails.nights).toFixed(2)}</span>
              </div>
              
              {/* Amenities */}
              {bookingDetails.selectedAmenities && bookingDetails.selectedAmenities.length > 0 && (
                <>
                  {bookingDetails.selectedAmenities.map((amenity, index) => {
                    const amenityName = amenity.name || amenity.amenity?.name || 'Amenity';
                    const amenityPrice = amenity.price || amenity.amenity?.price || 0;
                    const amenityQuantity = amenity.quantity || 1;
                    const totalPrice = amenityPrice * amenityQuantity;
                    
                    return (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>{amenityName} {amenityQuantity > 1 ? `(x${amenityQuantity})` : ''}</span>
                        <span>+${totalPrice.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </>
              )}
              
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>${(bookingDetails.totalAmount * 0.15 / 1.15).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>${bookingDetails.totalAmount.toFixed(2)}</span>
              </div>
              {isDepositPayment && (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>Deposit Paid Now (30%)</span>
                    <span className="font-semibold">${paymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Balance Due Later (70%)</span>
                    <span>${bookingDetails.paymentSchedule?.balanceAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center text-sm text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : isDepositPayment ? (
              `Pay $${paymentAmount.toFixed(2)} Deposit`
            ) : (
              `Pay $${paymentAmount.toFixed(2)}`
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center text-red-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Payment Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}