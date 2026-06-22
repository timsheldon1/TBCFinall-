import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Mail, MapPin, Calendar, Users, CreditCard } from 'lucide-react';

interface BookingDetails {
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
  paymentTerm?: 'deposit' | 'full';
  paymentSchedule?: {
    depositAmount?: number;
    balanceAmount?: number;
    depositDueDate?: string;
    balanceDueDate?: string;
  } | null;
  amountPaid?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  confirmationNumber: string;
  selectedAmenities?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
    totalPrice?: number;
  }>;
}

interface ReceiptProps {
  booking: BookingDetails;
  onEmailReceipt?: () => void;
  onClose?: () => void;
}

export default function Receipt({ booking, onEmailReceipt, onClose }: ReceiptProps) {
  const taxes = booking.totalAmount * 0.1; // 10% tax
  const subtotal = booking.totalAmount - taxes;
  const amenitiesTotal = booking.selectedAmenities?.reduce((total, amenity) => {
    const quantity = amenity.quantity || 1;
    const price = amenity.totalPrice || (amenity.price * quantity);
    return total + price;
  }, 0) || 0;
  // For packages, roomPrice is a package price per guest (not per night)
  const isPackageBooking = booking.roomName === 'Package Booking' || !booking.propertyLocation;
  const roomTotal = isPackageBooking
    ? (booking.roomPrice || 0) * (booking.guests || 1)
    : (booking.roomPrice || 0) * (booking.nights || 1);
  const receiptRef = useRef<HTMLDivElement>(null);
  

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    const element = receiptRef.current;
    if (!element) return;
  
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = 2; // Increased scale for better resolution
    
    const canvas = await html2canvas(element, { scale: scale });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
  
    // Add the first page of the image
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add new pages for remaining content
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    // Add the footer to the last page.
    pdf.text(
      'Thank you for choosing The Bush Collection • www.thebushcollection.africa',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  
    pdf.save(`Receipt_${booking.confirmationNumber}.pdf`);
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white">
      <Card className="shadow-lg" ref={receiptRef}>
        <CardHeader className="text-center bg-green-50 border-b">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600">
            Your booking has been confirmed. Here's your receipt:
          </p>
        </CardHeader>
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">The Bush Collection</h1>
            <p className="text-gray-600">Premium Safari Experiences</p>
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Receipt #{booking.confirmationNumber}
              </Badge>
              
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">{booking.propertyName}</span>
                </div>
                {booking.propertyLocation && (
                  <div className="text-gray-600 ml-6">{booking.propertyLocation}</div>
                )}
                {!isPackageBooking && booking.roomName && (
                  <div className="text-gray-600 ml-6">
                    <span className="font-medium">Room:</span> {booking.roomName}
                  </div>
                )}
                {isPackageBooking && (
                  <div className="text-gray-600 ml-6">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Safari Package
                    </Badge>
                  </div>
                )}
                <div className="flex items-center mt-3">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {booking.checkIn} - {booking.checkOut}
                  </span>
                </div>
                <div className="text-gray-600 ml-6">
                  {booking.nights} night{booking.nights > 1 ? 's' : ''}
                </div>
                <div className="flex items-center mt-3">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <div className="text-gray-600">{booking.customerName}</div>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <div className="text-gray-600">{booking.customerEmail}</div>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <div className="text-gray-600">{booking.customerPhone}</div>
                </div>
                <div>
                  <span className="font-medium">Booking Date:</span>
                  <div className="text-gray-600">{booking.bookingDate}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Payment Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {isPackageBooking ? 'Package' : 'Room'} Rate {isPackageBooking ? `(${booking.guests} guests)` : `(${booking.nights} night${booking.nights > 1 ? 's' : ''})`}
                  </span>
                  <span>${roomTotal.toFixed(2)}</span>
                </div>
                {amenitiesTotal > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Amenities & Add-ons</span>
                    <span>${amenitiesTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(roomTotal + amenitiesTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <Separator />
                {/* Payment term and breakdown */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Payment Term:</span>
                  <span>{booking.paymentTerm === 'deposit' ? 'Deposit (Partial Payment)' : 'Full Payment'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Amount Paid</span>
                  <span className="text-green-600">${(booking.amountPaid ?? booking.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Pending Balance</span>
                  <span className="text-orange-600">${((booking.totalAmount || 0) - (booking.amountPaid ?? booking.totalAmount)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Amenities */}
          {booking.selectedAmenities && booking.selectedAmenities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Selected Amenities & Add-ons</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {booking.selectedAmenities.map((amenity, index) => {
                    // Handle different possible data structures
                    const name = (amenity as any).name || (amenity as any).amenity?.name || 'Unknown Amenity';
                    const quantity = (amenity as any).quantity || 1;
                    const price = (amenity as any).totalPrice || (amenity as any).price * quantity || 0;

                    console.log('Receipt amenity data:', {
                      original: amenity,
                      name,
                      quantity,
                      price,
                      index
                    });

                    return (
                      <div key={(amenity as any).id || (amenity as any).amenityId || index} className="flex justify-between text-sm">
                        <span>
                          {name} × {quantity}
                        </span>
                        <span>${price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-8">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">
                <span className="font-medium">Payment Method:</span>{' '}
                {booking.paymentMethod}
              </span>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Important Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              Important Information
            </h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li><strong>Booking ID:</strong> {booking.id} (Keep this for your records)</li>
              {!isPackageBooking && (
                <>
                  <li>• Please arrive at the property by 3:00 PM on your check-in date</li>
                  <li>• Check-out time is 11:00 AM</li>
                </>
              )}
              {isPackageBooking && (
                <>
                  <li>• Your safari guide will contact you 24 hours before departure</li>
                  <li>• Please arrive at the meeting point 30 minutes before scheduled departure</li>
                </>
              )}
              <li>• Keep this receipt for your records</li>
              <li>• For any changes or cancellations, contact us at least 48 hours in advance</li>
              <li>• Emergency contact: +254 116072343</li>
            </ul>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t text-xs text-gray-500">
            <div className="flex justify-center mb-4">
              <img
                src="/images/PNG-LOGO (1).png"
                alt="The Bush Collection Logo"
                className="h-12 w-auto"
              />
            </div>

            <p>Thank you for choosing The Bush Collection!</p>
            <p className="mt-1">
              For support, contact us at{' '}
              <a
                href="mailto:support@thebushcollection.africa"
                className="text-green-700 hover:underline mx-1"
              >
                support@thebushcollection.africa
              </a>{' '}
              or call{' '}
              <span className="ml-1 font-medium text-gray-700">
                +254 116 072 343
              </span>
            </p>
          </div>          
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handlePrint} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>

            {onEmailReceipt && (
              <Button onClick={onEmailReceipt} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Receipt
              </Button>
            )}

            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            {onClose && <Button onClick={onClose}>Continue</Button>}
          </div>
    </div>
    
  );
}
