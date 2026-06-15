import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderPlacedQR, setOrderPlacedQR] = useState(null);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i._id === id) {
            const newQ = i.quantity + delta;
            return newQ > 0 ? { ...i, quantity: newQ } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  }, []);

  const resetOrder = useCallback(() => {
    setCart([]);
    setOrderPlacedQR(null);
    setIsOrderPlaced(false);
    setIsCartOpen(false);
  }, []);

  const placeOrder = useCallback((qrData) => {
    setOrderPlacedQR(qrData);
    setIsOrderPlaced(true);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        isOrderPlaced,
        orderPlacedQR,
        addToCart,
        updateQuantity,
        resetOrder,
        placeOrder,
        totalItems: cart.reduce((sum, i) => sum + i.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
