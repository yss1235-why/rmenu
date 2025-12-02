import { Timestamp } from 'firebase/firestore';
import { ThemeConfig } from '@/theme/config';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  logo?: string;
  coverImage?: string;

  // Contact Information
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };

  // Location
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Operating Hours
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };

  // Settings
  settings: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    serviceCharge?: number;
    acceptsOrders: boolean;
    requiresTableNumber: boolean;
    notificationEmail?: string;
  };

  // Theme customization
  theme?: Partial<ThemeConfig>;

  // UPI Payment
  payment?: {
    upiId?: string;
    upiQrCode?: string;
    paymentInstructions?: string;
  };

  // Status
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  qrCode?: string;
  isActive: boolean;
  currentOrderId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RestaurantUser {
  id: string;
  restaurantId: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'waiter' | 'kitchen';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
