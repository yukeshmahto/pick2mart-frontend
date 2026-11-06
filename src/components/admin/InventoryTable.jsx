'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, AlertTriangle, RefreshCw, SlidersHorizontal, Plus, Minus, X } from 'lucide-react';
import styles from '../../app/admin/page.module.css';

export default function InventoryTable() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' | 'remove' | 'set'
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAllInventory({
        search,
        lowStock: lowStockOnly,
        page,
        limit: 15,
      });
      if (res.success) {
        setInventories(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError(res.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, lowStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setAdjustLoading(true);
    try {
      const variantId = adjustingItem.variantId?._id;
      let payload = {};
      if (adjustmentType === 'add') {
        payload = { quantityChange: Number(adjustQty), reason: adjustReason };
      } else if (adjustmentType === 'remove') {
        payload = { quantityChange: -Number(adjustQty), reason: adjustReason };
      } else {
        payload = { newQuantity: Number(adjustQty), reason: adjustReason };
      }

      const res = await adminService.adjustInventory(variantId, payload);
      if (res.success) {
        setAdjustingItem(null);
        setAdjustReason('');
        fetchInventory();
      }
    } catch (err) {
      alert('Adjustment failed: ' + err.message);
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by SKU, variant, product name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', fontWeight: '600' }}>
            <input 
              type="checkbox" 
              checked={lowStockOnly} 
              onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }} 
              style={{ width: '16px', height: '16px', accentColor: '#e11d48' }}
            />
            Show Low Stock Only
          </label>

          <button 
            onClick={fetchInventory} 
            title="Refresh Inventory"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading inventory...</div>
          </div>
        ) : inventories.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <AlertTriangle size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No inventory records found</h3>
            <p style={{ fontSize: '0.9rem' }}>Check filter criteria or create product variants.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product & Variant</th>
                <th>SKU</th>
                <th>Total Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inv) => {
                const variant = inv.variantId;
                const product = variant?.productId;
                const isLowStock = inv.quantity <= inv.lowStockThreshold;

                return (
                  <tr key={inv._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {product?.name || 'Unnamed Product'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Variant: {variant?.name || 'Default'}
                      </div>
                      {product?.sellerId && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Seller: {product.sellerId.fullName || product.sellerId.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {variant?.sku || 'N/A'}
                      </code>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{inv.quantity}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#d97706', fontWeight: '600' }}>{inv.reservedQuantity}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: inv.availableQuantity > 0 ? '#15803d' : '#e11d48' }}>
                        {inv.availableQuantity}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{inv.lowStockThreshold}</span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: isLowStock ? '#fee2e2' : '#dcfce7',
                        color: isLowStock ? '#b91c1c' : '#15803d',
                      }}>
                        {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => {
                          setAdjustingItem(inv);
                          setAdjustmentType('add');
                          setAdjustQty(10);
                        }}
                        className={styles.actionBtn}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <SlidersHorizontal size={14} /> Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} records)
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

      {/* Adjust Stock Dialog */}
      {adjustingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            
            <button 
              onClick={() => setAdjustingItem(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#64748b" />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Adjust Inventory Stock
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Product: <strong>{adjustingItem.variantId?.productId?.name}</strong> (SKU: {adjustingItem.variantId?.sku})
            </p>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Adjustment Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setAdjustmentType('add')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: adjustmentType === 'add' ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: adjustmentType === 'add' ? '#f0fdf4' : 'white', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Add Stock
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAdjustmentType('remove')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: adjustmentType === 'remove' ? '2px solid #ef4444' : '1px solid #cbd5e1', backgroundColor: adjustmentType === 'remove' ? '#fef2f2' : 'white', fontWeight: '600', cursor: 'pointer' }}
                  >
                    - Deduct Stock
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAdjustmentType('set')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: adjustmentType === 'set' ? '2px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: adjustmentType === 'set' ? '#eff6ff' : 'white', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Set Absolute
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Quantity
                </label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={adjustQty} 
                  onChange={(e) => setAdjustQty(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Reason for Adjustment
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Physical inventory count, damaged shipment, restock"
                  value={adjustReason} 
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={adjustLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--teal)', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  {adjustLoading ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
