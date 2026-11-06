"use client";

import React, { useState, useEffect } from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones, Sparkles, Clock } from "lucide-react";
import { settingsService } from "../services/settings.service";

const ICON_MAP = {
  Truck: Truck,
  ShieldCheck: ShieldCheck,
  RotateCcw: RotateCcw,
  Headphones: Headphones,
  Sparkles: Sparkles,
  Clock: Clock,
};

export function TrustStrip() {
  const [guarantees, setGuarantees] = useState([
    { icon: "Truck", title: "Free delivery", subtitle: "On orders above ₹999" },
    { icon: "ShieldCheck", title: "Genuine products", subtitle: "Only from trusted sellers" },
    { icon: "RotateCcw", title: "Easy returns", subtitle: "7 day return policy" },
    { icon: "Headphones", title: "Always here to help", subtitle: "Support when you need it" },
  ]);

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSettings()
      .then((res) => {
        if (isMounted && res?.data?.trustGuarantees && Array.isArray(res.data.trustGuarantees) && res.data.trustGuarantees.length > 0) {
          setGuarantees(res.data.trustGuarantees);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section className="trust-strip">
        <div className="container trust-items">
          {guarantees.map((item, idx) => {
            const IconComponent = ICON_MAP[item.icon] || ShieldCheck;
            return (
              <div key={idx}>
                <IconComponent size={21} />
                <span>
                  <b>{item.title}</b>
                  <small>{item.subtitle}</small>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefit Strip */}
      <section className="benefit-strip container">
        {guarantees.map((item, idx) => {
          const IconComponent = ICON_MAP[item.icon] || ShieldCheck;
          return (
            <div key={`benefit-${idx}`}>
              <IconComponent size={20} />
              <span>
                <b>{item.title}</b>
                <small>{item.subtitle}</small>
              </span>
            </div>
          );
        })}
      </section>
    </>
  );
}
