"use client";

import React from "react";
import { X, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export function CartDrawer(props) {
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch (e) {}

  const cart = props.cart !== undefined ? props.cart : cartContext?.cart || [];
  const subtotal = props.subtotal !== undefined ? props.subtotal : cartContext?.subtotal || 0;
  const onClose = props.onClose || cartContext?.closeCart || (() => {});

  const handleUpdateQuantity = (id, change) => {
    if (props.setCart) {
      props.setCart((items) =>
        items
          .map((item) =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
          )
          .filter((item) => item.quantity > 0)
      );
    } else if (cartContext) {
      cartContext.updateQuantity(id, change);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <span className="section-kicker">Your bag</span>
            <h2>
              {cart.length ? `${cart.length} items` : "Your cart is empty"}
            </h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>
        {cart.length > 0 ? (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none'; 
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex';
                      }} 
                    />
                  ) : null}
                  <div 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: '8px', 
                      display: item.image ? 'none' : 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ShoppingBag size={20} color="#94a3b8" />
                  </div>
                  <div>
                    <b>{item.name}</b>
                    <small>{item.brand || "Pick2Mart"}</small>
                    <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                    <div className="quantity">
                      <button onClick={() => handleUpdateQuantity(item.id, -1)} aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, 1)} aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <b>₹{subtotal.toLocaleString("en-IN")}</b>
              </div>
              <small>Free express delivery unlocked on this order</small>
              <Link
                href="/checkout"
                className="primary-button"
                onClick={onClose}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "8px" }}
              >
                Proceed to checkout <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <ShoppingBag size={30} />
            <p>Your cart is waiting for something lovely.</p>
            <button className="primary-button" onClick={onClose}>
              Start shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
