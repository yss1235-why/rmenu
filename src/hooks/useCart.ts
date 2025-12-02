import { useState, useCallback, useMemo } from 'react';
import { CartItem, MenuItem, calculateCartItemTotal } from '@/types/menu';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prev, { ...item, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, notes } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calculateCartItemTotal(item), 0),
    [items]
  );

  const calculateTotal = useCallback(
    (taxRate: number = 0, serviceCharge: number = 0) => {
      const tax = subtotal * (taxRate / 100);
      return subtotal + tax + serviceCharge;
    },
    [subtotal]
  );

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    totalItems,
    subtotal,
    calculateTotal,
    isEmpty: items.length === 0,
  };
};
