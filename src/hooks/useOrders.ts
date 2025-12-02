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

  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    return orderService.updateOrderStatus(orderId, status);
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    return orderService.cancelOrder(orderId);
  }, []);

  // Filter helpers
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    loading,
    error,
    createOrder,
    updateStatus,
    cancelOrder,
  };
};

// Hook for tracking a single order (customer side)
export const useOrderTracking = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const unsubscribe = orderService.subscribeToOrder(orderId, (data) => {
      setOrder(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
};
