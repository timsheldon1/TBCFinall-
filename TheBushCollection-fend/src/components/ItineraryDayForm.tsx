import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItineraryDayForm as ItineraryDayFormType } from '@/types/package';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  image?: string;
}

interface ItineraryDayFormProps {
  days: ItineraryDayFormType[];
  onChange: (days: ItineraryDayFormType[]) => void;
}

const ItineraryDayForm: React.FC<ItineraryDayFormProps> = ({ days, onChange }) => {
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string[]}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const validateDay = (day: ItineraryDay): string[] => {
    const errors: string[] = [];
    if (!day.title?.trim()) {
      errors.push('Title is required');
    }
    if (!day.description?.trim()) {
      errors.push('Description is required');
    }
    if (day.day < 1) {
      errors.push('Day number must be positive');
    }
    // Check for duplicate day numbers
    const duplicateDays = days.filter(d => d.day === day.day && d !== day);
    if (duplicateDays.length > 0) {
      errors.push('Day number must be unique');
    }
    return errors;
  };

  const addDay = () => {
    const nextDayNumber = days.length > 0 ? Math.max(...days.map(d => d.day)) + 1 : 1;
    const newDay: ItineraryDay = {
      day: nextDayNumber,
      title: '',
      description: '',
      activities: [],
      image: undefined
    };
    onChange([...days, newDay]);
  };

  const removeDay = (dayNumber: number) => {
    const filteredDays = days.filter(d => d.day !== dayNumber);
    // Renumber remaining days to be sequential
    const renumberedDays = filteredDays.map((day, index) => ({
      ...day,
      day: index + 1
    }));
    onChange(renumberedDays);
    // Clear validation errors for removed day
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[dayNumber];
      return newErrors;
    });
  };

  const updateDay = (dayNumber: number, updates: Partial<ItineraryDay>) => {
    const updatedDays = days.map(day =>
      day.day === dayNumber ? { ...day, ...updates } : day
    );

    // Validate the updated day
    const updatedDay = updatedDays.find(d => d.day === dayNumber);
    if (updatedDay) {
      const errors = validateDay(updatedDay);
      setValidationErrors(prev => ({
        ...prev,
        [dayNumber]: errors
      }));
    }

    onChange(updatedDays);
  };

  const updateDayNumber = (oldDayNumber: number, newDayNumber: number) => {
    if (newDayNumber < 1 || days.some(d => d.day === newDayNumber && d.day !== oldDayNumber)) {
      return; // Invalid day number
    }

    const updatedDays = days.map(day =>
      day.day === oldDayNumber ? { ...day, day: newDayNumber } : day
    );

    // Renumber all days to maintain sequence
    const sortedDays = updatedDays.sort((a, b) => a.day - b.day).map((d, i) => ({ ...d, day: i + 1 }));

    // Re-validate all days
    const newErrors: {[key: number]: string[]} = {};
    sortedDays.forEach(day => {
      const errors = validateDay(day);
      if (errors.length > 0) {
        newErrors[day.day] = errors;
      }
    });

    setValidationErrors(newErrors);
    onChange(sortedDays);
  };

  const moveDay = (dayNumber: number, direction: 'up' | 'down') => {
    const currentIndex = days.findIndex(d => d.day === dayNumber);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= days.length) return;

    const newDays = [...days];
    [newDays[currentIndex], newDays[newIndex]] = [newDays[newIndex], newDays[currentIndex]];

    // Renumber days after moving
    const renumberedDays = newDays.map((day, index) => ({
      ...day,
      day: index + 1
    }));

    onChange(renumberedDays);
  };

  const updateActivities = (dayNumber: number, activitiesText: string) => {
    const activities = activitiesText.split('\n').filter(a => a.trim() !== '');
    updateDay(dayNumber, { activities });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Itinerary Days</Label>
          <p className="text-sm text-gray-600">
            Plan each day of your safari package. You can add, edit, or remove days as needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => {
              if (activeTab === 'form') {
                setActiveTab('preview');
              } else {
                setActiveTab('form');
              }
            }}
            variant="outline"
            size="sm"
          >
            {activeTab === 'preview' ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {activeTab === 'preview' ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={addDay} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Edit Itinerary</TabsTrigger>
          <TabsTrigger value="preview" disabled={days.length === 0 || Object.keys(validationErrors).length > 0}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4 mt-4">

      {days.length === 0 ? (
        <Card className="border-dashed border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-green-500 mb-4">
              <div className="text-4xl mb-2">📅</div>
              <p className="font-medium">No itinerary days yet</p>
              <p className="text-sm text-green-600">Add your first day to start planning the safari experience</p>
            </div>
            <Button onClick={addDay} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Plus className="h-4 w-4 mr-2" />
              Add First Day
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {days.map((day, index) => (
            <Card key={day.day} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1">
                      Day {day.day}
                    </Badge>
                    <CardTitle className="text-lg">{day.title || 'Untitled Day'}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveDay(day.day, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveDay(day.day, 'down')}
                      disabled={index === days.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeDay(day.day)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${day.day}`}>Day Title *</Label>
                    <Input
                      id={`title-${day.day}`}
                      value={day.title}
                      onChange={(e) => updateDay(day.day, { title: e.target.value })}
                      placeholder="e.g., Arrival & Safari Briefing"
                      required
                      className={validationErrors[day.day]?.some(e => e.includes('Title')) ? 'border-red-500' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`day-number-${day.day}`}>Day Number</Label>
                    <Input
                      id={`day-number-${day.day}`}
                      type="number"
                      value={day.day}
                      onChange={(e) => {
                        const newDayNumber = parseInt(e.target.value);
                        if (newDayNumber > 0 && !days.some(d => d.day === newDayNumber && d.day !== day.day)) {
                          updateDayNumber(day.day, newDayNumber);
                        }
                      }}
                      min="1"
                      className={validationErrors[day.day]?.some(e => e.includes('Day number')) ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-renumbers when changed to maintain sequence
                    </p>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors[day.day] && validationErrors[day.day].length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors[day.day].map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor={`description-${day.day}`}>Day Description *</Label>
                  <Textarea
                    id={`description-${day.day}`}
                    value={day.description}
                    onChange={(e) => updateDay(day.day, { description: e.target.value })}
                    rows={3}
                    placeholder="Describe what guests will experience on this day..."
                    required
                    className={validationErrors[day.day]?.some(e => e.includes('Description')) ? 'border-red-500' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor={`activities-${day.day}`}>Activities (one per line)</Label>
                  <Textarea
                    id={`activities-${day.day}`}
                    value={day.activities?.join('\n') || ''}
                    onChange={(e) => updateActivities(day.day, e.target.value)}
                    rows={3}
                    placeholder="Morning game drive&#10;Breakfast at the lodge&#10;Visit to Maasai village&#10;Afternoon photography session"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List specific activities or highlights for this day
                  </p>
                </div>

                <div className="border-2 border-yellow-400 rounded p-3 mt-2 bg-yellow-50">
                  <Label className="font-semibold text-yellow-700">Day Image URL</Label>
                  <p className="text-xs text-yellow-700 mb-2">Paste an image URL to visually represent this day in the itinerary. The image will be shown to users.</p>
                  <Input
                    type="text"
                    value={day.image || ''}
                    onChange={e => updateDay(day.day, { image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {day.image && (
                    <div className="mt-2">
                      <img src={day.image} alt={`Day ${day.day} image`} className="w-full h-40 object-cover rounded border border-yellow-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

        </TabsContent>

        <TabsContent value="preview" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800">Itinerary Preview</h3>
              <p className="text-sm text-green-600">This is how your itinerary will appear to customers</p>
            </div>

            <div className="space-y-3">
              {days.map((day) => (
                <Card key={day.day} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="px-3 py-1">
                        Day {day.day}
                      </Badge>
                      <CardTitle className="text-lg">{day.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.image && (
                      <img src={day.image} alt={`Day ${day.day} image`} className="w-full h-56 object-cover rounded" />
                    )}
                    <p className="text-gray-700">{day.description}</p>

                    {day.activities && day.activities.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Activities:</h4>
                        <ul className="space-y-1">
                          {day.activities.map((activity, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {days.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">
            <span className="font-medium">Total Days: {days.length}</span>
            <span className="ml-4">
              Activities: {days.reduce((sum, day) => sum + (day.activities?.length || 0), 0)} total
            </span>
            {Object.keys(validationErrors).length > 0 && (
              <span className="ml-4 text-red-600">
                ⚠️ {Object.keys(validationErrors).length} day(s) with errors
              </span>
            )}
          </div>
          <Button onClick={addDay} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Day
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItineraryDayForm;
