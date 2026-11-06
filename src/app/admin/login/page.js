"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Lock, Smartphone, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { authService } from "../../../services/auth.service";
import { userService } from "../../../services/user.service";
import { resolvePostLoginRedirect, USER_ROLES } from "../../../utils/auth-redirect";

export default function AdminLoginPage() {
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
          const profileRes = await userService.getProfile();
          if (profileRes.success && profileRes.data) {
            user = profileRes.data;
          }
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (user?.role === USER_ROLES.ADMIN) {
          const params = new URLSearchParams(window.location.search);
          const redirectParam = params.get("redirect");
          const target = resolvePostLoginRedirect(redirectParam, USER_ROLES.ADMIN);
          window.location.href = target;
        } else {
          setError(`Access Denied: Account (${user?.email}) does not have system administrator authorization.`);
          setLoading(false);
        }
      } else {
        setError(response.message || "Invalid administrator credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Invalid administrator credentials.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", flexDirection: "column", color: "#f8fafc" }}>
      {/* Top Header */}
      <header style={{ backgroundColor: "#090d16", borderBottom: "1px solid #1e293b", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ backgroundColor: "#dc2626", color: "white", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.9rem" }}>ADMIN</span>
            <span style={{ color: "white", fontWeight: "700", fontSize: "1.1rem" }}>Pick2Mart <span style={{ color: "#94a3b8", fontWeight: "500" }}>Operations Console</span></span>
          </Link>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem" }}>Return to Public Site</Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ backgroundColor: "#0f172a", padding: "40px", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", width: "100%", maxWidth: "440px", border: "1px solid #1e293b" }}>
          
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "rgba(220, 38, 38, 0.12)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid rgba(220, 38, 38, 0.25)" }}>
              <ShieldCheck size={32} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>Administrator Access</h1>
            <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.9rem" }}>Internal management, catalog control, and platform dispatch</p>
          </div>

          {error && (
            <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Email or Mobile */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>Admin Username / Email</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                  <Smartphone size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@pick2mart.com"
                  style={{ width: "100%", padding: "12px 12px 12px 42px", borderRadius: "10px", border: "1px solid #334155", backgroundColor: "#020617", color: "#f8fafc", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#ef4444"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#cbd5e1" }}>Password</label>
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
                  placeholder="Enter administrator password"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", borderRadius: "10px", border: "1px solid #334155", backgroundColor: "#020617", color: "#f8fafc", outline: "none", fontSize: "0.95rem" }}
                  onFocus={(e) => e.target.style.borderColor = "#ef4444"}
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
                backgroundColor: loading ? "#991b1b" : "#dc2626",
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
              {loading ? "Authenticating..." : <>Access Admin Console <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Security Notice */}
          <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#020617", borderRadius: "10px", border: "1px solid #1e293b", fontSize: "0.8rem", color: "#64748b", textAlign: "center" }}>
            All administrative actions, session events, and configuration overrides are cryptographically signed and logged for compliance auditing.
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "16px", color: "#475569", fontSize: "0.8rem", borderTop: "1px solid #1e293b" }}>
        © 2024 Pick2Mart Platform Administration. Restricted internal system.
      </footer>
    </div>
  );
}
