import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Settings {
  // General Settings
  businessName: string;
  contactEmail: string;
  businessDescription: string;

  // Booking Settings
  taxRate: number;
  extraGuestRate: number;
  allowExtraGuests: boolean;
  emailNotifications: boolean;

  // Payment Settings
  paymentGateway: string;
  acceptOnlinePayments: boolean;

  // Notification Settings
  newBookingAlerts: boolean;
  dailyReports: boolean;
}

const defaultSettings: Settings = {
  businessName: 'Safari Tours',
  contactEmail: 'info@safaritours.com',
  businessDescription: 'Premium safari experiences across Africa',
  taxRate: 15,
  extraGuestRate: 80,
  allowExtraGuests: true,
  emailNotifications: true,
  paymentGateway: '',
  acceptOnlinePayments: false,
  newBookingAlerts: true,
  dailyReports: false,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save settings to localStorage
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  // Update individual setting
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Configure your safari booking system</p>
              </div>
            </div>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Business Description</Label>
                <Textarea
                  value={settings.businessDescription}
                  onChange={(e) => updateSetting('businessDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Extra Guest Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.extraGuestRate}
                    onChange={(e) => updateSetting('extraGuestRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Extra Guests</Label>
                  <p className="text-sm text-gray-600">Allow bookings with guests exceeding room capacity</p>
                </div>
                <Switch
                  checked={settings.allowExtraGuests}
                  onCheckedChange={(checked) => updateSetting('allowExtraGuests', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send booking confirmation emails</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Gateway</Label>
                <Input
                  value={settings.paymentGateway}
                  onChange={(e) => updateSetting('paymentGateway', e.target.value)}
                  placeholder="Stripe, PayPal, etc."
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Accept Online Payments</Label>
                  <p className="text-sm text-gray-600">Enable online payment processing</p>
                </div>
                <Switch
                  checked={settings.acceptOnlinePayments}
                  onCheckedChange={(checked) => updateSetting('acceptOnlinePayments', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Booking Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified of new bookings</p>
                </div>
                <Switch
                  checked={settings.newBookingAlerts}
                  onCheckedChange={(checked) => updateSetting('newBookingAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Reports</Label>
                  <p className="text-sm text-gray-600">Receive daily booking summaries</p>
                </div>
                <Switch
                  checked={settings.dailyReports}
                  onCheckedChange={(checked) => updateSetting('dailyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}