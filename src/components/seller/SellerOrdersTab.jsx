'use client';
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  X
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import styles from '../../app/seller/page.module.css';

export default function SellerOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Detail & Fulfillment Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fulfillmentData, setFulfillmentData] = useState({
    trackingNumber: '',
    shippingProvider: 'Delhivery',
  });
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerService.getOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });

      if (res.success) {
        setOrders(res.data || []);
        if (res.meta) setMeta(res.meta);
      } else {
        setError(res.message || 'Failed to fetch seller orders');
      }
    } catch (err) {
      setError(err.message || 'An error occurred loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const viewOrderDetails = async (orderId) => {
    setDetailLoading(true);
    setActionError(null);
    try {
      const res = await sellerService.getOrderById(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
        setFulfillmentData({
          trackingNumber: res.data.trackingNumber || '',
          shippingProvider: res.data.shippingProvider || 'Delhivery',
        });
      } else {
        alert(res.message || 'Could not load order details');
      }
    } catch (err) {
      alert(err.message || 'Error loading order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (targetStatus) => {
    if (!selectedOrder) return;
    setActionSubmitting(true);
    setActionError(null);

    const payload = {
      status: targetStatus,
    };

    if (targetStatus === 'SHIPPED') {
      if (fulfillmentData.trackingNumber) payload.trackingNumber = fulfillmentData.trackingNumber;
      if (fulfillmentData.shippingProvider) payload.shippingProvider = fulfillmentData.shippingProvider;
    }

    try {
      const res = await sellerService.updateOrderStatus(selectedOrder._id, payload);
      if (res.success) {
        setSelectedOrder(res.data);
        fetchOrders();
      } else {
        setActionError(res.message || 'Status transition rejected');
      }
    } catch (err) {
      setActionError(err.message || 'Error updating order status');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filter orders by search locally if populated
  const filteredOrders = orders.filter((so) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const master = so.masterOrderId || {};
    const addr = master.shippingAddress || {};
    return (
      so.sellerOrderId?.toLowerCase().includes(term) ||
      master.orderNumber?.toLowerCase().includes(term) ||
      addr.fullName?.toLowerCase().includes(term) ||
      addr.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Merchant Order Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Process buyer orders, assign shipping tracking details, and fulfill marketplace purchases.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by order #, customer, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={styles.formSelect}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">All Statuses ({meta.total || orders.length})</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button onClick={fetchOrders} className={styles.secondaryBtn} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Orders Table */}
      <div className={styles.cardSection} style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading seller orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag className={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>No orders found</h3>
            <p style={{ fontSize: '0.875rem' }}>
              {statusFilter
                ? `No orders matching status "${statusFilter}".`
                : 'You have not received any orders matching your criteria yet.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order Identifiers</th>
                  <th>Order Date</th>
                  <th>Customer & Destination</th>
                  <th>Items Belonging to You</th>
                  <th>Payment</th>
                  <th>Seller Subtotal</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((so) => {
                  const master = so.masterOrderId || {};
                  const addr = master.shippingAddress || {};
                  const items = so.items || [];
                  const totalUnits = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

                  return (
                    <tr key={so._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {master.orderNumber || 'P2M-ORDER'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {so.sellerOrderId}
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                        {new Date(so.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{addr.fullName || 'Customer'}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                          {addr.city ? `${addr.city}, ${addr.state}` : 'Direct Shipping'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                          {items.length} {items.length === 1 ? 'Product' : 'Products'} ({totalUnits} pcs)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {items.map((it) => it.productId?.name || 'Product Item').join(', ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                          {master.paymentMethod || 'COD'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: master.paymentStatus === 'PAID' ? '#16a34a' : '#d97706' }}>
                          {master.paymentStatus || 'PENDING'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0284c7' }}>
                          ₹{so.totalAmount?.toLocaleString('en-IN')}
                        </div>
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
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => viewOrderDetails(so._id)}
                          className={styles.primaryBtn}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                        >
                          <Eye size={13} /> View & Fulfill
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

      {/* Order Detail & Fulfillment Modal */}
      {selectedOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '720px' }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  Fulfill Order #{selectedOrder.masterOrderId?.orderNumber || selectedOrder.sellerOrderId}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Sub-Order Code: {selectedOrder.sellerOrderId}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {actionError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  {actionError}
                </div>
              )}

              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</div>
                  <span
                    className={`${styles.badge} ${
                      selectedOrder.status === 'DELIVERED'
                        ? styles.badgeSuccess
                        : selectedOrder.status === 'CANCELLED'
                        ? styles.badgeDanger
                        : selectedOrder.status === 'SHIPPED'
                        ? styles.badgeInfo
                        : styles.badgeWarning
                    }`}
                    style={{ fontSize: '0.85rem', marginTop: '4px' }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Payment Method</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {selectedOrder.masterOrderId?.paymentMethod || 'COD'} ({selectedOrder.masterOrderId?.paymentStatus || 'PENDING'})
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={16} color="#0284c7" /> Customer Delivery Destination
                </h4>
                {selectedOrder.masterOrderId?.shippingAddress ? (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    <strong>{selectedOrder.masterOrderId.shippingAddress.fullName}</strong> ({selectedOrder.masterOrderId.shippingAddress.mobile})<br />
                    {selectedOrder.masterOrderId.shippingAddress.addressLine1}
                    {selectedOrder.masterOrderId.shippingAddress.addressLine2 && `, ${selectedOrder.masterOrderId.shippingAddress.addressLine2}`}<br />
                    {selectedOrder.masterOrderId.shippingAddress.city}, {selectedOrder.masterOrderId.shippingAddress.state} - {selectedOrder.masterOrderId.shippingAddress.pincode}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No shipping details available.</p>
                )}
              </div>

              {/* Items List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Ordered Items Belonging to Your Store
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Tax</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {item.productId?.name || 'Product Item'}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                          <td>₹{item.priceAtPurchase?.toLocaleString('en-IN')}</td>
                          <td>₹{item.taxAmount?.toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>
                            ₹{item.totalAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <div style={{ width: '220px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#16a34a' }}>
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.discountAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                      <span>Tax (GST):</span>
                      <span>₹{selectedOrder.taxAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      <span>Your Total:</span>
                      <span style={{ color: '#0284c7' }}>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update / Fulfillment Actions */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Order Transition Actions
                </h4>

                {selectedOrder.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleUpdateStatus('PROCESSING')}
                      disabled={actionSubmitting}
                      className={styles.primaryBtn}
                    >
                      <Clock size={16} /> Accept & Move to Processing
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      disabled={actionSubmitting}
                      className={styles.dangerBtn}
                    >
                      <XCircle size={16} /> Cancel Order
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'PROCESSING' && (
                  <div>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '10px' }}>
                      Package items and enter courier shipping tracking code to dispatch this order.
                    </p>
                    <div className={styles.formGrid2} style={{ marginBottom: '1rem' }}>
                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel}>Shipping Carrier</label>
                        <select
                          value={fulfillmentData.shippingProvider}
                          onChange={(e) => setFulfillmentData({ ...fulfillmentData, shippingProvider: e.target.value })}
                          className={styles.formSelect}
                        >
                          <option value="Delhivery">Delhivery</option>
                          <option value="BlueDart">BlueDart</option>
                          <option value="DTDC">DTDC</option>
                          <option value="Shadowfax">Shadowfax</option>
                          <option value="Self Delivery">Self Merchant Delivery</option>
                        </select>
                      </div>
                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel}>Tracking Number (AWB / Consignment)</label>
                        <input
                          type="text"
                          placeholder="e.g., DEL123456789IN"
                          value={fulfillmentData.trackingNumber}
                          onChange={(e) => setFulfillmentData({ ...fulfillmentData, trackingNumber: e.target.value })}
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleUpdateStatus('SHIPPED')}
                        disabled={actionSubmitting}
                        className={styles.primaryBtn}
                      >
                        <Truck size={16} /> Dispatch & Mark as Shipped
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        disabled={actionSubmitting}
                        className={styles.dangerBtn}
                      >
                        <XCircle size={16} /> Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <div>
                    <div style={{ backgroundColor: '#e0f2fe', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#0369a1' }}>
                      Carrier: <strong>{selectedOrder.shippingProvider || 'Carrier'}</strong> • Tracking: <strong>{selectedOrder.trackingNumber || 'N/A'}</strong> • Shipped on: {selectedOrder.shippedAt ? new Date(selectedOrder.shippedAt).toLocaleString('en-IN') : 'Recently'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        disabled={actionSubmitting}
                        className={styles.primaryBtn}
                        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
                      >
                        <CheckCircle size={16} /> Confirm Customer Delivery
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        disabled={actionSubmitting}
                        className={styles.dangerBtn}
                      >
                        <XCircle size={16} /> Mark Delivery Failed (Cancel)
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                    <CheckCircle size={18} /> Order has been successfully delivered and completed. No further transitions permitted.
                  </div>
                )}

                {selectedOrder.status === 'CANCELLED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
                    <XCircle size={18} /> Order is cancelled. No further fulfillment actions allowed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
