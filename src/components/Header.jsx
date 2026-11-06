"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  MapPin,
  ChevronDown,
  Search,
  X,
  UserRound,
  Heart,
  ShoppingBag,
  Sparkles,
  Flame,
  Package,
  LogOut,
  Settings,
  Store,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { userService } from "../services/user.service";
import { categoryService } from "../services/category.service";
import { settingsService } from "../services/settings.service";
import { productService } from "../services/product.service";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLocation } from "../context/LocationContext";
import { LocationModal } from "./LocationModal";

export function Header({
  search: externalSearch,
  setSearch: setExternalSearch,
  menuOpen,
  setMenuOpen,
  wishlistLength,
  cartCount,
  onCartClick,
  onWishlistClick,
}) {
  const router = useRouter();

  // Contexts
  let cartCtx = null;
  let wishCtx = null;
  try { cartCtx = useCart(); } catch (e) {}
  try { wishCtx = useWishlist(); } catch (e) {}
  const { currentLocation, openLocationModal } = useLocation();

  const activeCartCount = cartCount !== undefined ? cartCount : (cartCtx?.cartCount || 0);
  const activeSubtotal = cartCtx?.subtotal || 0;
  const activeCartClick = onCartClick || cartCtx?.openCart || (() => {});
  const activeWishCount = wishlistLength !== undefined ? wishlistLength : (wishCtx?.wishlistCount || 0);
  const activeWishClick = onWishlistClick || (() => router.push("/profile?tab=wishlist"));

  // Local state
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState(externalSearch || "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const accountMenuRef = useRef(null);

  // Sync external search prop if provided
  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== searchTerm) {
      setSearchTerm(externalSearch);
    }
  }, [externalSearch]);

  // Initial data loading
  useEffect(() => {
    const fetchUser = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token) {
        try {
          const response = await userService.getProfile();
          if (response?.success) {
            setUser(response.data);
          }
        } catch (err) {
          if (err?.message?.includes("Unauthorized") || err?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getActive();
        if (response?.success && Array.isArray(response.data)) {
          const valid = response.data.filter(
            (c) => c?.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
          );
          setCategories(valid.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response?.success) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    fetchUser();
    fetchCategories();
    fetchSettings();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getPublicProducts({ search: trimmed, limit: 5 });
        if (res?.data && Array.isArray(res.data)) {
          setSuggestions(res.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    setIsSearchOpen(false);
    if (setExternalSearch) {
      setExternalSearch(query);
    }
    if (query) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const deliverToUser = user?.fullName ? user.fullName.split(" ")[0] : "Guest";
  const deliverCity = currentLocation?.city || "Bengaluru";
  const deliverPin = currentLocation?.pincode || "560001";

  return (
    <>
      <header className="site-header">
        <div className="header-main container">
          {/* Mobile menu trigger */}
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen && setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={21} />
          </button>

          {/* Brand Logo */}
          <Link
            className="brand"
            href="/"
            aria-label={settings?.siteName || "Pick 2 Mart home"}
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <img
              src={settings?.logoUrl || "/logo.jpeg"}
              alt={settings?.siteName || "Pick 2 Mart"}
              style={{ height: "40px", objectFit: "contain" }}
            />
          </Link>

          {/* Dynamic Location Button */}
          <button
            className="location-action header-location"
            onClick={openLocationModal}
            type="button"
            title="Click to change delivery location"
          >
            <MapPin size={19} />
            <span>
              <small>Deliver to {deliverToUser}</small>
              <strong>
                {deliverCity} {deliverPin} <ChevronDown size={13} />
              </strong>
            </span>
          </button>

          {/* Dynamic Search Bar & Live Suggestions */}
          <div className="search-wrap" ref={searchContainerRef}>
            <form
              onSubmit={handleSearchSubmit}
              style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", gap: "8px" }}
            >
              <Search size={19} style={{ flexShrink: 0 }} />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (setExternalSearch) setExternalSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for products, brands and more"
                aria-label="Search products"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearchTerm("");
                    if (setExternalSearch) setExternalSearch("");
                    setSuggestions([]);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="search-button"
                aria-label="Submit search"
                title="Search"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {isSearchOpen && (searchTerm.trim().length >= 2 || suggestions.length > 0) && (
              <div className="search-dropdown">
                {isLoadingSuggestions ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    <Loader2 size={16} className="animate-spin" style={{ display: "inline-block", marginRight: "6px" }} />
                    Searching products...
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", background: "#f8fafc" }}>
                      Suggested Products
                    </div>
                    {suggestions.map((item) => {
                      const img = item.images?.[0] || "/placeholder-product.png";
                      const price = item.price || 0;
                      const catName = item.categoryId?.name || item.brand || "Product";
                      return (
                        <Link
                          key={item._id}
                          href={`/product/${item.slug || item._id}`}
                          className="search-dropdown-item"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <img src={img} alt={item.name} className="search-dropdown-thumb" />
                          <div className="search-dropdown-info">
                            <div className="search-dropdown-title">{item.name}</div>
                            <div className="search-dropdown-meta">
                              <span>{catName}</span>
                              {item.rating && <span>★ {item.rating}</span>}
                            </div>
                          </div>
                          <div className="search-dropdown-price">₹{price.toLocaleString("en-IN")}</div>
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      className="search-dropdown-footer"
                      onClick={handleSearchSubmit}
                    >
                      <span>See all matching results for &ldquo;{searchTerm}&rdquo;</span>
                      <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No products found for &ldquo;{searchTerm}&rdquo;
                    <div style={{ marginTop: "6px" }}>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        style={{ color: "#ff5b1f", background: "none", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}
                      >
                        Search all products →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Action Items */}
          <div className="header-actions">
            {/* Currency / Language indicator */}
            <button className="language-action" type="button" aria-label="Language & Currency">
              EN / ₹ <ChevronDown size={12} />
            </button>

            {/* Account / User Dropdown */}
            <div className="account-dropdown-wrap" ref={accountMenuRef}>
              <button
                type="button"
                className="account-action"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
              >
                <UserRound size={19} />
                <span>
                  <small>Hello, {user ? user.fullName.split(" ")[0] : "Sign In"}</small>
                  <strong>
                    Account & Lists <ChevronDown size={13} />
                  </strong>
                </span>
              </button>

              {isAccountMenuOpen && (
                <div className="account-dropdown-menu">
                  {user ? (
                    <>
                      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{user.fullName}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{user.email || user.mobile}</div>
                      </div>
                      <Link href="/profile" onClick={() => setIsAccountMenuOpen(false)}>
                        <UserRound size={15} /> Your Account
                      </Link>
                      <Link href="/profile?tab=orders" onClick={() => setIsAccountMenuOpen(false)}>
                        <Package size={15} /> Your Orders
                      </Link>
                      <Link href="/profile?tab=addresses" onClick={() => setIsAccountMenuOpen(false)}>
                        <MapPin size={15} /> Saved Addresses
                      </Link>
                      <Link href="/profile?tab=wishlist" onClick={() => setIsAccountMenuOpen(false)}>
                        <Heart size={15} /> Your Wishlist
                      </Link>

                      {user.role === "admin" && (
                        <Link href="/admin" onClick={() => setIsAccountMenuOpen(false)} style={{ color: "#2563eb", fontWeight: 700 }}>
                          <Settings size={15} /> Admin Console
                        </Link>
                      )}
                      {user.role === "seller" && (
                        <Link href="/seller" onClick={() => setIsAccountMenuOpen(false)} style={{ color: "#059669", fontWeight: 700 }}>
                          <Store size={15} /> Seller Portal
                        </Link>
                      )}
                      {user.role === "delivery_partner" && (
                        <Link href="/delivery" onClick={() => setIsAccountMenuOpen(false)} style={{ color: "#d97706", fontWeight: 700 }}>
                          <Truck size={15} /> Delivery Fleet
                        </Link>
                      )}

                      <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "4px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            handleLogout();
                          }}
                          style={{ color: "#dc2626" }}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                        <Link
                          href="/login"
                          onClick={() => setIsAccountMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "8px 16px",
                            backgroundColor: "#ff5b1f",
                            color: "#fff",
                            borderRadius: "8px",
                            fontWeight: 700,
                            textDecoration: "none",
                            fontSize: "13px",
                          }}
                        >
                          Sign In
                        </Link>
                        <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#64748b" }}>
                          New customer? <Link href="/register" style={{ color: "#ff5b1f", fontWeight: 600 }}>Start here</Link>
                        </p>
                      </div>
                      <Link href="/profile?tab=orders" onClick={() => setIsAccountMenuOpen(false)}>
                        <Package size={15} /> Track Your Orders
                      </Link>
                      <Link href="/help" onClick={() => setIsAccountMenuOpen(false)}>
                        Help Center
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              href={user ? "/profile?tab=orders" : "/login?redirect=/profile?tab=orders"}
              className="returns-action"
              style={{ textDecoration: "none" }}
            >
              <small>Returns</small>
              <strong>& Orders</strong>
            </Link>

            {/* Admin shortcut if admin */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="account-action"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span>
                  <small>Dashboard</small>
                  <strong>Admin Panel</strong>
                </span>
              </Link>
            )}

            {/* Wishlist Button */}
            <button
              className="header-icon"
              onClick={activeWishClick}
              aria-label="Wishlist"
              type="button"
              title="View Wishlist"
            >
              <Heart size={22} fill={activeWishCount ? "currentColor" : "none"} />
              {activeWishCount > 0 && <i>{activeWishCount}</i>}
            </button>

            {/* Dynamic Cart Button with Subtotal Price */}
            <button
              className="cart-trigger"
              onClick={activeCartClick}
              aria-label="Cart"
              type="button"
              title="View Cart"
            >
              <span className="cart-icon-wrap">
                <ShoppingBag size={21} />
                <i>{activeCartCount}</i>
              </span>
              <span className="cart-total-badge">
                ₹{Math.round(activeSubtotal).toLocaleString("en-IN")}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Category Navigation Bar */}
        <nav className={`category-nav ${menuOpen ? "is-open" : ""}`}>
          <div className="container nav-inner">
            <Link
              className="all-categories"
              href="/category"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 12px",
                background: "#eaf1ff",
                borderRadius: "6px",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              <Menu size={16} /> All Categories
            </Link>

            {/* Direct Link to Products Catalog */}
            <Link
              href="/products"
              style={{
                textDecoration: "none",
                fontSize: "14px",
                color: "#0f172a",
                fontWeight: 700,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles size={14} color="#ff5b1f" /> All Products
            </Link>

            {categories.map((item) => (
              <Link
                href={`/products?category=${encodeURIComponent(item.slug || item._id)}`}
                key={item._id || item.slug}
                style={{
                  textDecoration: "none",
                  fontSize: "13px",
                  color: "#475569",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {item.name}
              </Link>
            ))}

            <Link
              className="deals-nav"
              href="/products?deals=true"
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--orange, #ea580c)",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <Flame size={15} /> Flash Deals
            </Link>
          </div>
        </nav>
      </header>

      {/* Global Location Modal */}
      <LocationModal />
    </>
  );
}
