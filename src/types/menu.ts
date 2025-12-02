import { Timestamp } from 'firebase/firestore';

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string; // Cloudinary URL

  // Availability
  available: boolean;
  isSpecial: boolean;

  // Additional info
  preparationTime?: number; // in minutes
  calories?: number;
  allergens?: string[];
  tags?: string[]; // vegetarian, vegan, spicy, etc.

  // Variants/Options
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];

  // Display order
  order: number;

  // Timestamps
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  priceModifier: number; // Can be positive or negative
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
  selectedVariant?: MenuItemVariant;
  selectedAddons?: MenuItemAddon[];
}

// Calculate cart item total
export const calculateCartItemTotal = (item: CartItem): number => {
  let total = item.price * item.quantity;

  if (item.selectedVariant) {
    total += item.selectedVariant.priceModifier * item.quantity;
  }

  if (item.selectedAddons) {
    const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    total += addonsTotal * item.quantity;
  }

  return total;
};
