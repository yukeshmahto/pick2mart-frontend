'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, RefreshCw, Store, CheckCircle2, XCircle, AlertCircle, MapPin, FileText } from 'lucide-react';
import styles from '../../app/admin/page.module.css';

export default function SellersTable() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllSellers({
        search,
        approvalStatus: approvalFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      if (response.success) {
        setSellers(response.data);
        if (response.meta) setMeta(response.meta);
      } else {
        setError(response.message || 'Failed to fetch sellers');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [page, approvalFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSellers();
  };

  const handleUpdateSellerApproval = async (id, isApproved) => {
    const action = isApproved ? 'approve' : 'revoke approval for';
    if (!window.confirm(`Are you sure you want to ${action} this seller?`)) return;
    try {
      await adminService.updateSellerApproval(id, isApproved);
      fetchSellers();
    } catch (err) {
      alert(err.message || 'Failed to update seller approval');
    }
  };

  const handleUpdateSellerStatus = async (id, isActive) => {
    const action = isActive ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} this seller account?`)) return;
    try {
      await adminService.updateSellerStatus(id, isActive);
      fetchSellers();
    } catch (err) {
      alert(err.message || 'Failed to update seller status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search and Filters Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search sellers by store name, email, phone, city..." 
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
            value={approvalFilter} 
            onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button 
            onClick={fetchSellers} 
            title="Refresh Sellers"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

      </div>

      {/* Main Table Container */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={20} style={{ marginRight: '8px' }} /> Loading marketplace sellers...
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
            <p>{error}</p>
            <button onClick={fetchSellers} style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : sellers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <Store size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>No sellers match the criteria</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Store & Business</th>
                  <th style={{ padding: '14px 20px' }}>Owner & Contact</th>
                  <th style={{ padding: '14px 20px' }}>Location</th>
                  <th style={{ padding: '14px 20px' }}>Tax Details</th>
                  <th style={{ padding: '14px 20px' }}>Approval</th>
                  <th style={{ padding: '14px 20px' }}>Account Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => {
                  const storeName = s.businessName || s.storeName || s.companyName || 'Store';
                  return (
                    <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
                            <Store size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{storeName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.businessEmail || s.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#334155' }}>
                        <div style={{ fontWeight: '600' }}>{s.user?.fullName || s.user?.name || 'Owner'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.businessPhone || s.user?.mobile || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#94a3b8" />
                          <span>{s.city || 'N/A'}, {s.state || ''}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '18px' }}>PIN: {s.pincode || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#334155', fontSize: '0.8rem' }}>
                        <div><strong>GST:</strong> {s.gstNumber || 'N/A'}</div>
                        <div><strong>PAN:</strong> {s.panNumber || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: s.isApproved ? '#dcfce7' : '#fef3c7',
                          color: s.isApproved ? '#15803d' : '#b45309',
                        }}>
                          {s.isApproved ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {s.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: s.isActive ? '#dcfce7' : '#fee2e2',
                          color: s.isActive ? '#15803d' : '#b91c1c',
                        }}>
                          {s.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {s.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleUpdateSellerApproval(s._id, !s.isApproved)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              border: 'none',
                              backgroundColor: s.isApproved ? '#fee2e2' : '#dcfce7',
                              color: s.isApproved ? '#b91c1c' : '#15803d',
                              cursor: 'pointer',
                            }}
                          >
                            {s.isApproved ? 'Revoke' : 'Approve'}
                          </button>

                          <button
                            onClick={() => handleUpdateSellerStatus(s._id, !s.isActive)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              border: '1px solid #cbd5e1',
                              backgroundColor: s.isActive ? '#fef2f2' : '#f0fdf4',
                              color: s.isActive ? '#dc2626' : '#16a34a',
                              cursor: 'pointer',
                            }}
                          >
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.85rem', color: '#64748b' }}>
            <div>
              Showing {sellers.length} of {meta.total} registered sellers
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page <= 1 ? '#f1f5f9' : 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Page {page} of {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page >= meta.totalPages ? '#f1f5f9' : 'white', cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
