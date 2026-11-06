"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  X,
  Crosshair,
  Search,
  Check,
  Building,
  Home,
  Briefcase,
  Loader2,
  Navigation,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useLocation, POPULAR_LOCATIONS } from "../context/LocationContext";
import { addressService } from "../services/address.service";

export function LocationModal() {
  const {
    currentLocation,
    setLocation,
    isLocationModalOpen,
    closeLocationModal,
    detectCurrentLocation,
    lookupPincode,
    isDetecting,
    detectError,
  } = useLocation();

  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("quick"); // 'quick' | 'map' | 'addresses'

  // Sync selected location when modal opens
  useEffect(() => {
    if (isLocationModalOpen) {
      setSelectedLocation(currentLocation);
      setPincodeInput(currentLocation?.pincode || "");
      setPincodeError("");

      // Fetch saved addresses if logged in
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token) {
        setLoadingAddresses(true);
        addressService
          .getAll()
          .then((res) => {
            if (res?.success && Array.isArray(res.data)) {
              setSavedAddresses(res.data);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingAddresses(false));
      }
    }
  }, [isLocationModalOpen, currentLocation]);

  if (!isLocationModalOpen) return null;

  // Handle manual pincode submit
  const handlePincodeSubmit = async (e) => {
    e?.preventDefault();
    setPincodeError("");
    const cleaned = pincodeInput.trim().replace(/\D/g, "");
    if (cleaned.length !== 6) {
      setPincodeError("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setIsVerifyingPin(true);
    try {
      const result = await lookupPincode(cleaned);
      if (result) {
        setSelectedLocation(result);
        setLocation(result);
        closeLocationModal();
      } else {
        setPincodeError("Could not verify PIN code. Please check and try again.");
      }
    } catch (err) {
      setPincodeError("Verification failed. Please check network connection.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Handle GPS detect
  const handleDetectGPS = async () => {
    setPincodeError("");
    const loc = await detectCurrentLocation();
    if (loc) {
      setSelectedLocation(loc);
      closeLocationModal();
    }
  };

  // Handle popular city select
  const handleSelectPopular = (item) => {
    const loc = {
      pincode: item.pincode,
      city: item.city,
      state: item.state,
      area: item.area,
      lat: item.lat,
      lng: item.lng,
      formattedAddress: `${item.area}, ${item.city}, ${item.state} - ${item.pincode}`,
      source: "popular_city",
    };
    setSelectedLocation(loc);
    setLocation(loc);
    closeLocationModal();
  };

  // Handle saved address select
  const handleSelectSavedAddress = (addr) => {
    const loc = {
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      area: addr.landmark || addr.addressLine1,
      formattedAddress: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`,
      addressId: addr._id,
      source: "saved_address",
    };
    setSelectedLocation(loc);
    setLocation(loc);
    closeLocationModal();
  };

  // Map search query (places)
  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}&countrycodes=in&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const loc = {
          pincode: item.display_name.match(/\b\d{6}\b/)?.[0] || selectedLocation.pincode || "560001",
          city: item.display_name.split(",")[0] || selectedLocation.city,
          area: item.display_name.split(",").slice(0, 2).join(", "),
          state: "India",
          formattedAddress: item.display_name.split(",").slice(0, 3).join(", "),
          lat,
          lng,
          source: "map_search",
        };
        setSelectedLocation(loc);
      }
    } catch (err) {
      console.warn("Map search query failed:", err);
    }
  };

  const mapLat = selectedLocation?.lat || 12.9716;
  const mapLng = selectedLocation?.lng || 77.5946;
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLocationModal();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#fff7ed",
                color: "#ff5b1f",
                display: "grid",
                placeItems: "center",
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                Choose Delivery Location
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Select delivery location to see product availability and real-time delivery speed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLocationModal}
            aria-label="Close"
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#475569",
              transition: "all 0.15s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Location Pill */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "10px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155" }}>
            <span style={{ color: "#64748b" }}>Currently delivering to:</span>
            <strong style={{ color: "#0f172a" }}>
              {currentLocation.city} - {currentLocation.pincode}
            </strong>
          </div>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.72rem",
              fontWeight: 700,
              backgroundColor: "#dcfce7",
              color: "#15803d",
            }}
          >
            Active
          </span>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              background: "none",
              fontSize: "0.85rem",
              fontWeight: activeTab === "quick" ? 700 : 500,
              color: activeTab === "quick" ? "#ff5b1f" : "#64748b",
              borderBottom: activeTab === "quick" ? "2px solid #ff5b1f" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            Enter Pincode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("map")}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              background: "none",
              fontSize: "0.85rem",
              fontWeight: activeTab === "map" ? 700 : 500,
              color: activeTab === "map" ? "#ff5b1f" : "#64748b",
              borderBottom: activeTab === "map" ? "2px solid #ff5b1f" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Navigation size={14} /> Map & GPS
          </button>
          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "none",
                background: "none",
                fontSize: "0.85rem",
                fontWeight: activeTab === "addresses" ? 700 : 500,
                color: activeTab === "addresses" ? "#ff5b1f" : "#64748b",
                borderBottom: activeTab === "addresses" ? "2px solid #ff5b1f" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              Saved ({savedAddresses.length})
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* TAB 1: QUICK PINCODE & GPS */}
          {activeTab === "quick" && (
            <>
              {/* GPS Button */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetecting}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 18px",
                  backgroundColor: "#fff7ed",
                  border: "1px dashed #ff8957",
                  borderRadius: "10px",
                  color: "#ea580c",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: isDetecting ? "wait" : "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {isDetecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Detecting your GPS location...
                  </>
                ) : (
                  <>
                    <Crosshair size={18} /> Use my current location (GPS)
                  </>
                )}
              </button>

              {detectError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    backgroundColor: "#fee2e2",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "0.8rem",
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{detectError}</span>
                </div>
              )}

              {/* Or separator */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></span>
                <span>Or enter PIN code</span>
                <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></span>
              </div>

              {/* Pincode Input Form */}
              <form onSubmit={handlePincodeSubmit} style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => {
                      setPincodeInput(e.target.value.replace(/\D/g, ""));
                      setPincodeError("");
                    }}
                    placeholder="Enter 6-digit PIN code (e.g. 560001)"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: pincodeError ? "1px solid #ef4444" : "1px solid #cbd5e1",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      outline: "none",
                      color: "#0f172a",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingPin || !pincodeInput.trim()}
                  style={{
                    padding: "11px 22px",
                    backgroundColor: "#ff5b1f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: isVerifyingPin ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isVerifyingPin ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                </button>
              </form>

              {pincodeError && (
                <span style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "-10px", display: "block" }}>
                  {pincodeError}
                </span>
              )}

              {/* Popular Cities */}
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>
                  Popular Cities
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation?.pincode === loc.pincode;
                    return (
                      <button
                        key={loc.pincode}
                        type="button"
                        onClick={() => handleSelectPopular(loc)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: isSelected ? "1.5px solid #ff5b1f" : "1px solid #e2e8f0",
                          backgroundColor: isSelected ? "#fff7ed" : "#f8fafc",
                          color: isSelected ? "#ea580c" : "#334155",
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: "0.8rem",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{loc.city}</span>
                        <small style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{loc.pincode}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: GOOGLE MAPS & GPS */}
          {activeTab === "map" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <form onSubmit={handleMapSearch} style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Search locality, street or landmark..."
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Locate
                </button>
              </form>

              {/* Map View */}
              <div
                style={{
                  height: "220px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #cbd5e1",
                  position: "relative",
                  backgroundColor: "#f1f5f9",
                }}
              >
                {googleApiKey ? (
                  <iframe
                    title="Google Map Delivery Picker"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${mapLat},${mapLng}&zoom=15`}
                  ></iframe>
                ) : (
                  <iframe
                    title="Interactive Map Preview"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                )}

                {/* Center marker overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -100%)",
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <MapPin size={32} color="#ff5b1f" fill="#ff5b1f" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                </div>

                {/* Floating GPS button */}
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  title="Detect GPS"
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#0f172a",
                  }}
                >
                  <Crosshair size={14} color="#ff5b1f" /> Current Location
                </button>
              </div>

              {/* Selected coordinates preview */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.82rem",
                  color: "#334155",
                }}
              >
                <strong>Delivery Area:</strong> {selectedLocation.formattedAddress || `${selectedLocation.city} - ${selectedLocation.pincode}`}
              </div>

              <button
                type="button"
                onClick={() => {
                  setLocation(selectedLocation);
                  closeLocationModal();
                }}
                style={{
                  padding: "12px",
                  backgroundColor: "#ff5b1f",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Confirm This Location
              </button>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {savedAddresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: selectedLocation?.pincode === addr.pincode ? "2px solid #ff5b1f" : "1px solid #e2e8f0",
                    backgroundColor: selectedLocation?.pincode === addr.pincode ? "#fff7ed" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ marginTop: "2px", color: "#ff5b1f" }}>
                      {addr.addressType === "work" ? <Briefcase size={18} /> : <Home size={18} />}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>{addr.fullName}</strong>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            textTransform: "uppercase",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: "#e2e8f0",
                            color: "#475569",
                            fontWeight: 700,
                          }}
                        >
                          {addr.addressType || "home"}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                        {addr.addressLine1}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                    </div>
                  </div>
                  {selectedLocation?.pincode === addr.pincode && (
                    <span style={{ color: "#ea580c" }}>
                      <Check size={18} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
