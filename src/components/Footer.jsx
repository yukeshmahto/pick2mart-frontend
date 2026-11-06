"use client";
import React from "react";
import Link from "next/link";
import { Menu, Search, Heart, ShoppingBag, ArrowUp, Smartphone, QrCode } from "lucide-react";

import { useCart } from "../context/CartContext";

export function Footer({ cartCount, onCartClick }) {
  let cartCtx = null;
  try { cartCtx = useCart(); } catch (e) {}

  const activeCartCount = cartCount !== undefined ? cartCount : (cartCtx?.cartCount || 0);
  const activeCartClick = onCartClick || cartCtx?.openCart || (() => {});

  return (
    <>
      <footer className="site-footer">
        <div className="back-to-top">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top <ArrowUp size={14} />
          </button>
        </div>
        <div className="container footer-main">
          <div className="footer-col">
            <h4>About Pick 2 Mart</h4>
            <Link href="/about">About Us</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/seller/login">Merchant Hub Login</Link>
            <Link href="/delivery/login">Delivery Fleet Login</Link>
            <Link href="/become-seller">Sell on Pick2Mart</Link>
            <Link href="/corporate">Corporate Information</Link>
          </div>
          <div className="footer-col">
            <h4>Customer Care</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/track-order">Track Order</Link>
            <Link href="/shipping">Shipping & Delivery</Link>
            <Link href="/returns">Cancellation & Returns</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
          <div className="footer-col">
            <h4>Policies</h4>
            <Link href="/return-policy">Return Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Security & Privacy</Link>
            <Link href="/grievance">Grievance Redressal</Link>
            <Link href="/epr-compliance">EPR Compliance</Link>
          </div>
          <div className="footer-col footer-connect">
            <h4>Connect With Us</h4>
            <div className="socials-new">
              <Link href="#fb" className="social-icon">f</Link>
              <Link href="#tw" className="social-icon">X</Link>
              <Link href="#in" className="social-icon">in</Link>
              <Link href="#yt" className="social-icon">yt</Link>
            </div>
            <p>
              Stay updated with the latest trends,<br/>
              deals and community events.
            </p>
          </div>
          <div className="footer-col footer-app-col">
            <h4>Download App</h4>
            <div className="qr-box">
              <div className="qr-placeholder">
                <QrCode size={24} color="#0f172a" />
              </div>
              <div className="qr-text">
                <small>Scan QR code</small>
                <strong>Get App on Mobile</strong>
              </div>
            </div>
            <div className="app-buttons">
              <button className="app-btn-black">
                <span className="app-btn-icon">▶</span>
                <span className="app-btn-text">
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </span>
              </button>
              <button className="app-btn-black">
                <span className="app-btn-icon"></span>
                <span className="app-btn-text">
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <div className="footer-bottom-left">
            <img src="/logo.jpeg" alt="Pick 2 Mart" style={{ height: "40px", objectFit: "contain", marginBottom: "8px" }} />
            <br />
            <strong>Everything You Need. All in One Mart.</strong>
            <p>© 2024 Pick 2 Mart India Internet Pvt. Ltd. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <span>100% SECURE PAYMENT:</span>
            <div className="payment-badges">
              <span className="pay-badge">VISA</span>
              <span className="pay-badge">Mastercard</span>
              <span className="pay-badge">RuPay</span>
              <span className="pay-badge">UPI</span>
              <span className="pay-badge">NetBanking</span>
              <span className="pay-badge">COD</span>
            </div>
          </div>
        </div>
      </footer>

      <div className="mobile-bottom-nav">
        <Link href="/" className="active">
          <span>⌂</span>Home
        </Link>
        <Link href="/category">
          <Menu size={18} />
          Categories
        </Link>
        <button>
          <Search size={18} />
          Search
        </button>
        <button>
          <Heart size={18} />
          Wishlist
        </button>
        <button onClick={activeCartClick}>
          <ShoppingBag size={18} />
          <i>{activeCartCount}</i>Cart
        </button>
      </div>
    </>
  );
}
