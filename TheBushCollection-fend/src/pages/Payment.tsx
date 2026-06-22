import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, ArrowLeft, Check } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useAmenities } from '@/hooks/useAmenities';
import { toast } from 'sonner';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addBooking } = useBookings();
  const { amenities } = useAmenities();
  
  // Get booking data from URL params
  const propertyId = searchParams.get('propertyId') || '';
  const propertyName = searchParams.get('propertyName') || '';
  const roomName = searchParams.get('roomName') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1');
  const nights = parseInt(searchParams.get('nights') || '1');
  const pricePerNight = parseFloat(searchParams.get('pricePerNight') || '0');
  const customerName = searchParams.get('customerName') || '';
  const customerEmail = searchParams.get('customerEmail') || '';
  const customerPhone = searchParams.get('customerPhone') || '';
  const specialRequests = searchParams.get('specialRequests') || '';
  const selectedAmenityIds = searchParams.get('amenities')?.split(',').filter(Boolean) || [];

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate pricing
  const selectedAmenities = amenities?.filter(a => selectedAmenityIds.includes(a.id)) || [];
  const roomSubtotal = nights * pricePerNight;
  const amenitiesSubtotal = selectedAmenities.reduce((sum, amenity) => sum + amenity.price, 0);
  const subtotal = roomSubtotal + amenitiesSubtotal;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  // Redirect if no booking data
  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut || !customerName) {
      navigate('/book');
    }
  }, [propertyId, checkIn, checkOut, customerName, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    if (!cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking
      const newBooking = {
        propertyId,
        propertyName,
        roomId: 'room-1',
        roomName,
        roomType: 'standard',
        customerName,
        customerEmail,
        customerPhone,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight,
        total,
        specialRequests,
        status: 'confirmed' as const
      };

      await addBooking(newBooking);

      toast.success('Payment successful! Your booking has been confirmed.');
      
      // Redirect to confirmation page
      navigate(`/booking-confirmation?bookingId=${Date.now()}&total=${total.toFixed(2)}`);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!propertyId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600">Secure checkout for your safari booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="mt-1"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                <Lock className="h-4 w-4 text-green-600" />
                Your payment information is encrypted and secure
              </div>

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Details */}
              <div>
                <h3 className="font-semibold text-lg mb-2">{propertyName}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-medium">Room:</span> {roomName}</div>
                  <div><span className="font-medium">Check-in:</span> {new Date(checkIn).toLocaleDateString()}</div>
                  <div><span className="font-medium">Check-out:</span> {new Date(checkOut).toLocaleDateString()}</div>
                  <div><span className="font-medium">Guests:</span> {guests}</div>
                  <div><span className="font-medium">Nights:</span> {nights}</div>
                </div>
              </div>

              <Separator />

              {/* Guest Information */}
              <div>
                <h4 className="font-semibold mb-2">Guest Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>{customerName}</div>
                  <div>{customerEmail}</div>
                  {customerPhone && <div>{customerPhone}</div>}
                </div>
              </div>

              {/* Selected Amenities */}
              {selectedAmenities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Selected Amenities</h4>
                    <div className="space-y-2">
                      {selectedAmenities.map((amenity) => (
                        <div key={amenity.id} className="flex justify-between items-center">
                          <span className="text-sm">{amenity.name}</span>
                          <Badge variant="outline">${amenity.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Special Requests */}
              {specialRequests && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-sm text-gray-600">{specialRequests}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Room ({nights} nights × ${pricePerNight})</span>
                    <span>${roomSubtotal.toFixed(2)}</span>
                  </div>
                  {amenitiesSubtotal > 0 && (
                    <div className="flex justify-between">
                      <span>Amenities</span>
                      <span>${amenitiesSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (15%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}