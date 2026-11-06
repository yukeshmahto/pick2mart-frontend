"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import { categoryService } from "../../services/category.service";
import { useCart } from "../../context/CartContext";
import { ChevronRight, Loader2, Grid } from "lucide-react";

export default function CategoriesPage() {
  const { isCartOpen, closeCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const res = await categoryService.getActive();
        const liveCats = (res?.data || []).filter(
          (c) => c?.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
        );
        if (mounted) {
          if (liveCats.length > 0) {
            const mapped = liveCats.map((c) => ({
              name: c.name,
              slug: c.slug,
              description: c.description || "Discover verified products at best prices.",
              image: c.image || null,
            }));
            setCategories(mapped);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
      />

      <main style={{ minHeight: "80vh", backgroundColor: "#f9f9fb", paddingBottom: "60px" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "60px 20px", textAlign: "center", color: "white" }}>
          <h1 style={{ fontSize: "2.75rem", fontWeight: "800", marginBottom: "14px" }}>Shop by Category</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.85, maxWidth: "600px", margin: "0 auto" }}>
            Explore our wide range of products across various verified categories. Find exactly what you need with ease.
          </p>
        </div>

        <div className="shop-container-wide" style={{ marginTop: "40px" }}>
          {isLoading ? (
            <div style={{ padding: "80px 0", textAlign: "center", color: "var(--muted)" }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 16px", color: "var(--teal)" }} />
              <p>Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {categories.map((category) => (
                <Link
                  href={`/category/${category.slug}`}
                  key={category.slug}
                  style={{
                    display: "block",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={{ height: "200px", position: "relative", backgroundColor: "#0f172a" }}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)" }} />
                    )}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)",
                    }} />
                    <h2 style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "20px",
                      color: "white",
                      margin: 0,
                      fontSize: "1.4rem",
                      fontWeight: "700",
                    }}>
                      {category.name}
                    </h2>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "16px", lineHeight: 1.5 }}>
                      {category.description}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      color: "var(--teal)",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                    }}>
                      Explore Products <ChevronRight size={16} style={{ marginLeft: "4px" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "80px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", maxWidth: "600px", margin: "0 auto" }}>
              <Grid size={48} style={{ margin: "0 auto 16px", color: "#94a3b8" }} />
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#0f172a" }}>No Categories Available</h3>
              <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.95rem" }}>Categories will appear here once configured in the Admin Panel.</p>
              <Link href="/products" className="primary-button" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer onClose={closeCart} />
      )}
    </>
  );
}
