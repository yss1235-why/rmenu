import { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Upload,
  Grid,
  List,
  UtensilsCrossed,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItem, Category } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/cloudinary';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';

export const MenuManagementPanel = () => {
  const { toast } = useToast();
  const { 
    categories, 
    menuItems, 
    loading, 
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem 
  } = useMenu({ restaurantId: RESTAURANT_ID });

  const [activeTab, setActiveTab] = useState('items');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Dialog states
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    images: [] as string[],
    available: true,
    isSpecial: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    active: true,
  });

  const [uploading, setUploading] = useState(false);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out any empty or invalid URLs
      const validUrls = uploadedUrls.filter(url => url && url.trim() !== '');
      const newImages = [...itemForm.images.filter(img => img && img.trim() !== ''), ...validUrls];
      setItemForm({ 
        ...itemForm, 
        images: newImages,
        image: newImages[0] || '' // First image is the primary
      });
      
      toast({
        title: 'Images Uploaded',
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload images. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = itemForm.images.filter((_, index) => index !== indexToRemove);
    setItemForm({
      ...itemForm,
      images: newImages,
      image: newImages[0] || ''
    });
  };
 const handleAddItem = async () => {
    try {
      await createMenuItem({
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        image: itemForm.images[0] || itemForm.image,
        images: itemForm.images,
        available: itemForm.available,
        isSpecial: itemForm.isSpecial,
        order: menuItems.length,
      });

      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        images: [],
        available: true,
        isSpecial: false,
      });
      setIsAddItemOpen(false);

      toast({
        title: 'Item Created',
        description: `${itemForm.name} has been added to the menu.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create menu item.',
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        image: itemForm.images[0] || itemForm.image,
        images: itemForm.images,
        available: itemForm.available,
        isSpecial: itemForm.isSpecial,
        order: editingItem.order ?? menuItems.length,
      });

      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        images: [],
        available: true,
        isSpecial: false,
      });
      toast({
        title: 'Item Updated',
        description: `${itemForm.name} has been updated.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update menu item.',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId);
      toast({
        title: 'Item Deleted',
        description: 'Menu item has been removed.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete menu item.',
      });
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
      toast({
        title: item.available ? 'Item Hidden' : 'Item Visible',
        description: `${item.name} is now ${item.available ? 'hidden from' : 'visible on'} the menu.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update availability.',
      });
    }
  };

  const handleAddCategory = async () => {
    try {
      await createCategory({
        name: categoryForm.name,
        active: categoryForm.active,
        order: categories.length,
      });

      setCategoryForm({ name: '', active: true });
      setIsAddCategoryOpen(false);

      toast({
        title: 'Category Created',
        description: `${categoryForm.name} has been added.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create category.',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const itemsInCategory = menuItems.filter(item => item.categoryId === categoryId);
    if (itemsInCategory.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete',
        description: 'Remove all items from this category first.',
      });
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: 'Category Deleted',
        description: 'Category has been removed.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category.',
      });
    }
  };

  const openEditItem = (item: MenuItem) => {
    // Handle backward compatibility - if images array doesn't exist, use single image
    const images = item.images && item.images.length > 0 
      ? item.images 
      : item.image 
        ? [item.image] 
        : [];
    
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      categoryId: item.categoryId,
      image: item.image || '',
      images: images,
      available: item.available,
      isSpecial: item.isSpecial || false,
    });
    setEditingItem(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-500">Loading menu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Failed to load menu</p>
        <p className="text-sm text-slate-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {activeTab === 'items' && (
              <>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={() => setIsAddItemOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </>
            )}
            {activeTab === 'categories' && (
              <Button 
                onClick={() => setIsAddCategoryOpen(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="items" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid/List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600">No Menu Items</h3>
              <p className="text-slate-500">Add your first menu item to get started.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`relative overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                  {item.image && (
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          {item.isSpecial && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                        <p className="text-lg font-bold text-violet-600 mt-2">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditItem(item)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                            {item.available ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hide from Menu
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Show on Menu
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`${!item.available ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.isSpecial && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <Badge variant="secondary" className="ml-2">
                          {categories.find(c => c.id === item.categoryId)?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{item.description}</p>
                    </div>
                    <p className="text-lg font-bold text-violet-600">₹{item.price.toFixed(2)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditItem(item)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                          {item.available ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {item.available ? 'Hide' : 'Show'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600">No Categories</h3>
              <p className="text-slate-500">Add categories to organize your menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const itemCount = menuItems.filter(item => item.categoryId === category.id).length;
                return (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-slate-500">{itemCount} items</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setCategoryForm({ name: category.name, active: category.active });
                              setEditingCategory(category);
                            }}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                              disabled={itemCount > 0}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Badge variant={category.active ? 'secondary' : 'outline'} className="mt-2">
                        {category.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddItemOpen || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setIsAddItemOpen(false);
          setEditingItem(null);
          setItemForm({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            image: '',
            images: [],
            available: true,
            isSpecial: false,
          });
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the details of this menu item.' : 'Add a new item to your menu.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Truffle Burger"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="A delicious burger with truffle aioli..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="24.99"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={itemForm.categoryId} 
                  onValueChange={(v) => setItemForm({ ...itemForm, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Images</Label>
              <div className="mt-2 space-y-3">
                {/* Image Previews */}
               {itemForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {itemForm.images.filter(img => img && img.trim() !== '').map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img 
                          src={img} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12">Error</text></svg>';
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-sm text-slate-500">
                    {uploading ? 'Uploading...' : 'Click to add images'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {itemForm.images.length > 0 ? `${itemForm.images.length} image(s) added` : 'Multiple images supported'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.available}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, available: checked })}
                />
                <Label>Available on Menu</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.isSpecial}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, isSpecial: checked })}
                />
                <Label>Today's Special</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddItemOpen(false);
              setEditingItem(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              disabled={!itemForm.name || !itemForm.price || !itemForm.categoryId}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setIsAddCategoryOpen(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', active: true });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details.' : 'Create a new menu category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Main Courses"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryForm.active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddCategoryOpen(false);
              setEditingCategory(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={!categoryForm.name}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
