import { Booking } from '@/hooks/useBookings';
import { Property } from '@/data/properties';
import { Package } from '@/data/packages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, MapPin, Clock, Calendar } from 'lucide-react';

interface ItineraryProps {
  booking: Booking;
  property: Property;
  selectedPackage?: Package;
}

const Itinerary = ({ booking, property, selectedPackage }: ItineraryProps) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Generate daily itinerary based on property type and package
  const generateDailyActivities = () => {
    const activities = [];
    const baseActivities = {
      lodge: [
        'Morning game drive',
        'Afternoon relaxation at lodge',
        'Evening sundowner',
        'Night game drive (optional)'
      ],
      camp: [
        'Early morning bush walk',
        'Traditional lunch',
        'Cultural village visit',
        'Campfire dinner with stories'
      ],
      villa: [
        'Private game drive',
        'Spa treatment',
        'Gourmet dining experience',
        'Star gazing from private deck'
      ]
    };

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayActivities = baseActivities[property.type] || baseActivities.lodge;
      activities.push({
        day: i + 1,
        date: currentDate,
        activities: dayActivities
      });
    }

    return activities;
  };

  const dailyActivities = generateDailyActivities();

  const handleDownload = () => {
    const itineraryContent = `
SAFARI TOURS ITINERARY
======================

${booking.guestName}'s Safari Adventure
Booking ID: ${booking.id}

TRIP OVERVIEW
-------------
Destination: ${property.name}
Location: ${property.location}
Duration: ${nights} nights
Dates: ${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}
Guests: ${booking.guests} people
${selectedPackage ? `Package: ${selectedPackage.name}` : ''}

DAILY ITINERARY
---------------
${dailyActivities.map(day => `
Day ${day.day} - ${day.date.toLocaleDateString()}
${day.activities.map(activity => `• ${activity}`).join('\n')}
`).join('\n')}

IMPORTANT INFORMATION
--------------------
• Check-in time: 2:00 PM
• Check-out time: 11:00 AM
• All game drives include professional guide
• Meals are included as per package selection
• Emergency contact: +1-800-SAFARI

WHAT TO BRING
-------------
• Comfortable walking shoes
• Sun hat and sunscreen
• Camera with extra batteries
• Binoculars (can be provided)
• Light jacket for evening game drives
• Personal medications

CONTACT INFORMATION
------------------
Safari Tours
Email: info@safaritours.com
Phone: +1-800-SAFARI
Emergency: +1-800-HELP-911

Have an amazing safari adventure!
    `;

    const blob = new Blob([itineraryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safari-itinerary-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center bg-green-50">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-green-800">
          <Calendar className="w-6 h-6" />
          Your Safari Itinerary
        </CardTitle>
        <p className="text-green-600">{booking.guestName}'s Adventure</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Trip Overview */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-amber-800">Trip Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-gray-600">Destination</p>
                <p className="font-medium">{property.name}</p>
                <p className="text-gray-500 text-xs">{property.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-medium">{nights} nights</p>
                <p className="text-gray-500 text-xs">{booking.guests} guests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Information */}
        {selectedPackage && (
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Selected Package</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">{selectedPackage.name}</Badge>
                <span className="text-sm text-gray-600">{selectedPackage.duration}</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{selectedPackage.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedPackage.includes.map((item, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Itinerary */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Daily Itinerary</h3>
          <div className="space-y-4">
            {dailyActivities.map((day, index) => (
              <Card key={index} className="border-l-4 border-l-amber-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-semibold">Day {day.day}</h4>
                      <p className="text-sm text-gray-600">{day.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></div>
                        {activity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Check-in/Check-out</h4>
              <p className="text-gray-600">Check-in: 2:00 PM</p>
              <p className="text-gray-600">Check-out: 11:00 AM</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Emergency Contact</h4>
              <p className="text-gray-600">24/7 Support: +1-800-SAFARI</p>
              <p className="text-gray-600">Emergency: +1-800-HELP-911</p>
            </div>
          </div>
        </div>

        {/* What to Bring */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-800">What to Bring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Comfortable walking shoes',
              'Sun hat and sunscreen',
              'Camera with extra batteries',
              'Binoculars (can be provided)',
              'Light jacket for evening drives',
              'Personal medications'
            ].map((item, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center pt-4 border-t">
          <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Download Itinerary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Itinerary;