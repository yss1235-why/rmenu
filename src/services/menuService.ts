import { firestoreService, COLLECTIONS, where, orderBy } from '@/lib/firebase';
import { MenuItem, Category } from '@/types/menu';

export const menuService = {
  // Category operations
  async getCategories(restaurantId: string): Promise<Category[]> {
    return firestoreService.getCollection<Category>(COLLECTIONS.CATEGORIES, [
      where('restaurantId', '==', restaurantId),
      where('active', '==', true),
      orderBy('order'),
    ]);
  },

  async getCategory(categoryId: string): Promise<Category | null> {
    return firestoreService.getDocument<Category>(COLLECTIONS.CATEGORIES, categoryId);
  },

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return firestoreService.addDocument(COLLECTIONS.CATEGORIES, data);
  },

  async updateCategory(categoryId: string, data: Partial<Category>): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.CATEGORIES, categoryId, data);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    // Soft delete - just mark as inactive
    return firestoreService.updateDocument(COLLECTIONS.CATEGORIES, categoryId, { active: false });
  },

  subscribeToCategories(
    restaurantId: string,
    callback: (categories: Category[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Category>(
      COLLECTIONS.CATEGORIES,
      callback,
      [where('restaurantId', '==', restaurantId), where('active', '==', true), orderBy('order')]
    );
  },

  // Menu Item operations
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return firestoreService.getCollection<MenuItem>(COLLECTIONS.MENU_ITEMS, [
      where('restaurantId', '==', restaurantId),
      orderBy('order'),
    ]);
  },

  async getMenuItemsByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    return firestoreService.getCollection<MenuItem>(COLLECTIONS.MENU_ITEMS, [
      where('restaurantId', '==', restaurantId),
      where('categoryId', '==', categoryId),
      where('available', '==', true),
      orderBy('order'),
    ]);
  },

  async getAvailableMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return firestoreService.getCollection<MenuItem>(COLLECTIONS.MENU_ITEMS, [
      where('restaurantId', '==', restaurantId),
      where('available', '==', true),
      orderBy('order'),
    ]);
  },

  async getSpecialItems(restaurantId: string): Promise<MenuItem[]> {
    return firestoreService.getCollection<MenuItem>(COLLECTIONS.MENU_ITEMS, [
      where('restaurantId', '==', restaurantId),
      where('isSpecial', '==', true),
      where('available', '==', true),
    ]);
  },

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return firestoreService.getDocument<MenuItem>(COLLECTIONS.MENU_ITEMS, itemId);
  },

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return firestoreService.addDocument(COLLECTIONS.MENU_ITEMS, data);
  },

  async updateMenuItem(itemId: string, data: Partial<MenuItem>): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.MENU_ITEMS, itemId, data);
  },

  async deleteMenuItem(itemId: string): Promise<void> {
    return firestoreService.deleteDocument(COLLECTIONS.MENU_ITEMS, itemId);
  },

  async toggleItemAvailability(itemId: string, available: boolean): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.MENU_ITEMS, itemId, { available });
  },

  subscribeToMenuItems(
    restaurantId: string,
    callback: (items: MenuItem[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<MenuItem>(
      COLLECTIONS.MENU_ITEMS,
      callback,
      [where('restaurantId', '==', restaurantId), orderBy('order')]
    );
  },
};
