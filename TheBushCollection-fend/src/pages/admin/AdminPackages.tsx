import React, { useState } from 'react';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import useBackendBookings, { type SafariBooking } from '@/hooks/useBackendBookings';
import { fetchItinerariesForPackage, saveItineraryForPackage } from '@/hooks/useBackendItineraries';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ArrowLeft, Star, Users, Calendar, TrendingUp, Loader2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Package } from '@/types/package';
import ItineraryDayForm from '@/components/ItineraryDayForm';
import { ItineraryDayForm as ItineraryDayFormType } from '@/types/package';

const AdminPackages = () => {
  const { packages, loading, error, refetch, addPackage, updatePackage, deletePackage } = useBackendPackages();
  const { properties } = useBackendProperties();
  const { bookings } = useBackendBookings();
  const { isAdmin, loading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDayFormType[]>([]);
  const [formData, setFormData] = useState<Partial<Package>>({
    name: '',
    description: 'A thrilling safari experience',
    shortDescription: '',
    duration: '5 days / 4 nights',
    location: '',
    propertyId: '',
    destinations: [],
    image: '',
    gallery: [],
    price: 0,
    originalPrice: 0,
    maxGuests: 1,
    difficulty: 'easy',
    category: 'wildlife',
    featured: false,
    groupSize: '2-4 people',
    includes: [],
    excludes: [],
    highlights: [],
    bestTime: '',
    rating: 5,
    reviews: 0
  });

  // Calculate package popularity based on bookings
  const getPackagePopularity = (packageId: string) => {
    return bookings.filter((booking: SafariBooking) => {
      if (booking.package_id) return booking.package_id === packageId;
      // booking._raw is backend-shaped; allow dynamic access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = booking._raw as any;
      if (!raw) return false;
      if (raw.package) return (raw.package._id || raw.package) === packageId;
      if (raw.packageId) return raw.packageId === packageId;
      return false;
    }).length;
  };

  // Get most popular packages
  const popularPackages = packages
    .map(pkg => ({
      ...pkg,
      bookingCount: getPackagePopularity(pkg.id)
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on database schema
    if (!formData.name || !formData.name.trim()) {
      toast.error('Package name is required');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return;
    }
    
    if (!formData.duration || !formData.duration.trim()) {
      toast.error('Duration is required');
      return;
    }
    
    if (!formData.description || !formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    // Only require property selection if properties are available
    if (properties && properties.length > 0 && (!formData.propertyId || !formData.propertyId.trim())) {
      toast.error('Please select an accommodation property');
      return;
    }

    // Validate itinerary - ensure all days have required fields
    if (itineraryDays.length > 0) {
      const invalidDays = itineraryDays.filter(day =>
        !day.title?.trim() || !day.description?.trim()
      );
      if (invalidDays.length > 0) {
        toast.error('Please ensure all itinerary days have titles and descriptions');
        return;
      }
    }
    try {
      if (editingPackage) {
        console.log('Updating package:', editingPackage.id, formData);
        // Update via backend hook
        await updatePackage(editingPackage.id, formData);
        toast.success('Package updated successfully');

        // Save itinerary data after package update
        if (itineraryDays.length > 0) {
          await saveItineraryForPackage(editingPackage.id, itineraryDays);
        }
      } else {
        console.log('Creating new package:', formData);
        // Create via backend hook
        const newPackage = await addPackage(formData as Omit<Package, 'id'>);
        toast.success('Package created successfully');

        // Save itinerary data after package creation
        if (itineraryDays.length > 0) {
          await saveItineraryForPackage(newPackage.id, itineraryDays);
        }
      }

      // Refresh packages list and reset
      try { await refetch(); } catch (e) { /* ignore */ }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving package:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save package: ${errorMessage}`);
    }
  };

  const handleEdit = async (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || 'A thrilling safari experience',
      shortDescription: pkg.shortDescription || '',
      duration: pkg.duration || '5 days / 4 nights',
      location: pkg.location || '',
      propertyId: pkg.propertyId || '',
      destinations: [...(pkg.destinations || [])],
      image: pkg.image || '',
      gallery: [...(pkg.gallery || [])],
      price: pkg.price || 0,
      originalPrice: pkg.originalPrice ?? 0,
      maxGuests: pkg.maxGuests || 1,
      difficulty: pkg.difficulty || 'easy',
      category: pkg.category || 'wildlife',
      featured: pkg.featured || false,
      groupSize: pkg.groupSize || '2-4 people',
      includes: [...(pkg.includes || [])],
      excludes: [...(pkg.excludes || [])],
      highlights: [...(pkg.highlights || [])],
      bestTime: pkg.bestTime || '',
      rating: pkg.rating || 5,
      reviews: pkg.reviews || 0
    });

    // Load existing itinerary data for this package
    try {
      const itineraryData = await fetchItinerariesForPackage(pkg.id);
      // Convert database format to form format
      const formItineraryDays: ItineraryDayFormType[] = itineraryData.map((day: { dayNumber?: number; day?: number; title?: string; description?: string; location?: string; activities?: unknown[]; image?: string }, idx) => {
        const activities: string[] = Array.isArray(day.activities) ? (day.activities as unknown[]).map(a => String(a)) : [];
        return {
          day: day.dayNumber ?? day.day ?? idx + 1,
          title: day.title || '',
          description: day.description || day.location || '', // Map location back to description for the form
          activities,
          image: day.image || '' // <-- include image field
        };
      });
      setItineraryDays(formItineraryDays);
    } catch (error) {
      console.error('Error loading itinerary data:', error);
      setItineraryDays([]); // Set empty array if loading fails
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
        toast.success('Package deleted successfully');
      } catch (err) {
        console.error('Delete package failed', err);
        toast.error('Failed to delete package');
      }
    }
  };

  const resetForm = () => {
    setEditingPackage(null);
    setItineraryDays([]);
    setFormData({
      name: '',
      description: 'A thrilling safari experience',
      shortDescription: '',
      duration: '5 days / 4 nights',
      location: '',
      propertyId: '',
      destinations: [],
      image: '',
      gallery: [],
      price: 0,
      originalPrice: 0,
      maxGuests: 1,
      difficulty: 'easy',
      category: 'wildlife',
      featured: false,
      groupSize: '2-4 people',
      includes: [],
      excludes: [],
      highlights: [],
      bestTime: '',
      rating: 5,
      reviews: 0
    });
  };

  const handleArrayFieldChange = (field: 'destinations' | 'gallery' | 'includes' | 'excludes' | 'highlights', value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleItineraryChange = (days: ItineraryDayFormType[]) => {
    setItineraryDays(days);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">You need administrator privileges to access this page.</p>
            <Link to="/admin/login">
              <Button>
                Login as Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Packages</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
              <p className="text-gray-600">Manage your safari packages and track their popularity</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                  {editingPackage && (
                    <Badge variant="secondary" className="text-xs">
                      Editing: {editingPackage.name}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingPackage
                    ? 'Update the package details below. All fields will be pre-filled with current values.'
                    : 'Create a new safari package by filling out the form below.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Package Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration *</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 7 days / 6 nights"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Serengeti National Park, Tanzania"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The main location or region for this safari package.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="propertyId">
                        Accommodation Property {properties && properties.length > 0 ? '*' : '(Optional - no properties available)'}
                      </Label>
                      <Select
                        value={formData.propertyId || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}
                        disabled={!properties || properties.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !properties || properties.length === 0
                              ? "No properties available - please add properties first"
                              : "Select a property where guests will stay"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose the lodge, camp, or accommodation where guests will stay during this safari package.
                        {!properties || properties.length === 0 && (
                          <span className="text-red-500"> Please add properties in the Properties section first.</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Input
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        placeholder="Brief package description"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Detailed package description"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wildlife">Wildlife</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="adventure">Adventure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as Package['difficulty'] }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="challenging">Challenging</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxGuests">Max Guests</Label>
                        <Input
                          id="maxGuests"
                          type="number"
                          value={formData.maxGuests}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) }))}
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="groupSize">Group Size</Label>
                      <Input
                        id="groupSize"
                        value={formData.groupSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, groupSize: e.target.value }))}
                        placeholder="e.g., 2-8 people"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label htmlFor="image">Main Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="destinations">Destinations (one per line)</Label>
                      <Textarea
                        id="destinations"
                        value={formData.destinations?.join('\n') || ''}
                        onChange={(e) => handleArrayFieldChange('destinations', e.target.value)}
                        rows={3}
                        placeholder="Serengeti National Park&#10;Masai Mara&#10;Ngorongoro Crater"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gallery">Gallery Image URLs (one per line)</Label>
                      <Textarea
                        id="gallery"
                        value={formData.gallery?.join('\n') || ''}
                        onChange={(e) => handleArrayFieldChange('gallery', e.target.value)}
                        rows={3}
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="highlights">Package Highlights (one per line)</Label>
                      <Textarea
                        id="highlights"
                        value={formData.highlights?.join('\n') || ''}
                        onChange={(e) => handleArrayFieldChange('highlights', e.target.value)}
                        rows={4}
                        placeholder="Big Five game viewing&#10;Professional safari guide&#10;Luxury accommodation"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="includes">Includes (one per line)</Label>
                      <Textarea
                        id="includes"
                        value={formData.includes?.join('\n') || ''}
                        onChange={(e) => handleArrayFieldChange('includes', e.target.value)}
                        rows={4}
                        placeholder="Accommodation in luxury lodges&#10;All meals and beverages&#10;Professional safari guide"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="excludes">Excludes (one per line)</Label>
                      <Textarea
                        id="excludes"
                        value={formData.excludes?.join('\n') || ''}
                        onChange={(e) => handleArrayFieldChange('excludes', e.target.value)}
                        rows={4}
                        placeholder="International flights&#10;Travel insurance&#10;Personal expenses"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bestTime">Best Time to Visit</Label>
                      <Input
                        id="bestTime"
                        value={formData.bestTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, bestTime: e.target.value }))}
                        placeholder="e.g., July - October"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (USD) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (USD)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <Input
                          id="rating"
                          type="number"
                          value={formData.rating}
                          onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                          min="1"
                          max="5"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews">Number of Reviews</Label>
                        <Input
                          id="reviews"
                          type="number"
                          value={formData.reviews}
                          onChange={(e) => setFormData(prev => ({ ...prev, reviews: parseInt(e.target.value) }))}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="featured">Featured Package</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="itinerary" className="space-y-4">
                    <ItineraryDayForm
                      days={itineraryDays}
                      onChange={handleItineraryChange}
                    />
                    {/* Show a note to admin about image URLs */}
                    <div className="text-xs text-gray-500 mt-2">
                      You can add an image URL for each day. Paste a valid image URL to display an image for that day in the itinerary.
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPackage
                      ? `Update "${editingPackage.name}"`
                      : 'Create Package'
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Packages</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {packages.filter(pkg => pkg.featured).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(booking => booking.package_id).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Package Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Packages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Most Popular Packages</CardTitle>
            <CardDescription>Packages with the most bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularPackages.map((pkg, index) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">{pkg.shortDescription}</p>
                      {/* Show property info in popular packages */}
                      {pkg.propertyId && (
                        <div className="text-xs text-gray-500 mt-1">
                          🏨 {properties.find(p => p.id === pkg.propertyId)?.name || 'Property not found'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {pkg.bookingCount} bookings
                    </Badge>
                    <span className="font-semibold">${pkg.price}</span>
                  </div>
                </div>
              ))}
              {popularPackages.length === 0 && (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Packages */}
        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your safari packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {pkg.image && (
                      <img 
                        src={pkg.image} 
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {pkg.featured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <Badge variant="outline">{pkg.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{pkg.shortDescription}</p>

                      {/* Show selected property if available */}
                      {pkg.propertyId && (
                        <div className="text-xs text-gray-500">
                          🏨 {properties.find(p => p.id === pkg.propertyId)?.name || 'Property not found'} - {properties.find(p => p.id === pkg.propertyId)?.location || ''}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{pkg.rating} ({pkg.reviews})</span>
                        </div>
                        <div className="text-right">
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <span className="text-sm text-gray-500 line-through">${pkg.originalPrice}</span>
                          )}
                          <div className="font-bold text-lg">${pkg.price}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {getPackagePopularity(pkg.id)} bookings
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(pkg.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {packages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No packages found</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Package
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPackages;