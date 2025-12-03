import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
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
import { getOptimizedImageUrl } from '@/lib/cloudinary';

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
  const [orderNotes, setOrderNotes] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading menu...</p>
        </div>
      </div>
    );
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
            <div>
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

            {/* Cart Button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button 
                  className="relative bg-gradient-to-r from-violet-500 to-purple-600"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 bg-red-500 text-white border-0"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>
                    {cart.length === 0 
                      ? 'Your cart is empty' 
                      : `${cartItemCount} items in your cart`}
                  </SheetDescription>
                </SheetHeader>

                {cart.length > 0 ? (
                  <>
                    <ScrollArea className="flex-1 my-4 max-h-[50vh]">
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.menuItemId} className="flex items-center gap-3">
                            {item.image && (
                              <img 
                                src={getOptimizedImageUrl(item.image, 'thumbnail')} 
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
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
                          <span className="text-violet-600">₹{cartGrandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="pt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500">Your cart is empty</p>
                    <Button 
                      variant="link" 
                      onClick={() => setCartOpen(false)}
                      className="mt-2"
                    >
                      Browse Menu
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
       

            {/* Login Button */}
            <Link to="/login">
              <Button variant="ghost" size="icon" className="rounded-full">
                <LogIn className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Active Order Banner */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3">
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
      <nav className="sticky top-[73px] z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 py-3">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
              >
                All
              </Button>
              {categories.filter(c => c.active).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
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
        {/* Today's Specials */}
        {selectedCategory === 'all' && specialItems.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-serif font-semibold">Today's Specials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialItems.map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onAdd={addToCart}
                  onView={setSelectedItem}
                  isSpecial
                />
              ))}
            </div>
          </section>
        )}

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600">No Items Available</h3>
            <p className="text-slate-500">Check back later for our menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAdd={addToCart}
                onView={setSelectedItem}
              />
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              {selectedItem.image && (
                <div className="aspect-video -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                  <img 
                    src={getOptimizedImageUrl(selectedItem.image, 'menuDetail')} 
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
            </>
          )}
        </DialogContent>
      </Dialog>

     {/* Floating Cart Button (Mobile) - Always visible */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <Button
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-xl"
          size="lg"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {cartItemCount > 0 ? (
            <>View Cart ({cartItemCount}) • ₹{cartGrandTotal.toFixed(2)}</>
          ) : (
            <>Your Cart is Empty</>
          )}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onView: (item: MenuItem) => void;
  isSpecial?: boolean;
}

const MenuItemCard = ({ item, onAdd, onView, isSpecial = false }: MenuItemCardProps) => {
  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
        isSpecial ? 'ring-2 ring-amber-400/50' : ''
      }`}
      onClick={() => onView(item)}
    >
      {item.image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={getOptimizedImageUrl(item.image, 'menuCard')} 
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{item.name}</h3>
              {item.isSpecial && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-violet-600">
            ₹{item.price.toFixed(2)}
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-600"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Index;
