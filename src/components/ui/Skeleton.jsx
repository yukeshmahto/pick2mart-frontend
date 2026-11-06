'use client';
import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className="product-card"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
      }}
    >
      <Skeleton height="180px" borderRadius="12px" />
      <Skeleton width="40%" height="12px" />
      <Skeleton width="85%" height="16px" />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton width="50px" height="14px" />
        <Skeleton width="35px" height="14px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <Skeleton width="60px" height="20px" />
        <Skeleton width="32px" height="32px" borderRadius="50%" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4, columns = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(220px, 1fr))`,
        gap: '20px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="hero container" style={{ display: 'flex', gap: '20px', margin: '20px auto' }}>
      <div style={{ flex: 2 }}>
        <Skeleton height="380px" borderRadius="16px" />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="180px" borderRadius="16px" />
        <Skeleton height="180px" borderRadius="16px" />
      </div>
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width="120px" height="14px" />
      <Skeleton width="280px" height="28px" />
      <Skeleton width="400px" height="16px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width="100%" height="24px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width="100%" height="40px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AboutPageSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <Skeleton height="320px" borderRadius="20px" />
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton width="150px" height="20px" />
          <Skeleton width="300px" height="36px" />
          <Skeleton width="100%" height="16px" />
          <Skeleton width="100%" height="16px" />
          <Skeleton width="80%" height="16px" />
        </div>
        <div style={{ flex: 1 }}>
          <Skeleton height="280px" borderRadius="16px" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="120px" borderRadius="16px" />
        ))}
      </div>
    </div>
  );
}
