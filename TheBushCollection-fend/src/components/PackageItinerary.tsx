import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Camera } from 'lucide-react';
import { ItineraryDay } from '@/types/package';

interface PackageItineraryProps {
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
    image?: string;
  }>;
  packageName?: string;
}

const PackageItinerary: React.FC<PackageItineraryProps> = ({ itinerary, packageName }) => {
  if (!itinerary || itinerary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Itinerary Coming Soon</h3>
            <p className="text-gray-600">
              Detailed day-by-day itinerary will be available soon. Contact us for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {itinerary.map((day, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="bg-yellow-50 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {day.day}
              </div>
              <CardTitle className="text-lg text-yellow-800">
                Day {day.day}: {day.title}
              </CardTitle>
              <Badge variant="outline" className="ml-2 border-yellow-200 text-yellow-700">
                Day {day.day}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {day.image && (
                <img
                  src={day.image}
                  alt={`Day ${day.day} image`}
                  className="w-full md:w-64 h-56 object-cover rounded shadow"
                />
              )}
              <div className="flex-1">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {day.description}
                </p>
                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                      Day Activities
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {/* Footer note */}
      <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <p className="text-sm text-orange-800">
          <strong>Note:</strong> This itinerary is a general outline and may be adjusted based on weather conditions,
          wildlife sightings, and guest preferences. Your safari guide will provide daily briefings and updates.
        </p>
      </div>
    </div>
  );
};

export default PackageItinerary;
