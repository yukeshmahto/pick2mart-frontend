'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ProductCard } from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';

export function TrendingSection({
  products = [],
  categories = [],
  wishlist = [],
  toggleWishlist,
  addToCart,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef(null);

  // Active category pills
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.slice(0, 7).map((c) => ({
        name: c.name,
        slug: c.slug || c.name.toLowerCase(),
      }));
    }
    const unique = new Set();
    products.forEach((p) => {
      const c = p.category || p.categoryId?.name;
      if (c && typeof c === 'string') unique.add(c);
    });
    return Array.from(unique).map((name) => ({ name, slug: name.toLowerCase() }));
  }, [categories, products]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return products;
    return products.filter((p) => {
      const cat = p.category || p.categoryId?.name || p.categoryId;
      const slug = p.categoryId?.slug;
      return (
        (cat && cat.toLowerCase() === selectedCategory.toLowerCase()) ||
        (slug && slug.toLowerCase() === selectedCategory.toLowerCase())
      );
    });
  }, [products, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0, 300);
    }
  };

  useEffect(() => {
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.update();
      setIsBeginning(swiperRef.current.isBeginning);
      setIsEnd(swiperRef.current.isEnd);
    }
  }, [filteredProducts]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section trending-section container" id="trending-products">
      <div className="section-heading">
        <div>
          <span className="section-kicker">
            <TrendingUp size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Customer favourites
          </span>
          <h2>Trending Right Now</h2>
        </div>
        <div className="trending-header-actions">
          <div className="filter-pills">
            <button
              type="button"
              className={selectedCategory === 'ALL' ? 'active' : ''}
              onClick={() => handleCategorySelect('ALL')}
            >
              All Products
            </button>
            {availableCategories.map((cat) => (
              <button
                type="button"
                key={cat.slug || cat.name}
                className={selectedCategory === (cat.name || cat.slug) ? 'active' : ''}
                onClick={() => handleCategorySelect(cat.name || cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="carousel-controls trending-carousel-controls">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              className={`swiper-nav-btn ${isBeginning ? 'is-disabled' : ''}`}
              aria-label="Previous trending products"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              className={`swiper-nav-btn ${isEnd ? 'is-disabled' : ''}`}
              aria-label="Next trending products"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="product-swiper-wrapper">
        <button
          type="button"
          className={`floating-nav-arrow floating-prev ${isBeginning ? 'is-hidden' : ''}`}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous products"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          className={`floating-nav-arrow floating-next ${isEnd || filteredProducts.length <= 4 ? 'is-hidden' : ''}`}
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next products"
        >
          <ChevronRight size={22} />
        </button>

        {filteredProducts.length === 0 ? (
          <div
            className="empty-category-notice"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
              No trending products found in this category right now.
            </p>
            <button
              type="button"
              className="outline-button"
              onClick={() => handleCategorySelect('ALL')}
              style={{ cursor: 'pointer', fontSize: '13px', padding: '8px 16px' }}
            >
              View All Trending Products
            </button>
          </div>
        ) : (
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
            {filteredProducts.map((product) => (
              <SwiperSlide key={product.id || product._id} className="product-swiper-slide">
                <ProductCard
                  product={product}
                  wished={wishlist.includes(product.id || product._id)}
                  onWishlist={toggleWishlist}
                  onAdd={addToCart}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}

