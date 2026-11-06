"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { pageService } from "../services/page.service";
import { formatCmsContent } from "../utils/cmsFormatter";

export default function GenericPage({ title, description, slug }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cmsPage, setCmsPage] = useState(null);

  useEffect(() => {
    const pageSlug = slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!pageSlug) return;

    let isMounted = true;
    pageService
      .getBySlug(pageSlug)
      .then((res) => {
        if (isMounted && res?.data?.content) {
          setCmsPage(res.data);
        }
      })
      .catch(() => {
        // Fallback to default static description
      });

    return () => {
      isMounted = false;
    };
  }, [slug, title]);

  return (
    <>
      <Header
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        search={search}
        setSearch={setSearch}
      />
      
      <main style={{ minHeight: "60vh", backgroundColor: "#f9f9fb", padding: "60px 20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "60px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", marginBottom: "24px" }}>
            {cmsPage?.title || title}
          </h1>
          {cmsPage?.content ? (
            <div
              className="cms-content"
              style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: formatCmsContent(cmsPage.content, cmsPage?.title || title) }}
            />
          ) : (
            <div style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.8 }}>
              {description}
            </div>
          )}
        </div>
      </main>
      
      <Footer
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          subtotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          setCart={setCart}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </>
  );
}
