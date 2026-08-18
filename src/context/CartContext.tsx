import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface CartItem {
  id: string;
  cartItemId?: string; // Composite unique key: `${id}_${size || 'default'}`
  name: string;
  price: number;
  quantity: number;
  size?: string;
  imageUrl?: string;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

function getCartItemId(item: { id: string; size?: string; cartItemId?: string }): string {
  if (item.cartItemId) return item.cartItemId;
  return `${item.id}_${item.size || 'default'}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Migrate legacy cart items without cartItemId
      return Array.isArray(parsed)
        ? parsed.map(i => ({ ...i, cartItemId: getCartItemId(i) }))
        : [];
    } catch (e) {
      console.warn("Failed to load cart from local storage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to local storage", e);
    }
  }, [items]);

  const addToCart = (item: CartItem) => {
    const key = getCartItemId(item);
    const itemWithKey = { ...item, cartItemId: key };

    setItems(current => {
      const existing = current.find(i => getCartItemId(i) === key);
      if (existing) {
        return current.map(i =>
          getCartItemId(i) === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...current, itemWithKey];
    });
  };

  const removeFromCart = (cartItemIdOrId: string) => {
    setItems(current =>
      current.filter(i => i.cartItemId !== cartItemIdOrId && i.id !== cartItemIdOrId)
    );
  };

  const updateQuantity = (cartItemIdOrId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(current =>
      current.map(i =>
        (i.cartItemId === cartItemIdOrId || i.id === cartItemIdOrId)
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
