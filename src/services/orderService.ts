import { firestoreService, COLLECTIONS, where, orderBy, Timestamp } from '@/lib/firebase';
import { Order, OrderStatus, PaymentStatus, OrderItem, cartItemToOrderItem } from '@/types/order';
import { CartItem } from '@/types/menu';

export const orderService = {
  // Create a new order
  async createOrder(
    restaurantId: string,
    tableNumber: string,
    cartItems: CartItem[],
    notes?: string,
    taxRate: number = 0,
    serviceCharge: number = 0
  ): Promise<string> {
    const items: OrderItem[] = cartItems.map(cartItemToOrderItem);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax + serviceCharge;

    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      restaurantId,
      tableNumber,
      items,
      subtotal,
      tax,
      serviceCharge: serviceCharge > 0 ? serviceCharge : undefined,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      notes,
    };

    return firestoreService.addDocument(COLLECTIONS.ORDERS, orderData);
  },

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    return firestoreService.getDocument<Order>(COLLECTIONS.ORDERS, orderId);
  },

  // Get orders for a restaurant
  async getRestaurantOrders(
    restaurantId: string,
    status?: OrderStatus
  ): Promise<Order[]> {
    const constraints = [
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc'),
    ];

    if (status) {
      constraints.unshift(where('status', '==', status));
    }

    return firestoreService.getCollection<Order>(COLLECTIONS.ORDERS, constraints);
  },

  // Get active orders (not completed or cancelled)
  async getActiveOrders(restaurantId: string): Promise<Order[]> {
    return firestoreService.getCollection<Order>(COLLECTIONS.ORDERS, [
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'served']),
      orderBy('createdAt', 'desc'),
    ]);
  },

  // Get orders by table
  async getTableOrders(restaurantId: string, tableNumber: string): Promise<Order[]> {
    return firestoreService.getCollection<Order>(COLLECTIONS.ORDERS, [
      where('restaurantId', '==', restaurantId),
      where('tableNumber', '==', tableNumber),
      where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'served']),
      orderBy('createdAt', 'desc'),
    ]);
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const updates: Partial<Order> = { status };

    // Add timestamp for status change
    const timestampField = `${status}At` as keyof Order;
    if (['confirmed', 'prepared', 'ready', 'served', 'completed'].includes(status)) {
      (updates as any)[timestampField] = Timestamp.now();
    }

    return firestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, updates);
  },

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, { paymentStatus });
  },

  // Update order item status (for kitchen)
  async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'ready'
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const updatedItems = order.items.map((item) =>
      item.id === itemId ? { ...item, status } : item
    );

    return firestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, {
      items: updatedItems,
    });
  },

  // Remove item from order
  async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const updatedItems = order.items.filter((item) => item.id !== itemId);
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = order.subtotal > 0 ? order.tax / order.subtotal : 0.05;
    const tax = subtotal * taxRate;
    const total = subtotal + tax + (order.serviceCharge || 0) - (order.discount || 0);

    return firestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, {
      items: updatedItems,
      subtotal,
      tax,
      total,
    });
  },

  // Add kitchen notes
  async addKitchenNotes(orderId: string, notes: string): Promise<void> {
    return firestoreService.updateDocument(COLLECTIONS.ORDERS, orderId, {
      kitchenNotes: notes,
    });
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    return this.updateOrderStatus(orderId, 'cancelled');
  },

  // Subscribe to restaurant orders (real-time)
  subscribeToRestaurantOrders(
    restaurantId: string,
    callback: (orders: Order[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Order>(
      COLLECTIONS.ORDERS,
      callback,
      [
        where('restaurantId', '==', restaurantId),
        where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'served']),
        orderBy('createdAt', 'desc'),
      ]
    );
  },

  // Subscribe to a single order (for customer tracking)
  subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
    return firestoreService.subscribeToDocument<Order>(COLLECTIONS.ORDERS, orderId, callback);
  },

  // Subscribe to kitchen orders (preparing status)
  subscribeToKitchenOrders(
    restaurantId: string,
    callback: (orders: Order[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Order>(
      COLLECTIONS.ORDERS,
      callback,
      [
        where('restaurantId', '==', restaurantId),
        where('status', 'in', ['confirmed', 'preparing']),
        orderBy('createdAt', 'asc'),
      ]
    );
  },
};
