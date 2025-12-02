import { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';
import { MenuItem, Category } from '@/types/menu';

interface UseMenuOptions {
  restaurantId: string;
  realtime?: boolean;
}

export const useMenu = ({ restaurantId, realtime = true }: UseMenuOptions) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribeCategories: (() => void) | undefined;
    let unsubscribeItems: (() => void) | undefined;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        if (realtime) {
          // Subscribe to real-time updates
          unsubscribeCategories = menuService.subscribeToCategories(
            restaurantId,
            setCategories
          );

          unsubscribeItems = menuService.subscribeToMenuItems(
            restaurantId,
            setMenuItems
          );

          setLoading(false);
        } else {
          // One-time fetch
          const [categoriesData, itemsData] = await Promise.all([
            menuService.getCategories(restaurantId),
            menuService.getAvailableMenuItems(restaurantId),
          ]);

          setCategories(categoriesData);
          setMenuItems(itemsData);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch menu'));
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenu();
    }

    return () => {
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeItems) unsubscribeItems();
    };
  }, [restaurantId, realtime]);

  // Get items by category
  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    return menuItems.filter(
      (item) => item.categoryId === categoryId && item.available
    );
  };

  // Get special items
  const specialItems = menuItems.filter((item) => item.isSpecial && item.available);

  return {
    categories,
    menuItems,
    specialItems,
    getItemsByCategory,
    loading,
    error,
  };
};

// Hook for demo menu data (for development without Firebase)
export const useDemoMenu = () => {
  const categories: Category[] = [
    { id: 'specials', restaurantId: 'demo', name: "Today's Specials", order: 0, active: true },
    { id: 'starters', restaurantId: 'demo', name: 'Starters', order: 1, active: true },
    { id: 'mains', restaurantId: 'demo', name: 'Main Courses', order: 2, active: true },
    { id: 'desserts', restaurantId: 'demo', name: 'Desserts', order: 3, active: true },
    { id: 'beverages', restaurantId: 'demo', name: 'Beverages', order: 4, active: true },
  ];

  const menuItems: MenuItem[] = [
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
    {
      id: '5',
      restaurantId: 'demo',
      categoryId: 'mains',
      name: 'Grilled Ribeye',
      description: '12oz prime ribeye, herb butter, roasted vegetables, truffle mash',
      price: 42.99,
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
      available: true,
      isSpecial: true,
      order: 3,
    },
    {
      id: '6',
      restaurantId: 'demo',
      categoryId: 'starters',
      name: 'Tomato Basil Soup',
      description: 'Creamy roasted tomato soup with fresh basil and garlic croutons',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
      available: true,
      isSpecial: false,
      order: 2,
    },
    {
      id: '7',
      restaurantId: 'demo',
      categoryId: 'beverages',
      name: 'Fresh Lemonade',
      description: 'House-made lemonade with mint and honey',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&h=600&fit=crop',
      available: true,
      isSpecial: false,
      order: 1,
    },
    {
      id: '8',
      restaurantId: 'demo',
      categoryId: 'beverages',
      name: 'Iced Coffee',
      description: 'Cold brew coffee served over ice with your choice of milk',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&h=600&fit=crop',
      available: true,
      isSpecial: false,
      order: 2,
    },
  ];

  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    return menuItems.filter(
      (item) => item.categoryId === categoryId && item.available
    );
  };

  const specialItems = menuItems.filter((item) => item.isSpecial && item.available);

  return {
    categories,
    menuItems,
    specialItems,
    getItemsByCategory,
    loading: false,
    error: null,
  };
};
