"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Truck, Lock, Smartphone, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { authService } from "../../../services/auth.service";
import { userService } from "../../../services/user.service";
import { resolvePostLoginRedirect, USER_ROLES } from "../../../utils/auth-redirect";

export default function DeliveryLoginPage() {
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
        if (user?.role === USER_ROLES.DELIVERY_PARTNER || user?.role === USER_ROLES.ADMIN) {
          const target = resolvePostLoginRedirect(redirectParam, user.role);
          window.location.href = target;
        } else {
          setRoleNotice({
            currentRole: user?.role || "customer",
            email: user?.email,
          });
          setLoading(false);
        }
      } else {
        setError(response.message || "Invalid fleet credentials. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Delivery Login Error:", err);
      setError(err.message || "Invalid fleet credentials. Please verify and try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", display: "flex", flexDirection: "column", color: "#f8fafc" }}>
      {/* Top Fleet Header */}
      <header style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ backgroundColor: "#0d9488", color: "white", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.9rem" }}>FLEET</span>
            <span style={{ color: "white", fontWeight: "700", fontSize: "1.1rem" }}>Pick2Mart <span style={{ color: "#2dd4bf", fontWeight: "500" }}>Delivery Dispatch</span></span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.85rem" }}>
            <Link href="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Storefront Login</Link>
            <Link href="/seller/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Merchant Hub</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", width: "100%", maxWidth: "460px", border: "1px solid #334155" }}>
          
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(13, 148, 136, 0.15)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid rgba(45, 212, 191, 0.3)" }}>
              <Truck size={30} color="#2dd4bf" />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>Delivery Partner Login</h1>
            <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.9rem" }}>Dispatch tasks, route navigation, and delivery completion</p>
          </div>

          {/* Role Mismatch Notice */}
          {roleNotice && (
            <div style={{ padding: "16px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#fbbf24", marginBottom: "6px", fontSize: "0.95rem" }}>
                <ShieldAlert size={18} /> Not Authorized for Delivery Fleet
              </div>
              <p style={{ color: "#fef3c7", fontSize: "0.85rem", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                Your account ({roleNotice.email}) is currently registered with role <strong>{roleNotice.currentRole.toUpperCase()}</strong>. Delivery partner accounts are provisioned exclusively by Pick2Mart Fleet Operations.
              </p>
              <Link
                href="/login"
                style={{ display: "block", textAlign: "center", backgroundColor: "#334155", color: "white", padding: "8px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}
              >
                Log In With Authorized Account
              </Link>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Email or Mobile */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>Fleet Email or Mobile</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <Smartphone size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="delivery@example.com or mobile"
                  style={{ width: "100%", padding: "12px 12px 12px 42px", borderRadius: "10px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#f8fafc", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#2dd4bf"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#cbd5e1" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.825rem", color: "#2dd4bf", textDecoration: "none", fontWeight: "500" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your fleet password"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", borderRadius: "10px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#f8fafc", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#2dd4bf"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
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
                backgroundColor: loading ? "#0f766e" : "#0d9488",
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
              {loading ? "Verifying Credentials..." : <>Access Fleet Portal <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Provisioning Info Box */}
          <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#0f172a", borderRadius: "10px", border: "1px solid #334155", fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <CheckCircle2 size={16} color="#2dd4bf" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>Delivery partner accounts are provisioned and dispatched by hub managers. Please contact your local hub coordinator if you do not have credentials.</span>
          </div>

          {/* Bottom Switch Links */}
          <div style={{ marginTop: "24px", borderTop: "1px solid #334155", paddingTop: "18px", display: "flex", justifyContent: "center", gap: "16px", fontSize: "0.85rem" }}>
            <Link href="/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Customer Login</Link>
            <span style={{ color: "#475569" }}>•</span>
            <Link href="/seller/login" style={{ color: "#94a3b8", textDecoration: "none" }}>Merchant Login</Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "0.8rem", borderTop: "1px solid #1e293b" }}>
        © 2024 Pick2Mart Logistics & Delivery Fleet Dispatch. Authorized Personnel Only.
      </footer>
    </div>
  );
}
