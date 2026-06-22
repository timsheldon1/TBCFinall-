import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Phone, Mail, Plane, Car, Clock, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GuestMovement {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  type: 'arrival' | 'departure';
  date: string;
  time: string;
  status: string;
  transferType?: string;
  contactInfo: {
    phone?: string;
    email?: string;
  };
  adults: number;
  children: number;
  flightNumber?: string;
  specialRequests?: string;
}

interface GuestVoucherProps {
  movement: GuestMovement;
  booking?: any; // Optional booking details if available
}

const GuestVoucher: React.FC<GuestVoucherProps> = ({ movement, booking }) => {
  const isArrival = movement.type === 'arrival';
  const voucherNumber = `VC-${movement.bookingId}-${movement.id}`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-green-600 pb-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Safari Tours</h1>
        <p className="text-lg text-gray-600">Guest {isArrival ? 'Welcome' : 'Departure'} Voucher</p>
        <div className="flex justify-between items-center mt-4">
          <div className="text-left">
            <p className="text-sm text-gray-600">Voucher Number</p>
            <p className="font-semibold text-green-700">{voucherNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date Issued</p>
            <p className="font-semibold">{format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Guest Information */}
      <Card className="mb-6">
        <CardHeader className="bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-semibold text-green-800">Guest Information</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Guest Name</p>
              <p className="font-semibold text-lg">{movement.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Guests</p>
              <p className="font-semibold text-lg">{movement.adults + movement.children} ({movement.adults} adults, {movement.children} children)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Phone</p>
              <p className="font-semibold">{movement.contactInfo.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Email</p>
              <p className="font-semibold">{movement.contactInfo.email || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement Details */}
      <Card className="mb-6">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center">
            {isArrival ? (
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            ) : (
              <Plane className="h-5 w-5 mr-2 text-blue-600" />
            )}
            <span className="font-semibold text-blue-800">
              {isArrival ? 'Arrival' : 'Departure'} Details
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Property</p>
              <p className="font-semibold text-lg">{movement.propertyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-semibold text-lg">{movement.roomName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-lg">{format(parseISO(movement.date), 'EEEE, MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold text-lg">{movement.time}</p>
            </div>
          </div>

          {/* Transfer Information */}
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Transfer Type</p>
              <div className="flex items-center mt-1">
                {movement.transferType === 'airport' ? (
                  <Plane className="h-4 w-4 mr-2 text-blue-600" />
                ) : movement.transferType === 'inter-camp' ? (
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                ) : (
                  <Car className="h-4 w-4 mr-2 text-gray-600" />
                )}
                <span className="font-semibold capitalize">{movement.transferType || 'Self-drive'}</span>
              </div>
            </div>
            {movement.flightNumber && (
              <div>
                <p className="text-sm text-gray-600">Flight Number</p>
                <p className="font-semibold text-lg">{movement.flightNumber}</p>
              </div>
            )}
          </div>

          {/* Special Requests */}
          {movement.specialRequests && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">{movement.specialRequests}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="mb-6">
        <CardHeader className="bg-orange-50">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            <span className="font-semibold text-orange-800">Important Information</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Check-in/Check-out Times</h4>
              <p>Check-in: 2:00 PM</p>
              <p>Check-out: 11:00 AM</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Emergency Contact</h4>
              <p>24/7 Support: +1-800-SAFARI</p>
              <p>Emergency: +1-800-HELP-911</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <p className="font-semibold text-green-700">Safari Tours</p>
            <p>Creating unforgettable safari experiences</p>
          </div>
          <div>
            <p className="font-semibold">Contact Information</p>
            <p>+254 116072343</p>
            <p>info@thebushcollection.africa</p>
          </div>
          <div>
            <p className="font-semibold">Address</p>
            <p>42 Claret Close, Silanga Road, Karen</p>
            <p>P.O BOX 58671-00200, Nairobi</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          This voucher is valid only for the specified date and guest. Please present this voucher upon arrival.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Generated on {format(new Date(), 'MMM dd, yyyy \'at\' h:mm a')}
        </p>
      </div>
    </div>
  );
};

export default GuestVoucher;
