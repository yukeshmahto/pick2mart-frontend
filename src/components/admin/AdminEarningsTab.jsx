'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Plus,
  Edit2,
  Check,
  X,
  CreditCard,
  FileText,
  AlertTriangle,
  Building,
  UserCheck
} from 'lucide-react';
import { earningsService } from '../../services/earnings.service';
import { adminService } from '../../services/admin.service';
import styles from '../../app/admin/page.module.css';

export default function AdminEarningsTab() {
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [rules, setRules] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('payouts'); // 'payouts', 'rules', 'ledger'

  // Filter states
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterLedgerStatus, setFilterLedgerStatus] = useState('');
  const [filterPayoutStatus, setFilterPayoutStatus] = useState('');

  // Modals & Forms
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    scope: 'GLOBAL', // 'GLOBAL' or 'SELLER'
    sellerId: '',
    ratePercentage: '',
    isActive: true,
    effectiveFrom: '',
    notes: '',
  });

  const [reviewModalData, setReviewModalData] = useState(null); // { payout, action: 'APPROVE' | 'REJECT' }
  const [reviewReason, setReviewReason] = useState('');

  const [recordPaidModalData, setRecordPaidModalData] = useState(null); // payout
  const [paidForm, setPaidForm] = useState({
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'NEFT_RTGS',
    notes: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, ledgRes, rulesRes, payRes, sellersRes] = await Promise.all([
        earningsService.getAdminSummary(),
        earningsService.getAdminLedger({ sellerId: filterSellerId, status: filterLedgerStatus }),
        earningsService.getCommissionRules(),
        earningsService.getAdminPayouts({ sellerId: filterSellerId, status: filterPayoutStatus }),
        adminService.getSellers(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (ledgRes.success) setLedger(ledgRes.data.entries || []);
      if (rulesRes.success) setRules(rulesRes.data || []);
      if (payRes.success) setPayouts(payRes.data.payouts || []);
      if (sellersRes.success) setSellers(sellersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin earnings data:', err);
      setFeedbackMsg({ type: 'error', text: err.message || 'Error fetching earnings data.' });
    } finally {
      setLoading(false);
    }
  }, [filterSellerId, filterLedgerStatus, filterPayoutStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create Rule
  const handleCreateRule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: ruleForm.name.trim(),
        scope: ruleForm.scope,
        ratePercentage: parseFloat(ruleForm.ratePercentage),
        isActive: ruleForm.isActive,
        notes: ruleForm.notes,
      };
      if (ruleForm.scope === 'SELLER' && ruleForm.sellerId) {
        payload.sellerId = ruleForm.sellerId;
      }
      if (ruleForm.effectiveFrom) {
        payload.effectiveFrom = ruleForm.effectiveFrom;
      }

      const res = await earningsService.createCommissionRule(payload);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'Commission rule created successfully!' });
        setShowRuleModal(false);
        setRuleForm({
          name: '',
          scope: 'GLOBAL',
          sellerId: '',
          ratePercentage: '',
          isActive: true,
          effectiveFrom: '',
          notes: '',
        });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to create rule.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error creating rule.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Review Payout (APPROVE / REJECT)
  const handleReviewPayout = async (e) => {
    e.preventDefault();
    if (!reviewModalData) return;
    setActionLoading(true);
    try {
      const res = await earningsService.reviewPayout(reviewModalData.payout._id, {
        action: reviewModalData.action,
        reason: reviewReason,
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Payout request marked as ${reviewModalData.action} successfully!`,
        });
        setReviewModalData(null);
        setReviewReason('');
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Action failed.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error reviewing payout.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Record Payout Paid
  const handleRecordPaid = async (e) => {
    e.preventDefault();
    if (!recordPaidModalData) return;
    setActionLoading(true);
    try {
      const res = await earningsService.recordPayoutPaid(recordPaidModalData._id, paidForm);

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Payout ${recordPaidModalData.payoutNumber} recorded as PAID with reference ${paidForm.transactionReference}!`,
        });
        setRecordPaidModalData(null);
        setPaidForm({
          transactionReference: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'NEFT_RTGS',
          notes: '',
        });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to record payment.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error recording payout as paid.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm COD Cash Remittance
  const handleConfirmCodRemit = async (sellerOrderId) => {
    if (!confirm('Confirm that courier has remitted the cash for this delivered COD order? This will transition seller earnings from HELD to ELIGIBLE.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await earningsService.confirmCodRemittance(sellerOrderId);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'COD cash remittance confirmed. Earnings are now ELIGIBLE for payout!' });
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to confirm remittance.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error confirming remittance.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ELIGIBLE':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>ELIGIBLE</span>;
      case 'PENDING':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>PENDING</span>;
      case 'HELD':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fed7aa', color: '#9a3412' }}>HELD (COD)</span>;
      case 'PAID':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>PAID</span>;
      case 'REVERSED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>REVERSED</span>;
      case 'ADJUSTED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>ADJUSTED</span>;
      case 'REQUESTED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>PENDING REVIEW</span>;
      case 'APPROVED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#dbeafe', color: '#1e40af' }}>APPROVED</span>;
      case 'REJECTED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>REJECTED</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#334155' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Feedback */}
      {feedbackMsg.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.9rem',
          }}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg({ type: '', text: '' })}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>PLATFORM GMV</span>
            <DollarSign size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            ₹{summary?.totalGrossSales?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Gross multi-vendor sales
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL COMMISSION EARNED</span>
            <TrendingUp size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            ₹{summary?.totalCommissionEarned?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Net platform revenue
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>PENDING SETTLEMENT</span>
            <Clock size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>
            ₹{summary?.totalPendingEarnings?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Orders in fulfillment
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>HELD (COD CASH)</span>
            <AlertTriangle size={16} color="#c2410c" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c2410c', marginTop: '6px' }}>
            ₹{summary?.totalHeldEarnings?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Awaiting courier remittance
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL DISBURSED</span>
            <CheckCircle size={16} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f46e5', marginTop: '6px' }}>
            ₹{summary?.totalPaidOut?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Completed manual payouts
          </div>
        </div>
      </div>

      {/* Main Card with Navigation Sub-tabs */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setActiveSubTab('payouts')}
              style={{
                padding: '14px 20px',
                border: 'none',
                background: activeSubTab === 'payouts' ? '#ffffff' : 'transparent',
                borderBottom: activeSubTab === 'payouts' ? '2px solid #0284c7' : 'none',
                color: activeSubTab === 'payouts' ? '#0284c7' : '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CreditCard size={16} /> Payout Requests Review ({payouts.length})
            </button>

            <button
              onClick={() => setActiveSubTab('rules')}
              style={{
                padding: '14px 20px',
                border: 'none',
                background: activeSubTab === 'rules' ? '#ffffff' : 'transparent',
                borderBottom: activeSubTab === 'rules' ? '2px solid #0284c7' : 'none',
                color: activeSubTab === 'rules' ? '#0284c7' : '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Percent size={16} /> Commission Rules ({rules.length})
            </button>

            <button
              onClick={() => setActiveSubTab('ledger')}
              style={{
                padding: '14px 20px',
                border: 'none',
                background: activeSubTab === 'ledger' ? '#ffffff' : 'transparent',
                borderBottom: activeSubTab === 'ledger' ? '2px solid #0284c7' : 'none',
                color: activeSubTab === 'ledger' ? '#0284c7' : '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={16} /> Platform Seller Ledger ({ledger.length})
            </button>
          </div>

          <div style={{ padding: '0 1rem' }}>
            <button
              onClick={loadData}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* SUBTAB 1: Payout Requests Queue */}
        {activeSubTab === 'payouts' && (
          <div style={{ padding: '1.25rem' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
                <select
                  value={filterPayoutStatus}
                  onChange={(e) => setFilterPayoutStatus(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">All Payout Requests</option>
                  <option value="REQUESTED">REQUESTED (Pending Review)</option>
                  <option value="APPROVED">APPROVED (Ready for Bank Disbursement)</option>
                  <option value="PAID">PAID (Recorded)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <select
                  value={filterSellerId}
                  onChange={(e) => setFilterSellerId(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">All Sellers</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s.userId?._id || s.userId || s._id}>
                      {s.businessName || s.userId?.fullName || 'Seller'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Audited manual payout workflow. Record bank UTR after executing external disbursement.
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading payout requests...</div>
            ) : payouts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No payout requests found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px' }}>Payout #</th>
                      <th style={{ padding: '10px 12px' }}>Seller</th>
                      <th style={{ padding: '10px 12px' }}>Amount</th>
                      <th style={{ padding: '10px 12px' }}>Bank Details</th>
                      <th style={{ padding: '10px 12px' }}>Requested Date</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Disbursement Reference</th>
                      <th style={{ padding: '10px 12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0284c7' }}>{p.payoutNumber}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{p.sellerId?.fullName || 'Seller'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{p.sellerId?.email}</div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, fontSize: '0.95rem' }}>₹{p.requestedAmount.toFixed(2)}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{p.bankDetails?.bankName || 'Bank'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            A/C: {p.bankDetails?.accountNumber} | IFSC: {p.bankDetails?.ifscCode}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Holder: {p.bankDetails?.accountHolderName}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{new Date(p.requestedAt || p.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(p.status)}</td>
                        <td style={{ padding: '12px' }}>
                          {p.transactionReference ? (
                            <div>
                              <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                                UTR: {p.transactionReference}
                              </span>
                              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                Paid on {new Date(p.paidAt).toLocaleDateString()}
                              </div>
                            </div>
                          ) : p.rejectionReason ? (
                            <span style={{ color: '#dc2626', fontSize: '11px' }}>Rejected: {p.rejectionReason}</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {p.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() => {
                                    setReviewModalData({ payout: p, action: 'APPROVE' });
                                    setReviewReason('');
                                  }}
                                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewModalData({ payout: p, action: 'REJECT' });
                                    setReviewReason('');
                                  }}
                                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {p.status === 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setRecordPaidModalData(p);
                                  setPaidForm({
                                    transactionReference: '',
                                    paymentDate: new Date().toISOString().split('T')[0],
                                    paymentMethod: 'NEFT_RTGS',
                                    notes: '',
                                  });
                                }}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Record Paid
                              </button>
                            )}

                            {p.status === 'PAID' && (
                              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Completed</span>
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
        )}

        {/* SUBTAB 2: Commission Rules Configuration */}
        {activeSubTab === 'rules' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Configured Commission Rules</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Commission rate snapshot is stored on order creation. Rule changes never affect historical orders.
                </p>
              </div>

              <button
                onClick={() => setShowRuleModal(true)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} /> New Commission Rule
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading commission rules...</div>
            ) : rules.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                No commission rules configured. System fallback of 10.0% applies.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px' }}>Rule Name</th>
                      <th style={{ padding: '10px 12px' }}>Scope</th>
                      <th style={{ padding: '10px 12px' }}>Seller Target</th>
                      <th style={{ padding: '10px 12px' }}>Rate (%)</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Effective From</th>
                      <th style={{ padding: '10px 12px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>{rule.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              background: rule.scope === 'GLOBAL' ? '#e0f2fe' : '#fef3c7',
                              color: rule.scope === 'GLOBAL' ? '#0369a1' : '#92400e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          >
                            {rule.scope}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#475569' }}>
                          {rule.sellerId ? (
                            <div>
                              <strong>{rule.sellerId?.fullName || 'Seller'}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{rule.sellerId?.email}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>All Sellers (Default)</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 800, fontSize: '1rem', color: '#0284c7' }}>
                          {rule.ratePercentage}%
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              background: rule.isActive ? '#dcfce7' : '#fee2e2',
                              color: rule.isActive ? '#166534' : '#991b1b',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>
                          {new Date(rule.effectiveFrom).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>{rule.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: Platform Seller Ledger */}
        {activeSubTab === 'ledger' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Filter:</span>
                <select
                  value={filterLedgerStatus}
                  onChange={(e) => setFilterLedgerStatus(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ELIGIBLE">ELIGIBLE</option>
                  <option value="HELD">HELD (COD Remittance Pending)</option>
                  <option value="PAID">PAID</option>
                  <option value="REVERSED">REVERSED</option>
                  <option value="ADJUSTED">ADJUSTED</option>
                </select>

                <select
                  value={filterSellerId}
                  onChange={(e) => setFilterSellerId(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">All Sellers</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s.userId?._id || s.userId || s._id}>
                      {s.businessName || s.userId?.fullName || 'Seller'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing all audited seller earnings records.
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading ledger entries...</div>
            ) : ledger.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No ledger entries found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Seller</th>
                      <th style={{ padding: '10px 12px' }}>Sub-Order #</th>
                      <th style={{ padding: '10px 12px' }}>Order #</th>
                      <th style={{ padding: '10px 12px' }}>Gross</th>
                      <th style={{ padding: '10px 12px' }}>Commission</th>
                      <th style={{ padding: '10px 12px' }}>Net Earnings</th>
                      <th style={{ padding: '10px 12px' }}>Payment Method</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{entry.sellerId?.fullName || 'Seller'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{entry.sellerId?.email}</div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0284c7' }}>{entry.sellerOrderNumber || '-'}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{entry.orderNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{entry.grossAmount.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#e11d48', fontWeight: 600 }}>
                          ₹{entry.commissionAmount.toFixed(2)}{' '}
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>({entry.commissionRate}%)</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: entry.netEarnings >= 0 ? '#16a34a' : '#dc2626' }}>
                          ₹{entry.netEarnings.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>
                            {entry.paymentMethod} {entry.paymentMethod === 'COD' && (entry.isRemitted ? '✓ Remitted' : '⏳ Pending')}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(entry.status)}</td>
                        <td style={{ padding: '12px' }}>
                          {entry.status === 'HELD' && entry.paymentMethod === 'COD' && !entry.isRemitted && (
                            <button
                              onClick={() => handleConfirmCodRemit(entry.sellerOrderId?._id || entry.sellerOrderId)}
                              style={{
                                background: '#f97316',
                                color: '#ffffff',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Confirm courier remitted cash to Pick2Mart"
                            >
                              Confirm Remittance
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Create Commission Rule */}
      {showRuleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create Commission Rule</h3>
              <button onClick={() => setShowRuleModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Rule Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Global 10% or Premium Seller 8%"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Scope*</label>
                  <select
                    value={ruleForm.scope}
                    onChange={(e) => setRuleForm({ ...ruleForm, scope: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="GLOBAL">GLOBAL (All Sellers)</option>
                    <option value="SELLER">SELLER Specific (Override)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Commission Rate (%)*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g. 10.0"
                    value={ruleForm.ratePercentage}
                    onChange={(e) => setRuleForm({ ...ruleForm, ratePercentage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {ruleForm.scope === 'SELLER' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Select Target Seller*</label>
                  <select
                    required
                    value={ruleForm.sellerId}
                    onChange={(e) => setRuleForm({ ...ruleForm, sellerId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="">-- Choose Seller --</option>
                    {sellers.map((s) => (
                      <option key={s._id} value={s.userId?._id || s.userId || s._id}>
                        {s.businessName} ({s.userId?.fullName || s.userId?.email || 'Seller'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Internal Notes</label>
                <input
                  type="text"
                  placeholder="Reason or policy reference"
                  value={ruleForm.notes}
                  onChange={(e) => setRuleForm({ ...ruleForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Review Payout (APPROVE / REJECT) */}
      {reviewModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {reviewModalData.action === 'APPROVE' ? 'Approve Payout Request' : 'Reject Payout Request'}
              </h3>
              <button onClick={() => setReviewModalData(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>Payout #: <strong>{reviewModalData.payout.payoutNumber}</strong></div>
              <div>Amount: <strong style={{ color: '#0284c7', fontSize: '1rem' }}>₹{reviewModalData.payout.requestedAmount.toFixed(2)}</strong></div>
              <div>Bank: {reviewModalData.payout.bankDetails?.bankName} (A/C: {reviewModalData.payout.bankDetails?.accountNumber})</div>
            </div>

            <form onSubmit={handleReviewPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {reviewModalData.action === 'REJECT' ? 'Rejection Reason*' : 'Approval Notes (Optional)'}
                </label>
                <textarea
                  required={reviewModalData.action === 'REJECT'}
                  rows="3"
                  placeholder={reviewModalData.action === 'REJECT' ? 'Specify reason for seller rejection audit...' : 'Internal notes...'}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: reviewModalData.action === 'APPROVE' ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading ? 'Processing...' : `Confirm ${reviewModalData.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Record Manual Payout Paid */}
      {recordPaidModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Record Manual Payout as PAID</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Audited record: Only mark as paid after bank transfer is complete.
                </p>
              </div>
              <button onClick={() => setRecordPaidModalData(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>Payout #: <strong>{recordPaidModalData.payoutNumber}</strong></div>
              <div>Amount to Disburse: <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>₹{recordPaidModalData.requestedAmount.toFixed(2)}</strong></div>
              <div>Target Bank: <strong>{recordPaidModalData.bankDetails?.bankName}</strong> (A/C: {recordPaidModalData.bankDetails?.accountNumber}, IFSC: {recordPaidModalData.bankDetails?.ifscCode})</div>
            </div>

            <form onSubmit={handleRecordPaid} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Bank UTR / Transaction Reference ID*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR123456789012 or CMSREF998"
                  value={paidForm.transactionReference}
                  onChange={(e) => setPaidForm({ ...paidForm, transactionReference: e.target.value.trim() })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Payment Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={paidForm.paymentDate}
                    onChange={(e) => setPaidForm({ ...paidForm, paymentDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Disbursement Mode*
                  </label>
                  <select
                    value={paidForm.paymentMethod}
                    onChange={(e) => setPaidForm({ ...paidForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="NEFT_RTGS">NEFT / RTGS</option>
                    <option value="IMPS">IMPS Instant Transfer</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="MANUAL_BANK_TRANSFER">Manual Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Payment Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="Optional internal bank notes"
                  value={paidForm.notes}
                  onChange={(e) => setPaidForm({ ...paidForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setRecordPaidModalData(null)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {actionLoading ? 'Recording...' : 'Record as PAID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
