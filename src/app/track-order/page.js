'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Store,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

import { deliveryService } from '../../services/delivery.service';
import styles from './page.module.css';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get('orderId') || searchParams.get('orderNumber') || '';

  const [orderQuery, setOrderQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(Boolean(token));
  }, []);

  const handleTrack = useCallback(async (queryToSearch) => {
    const target = (queryToSearch || orderQuery).trim();
    if (!target) return;

    setError(null);
    setLoading(true);

    try {
      const res = await deliveryService.trackOrder(target);
      if (res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setError(res.message || 'Unable to find tracking records for this order.');
      }
    } catch (err) {
      if (err.message?.includes('403') || err.message?.includes('permission')) {
        setError(
          'Access Denied: You can only track orders placed from your authenticated account.',
        );
      } else if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('No order found matching the provided order number or ID.');
      } else {
        setError(err.message || 'Failed to retrieve order tracking information.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderQuery]);

  useEffect(() => {
    if (initialQuery && isAuthenticated) {
      handleTrack(initialQuery);
    }
  }, [initialQuery, isAuthenticated, handleTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  return (
    <div className={styles.trackContainer}>
      <div className={styles.trackWrapper}>
        {/* Header & Search Bar */}
        <div className={styles.headerCard}>
          <Truck size={36} color="#0d9488" style={{ margin: '0 auto 12px' }} />
          <h1 className={styles.title}>Track Your Delivery</h1>
          <p className={styles.subtitle}>
            Enter your Pick2Mart Order Number to track real-time fulfillment milestones, dispatch, and delivery partner arrival.
          </p>

          {!isAuthenticated ? (
            <div
              style={{
                background: '#f1f5f9',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              <AlertTriangle size={24} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                Account Authentication Required
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                For customer privacy and delivery PIN security, live shipment tracking is restricted to authenticated account owners.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  background: '#0d9488',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                Sign In to Track Orders
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Order Number (e.g. P2M1793...)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className={styles.searchInput}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.trackBtn}
              >
                <Search size={18} />
                <span>{loading ? 'Tracking...' : 'Track'}</span>
              </button>
            </form>
          )}

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '16px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Tracking Result */}
        {trackingData && (
          <div className={styles.resultCard}>
            {/* Master Order Details */}
            <div className={styles.metaHeader}>
              <div>
                <h2 className={styles.orderHeading}>
                  Order #{trackingData.orderNumber}
                </h2>
                <p className={styles.orderDate}>
                  Placed on {new Date(trackingData.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' • '}
                  Payment: {trackingData.paymentMethod} ({trackingData.paymentStatus})
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Delivery to: <strong>{trackingData.shippingAddress?.fullName}</strong> ({trackingData.shippingAddress?.city}, {trackingData.shippingAddress?.pincode})
                </p>
              </div>

              <span className={`${styles.statusPill} ${styles[`status${trackingData.orderStatus}`] || ''}`}>
                {trackingData.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Sub-Shipments Breakdown */}
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              Package Shipments ({trackingData.shipments?.length || 1})
            </h3>

            {trackingData.shipments?.map((shipment, sIdx) => (
              <div key={sIdx} className={styles.shipmentCard}>
                {/* Shipment Header */}
                <div className={styles.shipmentHeader}>
                  <div className={styles.sellerName}>
                    <Store size={16} color="#0d9488" />
                    <span>Fulfillment by {shipment.seller}</span>
                  </div>

                  {shipment.trackingNumber && (
                    <span className={styles.trackingBadge}>
                      AWB / Tracking: {shipment.trackingNumber}
                    </span>
                  )}
                </div>

                {/* Items in this shipment */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  {shipment.items?.map((it, itIdx) => (
                    <div
                      key={itIdx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#334155',
                      }}
                    >
                      <Package size={14} color="#64748b" />
                      <span>{it.quantity}x {it.title || it.productId?.name || 'Product'}</span>
                    </div>
                  ))}
                </div>

                {/* Live Milestones Stepper */}
                <div className={styles.timeline}>
                  {shipment.milestones?.map((milestone, mIdx) => {
                    const isLast = mIdx === shipment.milestones.length - 1;

                    return (
                      <div key={mIdx} className={styles.timelineItem}>
                        <div className={styles.timelineIconContainer}>
                          <div
                            className={`${styles.timelineDot} ${
                              milestone.completed ? styles.dotCompleted : ''
                            }`}
                          >
                            {milestone.completed ? <CheckCircle size={14} /> : mIdx + 1}
                          </div>
                          {!isLast && (
                            <div
                              className={`${styles.timelineLine} ${
                                milestone.completed ? styles.lineCompleted : ''
                              }`}
                            />
                          )}
                        </div>

                        <div className={styles.timelineContent}>
                          <div className={styles.stepTitle}>
                            <span style={{ color: milestone.completed ? '#0f172a' : '#94a3b8' }}>
                              {milestone.title}
                            </span>
                            {milestone.timestamp && (
                              <span className={styles.stepTime}>
                                {new Date(milestone.timestamp).toLocaleTimeString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <p className={styles.stepDesc}>
                            {milestone.description}
                          </p>

                          {/* OTP Notice when OUT_FOR_DELIVERY */}
                          {milestone.key === 'OUT_FOR_DELIVERY' && milestone.completed && shipment.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                            <div className={styles.otpBanner}>
                              <ShieldCheck size={20} color="#166534" />
                              <div>
                                <strong>Delivery PIN Sent:</strong> A 6-digit delivery PIN was sent to your registered email/phone. Please share it with the delivery partner upon arrival.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Executive Info */}
                {shipment.deliveryPartner && (
                  <div className={styles.partnerBox}>
                    <div>
                      <div className={styles.partnerLabel}>Assigned Delivery Executive</div>
                      <div className={styles.partnerName}>
                        {shipment.deliveryPartner.fullName}
                      </div>
                    </div>
                    {shipment.deliveryPartner.mobileMasked && (
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                        Contact: {shipment.deliveryPartner.mobileMasked}
                      </span>
                    )}
                  </div>
                )}

                {/* Failed Delivery Banner */}
                {shipment.failedDelivery && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginTop: '16px',
                      color: '#991b1b',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Delivery Attempt Rescheduled:</strong> {shipment.failedDelivery.reason}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading live tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
