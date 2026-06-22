import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBookings } from '@/hooks/useBookings';
import { Property } from '@/data/properties';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface BookingCalendarProps {
  selectedProperty: Property | null;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  selectedDates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
}

const BookingCalendar = ({ selectedProperty, onDateSelect, selectedDates }: BookingCalendarProps) => {
  const { getPropertyBookings, isDateRangeAvailable, getNextAvailableDate } = useBookings();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  useEffect(() => {
    if (selectedProperty) {
      const bookings = getPropertyBookings(selectedProperty.id);
      const dates: Date[] = [];
      
      bookings.forEach(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const currentDate = new Date(checkIn);
        
        while (currentDate < checkOut) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
      
      setBookedDates(dates);
    }
  }, [selectedProperty, getPropertyBookings]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !selectedProperty) return;

    if (!selectingCheckOut && !selectedDates.checkIn) {
      // Selecting check-in date
      const isBooked = bookedDates.some(bookedDate => 
        bookedDate.toDateString() === date.toDateString()
      );
      
      if (isBooked) {
        const nextAvailable = getNextAvailableDate(selectedProperty.id, date.toISOString());
        const nextDate = new Date(nextAvailable);
        onDateSelect(nextDate, null);
        setSelectingCheckOut(true);
      } else {
        onDateSelect(date, null);
        setSelectingCheckOut(true);
      }
    } else if (selectingCheckOut && selectedDates.checkIn) {
      // Selecting check-out date
      if (date <= selectedDates.checkIn) {
        // Reset if check-out is before check-in
        onDateSelect(date, null);
        setSelectingCheckOut(true);
        return;
      }

      // Check if the range is available
      const checkInStr = selectedDates.checkIn.toISOString().split('T')[0];
      const checkOutStr = date.toISOString().split('T')[0];
      
      if (isDateRangeAvailable(selectedProperty.id, checkInStr, checkOutStr)) {
        onDateSelect(selectedDates.checkIn, date);
        setSelectingCheckOut(false);
      } else {
        // Find next available checkout date
        const nextAvailable = getNextAvailableDate(selectedProperty.id, date.toISOString());
        const nextDate = new Date(nextAvailable);
        onDateSelect(selectedDates.checkIn, nextDate);
        setSelectingCheckOut(false);
      }
    }
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    return date >= selectedDates.checkIn && date <= selectedDates.checkOut;
  };

  const modifiers = {
    booked: bookedDates,
    selected: selectedDates.checkIn ? [selectedDates.checkIn] : [],
    range: selectedDates.checkIn && selectedDates.checkOut ? 
      Array.from({ length: Math.ceil((selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1 }, 
        (_, i) => {
          const date = new Date(selectedDates.checkIn!);
          date.setDate(date.getDate() + i);
          return date;
        }) : []
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: '#ef4444',
      color: 'white',
      fontWeight: 'bold'
    },
    selected: {
      backgroundColor: '#f59e0b',
      color: 'white',
      fontWeight: 'bold'
    },
    range: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Select Your Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProperty ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Booked
                </Badge>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  Selected
                </Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  <div className="w-3 h-3 bg-yellow-300 rounded-full mr-2"></div>
                  Your Stay
                </Badge>
              </div>

              <Calendar
                mode="single"
                selected={selectedDates.checkIn || undefined}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />

              {selectedDates.checkIn && selectedDates.checkOut && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Selected Dates:</h4>
                  <p className="text-green-700">
                    Check-in: {selectedDates.checkIn.toLocaleDateString()}
                  </p>
                  <p className="text-green-700">
                    Check-out: {selectedDates.checkOut.toLocaleDateString()}
                  </p>
                  <p className="text-green-700 font-medium">
                    Duration: {Math.ceil((selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                  </p>
                </div>
              )}

              {selectingCheckOut && selectedDates.checkIn && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Now select your check-out date. Red dates are unavailable.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a property first to view availability.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;