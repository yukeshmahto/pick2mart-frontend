'use client';
import React, { useState, useEffect } from 'react';
import { returnsService } from '../../../services/returns.service';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Search,
  RefreshCw,
  Calendar,
  Settings,
  CheckSquare,
  FileText
} from 'lucide-react';
import styles from '../../../app/admin/page.module.css';

export default function AdminReturnsTab() {
  const [activeSubTab, setActiveSubTab] = useState('returns'); // 'returns', 'refunds', 'policy'
  const [returns, setReturns] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Policy Form State
  const [policyDays, setPolicyDays] = useState(7);
  const [policyActive, setPolicyActive] = useState(true);
  const [policyDesc, setPolicyDesc] = useState('');
  const [policySaving, setPolicySaving] = useState(false);

  // Review Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'APPROVE' | 'REJECT'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Pickup Modal
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupCarrier, setPickupCarrier] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  // Inspection Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectOutcome, setInspectOutcome] = useState('PASSED');
  const [inspectNotes, setInspectNotes] = useState('');

  // Refund Settlement Modal
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundMethod, setRefundMethod] = useState('ORIGINAL_PAYMENT_GATEWAY');
  const [refundTxRef, setRefundTxRef] = useState('');
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0]);
  const [settlementNotes, setSettlementNotes] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await returnsService.getAdminReturns(statusFilter);
      if (res.success) {
        setReturns(res.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await returnsService.getAdminRefunds(statusFilter, originFilter);
      if (res.success) {
        setRefunds(res.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await returnsService.getReturnPolicy();
      if (res.success && res.data) {
        setPolicy(res.data);
        setPolicyDays(res.data.returnWindowDays || 7);
        setPolicyActive(res.data.isActive ?? true);
        setPolicyDesc(res.data.policyDescription || '');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch return policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'returns') {
      fetchReturns();
    } else if (activeSubTab === 'refunds') {
      fetchRefunds();
    } else if (activeSubTab === 'policy') {
      fetchPolicy();
    }
  }, [activeSubTab, statusFilter, originFilter]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setPolicySaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.updateReturnPolicy({
        returnWindowDays: Number(policyDays),
        isActive: policyActive,
        policyDescription: policyDesc,
      });
      if (res.success) {
        setSuccessMsg('Platform return policy updated successfully.');
        setPolicy(res.data);
      } else {
        setError(res.message || 'Failed to update policy');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update policy');
    } finally {
      setPolicySaving(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn || !reviewAction) return;
    if (reviewAction === 'REJECT' && !rejectionReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    setSubmittingAction(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.reviewAdminReturn(selectedReturn._id, {
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
      const res = await returnsService.scheduleAdminPickup(selectedReturn._id, {
        scheduledDate: pickupDate || undefined,
        carrierOrPartner: pickupCarrier || undefined,
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
      const res = await returnsService.inspectAdminReturn(selectedReturn._id, {
        outcome: inspectOutcome,
        inspectionNotes: inspectNotes || undefined,
      });
      if (res.success) {
        setSuccessMsg(
          inspectOutcome === 'PASSED'
            ? 'Item passed inspection. Refund record generated and ledger reverse queued!'
            : 'Item inspection recorded as failed.'
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

  const handleRecordRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRefund) return;
    if (!refundTxRef.trim()) {
      alert('Transaction / UTR Reference number is mandatory for manual refund audit trail.');
      return;
    }

    setSubmittingRefund(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await returnsService.recordRefundCompleted(selectedRefund._id, {
        paymentMethod: refundMethod,
        transactionReference: refundTxRef.trim(),
        paymentDate: refundDate || undefined,
        notes: settlementNotes || undefined,
      });
      if (res.success) {
        setSuccessMsg(`Refund of ₹${(selectedRefund.amountPaise / 100).toLocaleString('en-IN')} successfully settled with UTR: ${refundTxRef}.`);
        setSelectedRefund(null);
        setRefundTxRef('');
        setSettlementNotes('');
        await fetchRefunds();
      } else {
        setError(res.message || 'Failed to record refund');
      }
    } catch (err) {
      setError(err?.message || 'Failed to record refund');
    } finally {
      setSubmittingRefund(false);
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
      PROCESSING: { bg: '#fef3c7', text: '#b45309', label: 'Processing' },
      COMPLETED: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
      FAILED: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
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
      {/* Sub-navigation tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setActiveSubTab('returns'); setStatusFilter(''); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeSubTab === 'returns' ? 'var(--teal)' : '#f1f5f9',
              color: activeSubTab === 'returns' ? '#ffffff' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={16} /> Return Requests
          </button>

          <button
            onClick={() => { setActiveSubTab('refunds'); setStatusFilter(''); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeSubTab === 'refunds' ? 'var(--teal)' : '#f1f5f9',
              color: activeSubTab === 'refunds' ? '#ffffff' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <DollarSign size={16} /> Refunds & Settlement
          </button>

          <button
            onClick={() => { setActiveSubTab('policy'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeSubTab === 'policy' ? 'var(--teal)' : '#f1f5f9',
              color: activeSubTab === 'policy' ? '#ffffff' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Settings size={16} /> Return Policy Config
          </button>
        </div>

        <button
          onClick={() => {
            if (activeSubTab === 'returns') fetchReturns();
            else if (activeSubTab === 'refunds') fetchRefunds();
            else fetchPolicy();
          }}
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

      {/* TAB 1: RETURN REQUESTS */}
      {activeSubTab === 'returns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Showing {returns.length} customer return request(s)
            </span>
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
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                Loading returns...
              </div>
            ) : returns.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
                <RotateCcw size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Return Requests</h4>
                <p style={{ fontSize: '0.875rem' }}>Customer return requests will appear here for platform oversight and escalation.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Return ID / Date</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer / Seller</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Item & Reason</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Refund Amount</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret) => (
                      <tr key={ret._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ret.returnNumber || ret._id.substring(0, 8)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ret.customerId?.fullName || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ret.customerId?.email || ret.customerId?.mobile}</div>
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                            Seller: {ret.sellerId?.businessName || ret.sellerId?.fullName || 'Merchant'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top', maxWidth: '240px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {ret.itemSnapshot?.name} <span style={{ color: '#64748b' }}>(x{ret.quantity})</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                            Reason: <strong>{ret.customerReason}</strong>
                          </div>
                          {ret.customerDescription && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>"{ret.customerDescription}"</div>
                          )}
                          {ret.rejectionReason && (
                            <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                              Rejection: {ret.rejectionReason}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, color: 'var(--teal)' }}>
                            ₹{(ret.calculatedRefundAmount || (ret.calculatedRefundAmountPaise ? ret.calculatedRefundAmountPaise / 100 : 0)).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Comm Rev: ₹{(ret.commissionReversalPaise ? (ret.commissionReversalPaise / 100).toFixed(2) : '0.00')}
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
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            {ret.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedReturn(ret);
                                    setReviewAction('APPROVE');
                                  }}
                                  style={{
                                    padding: '5px 8px',
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
                                    padding: '5px 8px',
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

                            {ret.status === 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setSelectedReturn(ret);
                                  setPickupModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 8px',
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
                                <Truck size={12} /> Schedule
                              </button>
                            )}

                            {(ret.status === 'PICKUP_SCHEDULED' || ret.status === 'RECEIVED') && (
                              <button
                                onClick={() => {
                                  setSelectedReturn(ret);
                                  setInspectOutcome('PASSED');
                                  setInspectModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 8px',
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
                                <CheckSquare size={12} /> Inspect
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
        </div>
      )}

      {/* TAB 2: REFUNDS & MANUAL SETTLEMENT */}
      {activeSubTab === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Showing {refunds.length} refund transaction(s)
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                }}
              >
                <option value="">All Origins</option>
                <option value="ORDER_CANCELLATION">Order Cancellation</option>
                <option value="ITEM_RETURN">Item Return</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                }}
              >
                <option value="">All Statuses</option>
                <option value="REQUESTED">Requested / Needs Processing</option>
                <option value="APPROVED">Approved</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                Loading refunds...
              </div>
            ) : refunds.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
                <DollarSign size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Refunds Found</h4>
                <p style={{ fontSize: '0.875rem' }}>Refunds generated from cancellations or passed returns will appear here.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Refund ID / Origin</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Payment Method</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status / Reference</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((ref) => (
                      <tr key={ref._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ref.refundNumber || ref._id.substring(0, 8)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {ref.originType === 'ORDER_CANCELLATION' ? 'Order Cancellation' : 'Item Return'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ref.customerId?.fullName || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ref.customerId?.email || ref.customerId?.mobile}</div>
                          {ref.codBankDetails && (
                            <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                              A/C: {ref.codBankDetails.accountNumber} ({ref.codBankDetails.ifscCode})
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '1rem' }}>
                            ₹{(ref.amountPaise ? (ref.amountPaise / 100).toLocaleString('en-IN') : (ref.amount || 0).toLocaleString('en-IN'))}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ({ref.amountPaise} paise)
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{ref.paymentMethod || 'Manual'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Orig: {ref.originalPaymentMethod || 'Online'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                          <div>{getStatusBadge(ref.status)}</div>
                          {ref.transactionReference && (
                            <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600, marginTop: '4px' }}>
                              UTR: {ref.transactionReference}
                            </div>
                          )}
                          {ref.processedAt && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Paid: {new Date(ref.processedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                          {ref.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => {
                                setSelectedRefund(ref);
                                setRefundMethod(ref.originalPaymentMethod === 'COD' ? 'BANK_NEFT_IMPS' : 'ORIGINAL_PAYMENT_GATEWAY');
                                setRefundTxRef('');
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'var(--teal)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CreditCard size={13} /> Settle Refund
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RETURN POLICY CONFIG */}
      {activeSubTab === 'policy' && (
        <div style={{ maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Platform Return Window & Policy
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
            Configure default customer return duration and eligibility terms across all merchant stores.
          </p>

          <form onSubmit={handleUpdatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Return Window (Days from Delivery) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="90"
                required
                value={policyDays}
                onChange={(e) => setPolicyDays(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Returns requested after this duration will be rejected automatically.
              </span>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={policyActive}
                  onChange={(e) => setPolicyActive(e.target.checked)}
                />
                Enable Customer Returns Systemwide
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Public Policy Description & Terms
              </label>
              <textarea
                rows={4}
                value={policyDesc}
                onChange={(e) => setPolicyDesc(e.target.value)}
                placeholder="Items must be in original condition with tags and packaging intact..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={policySaving}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                backgroundColor: 'var(--teal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: policySaving ? 'not-allowed' : 'pointer',
              }}
            >
              {policySaving ? 'Saving...' : 'Save Policy Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Review Modal (Admin) */}
      {selectedReturn && reviewAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Admin: {reviewAction === 'APPROVE' ? 'Approve Return' : 'Reject Return'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Return #{selectedReturn.returnNumber || selectedReturn._id.substring(0, 8)}
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
                  placeholder="Explain reason for rejection..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
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
                {submittingAction ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Schedule Modal (Admin) */}
      {selectedReturn && pickupModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Schedule Return Pickup
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Assign return pickup date and logistics provider.
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
                  Carrier / Delivery Fleet
                </label>
                <input
                  type="text"
                  placeholder="e.g. In-house Fleet or External Courier"
                  value={pickupCarrier}
                  onChange={(e) => setPickupCarrier(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  AWB / Tracking Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional reference"
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
                {submittingAction ? 'Saving...' : 'Save Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal (Admin) */}
      {selectedReturn && inspectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Quality Inspection
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Inspect returned item: <strong>{selectedReturn.itemSnapshot?.name}</strong>
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
                  <option value="PASSED">Passed (Eligible for Full Refund)</option>
                  <option value="FAILED_DAMAGED_BY_USER">Failed (Customer Damage — No Refund)</option>
                  <option value="FAILED_INCOMPLETE">Failed (Missing Parts / Tags — No Refund)</option>
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
                  placeholder="Notes on packaging, condition..."
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

      {/* Manual Refund Settlement Modal (Admin) */}
      {selectedRefund && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Record Manual Refund Settlement
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
              Settle refund #{selectedRefund.refundNumber || selectedRefund._id.substring(0, 8)} of{' '}
              <strong style={{ color: 'var(--teal)' }}>
                ₹{((selectedRefund.amountPaise || 0) / 100).toLocaleString('en-IN')}
              </strong>
            </p>

            <form onSubmit={handleRecordRefundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Settlement Method <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                >
                  <option value="ORIGINAL_PAYMENT_GATEWAY">Original Gateway (Reversal Reference)</option>
                  <option value="BANK_NEFT_IMPS">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="UPI_MANUAL">UPI Transfer</option>
                  <option value="COD_REVERSAL">COD Cash / Payout Reversal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Transaction / UTR Reference <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR1234567890 or PG_REF_987654"
                  value={refundTxRef}
                  onChange={(e) => setRefundTxRef(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Settlement Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder="Auditable remarks for financial records..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRefund(null)}
                  disabled={submittingRefund}
                  style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--teal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: submittingRefund ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingRefund ? 'Recording...' : 'Record Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
