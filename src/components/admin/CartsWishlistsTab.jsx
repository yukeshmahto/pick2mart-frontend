'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { ShoppingCart, Heart, RefreshCw, User, Package } from 'lucide-react';
import styles from '../../app/admin/page.module.css';

export default function CartsWishlistsTab() {
  const [subTab, setSubTab] = useState('carts'); // 'carts' | 'wishlists'
  const [carts, setCarts] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (subTab === 'carts') {
        const res = await adminService.getAllCarts({ page: 1, limit: 30 });
        if (res.success) setCarts(res.data);
      } else {
        const res = await adminService.getAllWishlists({ page: 1, limit: 30 });
        if (res.success) setWishlists(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Sub-tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setSubTab('carts')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: subTab === 'carts' ? '2px solid var(--teal)' : '1px solid #cbd5e1', 
              backgroundColor: subTab === 'carts' ? '#f0fdf4' : 'white', 
              fontWeight: '700', 
              color: subTab === 'carts' ? 'var(--teal)' : '#64748b', 
              cursor: 'pointer' 
            }}
          >
            <ShoppingCart size={18} /> Active Customer Carts
          </button>
          
          <button 
            onClick={() => setSubTab('wishlists')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: subTab === 'wishlists' ? '2px solid #ec4899' : '1px solid #cbd5e1', 
              backgroundColor: subTab === 'wishlists' ? '#fdf2f8' : 'white', 
              fontWeight: '700', 
              color: subTab === 'wishlists' ? '#ec4899' : '#64748b', 
              cursor: 'pointer' 
            }}
          >
            <Heart size={18} /> Customer Wishlists
          </button>
        </div>

        <button 
          onClick={fetchData}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Content */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading {subTab === 'carts' ? 'cart' : 'wishlist'} activity...</div>
          </div>
        ) : subTab === 'carts' ? (
          carts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No active customer carts</h3>
              <p style={{ fontSize: '0.9rem' }}>When users add items to their cart, they will appear here in real time.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Cart Items</th>
                  <th>Total Quantity</th>
                  <th>Estimated Value</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {carts.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.userId?.fullName || 'User'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.userId?.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.userId?.mobile}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '350px' }}>
                        {c.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                            • <strong>{item.quantity}x</strong> {item.variantId?.productId?.name || 'Item'} (SKU: {item.variantId?.sku})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{c.totalItems}</strong>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: 'var(--teal)' }}>₹{c.totalAmount?.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(c.updatedAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          wishlists.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <Heart size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No customer wishlists found</h3>
              <p style={{ fontSize: '0.9rem' }}>When customers save items to their wishlist, they will appear here.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Wishlisted Products</th>
                  <th>Count</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {wishlists.map(w => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{w.userId?.fullName || 'User'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {w.items?.map((item, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', borderRadius: '12px', fontSize: '0.8rem', color: '#334155' }}>
                            {item.productId?.name || 'Product'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{w.items?.length || 0}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(w.updatedAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

    </div>
  );
}
