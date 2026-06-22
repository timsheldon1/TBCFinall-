import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Upload, Play, Image as ImageIcon, Eye, Calendar, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string; // fileUrl on backend
  thumbnail: string; // thumbnailUrl on backend
  date: string;
  category: string;
  featured?: boolean;
  property_id?: string;
  package_id?: string;
  created_at?: string; // Supabase timestamp
}

interface MediaFormData {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  type: 'image' | 'video';
  category: string;
  featured: boolean;
  property_id?: string;
  package_id?: string;
}

interface LoadingStates {
  submit: boolean;
  delete: boolean;
  initial: boolean;
}

const categories = ['Wildlife', 'Landscapes', 'Culture', 'Accommodations', 'Activities', 'Safari Experience'];

export default function AdminMediaCenter() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    submit: false,
    delete: false,
    initial: true
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    type: 'image',
    category: 'Wildlife',
    featured: false
  });

  // const { packages } = useSupabasePackages();
  // const { properties } = useSupabaseProperties();

  const loadMediaItems = useCallback(async () => {
    try {
      const res = await api.get('/media/media-center');
      const raw = res.data || [];
      const items = (raw as Array<Record<string, unknown>>).map((it) => {
        const obj = it as Record<string, unknown>;
        const id = String(obj['_id'] ?? obj['id'] ?? '');
        const type = String(obj['type'] ?? 'image') as 'image' | 'video';
        const title = String(obj['title'] ?? '');
        const description = String(obj['description'] ?? '');
        const fileUrl = String(obj['fileUrl'] ?? obj['thumbnailUrl'] ?? '');
        const thumbnail = String(obj['thumbnailUrl'] ?? obj['fileUrl'] ?? '');
        const date = String(obj['createdAt'] ?? obj['date'] ?? new Date().toISOString());
        const category = String(obj['category'] ?? '');
        const featured = Boolean(obj['featured'] ?? false);

        return {
          id,
          type,
          title,
          description,
          url: fileUrl,
          thumbnail,
          date,
          category,
          featured,
        } as MediaItem;
      });
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
      toast.error('Failed to load media items');
    } finally {
      setLoadingStates(prev => ({ ...prev, initial: false }));
    }
  }, []);

  useEffect(() => {
    loadMediaItems();
  }, [loadMediaItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url || !formData.thumbnail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoadingStates(prev => ({ ...prev, submit: true }));
    const date = new Date().toISOString().split('T')[0];

    try {
      if (editingItem) {
        try {
          // Try to call update endpoint if available
          await api.put(`/media/admin/media/${editingItem.id}`, {
            title: formData.title,
            type: formData.type,
            category: formData.category,
            thumbnailUrl: formData.thumbnail,
            description: formData.description,
            featured: formData.featured,
            fileUrl: formData.url,
            date,
          });
          toast.success('Media item updated successfully');
        } catch (err) {
          console.warn('Update not supported on backend, attempting create fallback', err);
          await api.post('/media/admin/media', {
            title: formData.title,
            type: formData.type,
            category: formData.category,
            thumbnailUrl: formData.thumbnail,
            description: formData.description,
            featured: formData.featured,
            fileUrl: formData.url,
            date,
          });
          toast.success('Media item saved (fallback)');
        }
      } else {
        await api.post('/media/admin/media', {
          title: formData.title,
          type: formData.type,
          category: formData.category,
          thumbnailUrl: formData.thumbnail,
          description: formData.description,
          featured: formData.featured,
          fileUrl: formData.url,
          date,
        });
        toast.success('Media item added successfully');
      }

      resetForm();
      setIsDialogOpen(false);
      loadMediaItems(); // Refresh the list
    } catch (error) {
      console.error('Error saving media item:', error);
      toast.error('Failed to save media item');
    } finally {
      setLoadingStates(prev => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      type: 'image',
      category: 'Wildlife',
      featured: false
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      url: item.url,
      thumbnail: item.thumbnail,
      type: item.type,
      category: item.category,
      featured: item.featured || false,
      property_id: item.property_id,
      package_id: item.package_id
    });
    setIsDialogOpen(true);
  };

  // File upload handling
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const handleFileUpload = async (file: File, target: 'media' | 'thumbnail') => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      if (target === 'media') setUploadingMedia(true); else setUploadingThumb(true);
      const res = await api.post('/media/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = res.data?.fileUrl;
      if (fileUrl) {
        if (target === 'media') setFormData(prev => ({ ...prev, url: fileUrl }));
        else setFormData(prev => ({ ...prev, thumbnail: fileUrl }));
        toast.success('File uploaded');
      } else {
        toast.error('Upload did not return file URL');
      }
    } catch (err) {
      console.error('Upload error', err);
      toast.error('File upload failed');
    } finally {
      if (target === 'media') setUploadingMedia(false); else setUploadingThumb(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, delete: true }));
    try {
      try {
        await api.delete(`/media/admin/media/${id}`);
        toast.success('Media item deleted successfully');
        loadMediaItems(); // Refresh the list
      } catch (err) {
        console.error('Error deleting media item:', err);
        toast.error('Failed to delete media item (backend may not support delete)');
      }
    } catch (error) {
      console.error('Error deleting media item:', error);
      toast.error('Failed to delete media item');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  };

  const filteredItems = mediaItems.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const featuredItems = mediaItems.filter(item => item.featured);

  // Loading state for initial load
  if (loadingStates.initial) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading media center...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Center Management</h1>
          <p className="text-gray-600">Manage photos, videos, and media content for the website</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" disabled={loadingStates.submit}>
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Media Item' : 'Add New Media Item'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter media title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Media URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Enter media URL (YouTube embed, image URL, etc.)"
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="mediaFile"
                    type="file"
                    accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'media');
                    }}
                    className="hidden"
                  />
                  <label htmlFor="mediaFile">
                    <Button size="sm" variant="outline" className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingMedia ? 'Uploading...' : 'Upload Media File'}
                    </Button>
                  </label>
                  {formData.url && (
                    <a href={formData.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                      View
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL *</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Enter thumbnail image URL"
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="thumbFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'thumbnail');
                    }}
                    className="hidden"
                  />
                  <label htmlFor="thumbFile">
                    <Button size="sm" variant="outline" className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingThumb ? 'Uploading...' : 'Upload Thumbnail'}
                    </Button>
                  </label>
                  {formData.thumbnail && (
                    <a href={formData.thumbnail} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                      View
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter media description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="featured">Mark as featured</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={loadingStates.submit}
                >
                  {loadingStates.submit ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingItem ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Add'} Media
                    </>
                  )}
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
                <p className="text-sm font-medium text-gray-600">Total Media</p>
                <p className="text-2xl font-bold text-gray-900">{mediaItems.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Items</p>
                <p className="text-2xl font-bold text-gray-900">{featuredItems.length}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Play className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'image').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ImageIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(item => item.type === 'video').length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Play className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              All ({mediaItems.length})
            </Button>
            {categories.map((category) => {
              const count = mediaItems.filter(item => item.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Media Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge className={item.type === 'video' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}>
                  {item.type === 'video' ? 'Video' : 'Photo'}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  {item.category}
                </Badge>
              </div>
              {item.featured && (
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-amber-600 text-white">
                    Featured
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>{item.type}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Media Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loadingStates.delete}
                      >
                        {loadingStates.delete ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting...
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p>No media items found in this category</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Media Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
