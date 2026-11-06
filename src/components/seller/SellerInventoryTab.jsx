'use client';
import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  X,
  Package,
  TrendingDown
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import styles from '../../app/seller/page.module.css';

export default function SellerInventoryTab({ preselectedProductId, isApproved }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [variantsWithStock, setVariantsWithStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Quick Stock Edit Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedVariantForStock, setSelectedVariantForStock] = useState(null);
  const [stockFormData, setStockFormData] = useState({ quantity: 0, lowStockThreshold: 5 });
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const [stockError, setStockError] = useState(null);

  // Add Variant Modal
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [variantFormData, setVariantFormData] = useState({
    name: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    attributes: '',
  });
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [variantError, setVariantError] = useState(null);

  // Load all products first
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await sellerService.getProducts();
        if (res.success) {
          const list = res.data || [];
          setProducts(list);
          if (!selectedProductId && list.length > 0) {
            setSelectedProductId(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  // Fetch variants and inventory for selected product
  const fetchVariantsAndInventory = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sellerService.getVariants(selectedProductId);
      if (res.success) {
        setVariantsWithStock(res.data || []);
      } else {
        setError(res.message || 'Failed to load product variants');
      }
    } catch (err) {
      setError(err.message || 'An error occurred loading variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchVariantsAndInventory();
    }
  }, [selectedProductId]);

  const openStockEdit = (variant) => {
    setSelectedVariantForStock(variant);
    const inv = variant.inventory || {};
    setStockFormData({
      quantity: inv.quantity !== undefined ? inv.quantity : 0,
      lowStockThreshold: inv.lowStockThreshold !== undefined ? inv.lowStockThreshold : 5,
    });
    setStockError(null);
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setStockSubmitting(true);
    setStockError(null);

    try {
      const res = await sellerService.updateInventory(
        selectedProductId,
        selectedVariantForStock._id,
        {
          quantity: parseInt(stockFormData.quantity, 10),
          lowStockThreshold: parseInt(stockFormData.lowStockThreshold, 10),
        }
      );

      if (res.success) {
        setStockModalOpen(false);
        fetchVariantsAndInventory();
      } else {
        setStockError(res.message || 'Failed to update stock');
      }
    } catch (err) {
      setStockError(err.message || 'Failed to update stock');
    } finally {
      setStockSubmitting(false);
    }
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    setVariantSubmitting(true);
    setVariantError(null);

    // Parse attributes string: "Color: Red, Size: XL"
    const attrs = {};
    if (variantFormData.attributes) {
      variantFormData.attributes.split(',').forEach((pair) => {
        const [k, v] = pair.split(':');
        if (k && v) attrs[k.trim()] = v.trim();
      });
    }

    const payload = {
      name: variantFormData.name.trim(),
      sku: variantFormData.sku.trim(),
      price: parseFloat(variantFormData.price),
      compareAtPrice: variantFormData.compareAtPrice ? parseFloat(variantFormData.compareAtPrice) : undefined,
      attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
    };

    try {
      const res = await sellerService.createVariant(selectedProductId, payload);
      if (res.success) {
        setAddVariantOpen(false);
        setVariantFormData({ name: '', sku: '', price: '', compareAtPrice: '', attributes: '' });
        fetchVariantsAndInventory();
      } else {
        setVariantError(res.message || 'Failed to create variant');
      }
    } catch (err) {
      setVariantError(err.message || 'Failed to create variant');
    } finally {
      setVariantSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Filtered variants
  const filteredVariants = variantsWithStock.filter((v) => {
    const matchesSearch =
      search === '' ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.sku?.toLowerCase().includes(search.toLowerCase());

    const inv = v.inventory || {};
    const isLow = (inv.availableQuantity || 0) <= (inv.lowStockThreshold || 5);
    const matchesLowStock = !filterLowStockOnly || isLow;

    return matchesSearch && matchesLowStock;
  });

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Inventory & Stock Control</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Monitor real-time available stock, reserved items held for orders, and configure low-stock warnings.
          </p>
        </div>
        <button
          onClick={() => {
            setVariantFormData({ name: '', sku: '', price: '', compareAtPrice: '', attributes: '' });
            setVariantError(null);
            setAddVariantOpen(true);
          }}
          disabled={!isApproved || !selectedProductId}
          className={styles.primaryBtn}
          style={{ opacity: !isApproved ? 0.6 : 1 }}
        >
          <Plus size={18} /> Add New Variant
        </button>
      </div>

      {/* Product Selection and Filters */}
      <div className={styles.filterBar}>
        <div style={{ minWidth: '260px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            SELECT PRODUCT
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className={styles.formSelect}
          >
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            SEARCH VARIANTS
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by variant name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              style={{ paddingLeft: '32px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', paddingBottom: '8px' }}>
          <input
            type="checkbox"
            id="lowStockToggle"
            checked={filterLowStockOnly}
            onChange={(e) => setFilterLowStockOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="lowStockToggle" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', cursor: 'pointer' }}>
            Show Low Stock Only
          </label>
        </div>
      </div>

      {/* Selected Product Context Banner */}
      {selectedProduct && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <img
            src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
            alt=""
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{selectedProduct.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Base SKU: {selectedProduct.sku} • Base Price: ₹{selectedProduct.price?.toLocaleString('en-IN')}
            </div>
          </div>
          <span className={`${styles.badge} ${selectedProduct.status === 'active' ? styles.badgeSuccess : styles.badgeNeutral}`}>
            {selectedProduct.status}
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <div className={styles.cardSection} style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading inventory records...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : filteredVariants.length === 0 ? (
          <div className={styles.emptyState}>
            <Layers className={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>No variants created</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Click "Add New Variant" to add sizes, colors, or specifications with dedicated stock limits.
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Variant Name</th>
                  <th>SKU Code</th>
                  <th>Price</th>
                  <th>Total Physical Stock</th>
                  <th>Reserved (In Cart / Order)</th>
                  <th>Available to Sell</th>
                  <th>Stock Health</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((v) => {
                  const inv = v.inventory || {};
                  const isLow = (inv.availableQuantity || 0) <= (inv.lowStockThreshold || 5);
                  return (
                    <tr key={v._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.name}</div>
                        {v.attributes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' • ')}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.sku}</td>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>₹{v.price?.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>{inv.quantity !== undefined ? inv.quantity : 0} units</td>
                      <td style={{ color: '#64748b' }}>{inv.reservedQuantity || 0} units</td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isLow ? '#dc2626' : '#16a34a' }}>
                          {inv.availableQuantity !== undefined ? inv.availableQuantity : 0}
                        </span>
                      </td>
                      <td>
                        {isLow ? (
                          <span className={styles.badgeDanger} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                            <AlertTriangle size={12} /> Low Stock (≤{inv.lowStockThreshold || 5})
                          </span>
                        ) : (
                          <span className={styles.badgeSuccess} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                            <CheckCircle size={12} /> Optimal
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openStockEdit(v)}
                          className={styles.secondaryBtn}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={14} /> Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Stock Modal */}
      {stockModalOpen && selectedVariantForStock && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '480px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Variant Stock</h3>
              <button onClick={() => setStockModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className={styles.modalBody}>
              {stockError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {stockError}
                </div>
              )}

              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedVariantForStock.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  SKU: {selectedVariantForStock.sku} • Reserved: {selectedVariantForStock.inventory?.reservedQuantity || 0} units
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Physical Quantity in Warehouse *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  className={styles.formInput}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Available quantity will automatically equal Total Quantity minus currently Reserved orders.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Low Stock Warning Threshold *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockFormData.lowStockThreshold}
                  onChange={(e) => setStockFormData({ ...stockFormData, lowStockThreshold: e.target.value })}
                  className={styles.formInput}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Receive low-stock indicator on dashboard when available stock hits or drops below this number.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockSubmitting}
                  className={styles.primaryBtn}
                >
                  {stockSubmitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {addVariantOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '520px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Product Variant</h3>
              <button onClick={() => setAddVariantOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className={styles.modalBody}>
              {variantError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {variantError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Variant Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midnight Black - 128GB"
                  value={variantFormData.name}
                  onChange={(e) => setVariantFormData({ ...variantFormData, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Unique Variant SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ELEC-HDPHN-BLK"
                    value={variantFormData.sku}
                    onChange={(e) => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="599.00"
                    value={variantFormData.price}
                    onChange={(e) => setVariantFormData({ ...variantFormData, price: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Attributes (Format: Key: Value, Key: Value)</label>
                <input
                  type="text"
                  placeholder="e.g., Color: Black, Storage: 128GB"
                  value={variantFormData.attributes}
                  onChange={(e) => setVariantFormData({ ...variantFormData, attributes: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAddVariantOpen(false)}
                  className={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={variantSubmitting}
                  className={styles.primaryBtn}
                >
                  {variantSubmitting ? 'Creating...' : 'Create Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
