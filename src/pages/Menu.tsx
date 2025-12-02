import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategorySection } from '@/components/CategorySection';
import { Cart } from '@/components/Cart';
import { menuItems, categories } from '@/data/sampleMenu';
import { MenuItem, CartItem } from '@/types/menu';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const table = searchParams.get('table') || '1';
    setTableNumber(table);
  }, [searchParams]);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast({
      title: 'Added to order',
      description: `${item.name} added to your order`,
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({
      title: 'Item removed',
      description: 'Item removed from your order',
    });
  };

  const handleSubmitOrder = (notes: string) => {
    // In production, this would submit to Firebase
    console.log('Order submitted:', { cart, notes, tableNumber });
    toast({
      title: 'Order placed!',
      description: `Your order has been sent to the kitchen. Table ${tableNumber}`,
    });
    setCart([]);
  };

  const specialItems = menuItems.filter((item) => item.isSpecial);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">La Maison</h1>
              <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Specials Section */}
        {specialItems.length > 0 && (
          <CategorySection
            category={categories.find((c) => c.id === 'specials')!}
            items={specialItems}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Regular Categories */}
        {categories
          .filter((category) => category.id !== 'specials' && category.active)
          .map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.categoryId === category.id && item.available
            );
            return (
              <CategorySection
                key={category.id}
                category={category}
                items={categoryItems}
                onAddToCart={handleAddToCart}
              />
            );
          })}
      </main>

      {/* Cart */}
      <Cart
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmitOrder={handleSubmitOrder}
        tableNumber={tableNumber}
      />
    </div>
  );
};

export default Menu;
