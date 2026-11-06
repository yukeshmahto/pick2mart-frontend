"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export function CategorySection({ categories = [], isLoading = false }) {
  const swiperRef = useRef(null);

  const validCategories = (categories || []).filter(
    (c) => c && c.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
  );

  if (!isLoading && validCategories.length === 0) {
    return null;
  }

  return (
    <section className="section category-section container" id="categories">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Explore the marketplace</span>
          <h2>Shop by Category</h2>
        </div>
        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="category-swiper-wrapper" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <Swiper
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation]}
          slidesPerView={3}
          spaceBetween={12}
          breakpoints={{
            480: {
              slidesPerView: 4,
              spaceBetween: 14,
            },
            640: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 18,
            },
            1024: {
              slidesPerView: 8,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 9,
              spaceBetween: 22,
            },
          }}
          className="category-swiper"
        >
          {validCategories.map((category, idx) => {
            const colorClass = idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "emerald" : "orange";
            const href = `/category/${category.slug || category._id || ""}`;

            return (
              <SwiperSlide key={category._id || category.slug || category.name}>
                <Link
                  href={href}
                  className={`category-card ${colorClass}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <div
                    className="category-image"
                    style={{
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: category.image ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.03)",
                        color: "var(--muted)",
                      }}
                    >
                      <ShoppingBag size={24} />
                    </div>
                  </div>
                  <div className="category-info" style={{ textAlign: "center", width: "100%" }}>
                    <strong
                      style={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {category.name}
                    </strong>
                    {category.itemCount ? (
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {category.itemCount} items
                      </span>
                    ) : null}
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
