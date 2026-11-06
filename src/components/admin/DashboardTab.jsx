'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function DashboardTab({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b' }}>
        <RefreshCw className="animate-spin" size={24} style={{ marginRight: '8px' }} /> Loading real-time metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '12px', border: '1px solid #fecaca' }}>
        <p style={{ fontWeight: '600', marginBottom: '8px' }}>Failed to load dashboard:</p>
        <p>{error}</p>
        <button onClick={fetchDashboardData} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  const { kpi, recentOrders, recentCustomers, recentSellers } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Controls / Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Platform Overview</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Aggregated live data from MongoDB</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
        >
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Customers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>TOTAL CUSTOMERS</span>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{kpi?.customers?.total || 0}</div>
          <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '4px' }}>Registered Platform Users</div>
        </div>

        {/* Sellers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>SELLERS</span>
            <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '10px', color: '#10b981' }}>
              <Store size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{kpi?.sellers?.total || 0}</div>
          <div style={{ fontSize: '0.85rem', color: kpi?.sellers?.pendingApprovals > 0 ? '#f59e0b' : '#64748b', marginTop: '4px', fontWeight: '600' }}>
            {kpi?.sellers?.pendingApprovals || 0} pending approval
          </div>
        </div>

        {/* Products */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>PRODUCTS</span>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{kpi?.products?.total || 0}</div>
          <div style={{ fontSize: '0.85rem', color: kpi?.products?.pendingApprovals > 0 ? '#ea580c' : '#10b981', marginTop: '4px', fontWeight: '600' }}>
            {kpi?.products?.pendingApprovals || 0} pending approval
          </div>
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>TOTAL ORDERS</span>
            <div style={{ padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '10px', color: '#9333ea' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{kpi?.orders?.total || 0}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Master customer orders</div>
        </div>

        {/* Sales Revenue */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>NET SALES</span>
            <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '10px', color: '#059669' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{(kpi?.sales?.totalRevenue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            From {kpi?.sales?.eligibleOrders || 0} fulfilled orders
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>LOW STOCK ALERTS</span>
            <div style={{ padding: '8px', backgroundColor: '#fff1f2', borderRadius: '10px', color: '#e11d48' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: kpi?.inventory?.lowStockCount > 0 ? '#e11d48' : '#0f172a' }}>
            {kpi?.inventory?.lowStockCount || 0}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Variants below threshold
          </div>
        </div>

      </div>

      {/* Orders By Status Breakdown */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Order Status Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
            <div style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: '600' }}>PENDING</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#92400e', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.pending || 0}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <div style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>CONFIRMED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#166534', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.confirmed || 0}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: '600' }}>PROCESSING</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e40af', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.processing || 0}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', textAlign: 'center' }}>
            <div style={{ color: '#7e22ce', fontSize: '0.85rem', fontWeight: '600' }}>SHIPPED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6b21a8', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.shipped || 0}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center' }}>
            <div style={{ color: '#047857', fontSize: '0.85rem', fontWeight: '600' }}>DELIVERED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#065f46', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.delivered || 0}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
            <div style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: '600' }}>CANCELLED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#991b1b', marginTop: '4px' }}>
              {kpi?.orders?.byStatus?.cancelled || 0}
            </div>
          </div>

        </div>
      </div>

      {/* Recent Orders & Registrations Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Recent Orders */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Recent Orders</h3>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('orders')}
                style={{ color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                View All →
              </button>
            )}
          </div>

          {(!recentOrders || recentOrders.length === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '30px 0' }}>No orders placed yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>#{order.orderNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerName} • {new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>₹{order.totalAmount?.toLocaleString()}</div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                      color: order.status === 'DELIVERED' ? '#15803d' : order.status === 'CANCELLED' ? '#b91c1c' : '#b45309',
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations (Customers & Sellers) */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Recent Registrations</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>New Customers</h4>
            {(!recentCustomers || recentCustomers.length === 0) ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent customers</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentCustomers.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{c.fullName}</strong>
                      <span style={{ color: '#64748b', marginLeft: '8px' }}>({c.email})</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>New Sellers</h4>
            {(!recentSellers || recentSellers.length === 0) ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No registered sellers yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentSellers.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{s.businessName}</strong>
                      <span style={{ color: '#64748b', marginLeft: '8px' }}>{s.ownerName}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: s.isApproved ? '#dcfce7' : '#fef3c7',
                      color: s.isApproved ? '#15803d' : '#b45309'
                    }}>
                      {s.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
