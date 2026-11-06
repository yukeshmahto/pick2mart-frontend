'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { History, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import styles from '../../app/admin/page.module.css';

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getActivityLogs({
        entity: entityFilter,
        page,
        limit: 25,
      });
      if (res.success) {
        setLogs(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError(res.message || 'Failed to fetch activity logs');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityFilter]);

  const getActionBadge = (action) => {
    if (action.includes('APPROVED')) {
      return { backgroundColor: '#dcfce7', color: '#15803d' };
    }
    if (action.includes('REJECTED') || action.includes('CANCELLED')) {
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    }
    if (action.includes('INVENTORY')) {
      return { backgroundColor: '#fef3c7', color: '#b45309' };
    }
    return { backgroundColor: '#eff6ff', color: '#1d4ed8' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Administrative Audit Trail</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Immutable record of administrator actions and status modifications</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={entityFilter} 
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Entities</option>
            <option value="product">Products</option>
            <option value="seller">Sellers</option>
            <option value="order">Orders</option>
            <option value="inventory">Inventory</option>
          </select>

          <button 
            onClick={fetchLogs} 
            title="Refresh Logs"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Logs Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading audit logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <History size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No activity logged yet</h3>
            <p style={{ fontSize: '0.9rem' }}>Actions such as approving products or adjusting stock will be recorded here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admin Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{log.adminEmail}</div>
                    {log.adminId?.fullName && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.adminId.fullName}</div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      ...getActionBadge(log.action),
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#475569' }}>
                      {log.entity}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.entityId}
                    </code>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#334155', wordBreak: 'break-all' }}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} events)
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

    </div>
  );
}
