import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Clock, AlertTriangle, Info, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import CancellationRequestForm from '@/components/CancellationRequestForm';
import UserBookingsModal from '@/components/UserBookingsModal';

export default function CancellationRequest() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cancel Your Safari Booking
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Cancel your safari booking in just a few simple steps. Enter your email address to find all your bookings,
            select the one you want to cancel, and submit your request. Our team will review and process it according to our cancellation policy.
          </p>

          {/* View My Bookings Button */}
          <div className="mb-6">
            <UserBookingsModal>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                View My Bookings First
              </Button>
            </UserBookingsModal>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold text-gray-900 mb-2">Email-Based Search</h3>
              <p className="text-sm text-gray-600">
                Find all your bookings instantly by entering your email address.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Bookings</h3>
              <p className="text-sm text-gray-600">
                If you have multiple bookings, easily select which one to cancel.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-red-500" />
              <h3 className="font-semibold text-gray-900 mb-2">Quick Review</h3>
              <p className="text-sm text-gray-600">
                Our team reviews all requests within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Before cancelling:</strong> Make sure you're using the same email address that was used when making your safari booking. If you have multiple bookings, you'll be able to select which one to cancel.
          </AlertDescription>
        </Alert>

        {/* Cancellation Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-700">Free Cancellation (Within 24 Hours)</h3>
                  <span className="text-sm text-green-600">100% refund</span>
                </div>
                <p className="text-sm text-gray-600">Cancel within 24 hours of booking for full refund</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-700">14+ Days Prior to Check-in</h3>
                  <span className="text-sm text-green-600">75% refund</span>
                </div>
                <p className="text-sm text-gray-600">Cancel 14 or more days before check-in for 75% refund</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-yellow-700">7 Days Prior to Check-in</h3>
                  <span className="text-sm text-yellow-600">50% refund</span>
                </div>
                <p className="text-sm text-gray-600">Cancel between 7 days before check-in for 50% refund</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-red-700">Less Than 48 Hours</h3>
                  <span className="text-sm text-red-600">No refund</span>
                </div>
                <p className="text-sm text-gray-600">Cancel less than 48 hours before check-in or no-shows - no refund</p>
              </div>

            </div>
          </CardContent>
        </Card>


        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Immediate Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">info@thebushcollection.africa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-600">+254 116072343</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Request Form */}
        <CancellationRequestForm />

        {/* Additional Information */}
        <Alert className="mt-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Processing Time:</strong> Please allow 24-48 hours for request processing during business days.
            You will receive email updates at each step of the process.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
