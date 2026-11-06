'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ui/Skeleton';
import { dealService } from '../services/deal.service';
import 'swiper/css';
import 'swiper/css/navigation';

export function FlashDeals({ wishlist = [], toggleWishlist, addToCart }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOffset, setServerOffset] = useState(0);
  const [nowTime, setNowTime] = useState(Date.now());
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await dealService.getActiveFlashDeals();
        if (isMounted && res?.success) {
          if (res.serverTime) {
            const serverMs = new Date(res.serverTime).getTime();
            setServerOffset(serverMs - Date.now());
          }
          setDeals(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load flash deals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDeals();
    return () => {
      isMounted = false;
    };
  }, []);

  // Server-synchronized ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now() + serverOffset);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverOffset]);

  // Active unexpired deals
  const activeDeals = useMemo(() => {
    return deals.filter((deal) => {
      const endMs = new Date(deal.endDate).getTime();
      const startMs = new Date(deal.startDate).getTime();
      return endMs > nowTime && startMs <= nowTime;
    });
  }, [deals, nowTime]);

  // Find the earliest expiration time among active deals
  const earliestExpiry = useMemo(() => {
    if (activeDeals.length === 0) return null;
    const minMs = Math.min(...activeDeals.map((d) => new Date(d.endDate).getTime()));
    return minMs;
  }, [activeDeals]);

  // Compute remaining hours, minutes, seconds
  const remaining = useMemo(() => {
    if (!earliestExpiry) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = Math.max(0, earliestExpiry - nowTime);
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, expired: false };
  }, [earliestExpiry, nowTime]);

  const padZero = (n) => String(n).padStart(2, '0');

  // If loading, show skeleton
  if (loading) {
    return (
      <section className="flash-section" id="flash-deals">
        <div className="container-fluid">
          <div className="flash-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={24} color="#ea580c" />
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Loading Flash Deals...</h2>
              </div>
            </div>
            <ProductGridSkeleton count={4} />
          </div>
        </div>
      </section>
    );
  }

  // If no deals active, hide section gracefully (do not invent fake countdown)
  if (activeDeals.length === 0) {
    return null;
  }

  return (
    <section className="flash-section" id="flash-deals">
      <div className="container-fluid">
        <div className="flash-wrapper">
          <div className="flash-heading">
            <div className="flash-title-group">
              <h2>
                <span className="flash-icon">
                  <Flame size={20} fill="#ea580c" stroke="none" />
                </span>{' '}
                Flash Deals{' '}
                <small className="limited-badge">LIMITED INVENTORY</small>
              </h2>
              <p className="flash-subtitle">
                Server-verified festive price crashes. Restocked automatically.
              </p>
            </div>
            <div className="flash-tools">
              {!remaining.expired && (
                <div className="countdown-wrapper">
                  <small style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> ENDS IN:
                  </small>
                  <div className="countdown">
                    <b>{padZero(remaining.hours)}</b>
                    <i>:</i>
                    <b>{padZero(remaining.minutes)}</b>
                    <i>:</i>
                    <b className="countdown-hot">{padZero(remaining.seconds)}</b>
                  </div>
                </div>
              )}
              <Link href="/products?deals=true" className="view-deals" style={{ textDecoration: 'none' }}>
                View All Deals <ArrowRight size={16} />
              </Link>

              {activeDeals.length > 4 && (
                <div className="carousel-controls flash-carousel-controls">
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slidePrev()}
                    disabled={isBeginning}
                    className={`swiper-nav-btn ${isBeginning ? 'is-disabled' : ''}`}
                    aria-label="Previous flash deals"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slideNext()}
                    disabled={isEnd}
                    className={`swiper-nav-btn ${isEnd ? 'is-disabled' : ''}`}
                    aria-label="Next flash deals"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="product-swiper-wrapper flash-swiper-wrapper">
            {activeDeals.length > 4 && (
              <>
                <button
                  type="button"
                  className={`floating-nav-arrow floating-prev ${isBeginning ? 'is-hidden' : ''}`}
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Previous flash deals"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className={`floating-nav-arrow floating-next ${isEnd ? 'is-hidden' : ''}`}
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Next flash deals"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <Swiper
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              modules={[Navigation]}
              slidesPerView={1.2}
              spaceBetween={12}
              grabCursor={true}
              watchSlidesProgress={true}
              breakpoints={{
                480: {
                  slidesPerView: 2,
                  spaceBetween: 12,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 14,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 16,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 18,
                },
              }}
              className="product-cards-swiper"
            >
              {activeDeals.map((deal) => {
                const product = deal.productId;
                if (!product) return null;

                // Format deal product card with deal-specific price
                const formattedProduct = {
                  ...product,
                  id: product._id,
                  _id: product._id,
                  price: deal.dealPrice,
                  compareAtPrice: deal.originalPrice,
                  mrp: deal.originalPrice,
                  tag: `${deal.discountPercentage}% OFF`,
                  note: deal.maxQuantity
                    ? `Only ${deal.maxQuantity - (deal.soldQuantity || 0)} left at this price`
                    : 'Flash Deal',
                  stockAvailable: deal.maxQuantity
                    ? deal.maxQuantity - (deal.soldQuantity || 0)
                    : 10,
                };

                return (
                  <SwiperSlide key={deal._id} className="product-swiper-slide">
                    <ProductCard
                      product={formattedProduct}
                      wished={wishlist.includes(product._id || product.id)}
                      onWishlist={toggleWishlist}
                      onAdd={addToCart}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

