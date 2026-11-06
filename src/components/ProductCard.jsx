"use client";

import React from "react";
import Link from "next/link";
import { Star, Plus, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { ProductImage } from "./ui/ProductImage";

export function ProductCard({ product, wished, onWishlist, onAdd }) {
  let cartCtx = null;
  let wishCtx = null;
  try { cartCtx = useCart(); } catch (e) {}
  try { wishCtx = useWishlist(); } catch (e) {}

  const productId = product.productId || product._id || product.id;
  const isWished = wished !== undefined ? wished : (wishCtx ? wishCtx.isInWishlist(productId) : false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (onWishlist) {
      onWishlist(product);
    } else if (wishCtx) {
      wishCtx.toggleWishlist(product);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    if (onAdd) {
      onAdd(product);
    } else if (cartCtx) {
      cartCtx.addToCart(product, 1);
    }
  };

  const mrp = product.mrp || product.compareAtPrice || Math.round((product.price || 0) * 1.25);
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  
  // Real inventory indicator
  const stockAvailable = product.stockAvailable ?? 50;
  const isLowStock = stockAvailable > 0 && stockAvailable <= 5;
  const cardNote = product.note || (isLowStock ? `Only ${stockAvailable} left!` : '');

  return (
    <article className="product-card">
      <div className={`product-image ${product.color || ""}`}>
        <Link href={`/product/${product.slug || productId}`}>
          <ProductImage
            src={product.image || product.images?.[0]}
            alt={product.name}
            fallbackText={product.brand || 'Pick2Mart'}
          />
        </Link>
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button
          className={`wishlist-button ${isWished ? "is-wished" : ""}`}
          onClick={handleWishlistClick}
          aria-label={`Wishlist ${product.name}`}
        >
          <Heart size={18} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <span className="product-brand">{product.brand || "Pick2Mart"}</span>
        <Link href={`/product/${product.slug || productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{product.name}</h3>
        </Link>
        {product.rating > 0 && (
          <div className="rating">
            <span>
              <Star size={13} fill="currentColor" /> {product.rating}
            </span>
            {product.reviews > 0 && <small>({product.reviews})</small>}
          </div>
        )}
        {cardNote && (
          <div className={`card-note ${isLowStock ? 'note-1' : ''}`}>
            {isLowStock && <span className="stock-bar" />}
            {cardNote}
          </div>
        )}
        <div className="price-row">
          <strong>₹{(product.price || 0).toLocaleString("en-IN")}</strong>
          {mrp > product.price && <del>₹{mrp.toLocaleString("en-IN")}</del>}
          {discount > 0 && <span>{discount}% off</span>}
        </div>
        <button className="add-button" onClick={handleAddClick}>
          <Plus size={16} /> Add to cart
        </button>
      </div>
    </article>
  );
}
