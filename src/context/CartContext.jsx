import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Default (domestic Germany) shipping rate — Checkout page recomputes based on
// the selected shipping country. Cart drawer only shows an estimate.
const SHIPPING_COST = 5.19;
const FREE_SHIPPING_THRESHOLD = 80;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('tic_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tic_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, color, size, quantity = 1, priceOverride = null) => {
    setItems((prev) => {
      const key = `${product.id}-${color}-${size}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          productName: product.name,
          color,
          size,
          quantity,
          price: priceOverride != null ? priceOverride : product.price,
          image: product.images?.[0] || '',
        },
      ];
    });
    setIsOpen(true);
  };

  // Add every product in a bundle to the cart in one go. Because a customer must
  // still pick color/size per garment, we accept `selections` (array aligned to
  // bundle.products) where each entry is { color, size }. The bundle's effective
  // price is distributed across items proportionally to their individual price
  // so the cart subtotal equals the bundle price, and each line carries a
  // bundleTag so the UI can show which bundle it came from.
  const addBundle = (bundle, selections, effectivePrice) => {
    if (!bundle?.products?.length) return;
    const normalTotal = bundle.products.reduce((sum, p) => sum + (p?.price || 0), 0);
    if (!normalTotal) return;
    const bundleTag = `${bundle.id || bundle.name}-${Date.now()}`;

    setItems((prev) => {
      const next = [...prev];
      bundle.products.forEach((product, idx) => {
        const sel = selections[idx] || {};
        // Prorate the bundle price across items by their share of the normal total.
        const share = (product.price / normalTotal) * effectivePrice;
        const linePrice = +share.toFixed(2);
        next.push({
          key: `bundle-${bundleTag}-${idx}`,
          productId: product.id,
          productName: product.name,
          color: sel.color || product.colors?.[0] || '',
          size: sel.size || product.sizes?.[0] || '',
          quantity: 1,
          price: linePrice,
          image: product.images?.[0] || '',
          bundleTag,
          bundleId: bundle.id,
          bundleName: bundle.name,
        });
      });
      return next;
    });
    setIsOpen(true);
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addBundle,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        shippingCost,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);