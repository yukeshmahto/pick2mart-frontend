'use client';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import styles from '../../app/seller/page.module.css';

export default function SellerDashboardTab({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerService.getDashboard();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load seller dashboard metrics');
      }
    } catch (err) {
      setError(err.message || 'An error occurred loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#0284c7' }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading merchant metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
          {error}
        </div>
        <button onClick={fetchDashboard} className={styles.primaryBtn}>
          <RefreshCw size={16} /> Retry Loading
        </button>
      </div>
    );
  }

  const { products, orders, sales, inventory, recentOrders, profile } = data || {};

  return (
    <div>
      {!profile?.isApproved && (
        <div className={styles.reviewBanner}>
          <Clock size={20} />
          <div>
            <strong>Account Verification Pending:</strong> Your seller profile is currently being reviewed by administrators. Product publishing and checkout fulfillment are restricted until approved.
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {/* Total Sales */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiLabel}>Total Revenue</div>
            <div className={styles.kpiValue}>₹{sales?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
            <div className={styles.kpiSubtext}>
              Delivered: ₹{sales?.confirmedEarnings?.toLocaleString('en-IN') || 0}
            </div>
          </div>
          <div className={styles.kpiIconBox} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Active Products */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiLabel}>Products Catalog</div>
            <div className={styles.kpiValue}>{products?.total || 0}</div>
            <div className={styles.kpiSubtext}>
              {products?.active || 0} Active • {products?.pendingApproval || 0} In Review
            </div>
          </div>
          <div className={styles.kpiIconBox} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Package size={24} />
          </div>
        </div>

        {/* Orders Processing */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiLabel}>Orders to Fulfill</div>
            <div className={styles.kpiValue}>{(orders?.pending || 0) + (orders?.processing || 0)}</div>
            <div className={styles.kpiSubtext}>
              {orders?.pending || 0} Pending • {orders?.processing || 0} Processing
            </div>
          </div>
          <div className={styles.kpiIconBox} style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiLabel}>Low Stock Alerts</div>
            <div className={styles.kpiValue} style={{ color: (inventory?.lowStockCount > 0) ? '#dc2626' : '#0f172a' }}>
              {inventory?.lowStockCount || 0}
            </div>
            <div className={styles.kpiSubtext}>
              {inventory?.lowStockCount > 0 ? 'Requires immediate restock' : 'Stock levels healthy'}
            </div>
          </div>
          <div
            className={styles.kpiIconBox}
            style={{
              backgroundColor: (inventory?.lowStockCount > 0) ? '#fef2f2' : '#f8fafc',
              color: (inventory?.lowStockCount > 0) ? '#dc2626' : '#64748b'
            }}
          >
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => onNavigateTab('products')} className={styles.primaryBtn}>
          <PlusCircle size={18} /> Add New Product
        </button>
        <button onClick={() => onNavigateTab('orders')} className={styles.secondaryBtn}>
          <Truck size={18} /> Manage Fulfillments
        </button>
        <button onClick={() => onNavigateTab('inventory')} className={styles.secondaryBtn}>
          <Package size={18} /> Stock & Variants
        </button>
      </div>

      {/* Recent Orders Section */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders Received</h2>
          <button
            onClick={() => onNavigateTab('orders')}
            className={styles.secondaryBtn}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            View All ({orders?.total || 0}) <ArrowRight size={14} />
          </button>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag className={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>No orders placed yet</h3>
            <p style={{ fontSize: '0.875rem' }}>Orders placed by customers for your products will appear here in real time.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Order Date</th>
                  <th>Destination</th>
                  <th>Payment</th>
                  <th>Total Amount</th>
                  <th>Fulfillment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((so) => {
                  const master = so.masterOrderId || {};
                  const addr = master.shippingAddress || {};
                  return (
                    <tr key={so._id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {master.orderNumber || so.sellerOrderId}
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(so.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        {addr.city ? `${addr.city}, ${addr.state}` : 'Standard Delivery'}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {master.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>
                        ₹{so.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            so.status === 'DELIVERED'
                              ? styles.badgeSuccess
                              : so.status === 'CANCELLED'
                              ? styles.badgeDanger
                              : so.status === 'SHIPPED'
                              ? styles.badgeInfo
                              : styles.badgeWarning
                          }`}
                        >
                          {so.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigateTab('orders')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
