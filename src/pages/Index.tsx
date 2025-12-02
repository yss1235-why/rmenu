import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
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
import { UtensilsCrossed, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = (item: MenuItem, quantity: number = 1) => {
    cart.addItem(item, quantity);
    toast({
      title: 'Added to cart',
      description: `${item.name} x${quantity}`,
    });
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    try {
      // TODO: Integrate with orderService when Firebase is configured
      console.log('Submitting order:', {
        items: cart.items,
        tableNumber,
        restaurantSlug,
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
          <div className="flex items-center justify-between">
            {/* Left side - Restaurant info */}
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

            {/* Right side - Staff Login Button */}
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <UserCircle className="w-5 h-5" />
                <span className="ml-2 hidden sm:inline text-sm">Staff</span>
              </Button>
            </Link>
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
