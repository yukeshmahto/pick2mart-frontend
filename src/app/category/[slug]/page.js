"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Filter, X, ChevronRight, Loader2, Sparkles } from "lucide-react";

// Services
import { categoryService } from "../../../services/category.service";
import { productService } from "../../../services/product.service";

// Components
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { ProductCard } from "../../../components/ProductCard";
import { CartDrawer } from "../../../components/CartDrawer";
import { Announcement } from "../../../components/Announcement";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { ProductGridSkeleton } from "../../../components/ui/Skeleton";

export default function CategoryPage({ params }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const { addToCart, isCartOpen, closeCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter State
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(200000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  // Load Category Details & Brands
  useEffect(() => {
    let mounted = true;

    async function loadCategoryAndBrands() {
      try {
        const [catRes, brandRes] = await Promise.allSettled([
          categoryService.getBySlug(slug),
          productService.getBrands(),
        ]);

        if (mounted) {
          if (catRes.status === "fulfilled" && catRes.value?.data) {
            setCategory(catRes.value.data);
          } else {
            setCategory({
              name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              slug: slug,
              description: `Explore our collection of authentic products in ${slug.replace(/-/g, " ")}.`,
            });
          }

          if (brandRes.status === "fulfilled" && brandRes.value?.data?.length > 0) {
            setBrandsList(brandRes.value.data);
          } else {
            setBrandsList(["Apple", "Samsung", "Sony", "Dell", "Organic India", "Tata", "Philips", "Nike"]);
          }
        }
      } catch (err) {
        console.error("Category load error:", err);
        if (mounted) {
          setCategory({
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            slug: slug,
            description: `Explore our collection of authentic products in ${slug.replace(/-/g, " ")}.`,
          });
        }
      }
    }

    loadCategoryAndBrands();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Load Products for this category
  const fetchCategoryProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      let sortByParam = "newest";
      if (sortOption === "price-low") sortByParam = "price_asc";
      if (sortOption === "price-high") sortByParam = "price_desc";
      if (sortOption === "discount") sortByParam = "discount";

      const queryParams = {
        categorySlug: slug,
        limit: 30,
        sortBy: sortByParam,
      };

      if (search.trim()) queryParams.search = search.trim();
      if (selectedBrands.length > 0) queryParams.brand = selectedBrands.join(",");
      if (priceRange < 200000) queryParams.maxPrice = priceRange;
      if (inStockOnly) queryParams.inStock = true;

      const res = await productService.getPublicProducts(queryParams);
      const rawProducts = res?.data || [];

      if (rawProducts.length > 0) {
        const normalized = rawProducts.map((p, idx) => ({
          id: p._id,
          _id: p._id,
          productId: p._id,
          variantId: p.defaultVariantId || p.variantId || (p.variants && p.variants[0]?._id),
          variants: p.variants,
          defaultVariantId: p.defaultVariantId,
          sku: p.sku || (p.variants && p.variants[0]?.sku),
          slug: p.slug || p._id,
          name: p.name,
          brand: p.brand || "Pick2Mart",
          price: p.price,
          mrp: p.compareAtPrice || Math.round(p.price * 1.25),
          image: p.images?.[0] || null,
          images: p.images || [],
          rating: p.rating || 4.5,
          reviews: p.numReviews || 0,
          tag: p.discount ? `${p.discount}% OFF` : undefined,
          color: idx % 2 === 0 ? "orange" : "teal",
          category: p.categoryId?.name || category?.name || "General",
          stockAvailable: p.stockAvailable || (p.variants && p.variants[0]?.stockQuantity) || 0,
        }));
        setProducts(normalized);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Backend products fetch failed:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, category, search, selectedBrands, priceRange, inStockOnly, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategoryProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCategoryProducts]);

  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleWishlist = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const FilterContent = () => (
    <>
      <div className="filter-group">
        <h3>Brand</h3>
        {brandsList.map((brand) => (
          <label key={brand} className="filter-option">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleArrayItem(selectedBrands, setSelectedBrands, brand)}
            />
            {brand}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h3>Price Range</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>
          <span>₹0</span>
          <span>₹{priceRange.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min="100"
          max="200000"
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--orange)", cursor: "pointer" }}
        />
      </div>

      <div className="filter-group">
        <h3>Availability</h3>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In Stock Only
        </label>
      </div>

      {(selectedBrands.length > 0 || priceRange < 200000 || inStockOnly || search) && (
        <button
          onClick={() => {
            setSelectedBrands([]);
            setPriceRange(200000);
            setInStockOnly(false);
            setSearch("");
          }}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "8px 12px",
            backgroundColor: "#f1f5f9",
            color: "#475569",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          Reset Filters
        </button>
      )}
    </>
  );

  return (
    <>
      <Announcement />
      <Header
        search={search}
        setSearch={setSearch}
      />

      <main>
        <div className="shop-container-wide" style={{ marginTop: "32px" }}>
          <div className="breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle", margin: "0 6px" }} />
            <Link href="/category" style={{ color: "inherit", textDecoration: "none" }}>Categories</Link>
            <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle", margin: "0 6px" }} />
            <span>{category?.name || slug}</span>
          </div>

          <div className="category-banner" style={{ minHeight: "180px", background: category?.image || category?.bannerImage ? undefined : "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)" }}>
            {(category?.image || category?.bannerImage) && (
              <img
                src={category.image || category.bannerImage}
                alt={category?.name || slug}
              />
            )}
            <div className="category-banner-overlay" />
            <div className="category-banner-content">
              <h1>{category?.name || slug}</h1>
              <p>{category?.description || "Browse authentic products with instant checkout."}</p>
            </div>
          </div>
        </div>

        <div className="shop-container-wide shop-layout">
          {/* Desktop Sidebar */}
          <aside className="shop-sidebar">
            <FilterContent />
          </aside>

          {/* Main Content */}
          <div className="shop-main">
            <div className="shop-toolbar">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong>{products.length} Products</strong>
                {isLoading && <Loader2 size={16} className="animate-spin" style={{ color: "var(--teal)" }} />}
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <button
                  className="mobile-filter-btn"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <Filter size={16} /> Filters
                </button>

                <div className="sort-dropdown">
                  Sort by:
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <div className="shop-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    wished={isInWishlist(product.id || product._id)}
                    onWishlist={() => handleWishlist(product)}
                    onAdd={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
                <Sparkles size={36} style={{ margin: "0 auto 12px", color: "#94a3b8" }} />
                <h3>No products found in this category.</h3>
                <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>Try adjusting your filters or browsing other categories.</p>
                <button
                  className="primary-button"
                  style={{ marginTop: "20px" }}
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange(200000);
                    setInStockOnly(false);
                    setSearch("");
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer onClose={closeCart} />
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100,
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "80%",
            maxWidth: "320px",
            backgroundColor: "#fff",
            padding: "24px",
            overflowY: "auto",
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} style={{ padding: "8px", border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <FilterContent />
            <button
              className="primary-button"
              style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
