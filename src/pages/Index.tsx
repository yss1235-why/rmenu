import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CategorySection } from '@/components/CategorySection';
import { CategoryNav } from '@/components/CategoryNav';
import { Cart } from '@/components/Cart';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/theme';
import { useDemoMenu } from '@/hooks/useMenu';
import { useDemoRestaurant } from '@/hooks/useRestaurant';
import { useCart } from '@/hooks/useCart';
import { MenuItem } from '@/types/menu';
import { UtensilsCrossed } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { restaurantSlug, tableNumber: tableParam } = useParams();
  const { theme } = useTheme();
  const { toast } = useToast();

  // State
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');

  // Use demo data (replace with real hooks when Firebase is configured)
  const restaurant = useDemoRestaurant();
  const { categories, menuItems, getItemsByCategory, specialItems } = useDemoMenu();
  const cart = useCart();

  // Get table number from params or query
  useEffect(() => {
    const table = tableParam || searchParams.get('table') || '1';
    setTableNumber(table);
  }, [tableParam, searchParams]);

  // Handle splash screen
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, theme.splash.duration);

    return () => clearTimeout(splashTimer);
  }, [theme.splash.duration]);

  // Handle loading state after splash
  useEffect(() => {
    if (!showSplash) {
      // Simulate data loading
      const loadTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(loadTimer);
    }
  }, [showSplash]);

  // Set initial active category
  useEffect(() => {
    if (!isLoading && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [isLoading, categories, activeCategory]);

  // Track scroll position to update active category
  useEffect(() => {
    if (isLoading || showSplash) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = categories.length - 1; i >= 0; i--) {
        const category = categories[i];
        const element = document.getElementById(`category-${category.id}`);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(category.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, showSplash, categories]);

  const handleAddToCart = (item: MenuItem) => {
    cart.addItem(item);
    toast({
      title: 'Added to order',
      description: `${item.name} added to your order`,
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleSubmitOrder = async (notes: string) => {
    try {
      // In production, this would call orderService.createOrder()
      console.log('Order submitted:', {
        items: cart.items,
        notes,
        tableNumber,
        total: cart.calculateTotal(restaurant.settings.taxRate),
      });

      toast({
        title: 'Order placed!',
        description: `Your order has been sent to the kitchen. Table ${tableNumber}`,
      });

      cart.clearCart();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreen restaurantName={restaurant.name} />;
  }

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading menu..." />;
  }

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
                {restaurant.name}
              </h1>
              <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      </header>

      {/* Menu Content */}
      <main className="app-content">
        <div className="px-4 py-6">
          {/* Specials Section */}
          {specialItems.length > 0 && (
            <CategorySection
              category={{
                id: 'specials',
                restaurantId: restaurant.id,
                name: "Today's Specials",
                order: 0,
                active: true,
              }}
              items={specialItems}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Regular Categories */}
          {categories
            .filter((c) => c.id !== 'specials')
            .map((category) => {
              const categoryItems = getItemsByCategory(category.id);
              if (categoryItems.length === 0) return null;

              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
        </div>
      </main>

      {/* Cart */}
      <Cart
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onSubmitOrder={handleSubmitOrder}
        tableNumber={tableNumber}
      />
    </div>
  );
};

export default Index;
