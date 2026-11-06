'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RotateCcw,
  LogOut,
  ChevronRight,
  User,
  X,
  ExternalLink,
} from 'lucide-react';

import { deliveryService } from '../../services/delivery.service';
import { userService } from '../../services/user.service';
import styles from './page.module.css';

export default function DeliveryPortalPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [otpModalAssignment, setOtpModalAssignment] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [recipientNameInput, setRecipientNameInput] = useState('');
  const [deliveryNotesInput, setDeliveryNotesInput] = useState('');

  const [failModalAssignment, setFailModalAssignment] = useState(null);
  const [failureReason, setFailureReason] = useState('Customer unreachable / phone switched off');
  const [failureNotes, setFailureNotes] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [dashRes, delivRes] = await Promise.all([
        deliveryService.getDashboard(),
        deliveryService.getDeliveries(activeTab === 'ALL' ? '' : activeTab),
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      if (delivRes.success) {
        setDeliveries(delivRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load delivery data:', err);
    }
  }, [activeTab]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/delivery/login?redirect=/delivery');
        return;
      }

      try {
        const profileRes = await userService.getProfile();
        if (
          profileRes.success &&
          (profileRes.data.role === 'delivery_partner' ||
            profileRes.data.role === 'admin')
        ) {
          setCurrentUser(profileRes.data);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        router.push('/delivery/login?redirect=/delivery');
        return;
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, loadData]);

  const handleToggleAvailability = async () => {
    if (!dashboardData?.stats) return;
    try {
      const newStatus = !dashboardData.stats.isAvailable;
      await deliveryService.updateProfile({ isAvailable: newStatus });
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, isAvailable: newStatus },
      }));
      showToast(
        `Status updated to ${newStatus ? 'Online (Available)' : 'Offline (Off-Duty)'}`,
      );
    } catch (err) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await deliveryService.acceptDelivery(id);
      showToast('Delivery accepted! Please proceed to pickup.');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to accept task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickup = async (id) => {
    setActionLoading(true);
    try {
      await deliveryService.pickupDelivery(id);
      showToast('Package marked as picked up from vendor!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to mark picked up', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartDelivery = async (id) => {
    setActionLoading(true);
    try {
      await deliveryService.outForDelivery(id);
      showToast('Shipment is out for delivery. OTP sent to customer!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to start delivery', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendOtp = async (id) => {
    setActionLoading(true);
    try {
      await deliveryService.resendOtp(id);
      showToast('A new delivery PIN has been dispatched to the customer.');
    } catch (err) {
      showToast(err.message || 'Failed to resend PIN', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpModalAssignment) return;
    if (otpInput.trim().length !== 6) {
      showToast('Please enter the complete 6-digit delivery PIN', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await deliveryService.verifyOtpAndComplete(otpModalAssignment._id, {
        otp: otpInput.trim(),
        recipientName: recipientNameInput.trim(),
        notes: deliveryNotesInput.trim(),
      });
      showToast('Order successfully verified and marked DELIVERED!');
      setOtpModalAssignment(null);
      setOtpInput('');
      setRecipientNameInput('');
      setDeliveryNotesInput('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFailSubmit = async (e) => {
    e.preventDefault();
    if (!failModalAssignment) return;
    if (!failureReason) {
      showToast('Please select a failure reason', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await deliveryService.failDelivery(failModalAssignment._id, {
        failureReason,
        notes: failureNotes.trim(),
      });
      showToast('Delivery attempt marked as failed for admin review.');
      setFailModalAssignment(null);
      setFailureNotes('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to record failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/delivery/login');
  };

  if (loading) {
    return (
      <div className={styles.portalContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>Verifying delivery partner credentials...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className={styles.portalContainer}>
        <div className={styles.accessDenied}>
          <AlertTriangle size={54} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Delivery Partner Access Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            This portal is exclusively accessible to authorized Pick2Mart delivery personnel and fleet managers. If you are an approved delivery partner, please log in with your fleet credentials.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>
              Return to Storefront
            </Link>
            <Link href="/delivery/login" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
              Fleet Login / Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.portalContainer}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'error' ? '#ef4444' : '#0d9488',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            zIndex: 9999,
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className={styles.portalHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitle}>
            <Truck size={28} color="#2dd4bf" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.partnerName}>
                  {currentUser?.fullName || 'Delivery Partner'}
                </span>
                <span className={styles.badgeFleet}>FLEET PARTNER</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {currentUser?.email}
              </p>
            </div>
          </div>

          <div className={styles.headerControls}>
            <button
              onClick={handleToggleAvailability}
              className={styles.availabilityToggle}
            >
              <div
                className={`${styles.statusIndicator} ${
                  dashboardData?.stats?.isAvailable
                    ? styles.statusOnline
                    : styles.statusOffline
                }`}
              />
              <span>
                {dashboardData?.stats?.isAvailable ? 'Online' : 'Off-Duty'}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className={styles.btnSecondary}
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Assigned Tasks</span>
            <span className={styles.kpiValue}>
              {dashboardData?.stats?.totalAssigned ?? 0}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Active Trips</span>
            <span className={styles.kpiValue} style={{ color: '#38bdf8' }}>
              {dashboardData?.stats?.activeDeliveries ?? 0}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Delivered Today</span>
            <span className={styles.kpiValue} style={{ color: '#34d399' }}>
              {dashboardData?.stats?.deliveredToday ?? 0}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Total Completed</span>
            <span className={styles.kpiValue} style={{ color: '#a78bfa' }}>
              {dashboardData?.stats?.totalCompleted ?? 0}
            </span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className={styles.filterTabs}>
          {[
            { id: 'ALL', label: 'All Shipments' },
            { id: 'ASSIGNED', label: 'Assigned (New)' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'PICKED_UP', label: 'Picked Up' },
            { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'FAILED_DELIVERY', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deliveries List */}
        {deliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
              No deliveries found
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              There are currently no tasks matching the selected filter ({activeTab}).
            </p>
          </div>
        ) : (
          <div className={styles.deliveryList}>
            {deliveries.map((assignment) => {
              const subOrder = assignment.sellerOrderId;
              const masterOrder = assignment.masterOrderId;
              const pickup = assignment.pickupDetails;
              const shipping = masterOrder?.shippingAddress;

              return (
                <div key={assignment._id} className={styles.deliveryCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.orderBadgeGroup}>
                      <span className={styles.orderNum}>
                        Order #{masterOrder?.orderNumber || subOrder?.sellerOrderId || 'N/A'}
                      </span>
                      <span className={styles.trackingCode}>
                        Tracking: {assignment.trackingNumber || 'PENDING'}
                      </span>
                    </div>

                    <span className={`${styles.statusPill} ${styles[`status${assignment.status}`] || ''}`}>
                      {assignment.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Locations Grid */}
                  <div className={styles.cardGrid}>
                    {/* Pickup Info */}
                    <div className={styles.addressBox}>
                      <div className={styles.addressTitle}>
                        <MapPin size={14} color="#f59e0b" />
                        <span>Pickup Location (Seller)</span>
                      </div>
                      <span className={styles.addressName}>
                        {pickup?.businessName || 'Seller Warehouse'}
                      </span>
                      <p className={styles.addressText}>
                        {pickup?.businessAddress || 'Hub Dispatch Centre'}
                        {pickup?.city ? `, ${pickup.city}` : ''}
                        {pickup?.pincode ? ` - ${pickup.pincode}` : ''}
                      </p>
                      {pickup?.businessPhone && (
                        <a href={`tel:${pickup.businessPhone}`} className={styles.phoneLink}>
                          <Phone size={13} /> Call Seller ({pickup.businessPhone})
                        </a>
                      )}
                    </div>

                    {/* Delivery Info */}
                    <div className={styles.addressBox}>
                      <div className={styles.addressTitle}>
                        <MapPin size={14} color="#10b981" />
                        <span>Delivery Address (Customer)</span>
                      </div>
                      <span className={styles.addressName}>
                        {shipping?.fullName || 'Customer'}
                      </span>
                      <p className={styles.addressText}>
                        {shipping?.addressLine1}
                        {shipping?.addressLine2 ? `, ${shipping.addressLine2}` : ''}
                        {shipping?.landmark ? ` (Near ${shipping.landmark})` : ''}
                        <br />
                        {shipping?.city}, {shipping?.state} - {shipping?.pincode}
                      </p>
                      {shipping?.mobile && (
                        <a href={`tel:${shipping.mobile}`} className={styles.phoneLink}>
                          <Phone size={13} /> Call Customer ({shipping.mobile})
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Items Summary */}
                  {assignment.items && assignment.items.length > 0 && (
                    <div className={styles.itemsSection}>
                      <div className={styles.itemsTitle}>SHIPMENT CONTENTS</div>
                      <div className={styles.itemsList}>
                        {assignment.items.map((it, idx) => (
                          <div key={idx} className={styles.itemChip}>
                            <Package size={14} />
                            <span>
                              {it.quantity}x {it.title || it.productId?.name || 'Product'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Actions */}
                  <div className={styles.cardActions}>
                    {assignment.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleAccept(assignment._id)}
                        disabled={actionLoading}
                        className={styles.btnPrimary}
                      >
                        <CheckCircle size={16} /> Accept Assignment
                      </button>
                    )}

                    {assignment.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handlePickup(assignment._id)}
                        disabled={actionLoading}
                        className={styles.btnPrimary}
                        style={{ background: '#f59e0b', color: '#000000' }}
                      >
                        <Package size={16} /> Confirm Package Picked Up
                      </button>
                    )}

                    {assignment.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleStartDelivery(assignment._id)}
                        disabled={actionLoading}
                        className={styles.btnPrimary}
                        style={{ background: '#8b5cf6' }}
                      >
                        <Truck size={16} /> Start Delivery Route (Dispatches OTP)
                      </button>
                    )}

                    {assignment.status === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => setOtpModalAssignment(assignment)}
                          className={styles.btnPrimary}
                        >
                          <ShieldCheck size={16} /> Verify OTP & Complete Delivery
                        </button>

                        <button
                          onClick={() => handleResendOtp(assignment._id)}
                          disabled={actionLoading}
                          className={styles.btnSecondary}
                        >
                          <RotateCcw size={14} /> Resend OTP
                        </button>

                        <button
                          onClick={() => setFailModalAssignment(assignment)}
                          className={styles.btnDanger}
                        >
                          <AlertTriangle size={14} /> Report Failed Attempt
                        </button>
                      </>
                    )}

                    {assignment.status === 'DELIVERED' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '14px', fontWeight: '600' }}>
                        <CheckCircle size={18} />
                        <span>
                          Delivered to {assignment.proofOfDelivery?.recipientName || 'Recipient'}{' '}
                          {assignment.deliveredAt
                            ? `on ${new Date(assignment.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                        </span>
                      </div>
                    )}

                    {assignment.status === 'FAILED_DELIVERY' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px' }}>
                        <AlertTriangle size={16} />
                        <span>Reason: {assignment.failureReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: OTP VERIFICATION */}
      {otpModalAssignment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#2dd4bf" />
                <h3 className={styles.modalTitle}>Proof of Delivery (OTP)</h3>
              </div>
              <button
                onClick={() => setOtpModalAssignment(null)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '18px' }}>
              Ask the customer for the 6-digit verification code sent to their email or mobile phone upon delivery dispatch.
            </p>

            <form onSubmit={handleVerifyOtpSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>6-Digit Delivery PIN *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className={`${styles.formInput} ${styles.otpInput}`}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Recipient Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Self, Security Guard, Family Member"
                  value={recipientNameInput}
                  onChange={(e) => setRecipientNameInput(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Delivery Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Left at doorstep / handed to customer"
                  value={deliveryNotesInput}
                  onChange={(e) => setDeliveryNotesInput(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setOtpModalAssignment(null)}
                  className={styles.btnSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || otpInput.length !== 6}
                  className={styles.btnPrimary}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {actionLoading ? 'Verifying PIN...' : 'Verify & Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FAILED DELIVERY ATTEMPT */}
      {failModalAssignment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} color="#f87171" />
                <h3 className={styles.modalTitle}>Record Delivery Failure</h3>
              </div>
              <button
                onClick={() => setFailModalAssignment(null)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '18px' }}>
              Please specify the precise reason delivery could not be completed. This will be recorded for audit and admin dispatch review.
            </p>

            <form onSubmit={handleFailSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Primary Failure Reason *</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="Customer unreachable / phone switched off">
                    Customer unreachable / phone switched off
                  </option>
                  <option value="Premises closed / Incorrect address given">
                    Premises closed / Incorrect address given
                  </option>
                  <option value="Customer refused delivery or cancelled at door">
                    Customer refused delivery or cancelled at door
                  </option>
                  <option value="Customer requested reschedule / delivery later">
                    Customer requested reschedule / delivery later
                  </option>
                  <option value="Cash collection failed (COD)">
                    Cash collection failed (COD)
                  </option>
                  <option value="Package damaged in transit">
                    Package damaged in transit
                  </option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Additional Notes / Comments</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Called customer 3 times, gate guard confirmed customer out of station"
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  className={styles.formTextarea}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setFailModalAssignment(null)}
                  className={styles.btnSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={styles.btnDanger}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {actionLoading ? 'Recording...' : 'Submit Failed Attempt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
