"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import { User, MapPin, Package, Heart, CreditCard, LogOut, Settings, Bell, Lock, Plus, Trash2, CheckCircle2, Loader2, ShoppingBag, AlertTriangle, ExternalLink, ChevronRight, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { userService } from "../../services/user.service";
import { addressService } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { returnsService } from "../../services/returns.service";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProfilePage() {
  let cartCtx = null;
  let wishCtx = null;
  try { cartCtx = useCart(); } catch (e) {}
  try { wishCtx = useWishlist(); } catch (e) {}

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab) setActiveTab(urlTab);
    }
  }, []);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelSubOrderId, setCancelSubOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Return Item Request Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("DAMAGED_PRODUCT");
  const [returnDescription, setReturnDescription] = useState("");
  const [codAccountNo, setCodAccountNo] = useState("");
  const [codIfsc, setCodIfsc] = useState("");
  const [codHolderName, setCodHolderName] = useState("");
  const [codBankName, setCodBankName] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  // Customer Returns & Refunds Tab State
  const [myReturns, setMyReturns] = useState([]);
  const [myRefunds, setMyRefunds] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getMyOrders();
      if (res?.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReturnsAndRefunds = async () => {
    setReturnsLoading(true);
    try {
      const [retRes, refRes] = await Promise.all([
        returnsService.getMyReturns(),
        returnsService.getMyRefunds(),
      ]);
      if (retRes?.success) setMyReturns(retRes.data || []);
      if (refRes?.success) setMyRefunds(refRes.data || []);
    } catch (err) {
      console.warn("Could not fetch customer returns/refunds:", err);
    } finally {
      setReturnsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "returns") {
      fetchReturnsAndRefunds();
    }
  }, [activeTab]);

  const handleOpenCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setCancelSubOrderId("");
    setCancelReason("");
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleSubmitCancellation = async (e) => {
    e.preventDefault();
    if (!selectedOrderForCancel) return;
    if (!cancelReason.trim()) {
      setCancelError("Cancellation reason is mandatory.");
      return;
    }

    setCancelSubmitting(true);
    setCancelError("");
    try {
      await returnsService.cancelOrder(selectedOrderForCancel._id, {
        reason: cancelReason.trim(),
        sellerOrderId: cancelSubOrderId || undefined,
      });
      setCancelModalOpen(false);
      setSelectedOrderForCancel(null);
      await fetchOrders();
    } catch (err) {
      setCancelError(err?.message || "Failed to cancel order.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleOpenReturnModal = (order, item) => {
    setSelectedOrderForReturn(order);
    setSelectedItemForReturn(item);
    setReturnQuantity(1);
    setReturnReason("DAMAGED_PRODUCT");
    setReturnDescription("");
    setCodAccountNo("");
    setCodIfsc("");
    setCodHolderName("");
    setCodBankName("");
    setReturnError("");
    setReturnSuccess("");
    setReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn || !selectedItemForReturn) return;

    setReturnSubmitting(true);
    setReturnError("");
    setReturnSuccess("");
    try {
      const payload = {
        orderId: selectedOrderForReturn._id,
        sellerOrderId: selectedItemForReturn.sellerOrderId || selectedItemForReturn.subOrderId || undefined,
        productId: selectedItemForReturn.productId,
        variantId: selectedItemForReturn.variantId || undefined,
        quantity: Number(returnQuantity),
        reason: returnReason,
        description: returnDescription.trim() || undefined,
      };

      if (selectedOrderForReturn.paymentMethod === "COD" && codAccountNo.trim()) {
        payload.codBankDetails = {
          accountNumber: codAccountNo.trim(),
          ifscCode: codIfsc.trim(),
          accountHolderName: codHolderName.trim() || undefined,
          bankName: codBankName.trim() || undefined,
        };
      }

      const res = await returnsService.createReturnRequest(payload);
      if (res.success) {
        setReturnSuccess("Return request submitted successfully. You can track its status under Returns & Refunds.");
        setTimeout(() => {
          setReturnModalOpen(false);
          setSelectedOrderForReturn(null);
          setSelectedItemForReturn(null);
        }, 1500);
      } else {
        setReturnError(res.message || "Failed to submit return request.");
      }
    } catch (err) {
      setReturnError(err?.message || "Failed to submit return request.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleMoveWishlistToCart = (item) => {
    if (cartCtx) {
      cartCtx.addToCart(item, 1);
    }
    if (wishCtx) {
      wishCtx.removeFromWishlist(item.productId || item.id);
    }
  };

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  const [profileStatus, setProfileStatus] = useState({ loading: false, error: "", success: "" });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileStatus({ loading: true, error: "", success: "" });
    try {
      const response = await userService.updateProfile(profileFormData);
      if (response.success) {
        setUser(response.data);
        setProfileStatus({ loading: false, error: "", success: "Profile updated successfully." });
        setIsEditingProfile(false);
      } else {
        setProfileStatus({ loading: false, error: response.message || "Failed to update profile.", success: "" });
      }
    } catch (err) {
      setProfileStatus({ loading: false, error: err.message || "An error occurred.", success: "" });
    }
  };

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({ fullName: "", mobile: "", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: "", country: "India", addressType: "home", isDefault: false });
  const [addressStatus, setAddressStatus] = useState({ loading: false, error: "", success: "" });

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await addressService.getAll();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressStatus({ loading: true, error: "", success: "" });
    try {
      const res = await addressService.create(addressFormData);
      if (res.success) {
        setAddressStatus({ loading: false, error: "", success: "Address added successfully" });
        setShowAddAddress(false);
        fetchAddresses();
        setAddressFormData({ fullName: "", mobile: "", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: "", country: "India", addressType: "home", isDefault: false });
      } else {
        setAddressStatus({ loading: false, error: res.message, success: "" });
      }
    } catch (err) {
      setAddressStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressService.delete(id);
      fetchAddresses();
    } catch(err) {
      console.error(err);
    }
  };
  
  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefault(id);
      fetchAddresses();
    } catch(err) {
      console.error(err);
    }
  };

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });
    try {
      const response = await userService.changePassword({ currentPassword, newPassword, confirmNewPassword });
      if (response.success) {
        setPasswordStatus({ loading: false, error: "", success: response.message || "Password changed successfully. Please login again." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        // Optionally redirect to login after a few seconds
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }, 2000);
      } else {
        setPasswordStatus({ loading: false, error: response.message || "Failed to change password.", success: "" });
      }
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.message || "An error occurred.", success: "" });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          setUser(response.data);
          setProfileFormData({
            fullName: response.data.fullName || "",
            dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : "",
            gender: response.data.gender || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (error.message === "Unauthorized") {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  
  const handleLogout = () => {
    window.location.href = "/login";
  };

  const SidebarItem = ({ icon, label, id }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", 
        padding: "16px 20px", 
        cursor: "pointer", 
        borderRadius: "12px",
        backgroundColor: activeTab === id ? "#f0fdf4" : "transparent",
        color: activeTab === id ? "var(--teal)" : "#475569",
        fontWeight: activeTab === id ? "600" : "500",
        transition: "all 0.2s"
      }}
    >
      {icon}
      {label}
    </div>
  );

  return (
    <>
      <Header
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        search={search}
        setSearch={setSearch}
      />
      
      <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px", alignItems: "start" }}>
          
          {/* Sidebar */}
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", position: "sticky", top: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "700" }}>
                {user ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                  {user ? user.fullName : "Loading..."}
                </h2>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  {user ? user.mobile : ""}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <SidebarItem id="profile" icon={<User size={20} />} label="My Profile" />
              <SidebarItem id="change-password" icon={<Lock size={20} />} label="Change Password" />
              <SidebarItem id="orders" icon={<Package size={20} />} label="My Orders" />
              <SidebarItem id="returns" icon={<RotateCcw size={20} />} label="Returns & Refunds" />
              <SidebarItem id="wishlist" icon={<Heart size={20} />} label="Wishlist" />
              <SidebarItem id="addresses" icon={<MapPin size={20} />} label="Saved Addresses" />
              <SidebarItem id="payment" icon={<CreditCard size={20} />} label="Payment Methods" />
              <SidebarItem id="notifications" icon={<Bell size={20} />} label="Notifications" />
              <SidebarItem id="settings" icon={<Settings size={20} />} label="Settings" />
              
              <div style={{ borderTop: "1px solid #e2e8f0", margin: "16px 0" }}></div>
              
              <div 
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", cursor: "pointer", color: "#ef4444", fontWeight: "500", borderRadius: "12px" }}
              >
                <LogOut size={20} />
                Log Out
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            
            {activeTab === "profile" && (
              <div>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", marginBottom: "32px" }}>Personal Information</h1>
                {loading ? (
                  <p style={{ color: "#64748b" }}>Loading profile information...</p>
                ) : (
                  <>
                    {profileStatus.error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", border: "1px solid #fecaca", marginBottom: "20px" }}>{profileStatus.error}</div>}
                    {profileStatus.success && <div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#15803d", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "20px" }}>{profileStatus.success}</div>}
                    
                    {!isEditingProfile ? (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Full Name</label>
                            <input type="text" value={user?.fullName || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Email Address</label>
                            <input type="email" value={user?.email || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Mobile Number</label>
                            <input type="text" value={user?.mobile || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Date of Birth</label>
                            <input type="text" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Gender</label>
                            <input type="text" value={user?.gender || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b", textTransform: 'capitalize' }} />
                          </div>
                        </div>
                        <button onClick={() => setIsEditingProfile(true)} style={{ padding: "14px 28px", backgroundColor: "white", color: "var(--teal)", border: "2px solid var(--teal)", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Full Name</label>
                            <input type="text" value={profileFormData.fullName} onChange={(e) => setProfileFormData({...profileFormData, fullName: e.target.value})} required style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Email Address (Cannot be changed here)</label>
                            <input type="email" value={user?.email || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Mobile Number (Cannot be changed here)</label>
                            <input type="text" value={user?.mobile || ""} disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#64748b" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Date of Birth</label>
                            <input type="date" value={profileFormData.dateOfBirth} onChange={(e) => setProfileFormData({...profileFormData, dateOfBirth: e.target.value})} required style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Gender</label>
                            <select value={profileFormData.gender} onChange={(e) => setProfileFormData({...profileFormData, gender: e.target.value})} required style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "white" }}>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "16px" }}>
                          <button type="submit" disabled={profileStatus.loading} style={{ padding: "14px 28px", backgroundColor: "var(--teal)", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: profileStatus.loading ? "not-allowed" : "pointer" }}>
                            {profileStatus.loading ? "Saving..." : "Save Changes"}
                          </button>
                          <button type="button" onClick={() => setIsEditingProfile(false)} style={{ padding: "14px 28px", backgroundColor: "white", color: "#64748b", border: "2px solid #cbd5e1", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "change-password" && (
              <div>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", marginBottom: "32px" }}>Change Password</h1>
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
                  {passwordStatus.error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", border: "1px solid #fecaca" }}>{passwordStatus.error}</div>}
                  {passwordStatus.success && <div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#15803d", borderRadius: "8px", border: "1px solid #bbf7d0" }}>{passwordStatus.success}</div>}
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Current Password</label>
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>New Password</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Confirm New Password</label>
                    <input type="password" required value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                  </div>
                  
                  <button type="submit" disabled={passwordStatus.loading} style={{ padding: "14px", backgroundColor: "var(--teal)", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: passwordStatus.loading ? "not-allowed" : "pointer" }}>
                    {passwordStatus.loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>Saved Addresses</h1>
                  {!showAddAddress && (
                    <button onClick={() => setShowAddAddress(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "var(--teal)", color: "white", border: "none", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "600", cursor: "pointer" }}>
                      <Plus size={18} /> Add New Address
                    </button>
                  )}
                </div>

                {showAddAddress ? (
                  <form onSubmit={handleAddAddress} style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "16px", marginBottom: "32px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "20px", color: "#0f172a" }}>Add New Address</h3>
                    {addressStatus.error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", border: "1px solid #fecaca", marginBottom: "20px" }}>{addressStatus.error}</div>}
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Full Name</label>
                        <input type="text" value={addressFormData.fullName} onChange={(e) => setAddressFormData({...addressFormData, fullName: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Mobile Number</label>
                        <input type="text" value={addressFormData.mobile} onChange={(e) => setAddressFormData({...addressFormData, mobile: e.target.value})} required pattern="[0-9]{10}" title="10 digit mobile number" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Address Line 1</label>
                        <input type="text" value={addressFormData.addressLine1} onChange={(e) => setAddressFormData({...addressFormData, addressLine1: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Address Line 2 (Optional)</label>
                        <input type="text" value={addressFormData.addressLine2} onChange={(e) => setAddressFormData({...addressFormData, addressLine2: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Landmark</label>
                        <input type="text" value={addressFormData.landmark} onChange={(e) => setAddressFormData({...addressFormData, landmark: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Pincode</label>
                        <input type="text" value={addressFormData.pincode} onChange={(e) => setAddressFormData({...addressFormData, pincode: e.target.value})} required pattern="[0-9]{6}" title="6 digit pincode" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>City</label>
                        <input type="text" value={addressFormData.city} onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>State</label>
                        <input type="text" value={addressFormData.state} onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Address Type</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {["home", "work", "other"].map(type => (
                            <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                              <input type="radio" name="addressType" value={type} checked={addressFormData.addressType === type} onChange={(e) => setAddressFormData({...addressFormData, addressType: e.target.value})} style={{ accentColor: "var(--teal)" }} />
                              <span style={{ textTransform: "capitalize", fontSize: "0.9rem" }}>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                          <input type="checkbox" checked={addressFormData.isDefault} onChange={(e) => setAddressFormData({...addressFormData, isDefault: e.target.checked})} style={{ accentColor: "var(--teal)", width: "18px", height: "18px" }} />
                          <span style={{ fontSize: "0.95rem", fontWeight: "500", color: "#0f172a" }}>Make this my default address</span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px" }}>
                      <button type="submit" disabled={addressStatus.loading} style={{ padding: "12px 24px", backgroundColor: "var(--teal)", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "600", cursor: addressStatus.loading ? "not-allowed" : "pointer" }}>
                        {addressStatus.loading ? "Saving..." : "Save Address"}
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} style={{ padding: "12px 24px", backgroundColor: "white", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "600", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {addressesLoading ? (
                      <p style={{ color: "#64748b" }}>Loading addresses...</p>
                    ) : addresses.length === 0 ? (
                      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                        <MapPin size={40} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
                        <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "8px" }}>No addresses found</h3>
                        <p style={{ color: "#64748b" }}>You haven't saved any addresses yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {addresses.map(address => (
                          <div key={address._id} style={{ padding: "20px", borderRadius: "16px", border: address.isDefault ? "2px solid var(--teal)" : "1px solid #e2e8f0", backgroundColor: address.isDefault ? "#f0fdf4" : "white", position: "relative" }}>
                            {address.isDefault && (
                              <div style={{ position: "absolute", top: "16px", right: "16px", color: "var(--teal)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: "700" }}>
                                <CheckCircle2 size={16} /> Default
                              </div>
                            )}
                            
                            <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#e2e8f0", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#475569", marginBottom: "12px" }}>
                              {address.addressType}
                            </div>
                            
                            <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{address.fullName}</h4>
                            <p style={{ color: "#475569", fontSize: "0.95rem", marginBottom: "16px", fontWeight: "500" }}>{address.mobile}</p>
                            
                            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px" }}>
                              {address.addressLine1} {address.addressLine2 && `, ${address.addressLine2}`}<br/>
                              {address.landmark && `Landmark: ${address.landmark}`}<br/>
                              {address.city}, {address.state} {address.pincode}<br/>
                              {address.country}
                            </p>
                            
                            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                              {!address.isDefault && (
                                <button onClick={() => handleSetDefaultAddress(address._id)} style={{ padding: "8px 12px", backgroundColor: "white", border: "1px solid var(--teal)", color: "var(--teal)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>
                                  Set as Default
                                </button>
                              )}
                              <button onClick={() => handleDeleteAddress(address._id)} style={{ padding: "8px", backgroundColor: "white", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Delete Address">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>My Orders</h1>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                  </span>
                </div>

                {ordersLoading ? (
                  <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
                    <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--teal)" }} />
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>
                    <Package size={48} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "1.25rem", color: "#0f172a", marginBottom: "8px", fontWeight: "700" }}>No orders placed yet</h3>
                    <p style={{ color: "#64748b", maxWidth: "380px", margin: "0 auto 24px", fontSize: "0.9rem" }}>
                      You haven't ordered anything yet. Browse our verified marketplace catalog to find top deals.
                    </p>
                    <Link href="/products" className="primary-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      Start Shopping <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {orders.map((order) => {
                      const s = (order.orderStatus || "").toUpperCase();
                      const isCancellable = s === "PENDING" || s === "PROCESSING" || s === "PLACED";
                      const isDelivered = s === "DELIVERED";
                      const isCancelled = s === "CANCELLED";

                      const getBadgeStyle = (status) => {
                        const st = (status || "").toLowerCase();
                        if (st === "placed" || st === "pending") return { bg: "#eff6ff", text: "#1d4ed8", label: "Order Placed" };
                        if (st === "confirmed") return { bg: "#f0fdfa", text: "#0f766e", label: "Confirmed" };
                        if (st === "processing") return { bg: "#fef3c7", text: "#b45309", label: "Processing" };
                        if (st === "shipped") return { bg: "#e0e7ff", text: "#4338ca", label: "Shipped" };
                        if (st === "delivered") return { bg: "#dcfce7", text: "#15803d", label: "Delivered" };
                        if (st === "cancelled") return { bg: "#fee2e2", text: "#b91c1c", label: "Cancelled" };
                        return { bg: "#f1f5f9", text: "#475569", label: status || "Pending" };
                      };

                      const badge = getBadgeStyle(order.orderStatus);

                      return (
                        <div
                          key={order._id}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                          }}
                        >
                          {/* Order Header */}
                          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                              <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>
                                Order #{order.orderNumber || order._id.slice(-8)}
                              </span>
                              <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </strong>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span
                                style={{
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  padding: "4px 12px",
                                  borderRadius: "14px",
                                  fontSize: "0.8rem",
                                  fontWeight: "700",
                                  textTransform: "uppercase",
                                }}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          {/* Cancellation Banner if Cancelled */}
                          {isCancelled && (
                            <div style={{ padding: "10px 20px", backgroundColor: "#fef2f2", borderBottom: "1px solid #fee2e2", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                              <AlertTriangle size={15} />
                              <span>
                                <strong>Order Cancelled</strong> {order.cancelledAt ? `on ${new Date(order.cancelledAt).toLocaleDateString("en-IN")}` : ""} {order.cancellationReason ? `— Reason: "${order.cancellationReason}"` : ""}
                              </span>
                            </div>
                          )}

                          {/* Order Items */}
                          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                                  alt={item.name}
                                  style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
                                    {item.name}
                                  </h4>
                                  <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "#64748b" }}>
                                    <span>Qty: <strong>{item.quantity}</strong></span>
                                    <span>Price: <strong>₹{(item.price || 0).toLocaleString("en-IN")}</strong></span>
                                  </div>
                                </div>
                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                  <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                                  </strong>
                                  {isDelivered && (
                                    <button
                                      onClick={() => handleOpenReturnModal(order, item)}
                                      style={{
                                        padding: "4px 10px",
                                        backgroundColor: "#f0fdf4",
                                        border: "1px solid #bbf7d0",
                                        color: "var(--teal)",
                                        borderRadius: "6px",
                                        fontSize: "0.78rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <RotateCcw size={12} /> Return Item
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer */}
                          <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#ffffff" }}>
                            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                              Payment: <strong>{order.paymentMethod || "COD"}</strong>
                              {order.shippingAddress?.city && (
                                <span> • Deliver to: <strong>{order.shippingAddress.city}</strong></span>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                              <div style={{ fontSize: "1rem", color: "#0f172a" }}>
                                Total: <strong style={{ color: "var(--teal)", fontSize: "1.15rem" }}>₹{(order.grandTotal || 0).toLocaleString("en-IN")}</strong>
                              </div>

                              <Link
                                href={`/track-order?orderId=${order._id}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "8px 14px",
                                  backgroundColor: "var(--teal)",
                                  color: "white",
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                  fontWeight: "700",
                                  textDecoration: "none",
                                }}
                              >
                                <Truck size={15} />
                                <span>Track Delivery</span>
                              </Link>

                              {isCancellable && (
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  style={{
                                    padding: "8px 16px",
                                    backgroundColor: "white",
                                    border: "1px solid #fecaca",
                                    color: "#ef4444",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Returns & Refunds Tab */}
            {activeTab === "returns" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                  <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>Returns & Refunds</h1>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
                      Track the status of your item returns, pickup progress, and refund disbursements.
                    </p>
                  </div>
                  <button
                    onClick={fetchReturnsAndRefunds}
                    disabled={returnsLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "white",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#475569",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RotateCcw size={14} className={returnsLoading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                {returnsLoading ? (
                  <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
                    <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--teal)" }} />
                    <p>Loading your returns & refunds...</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Return Requests Section */}
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                        Item Return Requests ({myReturns.length})
                      </h3>

                      {myReturns.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                          <RotateCcw size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                          <h4 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>No return requests</h4>
                          <p style={{ color: "#64748b", fontSize: "0.85rem", maxWidth: "360px", margin: "0 auto" }}>
                            You have not initiated any returns. Delivered items eligible for return can be submitted from My Orders.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {myReturns.map((ret) => {
                            const statusConfig = {
                              REQUESTED: { bg: "#fef3c7", text: "#b45309", label: "Review Pending" },
                              APPROVED: { bg: "#e0e7ff", text: "#3730a3", label: "Return Approved" },
                              PICKUP_SCHEDULED: { bg: "#e0f2fe", text: "#0369a1", label: "Pickup Scheduled" },
                              RECEIVED: { bg: "#f3e8ff", text: "#6b21a8", label: "Item Received" },
                              INSPECTED: { bg: "#dcfce7", text: "#15803d", label: "Inspected" },
                              REFUNDED: { bg: "#d1fae5", text: "#065f46", label: "Refunded" },
                              REJECTED: { bg: "#fee2e2", text: "#991b1b", label: "Return Rejected" },
                            };
                            const st = statusConfig[ret.status] || { bg: "#f1f5f9", text: "#475569", label: ret.status };

                            return (
                              <div
                                key={ret._id}
                                style={{
                                  backgroundColor: "white",
                                  borderRadius: "16px",
                                  border: "1px solid #e2e8f0",
                                  overflow: "hidden",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                }}
                              >
                                <div style={{ padding: "14px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                                  <div>
                                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Return #{ret.returnNumber || ret._id.substring(0, 8)}</span>
                                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>
                                      Requested on {new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </strong>
                                  </div>
                                  <span style={{ backgroundColor: st.bg, color: st.text, padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase" }}>
                                    {st.label}
                                  </span>
                                </div>

                                <div style={{ padding: "18px 20px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                    <div>
                                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
                                        {ret.itemSnapshot?.name || "Item"}
                                      </h4>
                                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                        Quantity: <strong>{ret.quantity} unit(s)</strong> • Reason: <strong>{ret.customerReason}</strong>
                                      </div>
                                      {ret.customerDescription && (
                                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                                          "{ret.customerDescription}"
                                        </div>
                                      )}
                                      {ret.rejectionReason && (
                                        <div style={{ fontSize: "0.82rem", color: "#dc2626", marginTop: "6px", fontWeight: "600" }}>
                                          Rejection note: {ret.rejectionReason}
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                      <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Refund Amount</span>
                                      <strong style={{ fontSize: "1.1rem", color: "var(--teal)" }}>
                                        ₹{(ret.calculatedRefundAmount || (ret.calculatedRefundAmountPaise ? ret.calculatedRefundAmountPaise / 100 : 0)).toLocaleString("en-IN")}
                                      </strong>
                                    </div>
                                  </div>

                                  {/* Pickup & Inspection Milestones */}
                                  {(ret.pickupDetails?.scheduledDate || ret.inspectionOutcome) && (
                                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0", display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "0.82rem", color: "#475569" }}>
                                      {ret.pickupDetails?.scheduledDate && (
                                        <div>
                                          Pickup Scheduled: <strong>{new Date(ret.pickupDetails.scheduledDate).toLocaleDateString("en-IN")}</strong> {ret.pickupDetails.carrierOrPartner ? `(${ret.pickupDetails.carrierOrPartner})` : ""}
                                        </div>
                                      )}
                                      {ret.inspectionOutcome && (
                                        <div>
                                          Inspection Result: <strong style={{ color: ret.inspectionOutcome === "PASSED" ? "#16a34a" : "#dc2626" }}>{ret.inspectionOutcome}</strong>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Customer Refunds Section */}
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                        Refunds History ({myRefunds.length})
                      </h3>

                      {myRefunds.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                          <CreditCard size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                          <h4 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>No refunds recorded</h4>
                          <p style={{ color: "#64748b", fontSize: "0.85rem", maxWidth: "360px", margin: "0 auto" }}>
                            Refunds from approved cancellations or completed returns will appear here with settlement references.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {myRefunds.map((ref) => {
                            const refStatus = {
                              REQUESTED: { bg: "#fef3c7", text: "#b45309", label: "Queued" },
                              APPROVED: { bg: "#e0e7ff", text: "#3730a3", label: "Approved" },
                              PROCESSING: { bg: "#fef3c7", text: "#b45309", label: "Disbursing" },
                              COMPLETED: { bg: "#dcfce7", text: "#15803d", label: "Completed" },
                              FAILED: { bg: "#fee2e2", text: "#991b1b", label: "Failed" },
                            };
                            const rs = refStatus[ref.status] || { bg: "#f1f5f9", text: "#475569", label: ref.status };

                            return (
                              <div
                                key={ref._id}
                                style={{
                                  backgroundColor: "white",
                                  borderRadius: "16px",
                                  border: "1px solid #e2e8f0",
                                  padding: "16px 20px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "12px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                    <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                                      Refund #{ref.refundNumber || ref._id.substring(0, 8)}
                                    </strong>
                                    <span style={{ backgroundColor: rs.bg, color: rs.text, padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" }}>
                                      {rs.label}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                                    Origin: {ref.originType === "ORDER_CANCELLATION" ? "Order Cancellation" : "Item Return"} • Method: {ref.paymentMethod || "Manual"}
                                  </div>
                                  {ref.transactionReference && (
                                    <div style={{ fontSize: "0.82rem", color: "#0f172a", marginTop: "4px", fontWeight: "600" }}>
                                      Bank UTR / Ref: {ref.transactionReference} {ref.processedAt ? `(${new Date(ref.processedAt).toLocaleDateString("en-IN")})` : ""}
                                    </div>
                                  )}
                                </div>

                                <div style={{ textAlign: "right" }}>
                                  <strong style={{ fontSize: "1.2rem", color: "var(--teal)" }}>
                                    ₹{((ref.amountPaise || 0) / 100).toLocaleString("en-IN")}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>My Wishlist</h1>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    {wishCtx?.wishlistCount || 0} saved items
                  </span>
                </div>

                {(!wishCtx || wishCtx.wishlist.length === 0) ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>
                    <Heart size={48} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "1.25rem", color: "#0f172a", marginBottom: "8px", fontWeight: "700" }}>Your wishlist is empty</h3>
                    <p style={{ color: "#64748b", maxWidth: "380px", margin: "0 auto 24px", fontSize: "0.9rem" }}>
                      Tap the heart icon on any product to save it here and purchase later.
                    </p>
                    <Link href="/products" className="primary-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      Explore Products <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                    {wishCtx.wishlist.map((item) => (
                      <div
                        key={item.productId || item.id}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ height: "180px", position: "relative", backgroundColor: "#f8fafc", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                          <button
                            onClick={() => wishCtx.removeFromWishlist(item.productId || item.id)}
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#ef4444",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            }}
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--teal)", fontWeight: "700", textTransform: "uppercase" }}>
                            {item.brand || "Brand"}
                          </span>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: "4px 0 10px", lineHeight: 1.3 }}>
                            {item.name}
                          </h4>

                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "auto", marginBottom: "14px" }}>
                            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>
                              ₹{(item.price || 0).toLocaleString("en-IN")}
                            </strong>
                            {item.mrp > item.price && (
                              <del style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                ₹{item.mrp.toLocaleString("en-IN")}
                              </del>
                            )}
                          </div>

                          <button
                            onClick={() => handleMoveWishlistToCart(item)}
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "var(--teal)",
                              color: "white",
                              border: "none",
                              borderRadius: "10px",
                              fontSize: "0.9rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <ShoppingBag size={16} /> Move to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Coming Soon Tabs */}
            {activeTab !== "profile" && activeTab !== "change-password" && activeTab !== "addresses" && activeTab !== "orders" && activeTab !== "returns" && activeTab !== "wishlist" && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Settings size={40} color="#94a3b8" />
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Coming Soon</h2>
                <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto" }}>
                  The {labelMap[activeTab] || "requested"} section is currently under development. Please check back later.
                </p>
              </div>
            )}

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

      {/* Customer Cancel Order Modal */}
      {cancelModalOpen && selectedOrderForCancel && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Cancel Order
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "16px" }}>
              Order #{selectedOrderForCancel.orderNumber || selectedOrderForCancel._id.slice(-8)} • Total: ₹{(selectedOrderForCancel.grandTotal || 0).toLocaleString("en-IN")}
            </p>

            {cancelError && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "14px" }}>
                {cancelError}
              </div>
            )}

            <form onSubmit={handleSubmitCancellation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {selectedOrderForCancel.sellerOrders && selectedOrderForCancel.sellerOrders.length > 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                    Cancellation Scope
                  </label>
                  <select
                    value={cancelSubOrderId}
                    onChange={(e) => setCancelSubOrderId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", boxSizing: "border-box" }}
                  >
                    <option value="">Cancel entire order (all sellers)</option>
                    {selectedOrderForCancel.sellerOrders.map((so) => (
                      <option key={so._id} value={so._id}>
                        Only Seller Sub-order #{so.subOrderNumber || so._id.slice(-6)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Reason for Cancellation <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please specify why you want to cancel this order..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>

              {selectedOrderForCancel.paymentMethod !== "COD" && (
                <div style={{ padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: "8px", color: "#1e40af", fontSize: "0.82rem" }}>
                  Note: Since this order was paid online, cancellation will immediately queue a refund to be disbursed to your original payment source.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setSelectedOrderForCancel(null);
                  }}
                  disabled={cancelSubmitting}
                  style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: cancelSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {cancelSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Return Request Modal */}
      {returnModalOpen && selectedOrderForReturn && selectedItemForReturn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "28px", maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Request Item Return
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "16px" }}>
              Order #{selectedOrderForReturn.orderNumber || selectedOrderForReturn._id.slice(-8)}
            </p>

            {returnError && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "14px" }}>
                {returnError}
              </div>
            )}
            {returnSuccess && (
              <div style={{ padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "14px" }}>
                {returnSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitReturn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Item Card */}
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "center" }}>
                <img
                  src={selectedItemForReturn.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                  alt={selectedItemForReturn.name}
                  style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                    {selectedItemForReturn.name}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                    Price: ₹{(selectedItemForReturn.price || 0).toLocaleString("en-IN")} • Purchased: {selectedItemForReturn.quantity} unit(s)
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Quantity to Return <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItemForReturn.quantity || 1}
                  required
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Reason for Return <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  <option value="DAMAGED_PRODUCT">Damaged / broken on arrival</option>
                  <option value="DEFECTIVE_OR_NOT_WORKING">Defective or not functioning</option>
                  <option value="WRONG_ITEM_SENT">Incorrect item sent</option>
                  <option value="SIZE_FIT_ISSUE">Size / fit mismatch</option>
                  <option value="NOT_AS_DESCRIBED">Item not as pictured / described</option>
                  <option value="QUALITY_NOT_SATISFACTORY">Quality unsatisfactory</option>
                  <option value="OTHER">Other reasons</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Describe the issue or defect..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>

              {selectedOrderForReturn.paymentMethod === "COD" && (
                <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <h5 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                    Bank Account for Cash on Delivery (COD) Refund
                  </h5>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 12px 0" }}>
                    Provide bank details where the refund will be directly remitted upon item inspection.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={codAccountNo}
                      onChange={(e) => setCodAccountNo(e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={codIfsc}
                      onChange={(e) => setCodIfsc(e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    />
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={codHolderName}
                      onChange={(e) => setCodHolderName(e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    />
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={codBankName}
                      onChange={(e) => setCodBankName(e.target.value)}
                      style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setReturnModalOpen(false);
                    setSelectedOrderForReturn(null);
                    setSelectedItemForReturn(null);
                  }}
                  disabled={returnSubmitting}
                  style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  style={{
                    padding: "8px 18px",
                    backgroundColor: "var(--teal)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: returnSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {returnSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const labelMap = {
  orders: "Orders",
  wishlist: "Wishlist",
  addresses: "Addresses",
  payment: "Payment Methods",
  notifications: "Notifications",
  settings: "Settings"
};
