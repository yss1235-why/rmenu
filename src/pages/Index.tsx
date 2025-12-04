import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { RefreshCw, AlertCircle, MapPin, LogIn, UtensilsCrossed } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  UtensilsCrossed,
  Star,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MenuItem, CartItem } from '@/types/menu';
import { useMenu } from '@/hooks/useMenu';
import { useOrders, useTableOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ImageLightbox } from '@/components/ImageLightbox';
import { MenuImage } from '@/components/MenuImage';
import { MenuItemCard } from '@/components/MenuItemCard';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';
const RESTAURANT_NAME = import.meta.env.VITE_RESTAURANT_NAME || 'Restaurant';
const TAX_RATE = parseFloat(import.meta.env.VITE_TAX_RATE || '0.05'); // 5% default

const Index = () => {
  const { restaurantSlug, tableNumber: tableParam } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get table number from URL param or query string
  const tableNumber = tableParam || searchParams.get('table') || '';

  // Real-time data from Firebase
  const { categories, menuItems, specialItems, loading, error } = useMenu({ 
    restaurantId: RESTAURANT_ID 
  });
  const { createOrder } = useOrders({ restaurantId: RESTAURANT_ID });
  const { activeOrder } = useTableOrders(RESTAURANT_ID, tableNumber);

  // Local state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
 const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Navigate to next/previous item in popup
  const navigateItem = (direction: 'next' | 'prev') => {
    const availableItems = filteredItems.length > 0 ? filteredItems : menuItems.filter(item => item.available);
    if (availableItems.length === 0) return;
    
    let newIndex = selectedItemIndex;
    if (direction === 'next') {
      newIndex = selectedItemIndex >= availableItems.length - 1 ? 0 : selectedItemIndex + 1;
    } else {
      newIndex = selectedItemIndex <= 0 ? availableItems.length - 1 : selectedItemIndex - 1;
    }
    
    setSelectedItemIndex(newIndex);
    setSelectedItem(availableItems[newIndex]);
  };

  // Handle item selection from grid
  const handleSelectItem = (item: MenuItem) => {
    const availableItems = filteredItems.length > 0 ? filteredItems : menuItems.filter(i => i.available);
    const index = availableItems.findIndex(i => i.id === item.id);
    setSelectedItemIndex(index >= 0 ? index : 0);
    setSelectedItem(item);
  };

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems.filter(item => item.available)
    : menuItems.filter(item => item.categoryId === selectedCategory && item.available);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartTotal * TAX_RATE;
  const cartGrandTotal = cartTotal + cartTax;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => 
          i.menuItemId === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        id: `cart-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      }];
    });

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  // Update cart item quantity
  const updateCartQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item from cart
  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      toast({
        variant: 'destructive',
        title: 'Table Required',
        description: 'Please scan a table QR code to place an order.',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart Empty',
        description: 'Please add items to your cart first.',
      });
      return;
    }

    setIsOrdering(true);
    try {
      await createOrder(tableNumber, cart, orderNotes, TAX_RATE);
      
      setCart([]);
      setOrderNotes('');
      setCartOpen(false);
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been sent to the kitchen.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.',
      });
    } finally {
      setIsOrdering(false);
    }
  };

 if (loading) {
    return <LoadingScreen message="Loading menu..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Menu</h2>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              {/* Restaurant Logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {RESTAURANT_NAME}
              </h1>
              {tableNumber && (
                <Badge variant="secondary" className="mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  Table {tableNumber}
                </Badge>
              )}
            </div>

           {/* Login Button */}
            <Link to="/login">
              <Button variant="ghost" size="icon" className="rounded-full">
                <LogIn className="w-5 h-5 text-slate-700" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Active Order Banner */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-success to-success/80 text-success-foreground px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                Order in progress: {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
              </span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {activeOrder.items.length} items
            </Badge>
          </div>
        </div>
      )}

      {/* Category Nav */}
      <nav className="sticky top-[73px] z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 py-3">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-primary' : ''}
              >
                All
              </Button>
              {categories.filter(c => c.active).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-primary' : ''}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
       {/* Today's Specials - 1 item per row on mobile (featured) */}
        {selectedCategory === 'all' && specialItems.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <h2 className="text-xl font-serif font-semibold">Today's Specials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {specialItems.map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onAddToCart={addToCart}
                  onView={handleSelectItem}
                  variant="featured"
                />
              ))}
            </div>
          </section>
        )}

       {/* Menu Items - 2 columns on mobile, 2 on tablet, 3-4 on desktop */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600">No Items Available</h3>
            <p className="text-slate-500">Check back later for our menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart}
                onView={handleSelectItem}
                variant="compact"
              />
            ))}
          </div>
        )}
      </main>

    {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden transition-all will-change-transform">
          {selectedItem && (
            <>
              {/* Image Carousel - Swipe here changes image only */}
             <div className="relative">
                <ImageCarousel
                  images={selectedItem.images}
                  fallbackImage={selectedItem.image}
                  alt={selectedItem.name}
                  onImageClick={(index) => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              </div>
              
              {/* Content Area - Swipe here changes item */}
             <div 
                className="p-6 transition-opacity duration-200 ease-out"
                onTouchStart={(e) => {
                  (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const startX = (e.currentTarget as any)._touchStartX;
                  const endX = e.changedTouches[0].clientX;
                  const diff = startX - endX;
                  
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      navigateItem('next');
                    } else {
                      navigateItem('prev');
                    }
                  }
                }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedItem.name}
                    {selectedItem.isSpecial && (
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription>{selectedItem.description}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <p className="text-2xl font-bold text-violet-600">
                    ₹{selectedItem.price.toFixed(2)}
                  </p>
                </div>

                {/* Item navigation hint */}
                <p className="text-xs text-muted-foreground text-center mb-4">
                  ← Swipe to browse items →
                </p>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                    onClick={() => {
                      addToCart(selectedItem);
                      setSelectedItem(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
     {selectedItem && (
        <ImageLightbox
          images={selectedItem.images}
          fallbackImage={selectedItem.image}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

     {/* Floating Cart Button (Bottom Right) - Only shows when cart has items */}
      {cartItemCount > 0 && (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <button className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold border-2 border-card">
                {cartItemCount}
              </Badge>
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
              <SheetDescription>
                {cartItemCount} items in your cart
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 my-4 max-h-[50vh]">
              <div className="space-y-4">
                {cart.map((item) => (
                 <div key={item.menuItemId} className="flex items-center gap-3">
                    <MenuImage
                      src={item.image}
                      alt={item.name}
                      preset="thumbnail"
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                      aspectRatio="square"
                      showPlaceholder={false}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-violet-600 font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.menuItemId, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.menuItemId, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeFromCart(item.menuItemId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4">
              <Textarea
                placeholder="Special instructions or notes..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
              />

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{cartGrandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isOrdering || !tableNumber}
              >
                {isOrdering ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order • ₹{cartGrandTotal.toFixed(2)}
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};



export default Index;
