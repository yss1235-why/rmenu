import { useState, useCallback, useMemo, useEffect } from 'react';
import { CartItem, MenuItem, calculateCartItemTotal } from '@/types/menu';

const CART_STORAGE_KEY = 'sizzle-menu-cart';

interface UseCartOptions {
  tableNumber?: string;
}

export const useCart = ({ tableNumber }: UseCartOptions = {}) => {
  const storageKey = tableNumber 
    ? `${CART_STORAGE_KEY}-${tableNumber}` 
    : CART_STORAGE_KEY;

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items, storageKey]);

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
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Failed to clear cart from localStorage:', err);
    }
  }, [storageKey]);

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
