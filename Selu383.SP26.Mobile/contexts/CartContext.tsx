import React, { createContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizationNotes?: string;
}

export interface CartContextType {
  cart: CartItem[];
  locationId: number | null;
  addItem: (item: CartItem, quantity: number, notes?: string) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setCartLocation: (locationId: number) => void;
  guestOrderIds: number[];
  addGuestOrderId: (orderId: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [guestOrderIds, setGuestOrderIds] = useState<number[]>([]);

  const setCartLocation = (newLocationId: number) => {
    if (locationId !== null && locationId !== newLocationId && cart.length > 0) {
      setCart([]);
    }
    setLocationId(newLocationId);
  };

  const addItem = (item: CartItem, quantity: number, notes?: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevCart, { ...item, quantity, customizationNotes: notes }];
    });
  };

  const removeItem = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setLocationId(null);
  };

  const addGuestOrderId = (orderId: number) => {
    setGuestOrderIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
  };

  return (
    <CartContext.Provider value={{ cart, locationId, addItem, removeItem, updateQuantity, clearCart, setCartLocation, guestOrderIds, addGuestOrderId }}>
      {children}
    </CartContext.Provider>
  );
};
