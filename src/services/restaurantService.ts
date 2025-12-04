import { firestoreService, COLLECTIONS, where, orderBy } from '@/lib/firebase';
import { Restaurant, Table, RestaurantUser } from '@/types/restaurant';

export const restaurantService = {
  // Get restaurant by ID
  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    return firestoreService.getDocument<Restaurant>(COLLECTIONS.RESTAURANTS, restaurantId);
  },

  // Get restaurant by slug
  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const restaurants = await firestoreService.getCollection<Restaurant>(
      COLLECTIONS.RESTAURANTS,
      [where('slug', '==', slug), where('isActive', '==', true)]
    );
    return restaurants[0] || null;
  },

  // Create restaurant
  async createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return firestoreService.addDocument(COLLECTIONS.RESTAURANTS, data);
  },

  // Update restaurant
  async updateRestaurant(restaurantId: string, data: Partial<Restaurant>): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.RESTAURANTS, restaurantId, data);
  },

  // Subscribe to restaurant updates
  subscribeToRestaurant(
    restaurantId: string,
    callback: (restaurant: Restaurant | null) => void
  ): () => void {
    return firestoreService.subscribeToDocument<Restaurant>(
      COLLECTIONS.RESTAURANTS,
      restaurantId,
      callback
    );
  },

 
  // User operations
  async getRestaurantUsers(restaurantId: string): Promise<RestaurantUser[]> {
    return firestoreService.getCollection<RestaurantUser>(COLLECTIONS.USERS, [
      where('restaurantId', '==', restaurantId),
      where('isActive', '==', true),
    ]);
  },

  async getUserByEmail(email: string): Promise<RestaurantUser | null> {
    const users = await firestoreService.getCollection<RestaurantUser>(COLLECTIONS.USERS, [
      where('email', '==', email),
    ]);
    return users[0] || null;
  },
};
