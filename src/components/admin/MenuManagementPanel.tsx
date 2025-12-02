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
  List
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
import { useToast } from '@/hooks/use-toast';

// Demo categories
const demoCategories: Category[] = [
  { id: 'specials', restaurantId: 'demo', name: "Today's Specials", order: 0, active: true },
  { id: 'starters', restaurantId: 'demo', name: 'Starters', order: 1, active: true },
  { id: 'mains', restaurantId: 'demo', name: 'Main Courses', order: 2, active: true },
  { id: 'desserts', restaurantId: 'demo', name: 'Desserts', order: 3, active: true },
  { id: 'beverages', restaurantId: 'demo', name: 'Beverages', order: 4, active: true },
];

// Demo menu items
const demoMenuItems: MenuItem[] = [
  {
    id: '1',
    restaurantId: 'demo',
    categoryId: 'mains',
    name: 'Truffle Burger',
    description: 'Wagyu beef patty, caramelized onions, aged cheddar, truffle aioli on brioche',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    available: true,
    isSpecial: true,
    order: 1,
    tags: ['signature', 'popular'],
  },
  {
    id: '2',
    restaurantId: 'demo',
    categoryId: 'starters',
    name: 'Garden Fresh Salad',
    description: 'Mixed greens, heirloom tomatoes, cucumber, radish, house vinaigrette',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    available: true,
    isSpecial: false,
    order: 1,
    tags: ['vegetarian', 'healthy'],
  },
  {
    id: '3',
    restaurantId: 'demo',
    categoryId: 'mains',
    name: 'Handmade Pasta Carbonara',
    description: 'Fresh egg pasta, pancetta, parmesan, black pepper, egg yolk',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    available: true,
    isSpecial: false,
    order: 2,
  },
  {
    id: '4',
    restaurantId: 'demo',
    categoryId: 'desserts',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla bean ice cream, fresh berries',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop',
    available: true,
    isSpecial: false,
    order: 1,
  },
];

export const MenuManagementPanel = () => {
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(demoMenuItems);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    available: true,
    isSpecial: false,
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
      available: true,
      isSpecial: false,
      tags: '',
    });
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      restaurantId: 'demo',
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      available: formData.available,
      isSpecial: formData.isSpecial,
      order: menuItems.length + 1,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
    };

    setMenuItems((prev) => [...prev, newItem]);
    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: 'Item added!',
      description: `${newItem.name} has been added to the menu`,
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price),
              categoryId: formData.categoryId,
              image: formData.image,
              available: formData.available,
              isSpecial: formData.isSpecial,
              tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
            }
          : item
      )
    );

    setEditingItem(null);
    resetForm();
    toast({
      title: 'Item updated!',
      description: `${formData.name} has been updated`,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    toast({
      title: 'Item deleted',
      description: `${item?.name} has been removed from the menu`,
    });
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const toggleSpecial = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isSpecial: !item.isSpecial } : item
      )
    );
  };

  const openEditDialog = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      image: item.image,
      available: item.available,
      isSpecial: item.isSpecial,
      tags: item.tags?.join(', ') || '',
    });
    setEditingItem(item);
  };

  const ItemCard = ({ item }: { item: MenuItem }) => {
    const category = categories.find((c) => c.id === item.categoryId);

    return (
      <Card className={`overflow-hidden transition-all hover:shadow-lg ${!item.available ? 'opacity-60' : ''}`}>
        <div className="relative aspect-[4/3]">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Badge variant="secondary">Unavailable</Badge>
            </div>
          )}
          {item.isSpecial && (
            <Badge className="absolute top-2 left-2 bg-amber-500">
              <Star className="w-3 h-3 mr-1" />
              Special
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleAvailability(item.id)}>
                {item.available ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Mark Unavailable
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Mark Available
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSpecial(item.id)}>
                <Star className={`w-4 h-4 mr-2 ${item.isSpecial ? 'fill-amber-500 text-amber-500' : ''}`} />
                {item.isSpecial ? 'Remove from Specials' : 'Add to Specials'}
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
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-xs text-slate-500">{category?.name}</p>
            </div>
            <span className="font-bold text-violet-600">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {item.description}
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Menu Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Add, edit, and organize your menu items</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-violet-500 to-purple-600"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-slate-500">
          <strong className="text-slate-900 dark:text-white">{filteredItems.length}</strong> items
        </span>
        <span className="text-slate-500">
          <strong className="text-emerald-600">{filteredItems.filter((i) => i.available).length}</strong> available
        </span>
        <span className="text-slate-500">
          <strong className="text-amber-600">{filteredItems.filter((i) => i.isSpecial).length}</strong> specials
        </span>
      </div>

      {/* Items Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No menu items found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isAddDialogOpen || !!editingItem} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingItem(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the details of this menu item' : 'Fill in the details to add a new item to your menu'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Truffle Burger"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the dish..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.id !== 'specials').map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              {formData.image && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img src={formData.image} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="vegetarian, spicy, popular"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="available">Available</Label>
                <p className="text-xs text-slate-500">Show this item on the menu</p>
              </div>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="special">Special Item</Label>
                <p className="text-xs text-slate-500">Feature in Today's Specials</p>
              </div>
              <Switch
                id="special"
                checked={formData.isSpecial}
                onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              disabled={!formData.name || !formData.description || !formData.price || !formData.categoryId}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
