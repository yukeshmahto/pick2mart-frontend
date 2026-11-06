"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Check } from "lucide-react";

// Services
import { settingsService } from "../services/settings.service";
import { categoryService } from "../services/category.service";
import { productService } from "../services/product.service";

// Components
import { Header } from "../components/Header";
import { Announcement } from "../components/Announcement";
import { Hero } from "../components/Hero";
import { TrustStrip } from "../components/TrustStrip";
import { CategorySection } from "../components/CategorySection";
import { FlashDeals } from "../components/FlashDeals";
import { SpotlightSection } from "../components/SpotlightSection";
import { TrendingSection } from "../components/TrendingSection";
import { Newsletter } from "../components/Newsletter";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { ProductGridSkeleton, BannerSkeleton } from "../components/ui/Skeleton";

export default function Page() {
  const { addToCart: contextAddToCart, isCartOpen, closeCart } = useCart();
  const { wishlist, toggleWishlist: contextToggleWishlist } = useWishlist();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic MongoDB state
  const [sections, setSections] = useState([
    { key: "hero", enabled: true, order: 1 },
    { key: "trust", enabled: true, order: 2 },
    { key: "categories", enabled: true, order: 3 },
    { key: "flash_deals", enabled: true, order: 4 },
    { key: "spotlight", enabled: true, order: 5 },
    { key: "trending", enabled: true, order: 6 },
    { key: "newsletter", enabled: true, order: 7 },
  ]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      setIsLoading(true);
      try {
        const [sectionsRes, categoriesRes, productsRes, settingsRes] = await Promise.allSettled([
          settingsService.getHomepageSections(),
          categoryService.getActive(),
          productService.getPublicProducts({ limit: 30 }),
          settingsService.getSettings(),
        ]);

        if (sectionsRes.status === "fulfilled" && sectionsRes.value?.success && Array.isArray(sectionsRes.value.data)) {
          setSections(sectionsRes.value.data);
        }

        if (categoriesRes.status === "fulfilled" && categoriesRes.value?.success && Array.isArray(categoriesRes.value.data)) {
          const valid = categoriesRes.value.data.filter(
            (c) => c && c.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
          );
          setLiveCategories(valid);
        }

        if (productsRes.status === "fulfilled" && productsRes.value?.success && Array.isArray(productsRes.value.data)) {
          setLiveProducts(productsRes.value.data);
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value?.success) {
          setSettings(settingsRes.value.data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic homepage data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  // Normalize backend products for cards
  const displayProducts = useMemo(() => {
    return liveProducts.map((p, idx) => ({
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
      color: idx % 2 === 0 ? "orange" : "teal",
      category: p.categoryId?.name || "General",
      categoryId: p.categoryId?._id || p.categoryId,
      stockAvailable: p.stockAvailable || (p.variants && p.variants[0]?.stockQuantity) || 0,
    }));
  }, [liveProducts]);

  const filteredProducts = useMemo(
    () =>
      displayProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      ),
    [displayProducts, search],
  );

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const addToCart = (product) => {
    contextAddToCart(product, 1);
    showToast(`${product.name} added to cart`);
  };

  const toggleWishlist = (product) => {
    contextToggleWishlist(product);
  };

  const wishlistIds = useMemo(() => {
    return wishlist.map((w) => w.id || w._id || w);
  }, [wishlist]);

  // Dynamic Section Renderer based on Admin Configuration
  const renderSection = (key) => {
    switch (key) {
      case "hero":
        return <Hero key="hero" />;
      case "trust":
        return <TrustStrip key="trust" />;
      case "categories":
        return <CategorySection key="categories" categories={liveCategories} isLoading={isLoading} />;
      case "flash_deals":
        return (
          <FlashDeals
            key="flash_deals"
            products={filteredProducts}
            wishlist={wishlistIds}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
          />
        );
      case "spotlight":
        return <SpotlightSection key="spotlight" />;
      case "trending":
        return (
          <TrendingSection
            key="trending"
            products={filteredProducts}
            categories={liveCategories}
            wishlist={wishlistIds}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
          />
        );
      case "newsletter":
        return <Newsletter key="newsletter" config={settings?.newsletterConfig} />;
      default:
        return null;
    }
  };

  // Sort enabled sections by order
  const activeSections = useMemo(() => {
    return sections
      .filter((s) => s.enabled)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [sections]);

  return (
    <div className="app-shell">
      <Header
        search={search}
        setSearch={setSearch}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onWishlistClick={() =>
          showToast(`${wishlist.length} items in your wishlist`)
        }
      />

      <Announcement />

      <main id="top">
        {isLoading && liveProducts.length === 0 ? (
          <div className="container" style={{ padding: "40px 0" }}>
            <BannerSkeleton />
            <div style={{ marginTop: "40px" }}>
              <ProductGridSkeleton count={4} />
            </div>
          </div>
        ) : (
          activeSections.map((sec) => renderSection(sec.key))
        )}
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer
          onClose={closeCart}
        />
      )}

      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
