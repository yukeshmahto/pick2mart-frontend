"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  ShoppingBag,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Store,
  Layers,
} from "lucide-react";

// Services
import { productService } from "../../../services/product.service";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

// Components
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { CartDrawer } from "../../../components/CartDrawer";

export default function ProductDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const { addToCart, isCartOpen, setIsCartOpen, closeCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  // Fetch product details & variants from live MongoDB
  useEffect(() => {
    let mounted = true;

    async function loadProductData() {
      setIsLoading(true);
      try {
        // 1. Fetch Product
        const prodRes = await productService.getProductById(id);
        const liveProd = prodRes?.data;

        if (mounted && liveProd) {
          setProduct(liveProd);
          setMainImage(liveProd.images?.[0] || "");

          // 2. Fetch Variants with inventory snapshot
          try {
            const varRes = await productService.getProductVariants(liveProd._id || id);
            const liveVariants = varRes?.data || [];
            if (mounted && liveVariants.length > 0) {
              setVariants(liveVariants);
              setSelectedVariant(liveVariants[0]);
              if (liveVariants[0]?.images?.[0]) {
                setMainImage(liveVariants[0].images[0]);
              }
            }
          } catch (varErr) {
            console.warn("Could not fetch variants:", varErr);
          }
          return;
        }
      } catch (err) {
        console.error("Live product fetch failed:", err);
      }
    }

    loadProductData().finally(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  // Handle Variant Selection
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    if (variant.images && variant.images.length > 0) {
      setMainImage(variant.images[0]);
    }
    // Cap quantity if it exceeds variant's available quantity
    const maxQty = variant.inventory?.availableQuantity ?? 10;
    if (quantity > maxQty) {
      setQuantity(Math.max(1, maxQty));
    }
  };

  // Compute Active Pricing and Stock based on selected variant (or base product)
  const activePrice = selectedVariant ? selectedVariant.price : (product?.price || 0);
  const activeMrp = selectedVariant
    ? (selectedVariant.compareAtPrice || Math.round(selectedVariant.price * 1.25))
    : (product?.compareAtPrice || product?.mrp || Math.round((product?.price || 0) * 1.25));
  const activeSku = selectedVariant ? selectedVariant.sku : (product?.sku || "N/A");

  // Inventory / Stock calculation
  const stockAvailable = useMemo(() => {
    if (selectedVariant && selectedVariant.inventory) {
      return selectedVariant.inventory.availableQuantity;
    }
    if (product?.stock !== undefined) {
      return product.stock;
    }
    // Base product with active status defaults to in-stock
    return product?.status === "active" ? 25 : 0;
  }, [selectedVariant, product]);

  const isInStock = stockAvailable > 0;
  const isLowStock = isInStock && stockAvailable <= 5;
  const discount = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  // Gallery
  const gallery = useMemo(() => {
    const list = [];
    if (selectedVariant?.images?.length > 0) {
      list.push(...selectedVariant.images);
    }
    if (product?.images?.length > 0) {
      list.push(...product.images);
    }
    if (product?.gallery?.length > 0) {
      list.push(...product.gallery);
    }
    if (product?.image && !list.includes(product.image)) {
      list.push(product.image);
    }
    return Array.from(new Set(list.filter(Boolean)));
  }, [selectedVariant, product]);

  const handleAddToCart = () => {
    if (!isInStock || !product) return;

    const currentVariant = selectedVariant || (variants && variants[0]);
    addToCart(
      {
        ...product,
        id: currentVariant?._id || product._id || product.id,
        variantId: currentVariant?._id,
        productId: product._id || product.id,
        name: currentVariant ? `${product.name} (${currentVariant.name})` : product.name,
        brand: product.brand || "Pick2Mart",
        price: activePrice,
        compareAtPrice: activeMrp,
        image: mainImage || gallery[0],
        sku: activeSku,
        stock: stockAvailable,
      },
      quantity
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header search={search} setSearch={setSearch} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--teal)" }} />
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Loading product specifications & stock...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header search={search} setSearch={setSearch} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "#0f172a" }}>Product Not Found</h1>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>The product you are looking for is unavailable or out of stock.</p>
          <Link href="/products" className="primary-button" style={{ textDecoration: "none" }}>
            Return to Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = product.categoryId?.name || product.category || "Catalog";
  const categorySlug = product.categoryId?.slug || (typeof product.category === "string" ? product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "all");
  const sellerName = product.sellerId?.businessName || product.sellerId?.fullName || "Verified Pick2Mart Seller";

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
      />

      <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "32px 20px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>Products</Link>
            <ChevronRight size={12} />
            <Link href={`/category/${categorySlug}`} style={{ color: "inherit", textDecoration: "none" }}>{categoryName}</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#0f172a", fontWeight: "600" }}>{product.name}</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "36px",
            backgroundColor: "white",
            padding: "36px",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>

              {/* Gallery Section */}
              <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  height: "480px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  padding: "16px",
                }}>
                  <img
                    src={mainImage || gallery[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                    alt={product.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                  {discount > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      backgroundColor: "var(--orange)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      {discount}% OFF
                    </div>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "10px",
                          border: mainImage === img ? "2px solid var(--teal)" : "1px solid #e2e8f0",
                          overflow: "hidden",
                          flexShrink: 0,
                          backgroundColor: "#f8fafc",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "var(--teal)", fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {product.brand || "Brand"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    SKU: <strong>{activeSku}</strong>
                  </span>
                </div>

                <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#0f172a", marginBottom: "14px", lineHeight: 1.25 }}>
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: "#0f766e", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "700" }}>
                    {product.rating || 4.8} <Star size={13} fill="white" style={{ marginLeft: "4px" }} />
                  </div>
                  <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    ({product.reviews || 92} customer ratings)
                  </span>
                  <span style={{ color: "#cbd5e1" }}>•</span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Store size={14} color="var(--teal)" /> {sellerName}
                  </span>
                </div>

                {/* Price Row */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                    ₹{activePrice.toLocaleString("en-IN")}
                  </span>
                  {activeMrp > activePrice && (
                    <span style={{ fontSize: "1.2rem", color: "#94a3b8", textDecoration: "line-through" }}>
                      ₹{activeMrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discount > 0 && (
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "1rem" }}>
                      Save ₹{(activeMrp - activePrice).toLocaleString("en-IN")} ({discount}%)
                    </span>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
                    {product.shortDescription}
                  </p>
                )}

                {/* Variant Selector (if variants exist) */}
                {variants.length > 0 && (
                  <div style={{ marginBottom: "24px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", fontSize: "0.9rem", fontWeight: "700", color: "#0f172a" }}>
                      <Layers size={16} color="var(--teal)" />
                      Available Variants / Options:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {variants.map((v) => {
                        const isSelected = selectedVariant?._id === v._id;
                        const vStock = v.inventory?.availableQuantity ?? 0;
                        const vInStock = vStock > 0;

                        return (
                          <button
                            key={v._id}
                            onClick={() => handleSelectVariant(v)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "8px",
                              border: isSelected ? "2px solid var(--teal)" : "1px solid #cbd5e1",
                              backgroundColor: isSelected ? "#f0fdfa" : "white",
                              color: isSelected ? "#0f766e" : (vInStock ? "#1e293b" : "#94a3b8"),
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: isSelected ? "700" : "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <span>{v.name}</span>
                            <span style={{ fontSize: "0.8rem", color: isSelected ? "#0d9488" : "#64748b" }}>
                              ₹{v.price.toLocaleString("en-IN")}
                            </span>
                            {!vInStock && (
                              <span style={{ fontSize: "0.7rem", backgroundColor: "#fee2e2", color: "#ef4444", padding: "1px 6px", borderRadius: "4px" }}>
                                Sold Out
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Status Badge */}
                <div style={{ marginBottom: "24px" }}>
                  {isInStock ? (
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      color: isLowStock ? "#d97706" : "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                      <Check size={18} />
                      {isLowStock
                        ? `Only ${stockAvailable} left in stock — order soon!`
                        : `In Stock (${stockAvailable} units ready to ship)`}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                      <AlertCircle size={18} />
                      Currently Out of Stock
                    </div>
                  )}
                </div>

                {/* Quantity & Add to Cart Controls */}
                <div style={{ marginBottom: "32px" }}>
                  {isInStock ? (
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          style={{ padding: "10px 16px", border: "none", backgroundColor: "#f8fafc", cursor: "pointer", fontSize: "1.1rem", fontWeight: "700", color: "#475569" }}
                        >
                          -
                        </button>
                        <div style={{ padding: "0 16px", fontSize: "1rem", fontWeight: "700", width: "36px", textAlign: "center", color: "#0f172a" }}>
                          {quantity}
                        </div>
                        <button
                          onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                          style={{ padding: "10px 16px", border: "none", backgroundColor: "#f8fafc", cursor: "pointer", fontSize: "1.1rem", fontWeight: "700", color: "#475569" }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        style={{
                          flex: 1,
                          minWidth: "180px",
                          backgroundColor: "var(--teal)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "12px 24px",
                          boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                        }}
                      >
                        <ShoppingBag size={18} /> Add to Cart
                      </button>

                      <button
                        onClick={() => toggleWishlist(product)}
                        style={{
                          width: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          backgroundColor: "white",
                          cursor: "pointer",
                          color: isInWishlist(product._id || product.id) ? "#ef4444" : "#64748b",
                        }}
                        aria-label="Wishlist"
                      >
                        <Heart
                          size={22}
                          fill={isInWishlist(product._id || product.id) ? "#ef4444" : "none"}
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled
                      style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "not-allowed",
                      }}
                    >
                      Out of Stock
                    </button>
                  )}
                </div>

                {/* Highlights / Features */}
                {(product.highlights || product.description) && (
                  <div style={{ marginBottom: "28px", padding: "18px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                      Product Overview & Description
                    </h3>
                    <div style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      {product.description}
                    </div>
                    {product.highlights && (
                      <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {product.highlights.map((hl, idx) => (
                          <li key={idx} style={{ display: "flex", gap: "8px", fontSize: "0.85rem", color: "#334155" }}>
                            <Check size={16} color="var(--teal)" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <span>
                              <strong>{hl.title || hl}</strong>: {hl.desc || hl.point || ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Delivery & Assurance */}
                <div style={{ display: "flex", gap: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, textAlign: "center", color: "#475569" }}>
                    <Truck size={22} color="var(--teal)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Free Express Delivery</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, textAlign: "center", color: "#475569" }}>
                    <RefreshCw size={22} color="var(--teal)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>7 Days Easy Return</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, textAlign: "center", color: "#475569" }}>
                    <ShieldCheck size={22} color="var(--teal)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>100% Genuine Product</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer
          onClose={closeCart}
        />
      )}
    </>
  );
}
