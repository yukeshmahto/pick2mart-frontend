"use client";

import React from "react";
import { LocationProvider } from "./LocationContext";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";

export function Providers({ children }) {
  return (
    <LocationProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </LocationProvider>
  );
}
