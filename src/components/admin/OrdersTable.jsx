'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, Eye, Filter, RefreshCw, X, MapPin, Package, User, CheckCircle2 } from 'lucide-react';
import styles from '../../app/admin/page.module.css';

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAllOrders({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        page,
        limit: 15,
      });
      if (res.success) {
        setOrders(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError(res.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await adminService.getOrderById(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      alert('Failed to load order details: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) return;

    setStatusUpdateLoading(true);
    try {
      const res = await adminService.updateOrderStatus(selectedOrder._id, newStatus);
      if (res.success) {
        setSelectedOrder(res.data);
        fetchOrders();
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { backgroundColor: '#dcfce7', color: '#15803d' };
      case 'SHIPPED':
        return { backgroundColor: '#f3e8ff', color: '#7e22ce' };
      case 'CONFIRMED':
      case 'PROCESSING':
        return { backgroundColor: '#eff6ff', color: '#1d4ed8' };
      case 'CANCELLED':
        return { backgroundColor: '#fee2e2', color: '#b91c1c' };
      default:
        return { backgroundColor: '#fef3c7', color: '#b45309' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filters & Search Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by order #, customer, mobile, city..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select 
            value={paymentFilter} 
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>

          <button 
            onClick={fetchOrders} 
            title="Refresh Orders"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Orders Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No orders found</h3>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search query or status filters.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items / Sellers</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>#{order.orderNumber}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{order.shippingAddress?.fullName || order.userId?.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.shippingAddress?.mobile || order.userId?.mobile}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{order.itemCount || 1} item(s)</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.sellerOrdersCount || 1} seller(s)</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{order.paymentMethod}</div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: order.paymentStatus === 'PAID' ? '#15803d' : '#b45309'
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      ...getStatusBadgeStyle(order.status),
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>₹{order.totalAmount?.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => openOrderDetail(order._id)}
                      className={styles.actionBtn}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      <Eye size={15} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} orders)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page <= 1 ? '#f1f5f9' : 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button 
              disabled={page >= meta.totalPages} 
              onClick={() => setPage(page + 1)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page >= meta.totalPages ? '#f1f5f9' : 'white', cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
            >
              <X size={24} color="#64748b" />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  Order #{selectedOrder.orderNumber}
                </h2>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '30px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>Status Transition:</div>
                <select 
                  value={selectedOrder.status}
                  disabled={statusUpdateLoading}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--teal)', fontWeight: '700', fontSize: '0.9rem', backgroundColor: '#f0fdf4' }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Address & Payment Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <MapPin size={16} color="var(--teal)" /> Shipping Address
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>{selectedOrder.shippingAddress?.fullName}</strong><br />
                  {selectedOrder.shippingAddress?.addressLine1} {selectedOrder.shippingAddress?.addressLine2}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}<br />
                  Mobile: <strong>{selectedOrder.shippingAddress?.mobile}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <CheckCircle2 size={16} color="var(--teal)" /> Payment & Summary
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Method:</span> <strong>{selectedOrder.paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment Status:</span> <strong style={{ color: selectedOrder.paymentStatus === 'PAID' ? '#15803d' : '#b45309' }}>{selectedOrder.paymentStatus}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span> <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping / Tax:</span> <span>₹{selectedOrder.shippingAmount || 0} / ₹{selectedOrder.taxAmount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                    <span>Total Amount:</span> <span>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Seller Sub-Orders & Item Snapshots */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                Seller Sub-Orders ({selectedOrder.sellerOrders?.length || 0})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedOrder.sellerOrders?.map((so) => (
                  <div key={so._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Sub-Order: #{so.sellerOrderId}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '12px' }}>
                          Seller: {so.sellerId?.storeName || so.sellerId?.fullName || 'Seller'}
                        </span>
                      </div>
                      <span style={{ ...getStatusBadgeStyle(so.status), padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {so.status}
                      </span>
                    </div>

                    {/* Order Items Table */}
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                          <th style={{ padding: '6px 0' }}>Product</th>
                          <th style={{ padding: '6px 0' }}>SKU</th>
                          <th style={{ padding: '6px 0' }}>Price</th>
                          <th style={{ padding: '6px 0' }}>Qty</th>
                          <th style={{ padding: '6px 0', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {so.items?.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '8px 0', fontWeight: '600', color: '#0f172a' }}>
                              {item.productName}
                              {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '400' }}>
                                  {Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '8px 0', color: '#64748b' }}>{item.sku}</td>
                            <td style={{ padding: '8px 0' }}>₹{item.priceAtPurchase?.toLocaleString()}</td>
                            <td style={{ padding: '8px 0' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '700' }}>
                              ₹{item.totalAmount?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
