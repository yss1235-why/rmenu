import { useState, useEffect } from 'react';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';

interface UseRestaurantOptions {
  restaurantId?: string;
  slug?: string;
}

export const useRestaurant = ({ restaurantId, slug }: UseRestaurantOptions = {}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);

        if (restaurantId) {
          // Subscribe to real-time updates
          unsubscribe = restaurantService.subscribeToRestaurant(restaurantId, (data) => {
            setRestaurant(data);
            setLoading(false);
          });
        } else if (slug) {
          const data = await restaurantService.getRestaurantBySlug(slug);
          setRestaurant(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch restaurant'));
        setLoading(false);
      }
    };

    fetchRestaurant();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [restaurantId, slug]);

  return { restaurant, loading, error };
};

// Hook for getting demo/default restaurant (for development)
export const useDemoRestaurant = (): Restaurant => {
  return {
    id: 'demo',
    name: 'Flavor Haven',
    slug: 'flavor-haven',
    tagline: 'Digital Menu',
    description: 'Experience dining reimagined',
    isActive: true,
    contact: {
      phone: '+1 234 567 890',
      email: 'hello@flavorhaven.com',
    },
    address: {
      street: '123 Main Street',
      city: 'Foodville',
      state: 'CA',
      zipCode: '12345',
      country: 'USA',
    },
    hours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
    settings: {
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.5,
      acceptsOrders: true,
      requiresTableNumber: true,
    },
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  };
};
