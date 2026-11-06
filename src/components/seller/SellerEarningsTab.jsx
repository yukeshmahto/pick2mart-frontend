'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Building,
  CreditCard,
  FileText,
  X,
  ChevronRight
} from 'lucide-react';
import { earningsService } from '../../services/earnings.service';
import styles from '../../app/seller/page.module.css';

export default function SellerEarningsTab() {
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, ledger, payouts

  // Filters
  const [ledgerFilterStatus, setLedgerFilterStatus] = useState('');
  const [payoutFilterStatus, setPayoutFilterStatus] = useState('');

  // Payout Request Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    panNumber: '',
    notes: '',
  });
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [payoutErrorMsg, setPayoutErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ledgRes, payRes] = await Promise.all([
        earningsService.getSellerSummary(),
        earningsService.getSellerLedger({ status: ledgerFilterStatus }),
        earningsService.getSellerPayouts({ status: payoutFilterStatus }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (ledgRes.success) setLedger(ledgRes.data.entries || []);
      if (payRes.success) setPayouts(payRes.data.payouts || []);
    } catch (err) {
      console.error('Failed to load seller earnings data:', err);
      setError(err.message || 'Failed to load earnings information.');
    } finally {
      setLoading(false);
    }
  }, [ledgerFilterStatus, payoutFilterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setPayoutSubmitting(true);
    setPayoutErrorMsg('');
    setPayoutSuccessMsg('');

    const requestedAmount = parseFloat(payoutForm.amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setPayoutErrorMsg('Please enter a valid payout amount.');
      setPayoutSubmitting(false);
      return;
    }

    if (summary && requestedAmount > summary.availablePayoutBalance) {
      setPayoutErrorMsg(
        `Requested amount exceeds your available payout balance of ₹${summary.availablePayoutBalance.toFixed(2)}.`
      );
      setPayoutSubmitting(false);
      return;
    }

    try {
      const res = await earningsService.requestPayout({
        ...payoutForm,
        amount: requestedAmount,
      });

      if (res.success) {
        setPayoutSuccessMsg('Payout request submitted successfully! Our finance team will review it.');
        setShowPayoutModal(false);
        setPayoutForm({
          amount: '',
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          panNumber: '',
          notes: '',
        });
        await loadData();
      } else {
        setPayoutErrorMsg(res.message || 'Failed to submit payout request.');
      }
    } catch (err) {
      setPayoutErrorMsg(err.message || 'Error submitting payout request.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ELIGIBLE':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>ELIGIBLE</span>;
      case 'PENDING':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>PENDING</span>;
      case 'HELD':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fed7aa', color: '#9a3412' }}>HELD (COD)</span>;
      case 'PAID':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>PAID OUT</span>;
      case 'REVERSED':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>REVERSED</span>;
      case 'ADJUSTED':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>ADJUSTED</span>;
      case 'REQUESTED':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#dbeafe', color: '#1e40af' }}>APPROVED</span>;
      case 'REJECTED':
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>REJECTED</span>;
      default:
        return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#334155' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Balance CTA */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Available Payout Balance
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
            ₹{summary ? summary.availablePayoutBalance.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
            Eligible: ₹{summary?.eligibleEarnings?.toFixed(2) || '0.00'} | Locked in Pending Requests: ₹{summary?.lockedInPayouts?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={loadData}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={!summary || summary.availablePayoutBalance <= 0}
            style={{
              background: summary && summary.availablePayoutBalance > 0 ? '#0284c7' : '#475569',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: summary && summary.availablePayoutBalance > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            <ArrowUpRight size={18} /> Request Payout
          </button>
        </div>
      </div>

      {payoutSuccessMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <CheckCircle size={18} /> {payoutSuccessMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>GROSS SALES</span>
            <DollarSign size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            ₹{summary?.grossSales?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Net Item Sale: ₹{summary?.netItemSales?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>COMMISSION DEDUCTED</span>
            <TrendingUp size={16} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e11d48', marginTop: '6px' }}>
            ₹{summary?.commissionDeducted?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Snapshot commission rate
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>PENDING EARNINGS</span>
            <Clock size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>
            ₹{summary?.pendingEarnings?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Pending delivery fulfillment
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>HELD (COD CASH)</span>
            <Clock size={16} color="#c2410c" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c2410c', marginTop: '6px' }}>
            ₹{summary?.heldEarnings?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Awaiting courier cash remittance
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL PAID OUT</span>
            <CheckCircle size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            ₹{summary?.totalPaidOut?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Disbursed to your bank
          </div>
        </div>
      </div>

      {/* Sub Tabs: Ledger History vs Payout Requests */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveSubTab('overview')}
            style={{
              padding: '14px 20px',
              border: 'none',
              background: activeSubTab === 'overview' ? '#ffffff' : 'transparent',
              borderBottom: activeSubTab === 'overview' ? '2px solid #0284c7' : 'none',
              color: activeSubTab === 'overview' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={16} /> Order-wise Earnings Ledger ({ledger.length})
          </button>

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
            <CreditCard size={16} /> Payout Requests & History ({payouts.length})
          </button>
        </div>

        {/* Tab 1: Order-wise Ledger */}
        {activeSubTab === 'overview' && (
          <div style={{ padding: '1.25rem' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="#64748b" />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                <select
                  value={ledgerFilterStatus}
                  onChange={(e) => setLedgerFilterStatus(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#334155',
                    outline: 'none',
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING (In Progress)</option>
                  <option value="ELIGIBLE">ELIGIBLE (Ready for Payout)</option>
                  <option value="HELD">HELD (COD Remittance Pending)</option>
                  <option value="PAID">PAID</option>
                  <option value="REVERSED">REVERSED (Cancelled)</option>
                  <option value="ADJUSTED">ADJUSTED</option>
                </select>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Calculation basis: Commission is applied strictly to Net Item Value (Gross minus Discounts).
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading earnings records...</div>
            ) : ledger.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <FileText size={32} style={{ marginBottom: '8px' }} />
                <div>No earnings entries recorded yet for the selected filter.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Sub-Order #</th>
                      <th style={{ padding: '10px 12px' }}>Order #</th>
                      <th style={{ padding: '10px 12px' }}>Gross Sale</th>
                      <th style={{ padding: '10px 12px' }}>Commission</th>
                      <th style={{ padding: '10px 12px' }}>Net Earnings</th>
                      <th style={{ padding: '10px 12px' }}>Payment</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0284c7' }}>{entry.sellerOrderNumber || '-'}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{entry.orderNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{entry.grossAmount.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#e11d48' }}>
                          ₹{entry.commissionAmount.toFixed(2)}{' '}
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>({entry.commissionRate}%)</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: entry.netEarnings >= 0 ? '#16a34a' : '#dc2626' }}>
                          ₹{entry.netEarnings.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                            {entry.paymentMethod} {entry.paymentMethod === 'COD' && (entry.isRemitted ? '✓ Remitted' : '⏳ Awaiting')}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(entry.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payout Requests */}
        {activeSubTab === 'payouts' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="#64748b" />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Filter:</span>
                <select
                  value={payoutFilterStatus}
                  onChange={(e) => setPayoutFilterStatus(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#334155',
                    outline: 'none',
                  }}
                >
                  <option value="">All Payouts</option>
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PAID">PAID</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={!summary || summary.availablePayoutBalance <= 0}
                style={{
                  background: summary && summary.availablePayoutBalance > 0 ? '#0284c7' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  cursor: summary && summary.availablePayoutBalance > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowUpRight size={16} /> New Payout Request
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading payout requests...</div>
            ) : payouts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <CreditCard size={32} style={{ marginBottom: '8px' }} />
                <div>No payout requests found.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px' }}>Payout #</th>
                      <th style={{ padding: '10px 12px' }}>Requested Date</th>
                      <th style={{ padding: '10px 12px' }}>Amount</th>
                      <th style={{ padding: '10px 12px' }}>Bank Account</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Payment Reference / UTR</th>
                      <th style={{ padding: '10px 12px' }}>Notes / Rejection Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0284c7' }}>{p.payoutNumber}</td>
                        <td style={{ padding: '12px' }}>{new Date(p.requestedAt || p.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontWeight: 700, fontSize: '0.95rem' }}>₹{p.requestedAmount.toFixed(2)}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{p.bankDetails?.bankName || 'Bank'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            A/C: •••• {p.bankDetails?.accountNumber?.slice(-4)} | IFSC: {p.bankDetails?.ifscCode}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(p.status)}</td>
                        <td style={{ padding: '12px', color: '#0f172a', fontWeight: 600 }}>
                          {p.transactionReference ? (
                            <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                              {p.transactionReference}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', color: p.rejectionReason ? '#dc2626' : '#64748b', fontSize: '0.8rem' }}>
                          {p.rejectionReason || p.notes || '-'}
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

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Request Earnings Payout</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Available Balance: <strong style={{ color: '#0284c7' }}>₹{summary?.availablePayoutBalance?.toFixed(2) || '0.00'}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {payoutErrorMsg && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {payoutErrorMsg}
              </div>
            )}

            <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Payout Amount (₹)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={summary?.availablePayoutBalance || 0}
                  required
                  placeholder={`Max ₹${summary?.availablePayoutBalance?.toFixed(2) || '0.00'}`}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Account Holder Name*
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per bank passbook"
                  value={payoutForm.accountHolderName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Bank Account Number*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Account Number"
                    value={payoutForm.accountNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    IFSC Code*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={payoutForm.ifscCode}
                    onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={payoutForm.bankName}
                    onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={payoutForm.panNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, panNumber: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional note for finance team"
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: payoutSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {payoutSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
