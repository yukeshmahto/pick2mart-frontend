'use client';
import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../../services/newsletter.service';
import { Mail, RefreshCw, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Search, UserX, Sliders } from 'lucide-react';
import styles from '../../../app/admin/page.module.css';

export default function NewsletterTab({ onNavigateToSettings }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [page, limit, statusFilter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await newsletterService.getSubscribers(params);
      if (res.success) {
        setSubscribers(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setError(res.message || 'Failed to fetch subscribers');
      }
    } catch (err) {
      setError(err.message || 'Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleUnsubscribe = async (email) => {
    if (window.confirm(`Are you sure you want to unsubscribe ${email}?`)) {
      try {
        await newsletterService.unsubscribe(email);
        setSuccessMsg(`Unsubscribed ${email}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchSubscribers();
      } catch (err) {
        alert(err.message || 'Failed to unsubscribe');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={22} color="var(--orange, #f97316)" /> Newsletter Subscribers & VIP Leads
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Audience captured via the homepage discount banner. Filter, search, and manage subscription statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer' }}
            >
              <Search size={15} />
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>

          <button 
            type="button"
            onClick={fetchSubscribers} 
            title="Refresh"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>

          {onNavigateToSettings && (
            <button
              type="button"
              onClick={() => onNavigateToSettings('newsletter')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <Sliders size={15} /> Configure Banner & App Offer
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading subscriber records...</div>
          </div>
        ) : subscribers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Mail size={44} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>No subscribers found</h3>
            <p style={{ fontSize: '0.9rem' }}>Users submitting their email in the homepage newsletter banner will appear here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Status</th>
                <th>Coupon Code Offered</th>
                <th>Source</th>
                <th>Subscribed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.email}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      backgroundColor: s.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: s.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.couponOffered ? (
                      <code style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: '700' }}>
                        {s.couponOffered}
                      </code>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.source || 'HOMEPAGE'}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : '-'}
                  </td>
                  <td>
                    {s.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleUnsubscribe(s.email)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          color: '#e11d48',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserX size={14} /> Unsubscribe
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {subscribers.length} of <strong>{total}</strong> subscribers
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page <= 1 ? '#f1f5f9' : 'white',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page >= totalPages ? '#f1f5f9' : 'white',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
