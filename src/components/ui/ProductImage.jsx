'use client';
import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

export function ProductImage({
  src,
  alt = 'Product image',
  className = '',
  style = {},
  fallbackText = 'Pick2Mart',
  loading = 'lazy',
}) {
  const [error, setError] = useState(false);

  // If no source or error occurred, render neutral designed SVG placeholder
  if (!src || error) {
    return (
      <div className={`neutral-image-placeholder ${className}`} style={style}>
        <ShoppingBag size={28} style={{ opacity: 0.6, marginBottom: '6px' }} />
        <span>{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setError(true)}
    />
  );
}
