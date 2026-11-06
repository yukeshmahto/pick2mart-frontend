"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import Link from "next/link";
import { UserPlus, Mail, Phone, Lock, Calendar, User, ShieldCheck } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function RegisterPage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    role: "customer"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.register(formData);
      if (response.success) {
        setSuccess(response.message || "Account created successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        search={search}
        setSearch={setSearch}
      />
      
      <main style={{ backgroundColor: "#f8fafc", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", width: "100%", maxWidth: "600px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UserPlus size={30} color="var(--teal)" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>Create an Account</h1>
            <p style={{ color: "#64748b", marginTop: "8px" }}>Join Pick2Mart for exclusive deals and offers</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", textAlign: "center", border: "1px solid #fecaca" }}>{error}</div>}
            {success && <div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#15803d", borderRadius: "8px", textAlign: "center", border: "1px solid #bbf7d0" }}>{success}</div>}

            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><User size={18} /></div>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.border = "1px solid var(--teal)"} onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"} />
              </div>
            </div>

            {/* Email & Mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Mail size={18} /></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Mobile Number</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Phone size={18} /></div>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="9876543210" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
            </div>

            {/* DOB & Gender */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Date of Birth</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Calendar size={18} /></div>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", appearance: "none", backgroundColor: "white" }}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Registering As (Category/Role) */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Registering As</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><ShieldCheck size={18} /></div>
                <select name="role" value={formData.role} onChange={handleChange} required style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "white", fontSize: "0.95rem", color: "#1e293b", cursor: "pointer" }}>
                  <option value="customer">Customer (Shop on Pick2Mart)</option>
                  <option value="seller">Seller (Sell Products)</option>
                  <option value="delivery_partner">Delivery Partner (Deliver Orders)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={18} /></div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a strong password" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "8px", cursor: "pointer" }}>
              <input type="checkbox" required style={{ marginTop: "4px", accentColor: "var(--teal)", width: "16px", height: "16px" }} />
              <span style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                I agree to the <Link href="/terms" style={{ color: "var(--teal)", textDecoration: "underline" }}>Terms of Use</Link> and <Link href="/privacy" style={{ color: "var(--teal)", textDecoration: "underline" }}>Privacy Policy</Link>
              </span>
            </label>

            <button disabled={loading} type="submit" style={{ width: "100%", padding: "16px", backgroundColor: loading ? "#99f6e4" : "var(--teal)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginTop: "16px", transition: "background-color 0.2s" }} onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = "#0d9488" }} onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = "var(--teal)" }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <p style={{ color: "#64748b" }}>
              Already have an account? <Link href="/login" style={{ color: "var(--orange)", fontWeight: "600", textDecoration: "none" }}>Log in here</Link>
            </p>
          </div>

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
