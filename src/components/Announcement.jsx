"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { settingsService } from "../services/settings.service";

export function Announcement() {
  const [data, setData] = useState({
    enabled: true,
    badge: "FESTIVAL LIVE",
    text: "Mega Savings Festival: Flat ₹150 OFF on UPI Orders | Use Code: PICKFIRST | Free Delivery on Orders Above ₹999",
    linkText: "Claim Bank Offers",
    linkUrl: "/products",
  });

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSettings()
      .then((res) => {
        if (isMounted && res?.data?.announcement) {
          setData(res.data.announcement);
        }
      })
      .catch((err) => {
        // Fallback gracefully
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (data?.enabled === false) {
    return null;
  }

  return (
    <div className="announcement">
      <span>
        <Zap size={14} fill="currentColor" /> {data.badge || "ANNOUNCEMENT"}
      </span>
      <span className="announcement-detail">
        {data.text}
      </span>
      {data.linkText && (
        <Link
          href={data.linkUrl || "/products"}
          className="announcement-link"
          style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          {data.linkText} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
