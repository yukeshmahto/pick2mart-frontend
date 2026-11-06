"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ShieldCheck,
  MapPin,
  CreditCard,
  ShoppingBag,
  Truck,
  Plus,
  Loader2,
  ChevronRight,
  AlertCircle,
  Check,
  Tag,
  X,
} from "lucide-react";

// Context & Services
import { useCart } from "../../context/CartContext";
import { addressService } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { promotionService } from "../../services/promotion.service";

// Components
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, isCartOpen, setIsCartOpen } = useCart();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
    isDefault: true,
  });
  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment & Order state
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  // Check auth & fetch saved addresses
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    setIsAuthenticated(!!token);
    setAuthChecked(true);

    if (token) {
      loadAddresses();
    } else {
      setIsLoadingAddresses(false);
    }
  }, []);

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await addressService.getAll();
      const list = res?.data || [];
      setAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr._id);
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.warn("Could not load addresses:", err?.message);
      setShowNewAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    setIsSavingAddress(true);
    try {
      const res = await addressService.create(addressForm);
      if (res?.data?._id) {
        const created = res.data;
        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created._id);
        setShowNewAddressForm(false);
      } else {
        throw new Error(res?.message || "Failed to save address");
      }
    } catch (err) {
      setAddressError(err?.message || "Failed to create address. Please check fields.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await promotionService.validateCoupon(couponInput.trim().toUpperCase(), subtotal);
      if (res?.success && res?.data) {
        setAppliedCoupon(res.data);
        setCouponSuccess(res.message || `Coupon ${res.data.code} applied! Saved ₹${res.data.discountAmount}`);
      } else {
        throw new Error(res?.message || "Invalid coupon code");
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setAddressError("Please select or add a delivery address to proceed.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    if (!selectedAddressId) {
      setOrderError("Please select a delivery address.");
      setStep(1);
      return;
    }

    setIsPlacingOrder(true);
    setOrderError("");

    try {
      const res = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      if (res?.success && res?.data) {
        setCompletedOrder(res.data);
        clearCart();
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(res?.message || "Could not place order.");
      }
    } catch (err) {
      console.error("Order checkout error:", err);
      setOrderError(err?.message || "Order placement failed. Please verify item stock or try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // If cart is empty and not on step 3
  if (cart.length === 0 && step !== 3) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "80vh", backgroundColor: "#f8fafc", padding: "60px 20px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", padding: "48px 32px", borderRadius: "20px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#f0fdfa", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <ShoppingBag size={36} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>Your Cart is Empty</h1>
            <p style={{ color: "#64748b", marginBottom: "28px" }}>You do not have any items in your cart to checkout.</p>
            <Link href="/products" className="primary-button" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              Explore Products <ChevronRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If not logged in
  if (authChecked && !isAuthenticated && step !== 3) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "80vh", backgroundColor: "#f8fafc", padding: "60px 20px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "white", padding: "48px 32px", borderRadius: "20px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <ShieldCheck size={32} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>Sign In to Checkout</h1>
            <p style={{ color: "#64748b", marginBottom: "28px", lineHeight: 1.5 }}>
              Please login or create an account to access saved delivery addresses and track order status.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/login?redirect=/checkout" className="primary-button" style={{ textDecoration: "none" }}>
                Login to Continue
              </Link>
              <Link href="/register" style={{ padding: "12px 24px", border: "1px solid #cbd5e1", borderRadius: "10px", color: "#334155", textDecoration: "none", fontWeight: "600" }}>
                Create Account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "36px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>Products</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#0f172a", fontWeight: "600" }}>Checkout</span>
          </div>

          {step < 3 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "36px", alignItems: "start" }}>
              {/* Left Column: Flow */}
              <div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#0f172a", marginBottom: "24px" }}>
                  Secure Checkout
                </h1>

                {/* Stepper Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", padding: "16px 20px", backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: step >= 1 ? "var(--teal)" : "#94a3b8", fontWeight: "700", fontSize: "0.9rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: step >= 1 ? "var(--teal)" : "#e2e8f0", color: step >= 1 ? "white" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                      1
                    </div>
                    Delivery Address
                  </div>
                  <div style={{ flex: 1, height: "2px", backgroundColor: "#e2e8f0" }}>
                    <div style={{ height: "100%", backgroundColor: "var(--teal)", width: step >= 2 ? "100%" : "0%", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: step >= 2 ? "var(--teal)" : "#94a3b8", fontWeight: "700", fontSize: "0.9rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: step >= 2 ? "var(--teal)" : "#e2e8f0", color: step >= 2 ? "white" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                      2
                    </div>
                    Payment & Confirm
                  </div>
                </div>

                {orderError && (
                  <div style={{ padding: "14px 18px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                    <AlertCircle size={18} />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Step 1: Address Selection */}
                {step === 1 && (
                  <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={20} color="var(--teal)" /> Select Delivery Address
                      </h2>
                      {!showNewAddressForm && addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(true)}
                          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--teal)", background: "none", border: "none", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
                        >
                          <Plus size={16} /> Add New Address
                        </button>
                      )}
                    </div>

                    {isLoadingAddresses ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 8px", color: "var(--teal)" }} />
                        <p>Loading your saved addresses...</p>
                      </div>
                    ) : (
                      <>
                        {/* Saved Addresses List */}
                        {!showNewAddressForm && addresses.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                            {addresses.map((addr) => {
                              const isSelected = selectedAddressId === addr._id;
                              return (
                                <label
                                  key={addr._id}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "14px",
                                    padding: "16px 20px",
                                    borderRadius: "14px",
                                    border: isSelected ? "2px solid var(--teal)" : "1px solid #e2e8f0",
                                    backgroundColor: isSelected ? "#f0fdfa" : "white",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="addressSelect"
                                    checked={isSelected}
                                    onChange={() => setSelectedAddressId(addr._id)}
                                    style={{ marginTop: "4px", accentColor: "var(--teal)" }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                      <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{addr.fullName}</strong>
                                      <span style={{ fontSize: "0.75rem", backgroundColor: "#e2e8f0", color: "#475569", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase", fontWeight: "700" }}>
                                        {addr.addressType || "Home"}
                                      </span>
                                    </div>
                                    <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.5, margin: "2px 0" }}>
                                      {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                      {addr.landmark ? ` (Near ${addr.landmark})` : ""}
                                    </p>
                                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                                    </p>
                                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
                                      Contact: {addr.mobile}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Add New Address Form */}
                        {showNewAddressForm && (
                          <form onSubmit={handleSaveNewAddress} style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", color: "#0f172a" }}>
                              Add a New Delivery Address
                            </h3>

                            {addressError && (
                              <div style={{ padding: "10px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" }}>
                                {addressError}
                              </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Full Name</label>
                                <input
                                  type="text"
                                  required
                                  value={addressForm.fullName}
                                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>10-Digit Mobile</label>
                                <input
                                  type="tel"
                                  required
                                  pattern="[0-9]{10}"
                                  value={addressForm.mobile}
                                  onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: "14px" }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Flat, House no., Building, Apartment</label>
                              <input
                                type="text"
                                required
                                value={addressForm.addressLine1}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                              />
                            </div>

                            <div style={{ marginBottom: "14px" }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Area, Colony, Street, Sector</label>
                              <input
                                type="text"
                                value={addressForm.addressLine2}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                              />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>City</label>
                                <input
                                  type="text"
                                  required
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>State</label>
                                <input
                                  type="text"
                                  required
                                  value={addressForm.state}
                                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>PIN Code</label>
                                <input
                                  type="text"
                                  required
                                  pattern="[0-9]{6}"
                                  value={addressForm.pincode}
                                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                              <button
                                type="submit"
                                disabled={isSavingAddress}
                                style={{
                                  padding: "10px 20px",
                                  backgroundColor: "var(--teal)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontWeight: "700",
                                  cursor: isSavingAddress ? "not-allowed" : "pointer",
                                }}
                              >
                                {isSavingAddress ? "Saving..." : "Save and Deliver Here"}
                              </button>
                              {addresses.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setShowNewAddressForm(false)}
                                  style={{ padding: "10px 18px", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#475569", fontWeight: "600", cursor: "pointer" }}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </form>
                        )}

                        {!showNewAddressForm && addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={handleProceedToPayment}
                            style={{
                              width: "100%",
                              padding: "14px",
                              backgroundColor: "var(--teal)",
                              color: "white",
                              border: "none",
                              borderRadius: "12px",
                              fontSize: "1rem",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            Proceed to Payment
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Payment Selection */}
                {step === 2 && (
                  <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CreditCard size={20} color="var(--teal)" /> Select Payment Method
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "18px 20px",
                          borderRadius: "12px",
                          border: paymentMethod === "COD" ? "2px solid var(--teal)" : "1px solid #e2e8f0",
                          backgroundColor: paymentMethod === "COD" ? "#f0fdfa" : "white",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          style={{ accentColor: "var(--teal)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: "block", color: "#0f172a", fontSize: "0.95rem" }}>
                            Cash on Delivery (COD)
                          </strong>
                          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            Pay in cash or UPI QR at your doorstep upon verified package handover.
                          </span>
                        </div>
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "18px 20px",
                          borderRadius: "12px",
                          border: paymentMethod === "ONLINE" ? "2px solid var(--teal)" : "1px solid #e2e8f0",
                          backgroundColor: paymentMethod === "ONLINE" ? "#f0fdfa" : "white",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value="ONLINE"
                          checked={paymentMethod === "ONLINE"}
                          onChange={() => setPaymentMethod("ONLINE")}
                          style={{ accentColor: "var(--teal)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: "block", color: "#0f172a", fontSize: "0.95rem" }}>
                            UPI / Cards / NetBanking
                          </strong>
                          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            Pay instantly via Google Pay, PhonePe, Paytm, or Credit/Debit Cards.
                          </span>
                        </div>
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "14px" }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{
                          padding: "14px 24px",
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          border: "none",
                          borderRadius: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                        style={{
                          flex: 1,
                          padding: "14px 28px",
                          backgroundColor: "var(--orange)",
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "1.05rem",
                          fontWeight: "800",
                          cursor: isPlacingOrder ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 4px 16px rgba(249, 115, 22, 0.3)",
                        }}
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> Placing Order...
                          </>
                        ) : (
                          `Place Order • ₹${grandTotal.toLocaleString("en-IN")}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary */}
              <div style={{ backgroundColor: "white", padding: "28px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", position: "sticky", top: "32px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
                  Order Summary ({cart.length} {cart.length === 1 ? "item" : "items"})
                </h3>

                {/* Items preview list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "260px", overflowY: "auto", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.name}
                        </h4>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                          <span>Qty: {item.quantity}</span>
                          <strong style={{ color: "#0f172a" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                    Have a Coupon / Promo Code?
                  </label>
                  {appliedCoupon ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px dashed #86efac", borderRadius: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Tag size={16} color="#16a34a" />
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: "#166534" }}>{appliedCoupon.code}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#15803d", marginLeft: "6px" }}>
                            (-₹{appliedCoupon.discountAmount.toLocaleString("en-IN")})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
                        title="Remove coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="ENTER COUPON"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "var(--teal)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          cursor: couponLoading || !couponInput.trim() ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "6px", fontWeight: "500" }}>{couponError}</p>
                  )}
                  {couponSuccess && !couponError && (
                    <p style={{ color: "#16a34a", fontSize: "0.75rem", marginTop: "6px", fontWeight: "600" }}>{couponSuccess}</p>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#475569", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "600" }}>
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "600" }}>
                    <span>Delivery Charges</span>
                    <span>FREE</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Grand Total</span>
                  <strong style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--teal)" }}>
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#64748b", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "10px" }}>
                  <Truck size={18} color="var(--teal)" />
                  <span>Guaranteed safe and express delivery</span>
                </div>
              </div>
            </div>
          ) : (
            /* Step 3: Order Success Screen */
            <div style={{ maxWidth: "640px", margin: "40px auto", backgroundColor: "white", padding: "48px 36px", borderRadius: "24px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle size={40} />
              </div>

              <span style={{ display: "inline-block", backgroundColor: "#f0fdfa", color: "var(--teal)", padding: "4px 12px", borderRadius: "16px", fontSize: "0.8rem", fontWeight: "700", marginBottom: "12px", textTransform: "uppercase" }}>
                Order Confirmed
              </span>

              <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Thank You for Your Order!
              </h1>

              <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "28px" }}>
                Your order <strong>#{completedOrder?.orderNumber || completedOrder?._id?.slice(-8) || "ORD-SUCCESS"}</strong> has been placed successfully and is being prepared for shipment.
              </p>

              <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9", marginBottom: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Payment Method</span>
                  <strong>{completedOrder?.paymentMethod || paymentMethod}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Order Status</span>
                  <span style={{ color: "#15803d", fontWeight: "700" }}>{completedOrder?.orderStatus || "PLACED"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Total Amount</span>
                  <strong>₹{(completedOrder?.grandTotal || subtotal).toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Estimated Delivery</span>
                  <strong>3 - 5 Business Days</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
                <Link
                  href="/profile?tab=orders"
                  className="primary-button"
                  style={{ textDecoration: "none", padding: "12px 24px" }}
                >
                  View My Orders
                </Link>
                <Link
                  href="/products"
                  style={{ padding: "12px 24px", border: "1px solid #cbd5e1", borderRadius: "10px", color: "#334155", textDecoration: "none", fontWeight: "600" }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
