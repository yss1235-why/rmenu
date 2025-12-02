import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';
import { CategorySection } from '@/components/CategorySection';
import { CategoryNav } from '@/components/CategoryNav';
import { Cart } from '@/components/Cart';
import { menuItems, categories } from '@/data/sampleMenu';
import { MenuItem, CartItem } from '@/types/menu';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

const RESTAURANT_NAME = "Flavor Haven";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const { toast } = useToast();

  // Initial loading and splash screen
  useEffect(() => {
    const table = searchParams.get('table') || '1';
    setTableNumber(table);

    // Simulate loading time for splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Set initial active category
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      const firstActiveCategory = categories.find(c => c.active);
      if (firstActiveCategory) {
        setActiveCategory(firstActiveCategory.id);
      }
    }
  }, [isLoading]);

  // Track scroll position to update active category
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      const categoryElements = categories
        .filter(c => c.active)
        .map(c => ({
          id: c.id,
          element: document.getElementById(`category-${c.id}`)
        }))
        .filter(c => c.element);

      const scrollPosition = window.scrollY + 160;

      for (let i = categoryElements.length - 1; i >= 0; i--) {
        const { id, element } = categoryElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

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
    console.log('Order submitted:', { cart, notes, tableNumber });
    toast({
      title: 'Order placed!',
      description: `Your order has been sent to the kitchen. Table ${tableNumber}`,
    });
    setCart([]);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen restaurantName={RESTAURANT_NAME} />;
  }

  // Get active categories
  const activeCategories = categories.filter(c => c.active);

  return (
    <div className="app-shell bg-background">
      {/* Header */}
      <header className="app-header">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-xl font-bold text-foreground truncate">
                {RESTAURANT_NAME}
              </h1>
              <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
            </div>
          </div>
        </div>
        
        {/* Category Navigation */}
        <CategoryNav
          categories={activeCategories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      </header>

      {/* Menu Content */}
      <main className="app-content">
        <div className="px-4 py-6">
          {activeCategories.map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.categoryId === category.id && item.available
            );
            
            // Also include special items in their respective categories
            const specialItems = category.id === 'specials' 
              ? menuItems.filter(item => item.isSpecial && item.available)
              : categoryItems;
              
            return (
              <CategorySection
                key={category.id}
                category={category}
                items={category.id === 'specials' ? specialItems : categoryItems}
                onAddToCart={handleAddToCart}
              />
            );
          })}
        </div>
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

export default Index;
