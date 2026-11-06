"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Check, Copy, AlertCircle, Loader2, QrCode, Smartphone } from "lucide-react";
import { newsletterService } from "../services/newsletter.service";
import { settingsService } from "../services/settings.service";

export function Newsletter({ config: initialConfig }) {
  const [config, setConfig] = useState(initialConfig || null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialConfig) {
      let isMounted = true;
      settingsService.getSettings()
        .then((res) => {
          if (isMounted && res?.data?.newsletterConfig) {
            setConfig(res.data.newsletterConfig);
          }
        })
        .catch(() => {});
      return () => { isMounted = false; };
    } else {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const isEnabled = config?.enabled !== false && config?.isActive !== false;
  if (!isEnabled) {
    return null;
  }

  // Dynamic left side content
  const kicker = config?.kicker || config?.badgeText || "VIP Perks Club";
  const headline = config?.headline || "Claim Flat ₹200 OFF on Your Next Order";
  const subtitle = config?.subtitle || config?.description || "Subscribe to personalized weekly flash drops, exclusive price crash alerts, and member-only coupons.";
  const ctaText = config?.ctaText || "Claim Coupon";
  const configuredCoupon = config?.couponCode || "WELCOME200";
  const disclaimer = config?.disclaimer || "Zero spam. Unsubscribe anytime with one tap.";
  const inputPlaceholder = config?.inputPlaceholder || "Enter your email address...";

  // Dynamic right side app offer content
  const showAppOffer = config?.showAppOffer !== false;
  const appTitle = config?.appTitle || "Shop Faster on Pick2Mart App";
  const appDescription = config?.appDescription || "Enjoy app-exclusive hourly deals, live dispatch order tracking, and easy one-click checkout.";
  const appStats = config?.appStats || "★ 4.8 ◉ 10M+ Installs";
  const qrCodeText = config?.qrCodeText || "SCAN TO INSTALL";
  const qrCodeImage = config?.qrCodeImage || "";
  const appStoreUrl = config?.appStoreUrl || "";
  const playStoreUrl = config?.playStoreUrl || "";
  const customBg = config?.bgGradient ? { background: config.bgGradient } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await newsletterService.subscribe(trimmed, configuredCoupon, "HOMEPAGE");
      if (res?.success || res?.status === "success" || res?.message) {
        setSuccess(true);
        setCouponCode(res?.data?.couponCode || configuredCoupon);
      } else {
        setError(res?.message || "Subscription could not be processed. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to subscribe. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCoupon = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="newsletter" id="newsletter" style={customBg}>
      <div className="container newsletter-inner">
        <div>
          <span className="section-kicker">{kicker}</span>
          <h2>{headline}</h2>
          <p>{subtitle}</p>

          {success ? (
            <div style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "20px 24px",
              marginTop: "20px",
              maxWidth: "500px",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Check size={20} color="#34d399" />
                <strong style={{ fontSize: "1.1rem" }}>You are successfully subscribed!</strong>
              </div>
              <p style={{ margin: "0 0 14px 0", fontSize: "0.9rem", opacity: 0.9 }}>
                Use this verified welcome coupon code at checkout:
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  letterSpacing: "2px",
                  fontWeight: "800",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  border: "1px dashed rgba(255,255,255,0.5)"
                }}>
                  {couponCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="secondary-button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%", maxWidth: "520px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={inputPlaceholder}
                  required
                  disabled={loading}
                  style={{ flex: "1 1 240px" }}
                />
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                  style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Subscribing...
                    </>
                  ) : (
                    <>
                      {ctaText} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#fecaca",
                  fontSize: "0.85rem",
                  marginTop: "6px"
                }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <small style={{ display: "block", marginTop: "8px" }}>{disclaimer}</small>
            </form>
          )}
        </div>

        {showAppOffer && (
          <div className="app-offer">
            <div className="qr" style={{ padding: qrCodeImage ? "4px" : "8px", overflow: "hidden" }}>
              {qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt={appTitle}
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "4px" }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%" }}>
                  <QrCode size={48} style={{ opacity: 0.95 }} />
                  <small style={{ fontWeight: 800, marginTop: "4px", fontSize: "8px", letterSpacing: "0.06em" }}>{qrCodeText}</small>
                </div>
              )}
            </div>
            <div>
              <b>{appTitle}</b>
              <p>{appDescription}</p>
              <span>{appStats}</span>

              {(playStoreUrl || appStoreUrl) && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {playStoreUrl && (
                    <a
                      href={playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                        padding: "5px 10px",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontWeight: 600,
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <Smartphone size={13} /> Google Play
                    </a>
                  )}
                  {appStoreUrl && (
                    <a
                      href={appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                        padding: "5px 10px",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontWeight: 600,
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <Smartphone size={13} /> App Store
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
