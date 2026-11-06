"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext(null);

const STORAGE_KEY = "pick2mart_delivery_location";

const DEFAULT_LOCATION = {
  pincode: "560001",
  city: "Bengaluru",
  area: "Central Bangalore",
  state: "Karnataka",
  country: "India",
  formattedAddress: "Bengaluru, Karnataka - 560001",
  lat: 12.9716,
  lng: 77.5946,
  source: "default",
};

// Popular Indian City / Metro presets
export const POPULAR_LOCATIONS = [
  { city: "Bengaluru", pincode: "560001", state: "Karnataka", area: "MG Road / Central", lat: 12.9716, lng: 77.5946 },
  { city: "Mumbai", pincode: "400001", state: "Maharashtra", area: "Fort / Nariman Point", lat: 18.9388, lng: 72.8354 },
  { city: "Delhi NCR", pincode: "110001", state: "Delhi", area: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { city: "Kolkata", pincode: "700001", state: "West Bengal", area: "BBD Bagh / Central", lat: 22.5726, lng: 88.3639 },
  { city: "Chennai", pincode: "600001", state: "Tamil Nadu", area: "George Town", lat: 13.0827, lng: 80.2707 },
  { city: "Hyderabad", pincode: "500001", state: "Telangana", area: "Abids / Koti", lat: 17.3850, lng: 78.4867 },
  { city: "Pune", pincode: "411001", state: "Maharashtra", area: "Camp / Station", lat: 18.5204, lng: 73.8567 },
  { city: "Lucknow", pincode: "226012", state: "Uttar Pradesh", area: "Ashiyana / Kanpur Rd", lat: 26.7810, lng: 80.9117 },
];

export function LocationProvider({ children }) {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.pincode) {
            setCurrentLocation(parsed);
          }
        }
      } catch (err) {
        console.warn("Failed to load stored delivery location:", err);
      }
    }
  }, []);

  // Update location and persist
  const setLocation = useCallback((newLocation) => {
    const merged = { ...currentLocation, ...newLocation };
    setCurrentLocation(merged);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.warn("Failed to save delivery location to storage:", err);
      }
    }
  }, [currentLocation]);

  // Google Maps / Nominatim reverse geocoding from lat/lng
  const reverseGeocode = async (lat, lng) => {
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Try Google Maps Geocoding API if key configured
    if (googleApiKey) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
        );
        const data = await res.json();
        if (data.status === "OK" && data.results && data.results.length > 0) {
          const best = data.results[0];
          let postalCode = "";
          let city = "";
          let state = "";
          let area = "";

          for (const comp of best.address_components) {
            if (comp.types.includes("postal_code")) postalCode = comp.long_name;
            if (comp.types.includes("locality")) city = comp.long_name;
            if (!city && comp.types.includes("administrative_area_level_2")) city = comp.long_name;
            if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
            if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
              area = comp.long_name;
            }
          }

          return {
            pincode: postalCode || "560001",
            city: city || "Bengaluru",
            area: area || city || "Current Location",
            state: state || "Karnataka",
            formattedAddress: best.formatted_address || `${city || 'Location'}, ${state}`,
            lat,
            lng,
            source: "google_maps",
          };
        }
      } catch (err) {
        console.warn("Google Maps geocoding failed, falling back to OSM Nominatim:", err);
      }
    }

    // 2. OpenStreetMap Nominatim reverse geocoding fallback (Free & reliable)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const pincode = addr.postcode ? addr.postcode.replace(/\s+/g, "").slice(0, 6) : "560001";
        const city = addr.city || addr.town || addr.municipality || addr.state_district || "Bengaluru";
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || city;
        const state = addr.state || "Karnataka";
        const formatted = data.display_name ? data.display_name.split(",").slice(0, 3).join(", ") : `${city}, ${state} - ${pincode}`;

        return {
          pincode,
          city,
          area,
          state,
          formattedAddress: formatted,
          lat,
          lng,
          source: "gps",
        };
      }
    } catch (err) {
      console.warn("OSM reverse geocoding failed:", err);
    }

    // 3. Coordinate fallback
    return {
      pincode: "560001",
      city: "Current Location",
      area: "Detected via GPS",
      state: "India",
      formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      lat,
      lng,
      source: "gps_coords",
    };
  };

  // Lookup pincode details
  const lookupPincode = async (pincode) => {
    const cleanPin = String(pincode).trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) return null;

    // Check popular locations first
    const preset = POPULAR_LOCATIONS.find((p) => p.pincode === cleanPin);
    if (preset) {
      return {
        pincode: preset.pincode,
        city: preset.city,
        state: preset.state,
        area: preset.area,
        lat: preset.lat,
        lng: preset.lng,
        formattedAddress: `${preset.area}, ${preset.city}, ${preset.state} - ${preset.pincode}`,
      };
    }

    // Postal Pincode API lookup
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          pincode: cleanPin,
          city: po.District || po.Division || po.Block || "City",
          state: po.State || "India",
          area: po.Name || "Area",
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          formattedAddress: `${po.Name}, ${po.District}, ${po.State} - ${cleanPin}`,
        };
      }
    } catch (err) {
      console.warn("Pincode API lookup failed:", err);
    }

    return {
      pincode: cleanPin,
      city: "Delivery Hub",
      state: "India",
      area: "Standard Delivery Zone",
      lat: DEFAULT_LOCATION.lat,
      lng: DEFAULT_LOCATION.lng,
      formattedAddress: `Pincode ${cleanPin}, India`,
    };
  };

  // HTML5 Browser Geolocation Auto-detect
  const detectCurrentLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return null;
    }

    setIsDetecting(true);
    setDetectError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const resolved = await reverseGeocode(latitude, longitude);
            setLocation(resolved);
            setIsDetecting(false);
            resolve(resolved);
          } catch (err) {
            setDetectError("Could not resolve address from coordinates.");
            setIsDetecting(false);
            resolve(null);
          }
        },
        (error) => {
          let msg = "Could not fetch GPS location. Please check browser permissions.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please allow location access or type your pincode.";
          } else if (error.code === error.TIMEOUT) {
            msg = "Location request timed out. Please enter pincode manually.";
          }
          setDetectError(msg);
          setIsDetecting(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [setLocation]);

  const value = {
    currentLocation,
    setLocation,
    isLocationModalOpen,
    openLocationModal: () => setIsLocationModalOpen(true),
    closeLocationModal: () => {
      setIsLocationModalOpen(false);
      setDetectError("");
    },
    detectCurrentLocation,
    lookupPincode,
    isDetecting,
    detectError,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
