"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Lock, Smartphone, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, User } from "lucide-react";
import { authService } from "../../../services/auth.service";
import { userService } from "../../../services/user.service";
import { resolvePostLoginRedirect, USER_ROLES } from "../../../utils/auth-redirect";

export default function SellerLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleNotice, setRoleNotice] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setRoleNotice(null);
    setLoading(true);

    try {
      const response = await authService.login({ identifier, password });
      if (response.success && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        let user = response.data.user;
        if (!user || !user.role) {
          const profileRes = await userService.getProfile();
          if (profileRes.success && profileRes.data) {
            user = profileRes.data;
          }
        }

        localStorage.setItem("user", JSON.stringify(user));

        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");

        // Role verification
        if (user?.role === USER_ROLES.SELLER || user?.role === USER_ROLES.ADMIN) {
          const target = resolvePostLoginRedirect(redirectParam, user.role);
          window.location.href = target;
        } else {
          // Account exists but is not an authorized seller
          setRoleNotice({
            currentRole: user?.role || "customer",
            email: user?.email,
          });
          setLoading(false);
        }
      } else {
        setError(response.message || "Invalid merchant credentials. Please check your email/mobile and password.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Seller Login Error:", err);
      setError(err.message || "Invalid merchant credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top Merchant Brand Bar */}
      <header style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ backgroundColor: "#0284c7", color: "white", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.9rem" }}>P2M</span>
            <span style={{ color: "white", fontWeight: "700", fontSize: "1.1rem" }}>Pick2Mart <span style={{ color: "#38bdf8", fontWeight: "500" }}>Seller Hub</span></span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.85rem" }}>
            <Link href="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Customer Storefront</Link>
            <Link href="/become-seller" style={{ backgroundColor: "#0284c7", color: "white", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontWeight: "600" }}>Apply to Sell</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", width: "100%", maxWidth: "460px", border: "1px solid #e2e8f0" }}>
          
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#f0f9ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid #bae6fd" }}>
              <Store size={28} color="#0284c7" />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>Merchant Login</h1>
            <p style={{ color: "#64748b", marginTop: "6px", fontSize: "0.9rem" }}>Access your Pick2Mart store, catalog, and orders</p>
          </div>

          {/* Role Mismatch Notice */}
          {roleNotice && (
            <div style={{ padding: "16px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "12px", marginBottom: "20px" }}>
              <div style={{ fontWeight: "700", color: "#92400e", marginBottom: "6px", fontSize: "0.95rem" }}>
                Not a Merchant Account
              </div>
              <p style={{ color: "#b45309", fontSize: "0.85rem", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                You are logged in as <strong>{roleNotice.currentRole.toUpperCase()}</strong> ({roleNotice.email}). This portal requires an approved Seller account.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href="/become-seller"
                  style={{ flex: 1, textAlign: "center", backgroundColor: "#0284c7", color: "white", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}
                >
                  Apply to Sell
                </Link>
                <Link
                  href="/profile"
                  style={{ flex: 1, textAlign: "center", backgroundColor: "#f1f5f9", color: "#334155", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}
                >
                  My Customer Account
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", border: "1px solid #fecaca", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Email or Mobile */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Merchant Email or Mobile</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <Smartphone size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="seller@example.com or 9876543210"
                  style={{ width: "100%", padding: "12px 12px 12px 42px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#0284c7"}
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.825rem", color: "#0284c7", textDecoration: "none", fontWeight: "500" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your merchant password"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#0284c7"}
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: loading ? "#7dd3fc" : "#0284c7",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "6px",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? "Signing in..." : <>Sign In to Merchant Hub <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Bottom Switch Links */}
          <div style={{ marginTop: "28px", borderTop: "1px solid #f1f5f9", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", textAlign: "center" }}>
            <div>
              <span style={{ color: "#64748b" }}>Want to sell on Pick2Mart? </span>
              <Link href="/become-seller" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>Apply as a Seller</Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", color: "#94a3b8" }}>
              <Link href="/login" style={{ color: "#64748b", textDecoration: "none" }}>Customer Login</Link>
              <span>•</span>
              <Link href="/delivery/login" style={{ color: "#64748b", textDecoration: "none" }}>Fleet Partner Login</Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "0.8rem", borderTop: "1px solid #e2e8f0" }}>
        © 2024 Pick2Mart Marketplace. All rights reserved. Secure Merchant Access.
      </footer>
    </div>
  );
}
