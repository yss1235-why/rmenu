import { Timestamp } from 'firebase/firestore';
import { CartItem } from './menu';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'verified' | 'refunded';

export interface Order {
  id: string;
  restaurantId: string;
  tableNumber: string;
  tableId?: string;

  // Order Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  tax: number;
  serviceCharge?: number;
  discount?: number;
  total: number;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;

  // Customer Info (optional)
  customerName?: string;
  customerPhone?: string;

  // Notes
  notes?: string;
  kitchenNotes?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  preparedAt?: Timestamp;
  readyAt?: Timestamp;
  servedAt?: Timestamp;
  completedAt?: Timestamp;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;

  // Item status for kitchen tracking
  status: 'pending' | 'preparing' | 'ready';
}

// Helper to convert CartItem to OrderItem
export const cartItemToOrderItem = (cartItem: CartItem): OrderItem => ({
  id: cartItem.id,
  menuItemId: cartItem.id,
  name: cartItem.name,
  price: cartItem.price,
  quantity: cartItem.quantity,
  notes: cartItem.notes,
  image: cartItem.image,
  status: 'pending',
});
