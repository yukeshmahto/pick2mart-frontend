"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { wishlistService } from "../services/wishlist.service";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pick2mart_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load wishlist from localStorage:", e);
    }

    // Sync with backend if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      wishlistService
        .getWishlist()
        .then((res) => {
          if (res?.data?.items && Array.isArray(res.data.items)) {
            const backendItems = res.data.items
              .map((item) => {
                const p = item.productId;
                if (!p) return null;
                return {
                  id: p._id || p,
                  productId: p._id || p,
                  name: p.name || "Product",
                  brand: p.brand || "Pick2Mart",
                  price: p.price || 0,
                  mrp: p.compareAtPrice || Math.round((p.price || 0) * 1.25),
                  image: p.images?.[0] || "",
                  slug: p.slug || p._id || p,
                };
              })
              .filter(Boolean);

            if (backendItems.length > 0) {
              setWishlist(backendItems);
              localStorage.setItem("pick2mart_wishlist", JSON.stringify(backendItems));
            }
          }
        })
        .catch((err) => {
          console.warn("Backend wishlist sync skipped:", err?.message);
        });
    }
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      const targetId = typeof productId === "object" ? productId.productId || productId.id || productId._id : productId;
      return wishlist.some((item) => (item.productId || item.id) === targetId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      const productId = product.productId || product._id || product.id;

      setWishlist((prev) => {
        const exists = prev.some((item) => (item.productId || item.id) === productId);
        let updated;
        if (exists) {
          updated = prev.filter((item) => (item.productId || item.id) !== productId);
        } else {
          updated = [
            ...prev,
            {
              id: productId,
              productId,
              name: product.name,
              brand: product.brand || "Pick2Mart",
              price: product.price,
              mrp: product.mrp || product.compareAtPrice,
              image: product.image || product.images?.[0],
              slug: product.slug || productId,
            },
          ];
        }
        try {
          localStorage.setItem("pick2mart_wishlist", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token && productId) {
        try {
          const isCurrentlyWished = wishlist.some((item) => (item.productId || item.id) === productId);
          if (isCurrentlyWished) {
            await wishlistService.removeFromWishlist(productId);
          } else {
            await wishlistService.addToWishlist(productId);
          }
        } catch (err) {
          console.warn("Backend wishlist toggle skipped:", err?.message);
        }
      }
    },
    [wishlist]
  );

  const removeFromWishlist = useCallback(async (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => (item.productId || item.id) !== productId);
      try {
        localStorage.setItem("pick2mart_wishlist", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      try {
        await wishlistService.removeFromWishlist(productId);
      } catch (err) {}
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    setWishlist([]);
    try {
      localStorage.setItem("pick2mart_wishlist", JSON.stringify([]));
    } catch (e) {}

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      try {
        await wishlistService.clearWishlist();
      } catch (err) {}
    }
  }, []);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = {
    wishlist,
    wishlistCount,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
