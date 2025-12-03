import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types/order';
import { CartItem } from '@/types/menu';

interface UseOrdersOptions {
  restaurantId: string;
  realtime?: boolean;
}

export const useOrders = ({ restaurantId, realtime = true }: UseOrdersOptions) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        if (realtime) {
          unsubscribe = orderService.subscribeToRestaurantOrders(
            restaurantId,
            (data) => {
              setOrders(data);
              setLoading(false);
            }
          );
        } else {
          const data = await orderService.getActiveOrders(restaurantId);
          setOrders(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchOrders();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantId, realtime]);

  // Create order
  const createOrder = useCallback(
    async (
      tableNumber: string,
      items: CartItem[],
      notes?: string,
      taxRate?: number,
      serviceCharge?: number
    ) => {
      return orderService.createOrder(
        restaurantId,
        tableNumber,
        items,
        notes,
        taxRate,
        serviceCharge
      );
    },
    [restaurantId]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      return orderService.updateOrderStatus(orderId, status);
    },
    []
  );

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (orderId: string, paymentStatus: Order['paymentStatus']) => {
      return orderService.updatePaymentStatus(orderId, paymentStatus);
    },
    []
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (orderId: string) => {
      return orderService.updateOrderStatus(orderId, 'cancelled');
    },
    []
  );

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: OrderStatus): Order[] => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  // Get orders by table
  const getOrdersByTable = useCallback(
    (tableNumber: string): Order[] => {
      return orders.filter((order) => order.tableNumber === tableNumber);
    },
    [orders]
  );

  // Filter helpers
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const activeOrders = orders.filter((o) => 
    !['completed', 'cancelled'].includes(o.status)
  );

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    getOrdersByStatus,
    getOrdersByTable,
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    activeOrders,
  };
};

// Hook for customer orders (by table)
export const useTableOrders = (restaurantId: string, tableNumber: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        unsubscribe = orderService.subscribeToTableOrders(
          restaurantId,
          tableNumber,
          (data) => {
            setOrders(data);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
        setLoading(false);
      }
    };

    if (restaurantId && tableNumber) {
      fetchOrders();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantId, tableNumber]);

  // Get active order for this table
  const activeOrder = orders.find((o) => 
    !['completed', 'cancelled'].includes(o.status)
  );

  return {
    orders,
    activeOrder,
    loading,
    error,
  };
};
