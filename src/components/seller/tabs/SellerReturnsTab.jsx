'use client';
import React, { useState, useEffect } from 'react';
import { returnsService } from '../../../services/returns.service';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  AlertTriangle,
  Search,
  RefreshCw,
  Calendar,
  Package,
  CheckSquare
} from 'lucide-react';
import styles from '../../../app/seller/page.module.css';

export default function SellerReturnsTab() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'APPROVE' or 'REJECT'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Pickup modal
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupPartner, setPickupPartner] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectOutcome, setInspectOutcome] = useState('PASSED');
  const [inspectNotes, setInspectNotes] = useState('');

  const fetchReturns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await returnsService.getSellerReturns(statusFilter);
      if (res.success) {
        setReturns(res.data || []);
      } else {
        setError(res.message || 'Failed to load return requests');
      }
    } catch (err) {
      setError(err?.message || 'Error loading return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn || !reviewAction) return;
    if (reviewAction === 'REJECT' && !rejectionReason.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }

    setSubmittingAction(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.reviewSellerReturn(selectedReturn._id, {
        action: reviewAction,
        rejectionReason: reviewAction === 'REJECT' ? rejectionReason : undefined,
      });
      if (res.success) {
        setSuccessMsg(`Return request ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
        setSelectedReturn(null);
        setReviewAction(null);
        setRejectionReason('');
        await fetchReturns();
      } else {
        setError(res.message || 'Action failed.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSubmittingAction(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.scheduleSellerPickup(selectedReturn._id, {
        scheduledDate: pickupDate || undefined,
        carrierOrPartner: pickupPartner || undefined,
        trackingNotes: pickupNotes || undefined,
      });
      if (res.success) {
        setSuccessMsg('Pickup details recorded successfully.');
        setPickupModalOpen(false);
        setSelectedReturn(null);
        await fetchReturns();
      } else {
        setError(res.message || 'Failed to record pickup');
      }
    } catch (err) {
      setError(err?.message || 'Failed to record pickup');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSubmittingAction(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.inspectSellerReturn(selectedReturn._id, {
        outcome: inspectOutcome,
        inspectionNotes: inspectNotes || undefined,
      });
      if (res.success) {
        setSuccessMsg(
          inspectOutcome === 'PASSED'
            ? 'Item passed inspection. Refund has been automatically queued!'
            : 'Item failed inspection. Return closed without refund.'
        );
        setInspectModalOpen(false);
        setSelectedReturn(null);
        await fetchReturns();
      } else {
        setError(res.message || 'Failed to record inspection');
      }
    } catch (err) {
      setError(err?.message || 'Failed to record inspection');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      REQUESTED: { bg: '#fef3c7', text: '#b45309', label: 'Requested' },
      APPROVED: { bg: '#e0e7ff', text: '#3730a3', label: 'Approved' },
      PICKUP_SCHEDULED: { bg: '#e0f2fe', text: '#0369a1', label: 'Pickup Scheduled' },
      RECEIVED: { bg: '#f3e8ff', text: '#6b21a8', label: 'Received' },
      INSPECTED: { bg: '#dcfce7', text: '#15803d', label: 'Inspected' },
      REFUNDED: { bg: '#d1fae5', text: '#065f46', label: 'Refunded' },
      REJECTED: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
      CANCELLED: { bg: '#f1f5f9', text: '#475569', label: 'Cancelled' },
    };
    const c = config[status] || { bg: '#f1f5f9', text: '#475569', label: status };
    return (
      <span
        style={{
          backgroundColor: c.bg,
          color: c.text,
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={22} color="var(--teal)" /> Returns & Item Claims
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            Review customer return requests, update return pickup, and inspect returned inventory for your sub-orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              color: '#0f172a',
            }}
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">Requested (Needs Review)</option>
            <option value="APPROVED">Approved</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="RECEIVED">Received</option>
            <option value="INSPECTED">Inspected</option>
            <option value="REFUNDED">Refunded</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={fetchReturns}
            disabled={loading}
            style={{
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#475569',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Returns Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            Loading return requests...
          </div>
        ) : returns.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <RotateCcw size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Return Requests Found</h4>
            <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
              When customers submit returns for items fulfilled by your store, they will appear here for review and inspection.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Return ID / Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Item & Qty</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer Reason</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Est. Refund</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{ret.returnNumber || ret._id.substring(0, 8)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Sub-order: {ret.sellerOrderId?.subOrderNumber || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{ret.itemSnapshot?.name || 'Item'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Returning: <strong style={{ color: '#0f172a' }}>{ret.quantity} unit(s)</strong>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', verticalAlign: 'top', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{ret.customerReason}</div>
                      {ret.customerDescription && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', wordBreak: 'break-word' }}>
                          "{ret.customerDescription}"
                        </div>
                      )}
                      {ret.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                          Rejection: {ret.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: 'var(--teal)' }}>
                        ₹{(ret.calculatedRefundAmount || (ret.calculatedRefundAmountPaise ? ret.calculatedRefundAmountPaise / 100 : 0)).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Commission Rev: ₹{(ret.commissionReversalPaise ? (ret.commissionReversalPaise / 100).toFixed(2) : '0.00')}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                      <div>{getStatusBadge(ret.status)}</div>
                      {ret.inspectionOutcome && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
                          Insp: <strong>{ret.inspectionOutcome}</strong>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Review Action if REQUESTED */}
                        {ret.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReturn(ret);
                                setReviewAction('APPROVE');
                              }}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReturn(ret);
                                setReviewAction('REJECT');
                              }}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Pickup Schedule Action if APPROVED */}
                        {ret.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedReturn(ret);
                              setPickupModalOpen(true);
                            }}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Truck size={12} /> Schedule Pickup
                          </button>
                        )}

                        {/* Inspection Action if PICKUP_SCHEDULED or RECEIVED */}
                        {(ret.status === 'PICKUP_SCHEDULED' || ret.status === 'RECEIVED') && (
                          <button
                            onClick={() => {
                              setSelectedReturn(ret);
                              setInspectOutcome('PASSED');
                              setInspectModalOpen(true);
                            }}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#8b5cf6',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckSquare size={12} /> Inspect Item
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal (Approve / Reject) */}
      {selectedReturn && reviewAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              {reviewAction === 'APPROVE' ? 'Approve Return Request' : 'Reject Return Request'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Item: <strong>{selectedReturn.itemSnapshot?.name}</strong> (Qty: {selectedReturn.quantity})
            </p>

            {reviewAction === 'REJECT' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Rejection Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this return request is rejected (e.g. seal broken, missing original tags)..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {reviewAction === 'APPROVE' && (
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '16px' }}>
                Approving this return allows the customer to send back the item or schedules courier pickup. A refund will only be initiated once the returned item is inspected and passes quality check.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(null);
                  setReviewAction(null);
                }}
                disabled={submittingAction}
                style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={submittingAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: reviewAction === 'APPROVE' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submittingAction ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingAction ? 'Submitting...' : `Confirm ${reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Schedule Modal */}
      {selectedReturn && pickupModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Schedule Return Pickup
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Set estimated pickup date or courier partner for return #{selectedReturn.returnNumber || selectedReturn._id.substring(0, 8)}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Logistics / Fleet Carrier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pick2Mart Fleet or Delhivery"
                  value={pickupPartner}
                  onChange={(e) => setPickupPartner(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Pickup Notes / AWB
                </label>
                <input
                  type="text"
                  placeholder="Optional tracking or dispatch note"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(null);
                  setPickupModalOpen(false);
                }}
                disabled={submittingAction}
                style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePickupSubmit}
                disabled={submittingAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submittingAction ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingAction ? 'Saving...' : 'Save Pickup Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedReturn && inspectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Record Quality Inspection
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Confirm condition of received item <strong>{selectedReturn.itemSnapshot?.name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Inspection Outcome <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={inspectOutcome}
                  onChange={(e) => setInspectOutcome(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                >
                  <option value="PASSED">Passed (Item in acceptable condition — Trigger Refund)</option>
                  <option value="FAILED_DAMAGED_BY_USER">Failed (Item damaged by customer — Reject Refund)</option>
                  <option value="FAILED_INCOMPLETE">Failed (Missing components / parts — Reject Refund)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Inspection Notes
                </label>
                <textarea
                  rows={3}
                  value={inspectNotes}
                  onChange={(e) => setInspectNotes(e.target.value)}
                  placeholder="Remarks on packaging, tags, or item wear..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(null);
                  setInspectModalOpen(false);
                }}
                disabled={submittingAction}
                style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInspectSubmit}
                disabled={submittingAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submittingAction ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingAction ? 'Submitting...' : 'Complete Inspection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
