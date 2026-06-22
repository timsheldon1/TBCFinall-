import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Edit, Trash2, DollarSign, Clock, Users, 
  MapPin, Utensils, Waves, Car, Sparkles
} from 'lucide-react';
import { useAmenities } from '@/hooks/useAmenities';
import { Amenity } from '@/types/amenity';
import { toast } from 'sonner';

const categoryIcons = {
  activity: MapPin,
  dining: Utensils,
  spa: Sparkles,
  transport: Car,
  facility: Waves
};

const categoryColors = {
  activity: 'bg-green-100 text-green-800',
  dining: 'bg-orange-100 text-orange-800',
  spa: 'bg-purple-100 text-purple-800',
  transport: 'bg-blue-100 text-blue-800',
  facility: 'bg-cyan-100 text-cyan-800'
};

export default function AdminAmenities() {
  const { amenities, addAmenity, updateAmenity, deleteAmenity } = useAmenities();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'activity' as Amenity['category'],
    duration: '',
    availability: 'always' as Amenity['availability'],
    maxGuests: '',
    isForExternalGuests: false,
    featured: false,
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'activity',
      duration: '',
      availability: 'always',
      maxGuests: '',
      isForExternalGuests: false,
      featured: false,
      active: true
    });
    setEditingAmenity(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amenityData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      duration: formData.duration,
      availability: formData.availability,
      maxGuests: formData.maxGuests ? parseInt(formData.maxGuests) : undefined,
      isForExternalGuests: formData.isForExternalGuests,
      featured: formData.featured,
      active: formData.active
    };

    if (editingAmenity) {
      updateAmenity(editingAmenity.id, amenityData);
      toast.success('Amenity updated successfully!');
    } else {
      addAmenity(amenityData);
      toast.success('Amenity added successfully!');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description,
      price: amenity.price.toString(),
      category: amenity.category,
      duration: amenity.duration || '',
      availability: amenity.availability,
      maxGuests: amenity.maxGuests?.toString() || '',
      isForExternalGuests: amenity.isForExternalGuests || false,
      featured: amenity.featured,
      active: amenity.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this amenity?')) {
      deleteAmenity(id);
      toast.success('Amenity deleted successfully!');
    }
  };

  const getCategoryStats = () => {
    const stats = amenities.reduce((acc, amenity) => {
      acc[amenity.category] = (acc[amenity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([category, count]) => ({ category, count }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Amenities Management</h1>
          <p className="text-gray-600">Manage bookable amenities and their pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Amenity Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Amenity['category'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="dining">Dining</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="facility">Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 hours, Full day"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value as Amenity['availability'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always Available</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="on-request">On Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    placeholder="Optional"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isForExternalGuests"
                    checked={formData.isForExternalGuests}
                    onCheckedChange={(checked) => setFormData({ ...formData, isForExternalGuests: checked })}
                  />
                  <Label htmlFor="isForExternalGuests">For External Guests</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAmenity ? 'Update' : 'Add'} Amenity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amenities</p>
                <p className="text-2xl font-bold">{amenities.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Amenities</p>
                <p className="text-2xl font-bold">{amenities.filter(a => a.active).length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold">{amenities.filter(a => a.featured).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold">
                  ${amenities.length > 0 ? (amenities.reduce((sum, a) => sum + a.price, 0) / amenities.length).toFixed(0) : 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amenities List */}
      <Card>
        <CardHeader>
          <CardTitle>All Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((amenity) => {
              const CategoryIcon = categoryIcons[amenity.category];
              return (
                <Card key={amenity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold">{amenity.name}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(amenity)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(amenity.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{amenity.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">${amenity.price}</span>
                        <Badge className={categoryColors[amenity.category]}>
                          {amenity.category}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        {amenity.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{amenity.duration}</span>
                          </div>
                        )}
                        {amenity.maxGuests && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Max {amenity.maxGuests}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {amenity.featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                        {amenity.isForExternalGuests && (
                          <Badge variant="outline" className="text-xs">External Guests</Badge>
                        )}
                        {!amenity.active && (
                          <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}