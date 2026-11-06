"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import Link from "next/link";
import { LogIn, Lock, Mail, Smartphone, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { useCart } from "../../context/CartContext";
import { resolvePostLoginRedirect } from "../../utils/auth-redirect";

export default function LoginPage() {
  const { isCartOpen, closeCart } = useCart();
  const [search, setSearch] = useState("");
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
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
          try {
            const profileRes = await userService.getProfile();
            if (profileRes.success && profileRes.data) {
              user = profileRes.data;
            }
          } catch (e) {
            console.warn("Could not fetch user profile on login:", e);
          }
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");
        const targetUrl = resolvePostLoginRedirect(redirectParam, user?.role);

        window.location.href = targetUrl;
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
      />
      
      <main style={{ backgroundColor: "#f8fafc", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", width: "100%", maxWidth: "450px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "#fff7ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <LogIn size={30} color="var(--orange)" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>Welcome Back</h1>
            <p style={{ color: "#64748b", marginTop: "8px" }}>Log in to your Pick2Mart account</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {error && (
              <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", border: "1px solid #fecaca" }}>
                {error}
              </div>
            )}

            {/* Email or Mobile */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Email or Mobile Number</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Smartphone size={18} /></div>
                <input 
                  type="text" 
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or mobile" 
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", transition: "border 0.2s" }} 
                  onFocus={(e) => e.target.style.border = "1px solid var(--orange)"} 
                  onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"} 
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--teal)", textDecoration: "none", fontWeight: "500" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={18} /></div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  style={{ width: "100%", padding: "12px 42px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", transition: "border 0.2s" }} 
                  onFocus={(e) => e.target.style.border = "1px solid var(--orange)"} 
                  onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"} 
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

            <button disabled={loading} type="submit" style={{ width: "100%", padding: "16px", backgroundColor: loading ? "#fdba74" : "var(--orange)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", transition: "background-color 0.2s" }} onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = "#ea580c"; }} onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = "var(--orange)"; }}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div style={{ marginTop: "28px", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <p style={{ color: "#64748b", margin: "0 0 16px 0" }}>
              New to Pick2Mart? <Link href="/register" style={{ color: "var(--teal)", fontWeight: "600", textDecoration: "none" }}>Create an account</Link>
            </p>

            {/* Portal Switch Links */}
            <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#475569" }}>Selling on Pick2Mart?</span>
                <Link href="/seller/login" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>Merchant Login →</Link>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                <span style={{ color: "#475569" }}>Delivery Fleet Partner?</span>
                <Link href="/delivery/login" style={{ color: "#0d9488", fontWeight: "600", textDecoration: "none" }}>Fleet Partner Login →</Link>
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
