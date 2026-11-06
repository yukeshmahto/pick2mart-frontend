"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { cartService } from "../services/cart.service";
import { productService } from "../services/product.service";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "pick2mart_cart";

const isMongoId = (id) =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const isMergingRef = useRef(false);

  // Helper: map server cart document into our unified client format
  const mapServerCartItems = useCallback((serverItems = []) => {
    if (!Array.isArray(serverItems)) return [];
    return serverItems
      .map((item) => {
        const v = item.variantId;
        if (!v || typeof v !== "object") return null;
        const p = v.productId;

        const variantId = v._id ? v._id.toString() : "";
        if (!variantId) return null;

        const prodId = p && typeof p === "object" && p._id ? p._id.toString() : (p || "");
        const prodName = p && typeof p === "object" && p.name ? p.name : "";
        const variantName = v.name || "";
        const displayName = prodName
          ? variantName && !prodName.includes(variantName)
            ? `${prodName} (${variantName})`
            : prodName
          : variantName || "Product";

        const prodImage =
          (v.images && v.images[0]) ||
          (p && typeof p === "object" && p.images && p.images[0]) ||
          "";

        const stock =
          typeof v.availableQuantity === "number"
            ? v.availableQuantity
            : v.inventory?.availableQuantity ?? 99;

        return {
          id: variantId,
          variantId,
          productId: prodId,
          name: displayName,
          brand: (p && typeof p === "object" && p.brand) || "Pick2Mart",
          price: Number(v.price) || 0,
          compareAtPrice: Number(v.compareAtPrice) || 0,
          image: prodImage,
          quantity: Math.max(1, Number(item.quantity) || 1),
          sku: v.sku || "N/A",
          stock,
        };
      })
      .filter(Boolean);
  }, []);

  // Save to localStorage helper
  const saveToStorage = useCallback((items) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Could not write cart to localStorage:", e);
    }
  }, []);

  // Synchronize and merge guest cart with server cart on mount / login
  const syncWithBackend = useCallback(async (token) => {
    if (!token || isMergingRef.current) return;
    isMergingRef.current = true;
    setIsSyncing(true);

    try {
      // 1. Fetch live server cart
      const res = await cartService.getCart();
      const serverItems = mapServerCartItems(res?.data?.items || []);

      // 2. Read local guest items
      let localItems = [];
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) localItems = JSON.parse(saved);
      } catch (e) {}

      // 3. Determine which local guest items need to be merged into the server
      if (Array.isArray(localItems) && localItems.length > 0) {
        const serverVariantIds = new Set(serverItems.map((i) => i.variantId));

        for (const localItem of localItems) {
          const vId = localItem.variantId || localItem.productId || localItem.id;
          if (isMongoId(vId) && !serverVariantIds.has(vId)) {
            try {
              await cartService.addItem(vId, localItem.quantity || 1);
            } catch (err) {
              console.warn(`Could not merge guest item ${vId} to server:`, err?.message);
            }
          }
        }

        // Re-fetch final unified server cart after merging
        const freshRes = await cartService.getCart();
        const freshItems = mapServerCartItems(freshRes?.data?.items || []);
        if (freshItems.length > 0) {
          setCart(freshItems);
          saveToStorage(freshItems);
        } else if (serverItems.length > 0) {
          setCart(serverItems);
          saveToStorage(serverItems);
        }
      } else {
        setCart(serverItems);
        saveToStorage(serverItems);
      }
    } catch (err) {
      if (err?.message?.includes("Unauthorized") || err?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      console.warn("Cart backend synchronization error:", err?.message);
    } finally {
      setIsSyncing(false);
      isMergingRef.current = false;
      setIsLoading(false);
    }
  }, [mapServerCartItems, saveToStorage]);

  // Initial load on mount
  useEffect(() => {
    // Fast initial load from localStorage
    let initialLocal = [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        initialLocal = JSON.parse(saved);
        setCart(initialLocal);
      }
    } catch (e) {
      console.warn("Could not read cart from localStorage:", e);
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      syncWithBackend(token);
    } else {
      setIsLoading(false);
    }

    // Listen for custom login event or storage events across tabs
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && e.newValue) {
        syncWithBackend(e.newValue);
      } else if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncWithBackend]);

  // Resolve a valid variantId from product object, fetching if necessary
  const resolveProductVariant = useCallback(async (product) => {
    // 1. Direct variantId
    if (product.variantId && isMongoId(product.variantId)) {
      return {
        variantId: product.variantId,
        price: product.price,
        stock: product.stock ?? 99,
        sku: product.sku || "N/A",
      };
    }

    // 2. defaultVariantId
    if (product.defaultVariantId && isMongoId(product.defaultVariantId)) {
      return {
        variantId: product.defaultVariantId,
        price: product.price,
        stock: product.stock ?? 99,
        sku: product.sku || "N/A",
      };
    }

    // 3. Embedded variants array
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const first = product.variants[0];
      const vId = first._id || first.id;
      if (isMongoId(vId)) {
        return {
          variantId: vId,
          price: first.price ?? product.price,
          stock: first.inventory?.availableQuantity ?? product.stock ?? 99,
          sku: first.sku || product.sku || "N/A",
        };
      }
    }

    // 4. If product.id or product._id is itself a variant or product
    const targetId = product._id || product.productId || product.id;
    if (isMongoId(targetId)) {
      try {
        const res = await productService.getProductVariants(targetId);
        const fetchedVariants = res?.data || [];
        if (fetchedVariants.length > 0) {
          const first = fetchedVariants[0];
          return {
            variantId: first._id,
            price: first.price ?? product.price,
            stock: first.inventory?.availableQuantity ?? 99,
            sku: first.sku || "N/A",
          };
        }
      } catch (e) {
        console.warn("Failed to fetch product variants for cart:", e?.message);
      }
    }

    return null;
  }, []);

  // Add Item to Cart
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) return;

      // Resolve variant info
      const variantInfo = await resolveProductVariant(product);
      const variantId = variantInfo?.variantId || product.variantId || product._id || product.id;
      const itemId = variantId ? variantId.toString() : `item-${Date.now()}`;
      const itemPrice = Number(variantInfo?.price ?? product.price ?? 0);
      const maxStock = Number(variantInfo?.stock ?? product.stock ?? 99);

      setCart((prevCart) => {
        const existingIdx = prevCart.findIndex(
          (item) => item.id === itemId || (variantId && item.variantId === variantId)
        );

        let updated;
        if (existingIdx > -1) {
          const existing = prevCart[existingIdx];
          const newQty = Math.min(existing.quantity + quantity, maxStock);
          updated = prevCart.map((item, idx) =>
            idx === existingIdx ? { ...item, quantity: newQty, stock: maxStock } : item
          );
        } else {
          const newItem = {
            id: itemId,
            variantId: isMongoId(variantId) ? variantId : null,
            productId: product.productId || product._id || product.id || "",
            name: product.name || "Product",
            brand: product.brand || "Pick2Mart",
            price: itemPrice,
            compareAtPrice: Number(product.compareAtPrice || product.mrp || 0),
            image:
              product.image ||
              (product.images && product.images[0]) ||
              "",
            quantity: Math.min(quantity, maxStock),
            sku: variantInfo?.sku || product.sku || "N/A",
            stock: maxStock,
          };
          updated = [...prevCart, newItem];
        }

        saveToStorage(updated);
        return updated;
      });

      setIsCartOpen(true);

      // Backend synchronization for logged-in user with valid MongoDB variant ID
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token && isMongoId(variantId)) {
        try {
          const res = await cartService.addItem(variantId, quantity);
          if (res?.data?.items) {
            const serverItems = mapServerCartItems(res.data.items);
            if (serverItems.length > 0) {
              setCart(serverItems);
              saveToStorage(serverItems);
            }
          }
        } catch (err) {
          console.warn("Backend add item sync skipped/failed:", err?.message);
        }
      }
    },
    [resolveProductVariant, saveToStorage, mapServerCartItems]
  );

  // Update Item Quantity
  const updateQuantity = useCallback(
    async (itemId, change) => {
      let finalQty = 1;
      let targetVariantId = null;

      setCart((prevCart) => {
        const updated = prevCart
          .map((item) => {
            if (item.id === itemId || item.variantId === itemId) {
              const maxStock = item.stock ?? 99;
              const newQty = item.quantity + change;
              finalQty = Math.min(newQty, maxStock);
              targetVariantId = item.variantId || item.id;
              return finalQty > 0 ? { ...item, quantity: finalQty } : null;
            }
            return item;
          })
          .filter(Boolean);

        saveToStorage(updated);
        return updated;
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token && isMongoId(targetVariantId)) {
        try {
          if (finalQty > 0) {
            const res = await cartService.updateQuantity(targetVariantId, finalQty);
            if (res?.data?.items) {
              const serverItems = mapServerCartItems(res.data.items);
              setCart(serverItems);
              saveToStorage(serverItems);
            }
          } else {
            const res = await cartService.removeItem(targetVariantId);
            if (res?.data?.items) {
              const serverItems = mapServerCartItems(res.data.items);
              setCart(serverItems);
              saveToStorage(serverItems);
            }
          }
        } catch (err) {
          console.warn("Backend update quantity sync skipped/failed:", err?.message);
        }
      }
    },
    [saveToStorage, mapServerCartItems]
  );

  // Remove Item from Cart
  const removeFromCart = useCallback(
    async (itemId) => {
      let targetVariantId = null;

      setCart((prevCart) => {
        const itemToRemove = prevCart.find(
          (i) => i.id === itemId || i.variantId === itemId
        );
        targetVariantId = itemToRemove?.variantId || itemToRemove?.id;
        const updated = prevCart.filter(
          (i) => i.id !== itemId && i.variantId !== itemId
        );
        saveToStorage(updated);
        return updated;
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token && isMongoId(targetVariantId)) {
        try {
          const res = await cartService.removeItem(targetVariantId);
          if (res?.data?.items) {
            const serverItems = mapServerCartItems(res.data.items);
            setCart(serverItems);
            saveToStorage(serverItems);
          }
        } catch (err) {
          console.warn("Backend remove item sync skipped/failed:", err?.message);
        }
      }
    },
    [saveToStorage, mapServerCartItems]
  );

  // Clear Entire Cart
  const clearCart = useCallback(async () => {
    setCart([]);
    saveToStorage([]);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn("Backend clear cart skipped/failed:", err?.message);
      }
    }
  }, [saveToStorage]);

  // Refresh cart from server manually
  const refreshCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      await syncWithBackend(token);
    }
  }, [syncWithBackend]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (item.quantity || 1), 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const value = {
    cart,
    cartCount,
    subtotal,
    isLoading,
    isSyncing,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    syncWithBackend,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
