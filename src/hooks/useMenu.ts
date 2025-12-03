import { useState, useEffect, useCallback } from 'react';
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
            (data) => {
              setCategories(data);
            }
          );

          unsubscribeItems = menuService.subscribeToMenuItems(
            restaurantId,
            (data) => {
              setMenuItems(data);
              setLoading(false);
            }
          );
        } else {
          // One-time fetch
          const [categoriesData, itemsData] = await Promise.all([
            menuService.getCategories(restaurantId),
            menuService.getMenuItems(restaurantId),
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

  // Category operations
  const createCategory = useCallback(
    async (data: Partial<Category>) => {
      return menuService.createCategory({
        ...data,
        restaurantId,
      } as Omit<Category, 'id'>);
    },
    [restaurantId]
  );

  const updateCategory = useCallback(
    async (categoryId: string, data: Partial<Category>) => {
      return menuService.updateCategory(categoryId, data);
    },
    []
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      return menuService.deleteCategory(categoryId);
    },
    []
  );

  // Menu item operations
  const createMenuItem = useCallback(
    async (data: Partial<MenuItem>) => {
      return menuService.createMenuItem({
        ...data,
        restaurantId,
      } as Omit<MenuItem, 'id'>);
    },
    [restaurantId]
  );

  const updateMenuItem = useCallback(
    async (itemId: string, data: Partial<MenuItem>) => {
      return menuService.updateMenuItem(itemId, data);
    },
    []
  );

  const deleteMenuItem = useCallback(
    async (itemId: string) => {
      return menuService.deleteMenuItem(itemId);
    },
    []
  );

  // Get items by category
  const getItemsByCategory = useCallback(
    (categoryId: string): MenuItem[] => {
      return menuItems.filter(
        (item) => item.categoryId === categoryId && item.available
      );
    },
    [menuItems]
  );

  // Get special items
  const specialItems = menuItems.filter((item) => item.isSpecial && item.available);

  // Get available items only
  const availableItems = menuItems.filter((item) => item.available);

  return {
    categories,
    menuItems,
    availableItems,
    specialItems,
    getItemsByCategory,
    loading,
    error,
    // Category operations
    createCategory,
    updateCategory,
    deleteCategory,
    // Menu item operations
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
};
