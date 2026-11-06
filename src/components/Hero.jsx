'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  ShoppingBag,
  Flame,
  CheckCircle2,
  Truck,
  Compass,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { bannerService } from '../services/banner.service';
import { BannerSkeleton } from './ui/Skeleton';
import 'swiper/css';
import 'swiper/css/pagination';

export function Hero() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [sideBanners, setSideBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const [heroRes, sideRes] = await Promise.allSettled([
          bannerService.getActive('hero'),
          bannerService.getActive('side'),
        ]);

        if (isMounted) {
          if (heroRes.status === 'fulfilled' && heroRes.value?.success) {
            setHeroBanners(heroRes.value.data || []);
          }
          if (sideRes.status === 'fulfilled' && sideRes.value?.success) {
            setSideBanners(sideRes.value.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <BannerSkeleton />;
  }

  // Exact fallback side cards matching original design
  const defaultSideCards = [
    {
      _id: 'default-side-1',
      title: 'Super Electronics Bonanza',
      subtitle: 'AUDIO & WEARABLES',
      description: 'Smartwatches & True Wireless Earbuds from ₹999',
      ctaText: 'Claim Gadgets',
      link: '/products?category=electronics',
      imageUrl:
        'https://images.unsplash.com/photo-1680113729613-7635a0b8be09?auto=format&fit=crop&w=300&q=80',
    },
    {
      _id: 'default-side-2',
      title: 'Indian Fashion Fest',
      subtitle: 'FESTIVE EDIT 2024',
      description: 'Kurtas, Sarees & Western Casuals at Min 60% OFF',
      ctaText: 'Explore Collection',
      link: '/products?category=fashion',
      imageUrl:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const cardsToRender =
    sideBanners.length >= 2
      ? sideBanners.slice(0, 2)
      : sideBanners.length === 1
      ? [sideBanners[0], defaultSideCards[1]]
      : defaultSideCards;

  function renderDescription(desc, idx) {
    if (!desc) {
      return idx === 0 ? (
        <>
          Smartwatches & True Wireless Earbuds from <b>₹999</b>
        </>
      ) : (
        <>
          Kurtas, Sarees & Western Casuals at <b>Min 60% OFF</b>
        </>
      );
    }
    if (desc.includes('₹999')) {
      const parts = desc.split('₹999');
      return (
        <>
          {parts[0]}
          <b>₹999</b>
          {parts[1]}
        </>
      );
    }
    if (desc.includes('Min 60% OFF')) {
      const parts = desc.split('Min 60% OFF');
      return (
        <>
          {parts[0]}
          <b>Min 60% OFF</b>
          {parts[1]}
        </>
      );
    }
    return desc;
  }

  return (
    <section className="hero container">
      <div className="hero-left">
        <Swiper
          className="hero-swiper"
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
        >
          {/* Slide 1: Flagship Curated Blockbuster Offer (Exact Image 1) */}
          <SwiperSlide key="curated-slide-1">
            <div className="hero-slide-content mesh-bg-1">
              <div className="promo-top-bar">
                <div className="promo-badges">
                  <b className="badge-orange">
                    <Zap size={12} fill="currentColor" /> BLOCKBUSTER OFFER
                  </b>
                  <span className="badge-white">HDFC Bank 10% Instant Discount</span>
                </div>
                <span className="promo-meta">CURATED • OCT 2024</span>
              </div>

              <div className="promo-copy">
                <h1>
                  Big Savings Across
                  <br />
                  <span className="gradient-text">Every Category.</span>
                </h1>
                <p>
                  Unpack curated festive hauls with up to 70% OFF on premium
                  electronics, festive ethnic wear, and daily kitchen essentials.
                </p>
                <div className="hero-actions">
                  <Link href="/products" className="primary-button-orange">
                    Shop Now <ShoppingBag size={14} />
                  </Link>
                  <Link href="/products?deals=true" className="light-button-white">
                    Explore Deals <Compass size={14} />
                  </Link>
                </div>
              </div>

              <div className="promo-bottom-bar">
                <div className="promo-quality" style={{ display: 'flex', gap: '24px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={13} className="text-teal-400" /> Assured Quality
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Truck size={13} className="text-teal-400" /> Express Next-Day Hub
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2: Curated Wardrobe Steals Slide */}
          <SwiperSlide key="curated-slide-2">
            <div className="hero-slide-content mesh-bg-2">
              <div className="promo-top-bar">
                <div className="promo-badges">
                  <b className="badge-orange">
                    <Zap size={12} fill="currentColor" /> BLOCKBUSTER OFFER
                  </b>
                  <span className="badge-white">ICICI Bank 10% Instant Discount</span>
                </div>
                <span className="promo-meta">FESTIVE • OCT 2024</span>
              </div>
              <div className="promo-copy">
                <h1>
                  Exclusive Festive
                  <br />
                  <span className="gradient-text">Wardrobe Steals.</span>
                </h1>
                <p>
                  Get ready for the celebrations with our premium ethnic wear
                  collection. Up to 80% OFF on top fashion brands.
                </p>
                <div className="hero-actions">
                  <Link href="/products?category=fashion" className="primary-button-orange">
                    Shop Fashion <ShoppingBag size={14} />
                  </Link>
                  <Link href="/products?deals=true" className="light-button-white">
                    Explore Deals <Flame size={14} />
                  </Link>
                </div>
              </div>
              <div className="promo-bottom-bar">
                <div className="promo-quality" style={{ display: 'flex', gap: '24px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={13} className="text-teal-400" /> Verified Brands
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Truck size={13} className="text-teal-400" /> Easy Returns
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Additional uploaded hero slides if present */}
          {heroBanners
            .filter((b) => b.imageUrl && b.imageUrl !== '')
            .map((banner) => (
              <SwiperSlide key={banner._id}>
                <Link
                  href={banner.link || '/products'}
                  className="hero-slide-content"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'block',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {(banner.title || banner.subtitle) && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '24px 32px',
                        background:
                          'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)',
                        color: '#ffffff',
                      }}
                    >
                      {banner.subtitle && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#f97316',
                            fontWeight: 700,
                          }}
                        >
                          {banner.subtitle}
                        </span>
                      )}
                      <h2
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 800,
                          margin: '4px 0 8px',
                          color: '#ffffff',
                        }}
                      >
                        {banner.title}
                      </h2>
                      {banner.description && (
                        <p
                          style={{
                            fontSize: '0.95rem',
                            opacity: 0.9,
                            margin: '0 0 16px',
                            maxWidth: '520px',
                          }}
                        >
                          {banner.description}
                        </p>
                      )}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#f97316',
                          color: '#ffffff',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        {banner.ctaText || 'Shop Now'} <ShoppingBag size={14} />
                      </span>
                    </div>
                  )}
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* Hero Side Cards: Exact markup & styling from Image 1 */}
      <div className="hero-side">
        {cardsToRender.map((card, idx) => {
          const isFirst = idx % 2 === 0;
          return (
            <article
              key={card._id || idx}
              className={`side-card ${isFirst ? 'light-blue-bg' : 'peach-bg'}`}
            >
              <div className="side-card-content">
                <span className={`side-label ${isFirst ? 'blue-label' : 'peach-label'}`}>
                  {card.subtitle || (isFirst ? 'AUDIO & WEARABLES' : 'FESTIVE EDIT 2024')}
                </span>
                <h3>{card.title}</h3>
                <p>{renderDescription(card.description, idx)}</p>
                <Link
                  href={card.link || (isFirst ? '/products?category=electronics' : '/products?category=fashion')}
                  className="claim-link"
                >
                  {card.ctaText || (isFirst ? 'Claim Gadgets' : 'Explore Collection')}{' '}
                  <ArrowRight size={14} />
                </Link>
              </div>

              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className={isFirst ? 'side-img-box' : 'side-img-tall'}
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
