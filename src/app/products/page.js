"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Check,
  ShoppingBag,
} from "lucide-react";

// Services
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";

// Components
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { ProductCard } from "../../components/ProductCard";
import { CartDrawer } from "../../components/CartDrawer";
import { Announcement } from "../../components/Announcement";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { ProductGridSkeleton } from "../../components/ui/Skeleton";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { addToCart, isCartOpen, closeCart } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic Products & Pagination
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [toast, setToast] = useState("");

  // Filters State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : []
  );
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brand") ? [searchParams.get("brand")] : []
  );
  const [priceRange, setPriceRange] = useState(200000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [onlyDeals, setOnlyDeals] = useState(searchParams.get("deals") === "true");

  // Sync state when URL search params change
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    const urlBrand = searchParams.get("brand");
    const urlDeals = searchParams.get("deals") === "true";

    if (urlSearch !== null && urlSearch !== search) setSearch(urlSearch);
    if (urlCategory && !selectedCategories.includes(urlCategory)) setSelectedCategories([urlCategory]);
    if (urlBrand && !selectedBrands.includes(urlBrand)) setSelectedBrands([urlBrand]);
    if (urlDeals !== onlyDeals) setOnlyDeals(urlDeals);
  }, [searchParams]);

  // Load Categories & Brands
  useEffect(() => {
    let mounted = true;
    async function loadMetadata() {
      try {
        const [catRes, brandRes] = await Promise.allSettled([
          categoryService.getActive(),
          productService.getBrands(),
        ]);

        if (mounted) {
          if (catRes.status === "fulfilled" && catRes.value?.data && Array.isArray(catRes.value.data)) {
            const validCats = catRes.value.data.filter(
              (c) => c && c.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
            );
            setCategoriesList(validCats);
          }

          if (brandRes.status === "fulfilled" && Array.isArray(brandRes.value?.data)) {
            setBrandsList(brandRes.value.data.filter(Boolean));
          }
        }
      } catch (err) {
        console.error("Error loading filter metadata:", err);
      }
    }

    loadMetadata();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Products from Backend
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      let sortByParam = "newest";
      if (sortOption === "price-low") sortByParam = "price_asc";
      if (sortOption === "price-high") sortByParam = "price_desc";
      if (sortOption === "discount") sortByParam = "discount";

      const queryParams = {
        page: currentPage,
        limit: 16,
        sortBy: sortByParam,
      };

      if (search.trim()) queryParams.search = search.trim();
      if (selectedCategories.length === 1) {
        queryParams.category = selectedCategories[0];
      }
      if (selectedBrands.length > 0) {
        queryParams.brand = selectedBrands.join(",");
      }
      if (priceRange < 200000) {
        queryParams.maxPrice = priceRange;
      }
      if (inStockOnly) {
        queryParams.inStock = true;
      }

      const res = await productService.getPublicProducts(queryParams);
      const rawProducts = res?.data || [];
      const meta = res?.meta || {};

      let normalized = rawProducts.map((p, idx) => ({
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
        reviews: p.numReviews || (p.reviews && p.reviews.length) || 0,
        tag: p.discount ? `${p.discount}% OFF` : undefined,
        discount: p.discount || 0,
        color: idx % 2 === 0 ? "orange" : "teal",
        category: p.categoryId?.name || "General",
        stockAvailable: p.stockAvailable || (p.variants && p.variants[0]?.stockQuantity) || 0,
      }));

      // If deals filter is active, show items with discount
      if (onlyDeals) {
        normalized = normalized.filter((p) => p.discount > 0 || (p.mrp && p.mrp > p.price));
      }

      setProducts(normalized);
      setTotalProducts(meta.total || normalized.length);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
      console.error("Backend products query failed:", err);
      setHasError(true);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedCategories, selectedBrands, priceRange, inStockOnly, sortOption, onlyDeals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Wishlist ids for heart buttons
  const wishlistIds = useMemo(() => {
    return wishlist.map((w) => w.id || w._id || w);
  }, [wishlist]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart`);
  };

  const handleWishlist = (product) => {
    toggleWishlist(product);
  };

  const toggleArrayItem = (array, setArray, item) => {
    setCurrentPage(1);
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(200000);
    setInStockOnly(false);
    setOnlyDeals(false);
    setSearch("");
    setCurrentPage(1);
    setSortOption("featured");
    router.push("/products");
  };

  const FilterContent = () => (
    <>
      {categoriesList.length > 0 && (
        <div className="filter-group">
          <h3>Categories</h3>
          {categoriesList.map((cat) => {
            const catName = typeof cat === "string" ? cat : cat.name;
            const catKey = typeof cat === "string" ? cat : cat.slug || cat._id;
            const isChecked = selectedCategories.includes(catName) || selectedCategories.includes(catKey);

            return (
              <label key={catKey} className="filter-option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayItem(selectedCategories, setSelectedCategories, catName)}
                />
                <span>{catName}</span>
              </label>
            );
          })}
        </div>
      )}

      {brandsList.length > 0 && (
        <div className="filter-group">
          <h3>Brands</h3>
          {brandsList.map((brand) => (
            <label key={brand} className="filter-option">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleArrayItem(selectedBrands, setSelectedBrands, brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      )}

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
          onChange={(e) => {
            setCurrentPage(1);
            setPriceRange(Number(e.target.value));
          }}
          style={{ width: "100%", accentColor: "var(--orange, #ea580c)", cursor: "pointer" }}
        />
      </div>

      <div className="filter-group">
        <h3>Availability & Offers</h3>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setCurrentPage(1);
              setInStockOnly(e.target.checked);
            }}
          />
          <span>In Stock Only</span>
        </label>
        <label className="filter-option" style={{ marginTop: "6px" }}>
          <input
            type="checkbox"
            checked={onlyDeals}
            onChange={(e) => {
              setCurrentPage(1);
              setOnlyDeals(e.target.checked);
            }}
          />
          <span>Deals & Discounts Only</span>
        </label>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange < 200000 || inStockOnly || onlyDeals || search) && (
        <button
          type="button"
          onClick={clearAllFilters}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "9px 12px",
            backgroundColor: "#f1f5f9",
            color: "#0f172a",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "0.85rem",
          }}
        >
          Reset All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <Header
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        onWishlistClick={() => showToast(`${wishlist.length} items in your wishlist`)}
      />

      <Announcement />

      <main className="shop-page container" style={{ padding: "28px 16px 60px" }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#64748b", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#0f172a", fontWeight: 700 }}>
            {search ? `Search results for "${search}"` : "All Products"}
          </span>
        </div>

        {/* Top Header & Sort Control */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={24} color="#ff5b1f" />
              {search ? `Results for "${search}"` : onlyDeals ? "Flash Deals & Offers" : "Product Catalog"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              Showing {products.length} of <strong>{totalProducts}</strong> products available for delivery
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Mobile Filter Button */}
            <button
              type="button"
              className="mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(true)}
              style={{
                display: "none",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <Filter size={16} /> Filters
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                fontWeight: 600,
                fontSize: "0.88rem",
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-low">Sort by: Price: Low to High</option>
              <option value="price-high">Sort by: Price: High to Low</option>
              <option value="discount">Sort by: Highest Discount</option>
            </select>
          </div>
        </div>

        {/* Catalog Layout: Sidebar + Grid */}
        <div className="shop-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "30px", alignItems: "start" }}>
          {/* Desktop Filter Sidebar */}
          <aside className="shop-sidebar" style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <SlidersHorizontal size={16} /> Filter Products
              </span>
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || search) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ background: "none", border: "none", color: "#ff5b1f", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            <FilterContent />
          </aside>

          {/* Products Grid Section */}
          <section className="shop-main">
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <Search size={48} style={{ margin: "0 auto 16px", color: "#94a3b8" }} />
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                  No matching products found
                </h3>
                <p style={{ color: "#64748b", maxWidth: "420px", margin: "0 auto 20px", fontSize: "0.95rem" }}>
                  We couldn&apos;t find any products matching your current filters. Try resetting filters or searching with different keywords.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#ff5b1f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    wishlist={wishlistIds}
                    toggleWishlist={handleWishlist}
                    addToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "40px" }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: currentPage <= 1 ? "#f1f5f9" : "#fff",
                    color: currentPage <= 1 ? "#94a3b8" : "#0f172a",
                    fontWeight: 600,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: isActive ? "2px solid #ff5b1f" : "1px solid #cbd5e1",
                        backgroundColor: isActive ? "#ff5b1f" : "#fff",
                        color: isActive ? "#fff" : "#0f172a",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: currentPage >= totalPages ? "#f1f5f9" : "#fff",
                    color: currentPage >= totalPages ? "#94a3b8" : "#0f172a",
                    fontWeight: 600,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {isCartOpen && <CartDrawer onClose={closeCart} />}

      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <Loader2 size={32} className="animate-spin" color="#ff5b1f" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
