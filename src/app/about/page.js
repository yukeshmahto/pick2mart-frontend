"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import { CheckCircle, ShieldCheck, Truck, Clock, ArrowRight, Building2, Target, Eye } from "lucide-react";
import { pageService } from "../../services/page.service";
import { cleanHtml } from "../../utils/sanitize";
import { useCart } from "../../context/CartContext";
import { AboutPageSkeleton } from "../../components/ui/Skeleton";

export default function AboutPage() {
  const { isCartOpen, closeCart } = useCart();
  const [search, setSearch] = useState("");
  const [cmsPage, setCmsPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    pageService
      .getBySlug("about")
      .then((res) => {
        if (mounted && res?.data) {
          setCmsPage(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load about page:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const config = cmsPage?.aboutConfig || {};
  const headline = config?.headline || cmsPage?.title || "About Pick2Mart";
  const subheadline = config?.subheadline || "Connecting authentic brands, verified sellers, and customers with transparent pricing and fastest delivery.";
  const story = config?.story || "";
  const mission = config?.mission || "";
  const vision = config?.vision || "";
  const heroImage = config?.heroImage || "";
  const teamImage = config?.teamImage || "";
  const values = config?.values?.length > 0 ? config.values : [
    { title: "Customer First", desc: "Every product cataloged and delivery milestone is designed around customer satisfaction." },
    { title: "Verified Quality", desc: "Stringent merchant onboarding and genuine product verification ensure authenticity." },
    { title: "Transparent Pricing", desc: "Real-time discounts, verified flash deals, and zero hidden checkout charges." },
    { title: "Fast Fulfillment", desc: "Integrated dispatch fleet and localized hubs ensuring delivery in record time." }
  ];
  const stats = config?.stats?.length > 0 ? config.stats : [
    { label: "Verified Merchants", value: "1,200+" },
    { label: "Curated Products", value: "15,000+" },
    { label: "Orders Delivered", value: "50,000+" },
    { label: "Pincodes Covered", value: "250+" }
  ];
  const ctaText = config?.ctaText || "Explore Our Catalog";
  const ctaUrl = config?.ctaUrl || "/products";

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
      />

      <main style={{ backgroundColor: "#ffffff" }}>
        {isLoading ? (
          <AboutPageSkeleton />
        ) : (
          <>
            {/* Dynamic Hero Section */}
            <div
              style={{
                position: "relative",
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: heroImage
                  ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${heroImage}) center/cover no-repeat`
                  : "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)",
                color: "white",
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <span style={{
                  display: "inline-block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#34d399",
                  marginBottom: "12px",
                }}>
                  Our Heritage & Purpose
                </span>
                <h1 style={{ fontSize: "2.8rem", fontWeight: "800", marginBottom: "16px", lineHeight: 1.2 }}>
                  {headline}
                </h1>
                <p style={{ fontSize: "1.15rem", maxWidth: "700px", margin: "0 auto 24px", opacity: 0.9, lineHeight: 1.6 }}>
                  {subheadline}
                </p>
                {ctaText && (
                  <Link
                    href={ctaUrl}
                    className="primary-button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 28px",
                      fontSize: "1rem",
                      textDecoration: "none",
                    }}
                  >
                    {ctaText} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            {/* Story & Narrative Section */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "70px 20px" }}>
              {cmsPage?.content ? (
                <div
                  className="cms-content"
                  style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: cleanHtml(cmsPage.content) }}
                />
              ) : null}

              {story ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center", marginTop: cmsPage?.content ? "40px" : "0" }}>
                  <div style={{ flex: "1 1 450px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Who We Are
                    </span>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: "700", margin: "8px 0 20px", color: "#1e293b" }}>
                      Our Journey & Story
                    </h2>
                    <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.8, marginBottom: "20px" }}>
                      {story}
                    </p>
                  </div>
                  {teamImage ? (
                    <div style={{ flex: "1 1 400px" }}>
                      <img
                        src={teamImage}
                        alt="Pick2Mart Organization & Team"
                        style={{ width: "100%", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", objectFit: "cover" }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Mission & Vision Cards */}
              {(mission || vision) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "50px" }}>
                  {mission && (
                    <div style={{
                      padding: "32px",
                      borderRadius: "16px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                        <Target size={28} color="var(--teal)" />
                        <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>Our Mission</h3>
                      </div>
                      <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: "1rem" }}>{mission}</p>
                    </div>
                  )}
                  {vision && (
                    <div style={{
                      padding: "32px",
                      borderRadius: "16px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                        <Eye size={28} color="var(--orange)" />
                        <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>Our Vision</h3>
                      </div>
                      <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: "1rem" }}>{vision}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Verified Statistics Section */}
            {stats.length > 0 && (
              <div style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "60px 20px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", textAlign: "center" }}>
                  {stats.map((stat, idx) => (
                    <div key={idx} style={{ padding: "30px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #edf2f7" }}>
                      <div style={{ fontSize: "2.4rem", fontWeight: "800", color: idx % 2 === 0 ? "var(--teal)" : "var(--orange)", marginBottom: "8px" }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: "1rem", color: "#64748b", fontWeight: "600" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Values Section */}
            {values.length > 0 && (
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Principles
                </span>
                <h2 style={{ fontSize: "2.4rem", fontWeight: "700", margin: "8px 0 48px", color: "#1e293b" }}>
                  Why Pick2Mart
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px" }}>
                  {values.map((feature, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "32px 24px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        transition: "all 0.25s ease",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ marginBottom: "18px" }}>
                        {idx % 4 === 0 && <ShieldCheck size={36} color="var(--teal)" />}
                        {idx % 4 === 1 && <CheckCircle size={36} color="var(--orange)" />}
                        {idx % 4 === 2 && <Building2 size={36} color="var(--teal)" />}
                        {idx % 4 === 3 && <Clock size={36} color="var(--orange)" />}
                      </div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "10px", color: "#0f172a" }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem", margin: 0 }}>
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {isCartOpen && <CartDrawer onClose={closeCart} />}
    </>
  );
}
