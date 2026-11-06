'use client';
import React, { useState, useEffect } from 'react';
import { dealService } from '../../../services/deal.service';
import { productService } from '../../../services/product.service';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  RefreshCw, 
  Calendar, 
  Percent, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import styles from '../../../app/admin/page.module.css';

const INITIAL_FORM = {
  productId: '',
  dealPrice: '',
  originalPrice: '',
  discountPercentage: 0,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  maxQuantity: 50,
  isFlashDeal: true,
  showOnHomepage: true,
  displayOrder: 1,
  isActive: true,
};

export default function DealsTab() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('ALL'); // ALL, FLASH, STANDARD

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Available Products for dropdown
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    fetchDeals();
  }, [page, limit, filterType]);

  useEffect(() => {
    // Load products list for deal creation
    productService.getPublicProducts({ limit: 50 })
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setAvailableProducts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (filterType === 'FLASH') params.isFlashDeal = true;
      if (filterType === 'STANDARD') params.isFlashDeal = false;

      const res = await dealService.getAllDealsAdmin(params);
      if (res.success) {
        setDeals(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setError(res.message || 'Failed to fetch deals');
      }
    } catch (err) {
      setError(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setFormData(INITIAL_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    const prodId = typeof deal.productId === 'object' ? deal.productId._id : deal.productId;
    setFormData({
      productId: prodId || '',
      dealPrice: deal.dealPrice || '',
      originalPrice: deal.originalPrice || '',
      discountPercentage: deal.discountPercentage || 0,
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 16) : '',
      endDate: deal.endDate ? new Date(deal.endDate).toISOString().slice(0, 16) : '',
      maxQuantity: deal.maxQuantity || 50,
      isFlashDeal: deal.isFlashDeal !== false,
      showOnHomepage: deal.showOnHomepage !== false,
      displayOrder: deal.displayOrder || 1,
      isActive: deal.isActive !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    const prod = availableProducts.find((p) => p._id === selectedId);
    if (prod) {
      const orig = prod.price || 0;
      setFormData((prev) => ({
        ...prev,
        productId: selectedId,
        originalPrice: orig,
        dealPrice: Math.round(orig * 0.8), // Suggest 20% off
        discountPercentage: 20,
      }));
    } else {
      setFormData((prev) => ({ ...prev, productId: selectedId }));
    }
  };

  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    const orig = parseFloat(formData.originalPrice) || 0;
    let disc = 0;
    if (orig > 0 && price < orig) {
      disc = Math.round(((orig - price) / orig) * 100);
    }
    setFormData((prev) => ({
      ...prev,
      dealPrice: price,
      discountPercentage: disc,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.productId) {
      setFormError('Please select a product.');
      return;
    }

    const dPrice = parseFloat(formData.dealPrice);
    const oPrice = parseFloat(formData.originalPrice);

    if (isNaN(dPrice) || dPrice <= 0) {
      setFormError('Deal price must be greater than zero.');
      return;
    }
    if (oPrice > 0 && dPrice >= oPrice) {
      setFormError('Deal price must be strictly lower than original product price.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError('Start date and end date are required.');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setFormError('End date must be after the start date.');
      return;
    }

    setSubmitting(true);
    const payload = {
      productId: formData.productId,
      dealPrice: dPrice,
      originalPrice: oPrice,
      discountPercentage: formData.discountPercentage,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      maxQuantity: parseInt(formData.maxQuantity, 10) || 100,
      isFlashDeal: formData.isFlashDeal,
      showOnHomepage: formData.showOnHomepage,
      displayOrder: parseInt(formData.displayOrder, 10) || 1,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editingDeal) {
        res = await dealService.updateDeal(editingDeal._id, payload);
      } else {
        res = await dealService.createDeal(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        setSuccessMsg(editingDeal ? 'Deal updated successfully!' : 'New deal campaign created successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchDeals();
      } else {
        setFormError(res.message || 'Failed to save deal');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await dealService.updateDeal(id, { isActive: !currentStatus });
      fetchDeals();
    } catch (err) {
      alert(err.message || 'Failed to update deal status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await dealService.deleteDeal(id);
        setSuccessMsg('Deal deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchDeals();
      } catch (err) {
        alert(err.message || 'Failed to delete deal');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} color="var(--orange, #f97316)" /> Deals & Flash Sale Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Configure server-authoritative flash drops with synchronized expiry clocks and inventory quotas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}
          >
            <option value="ALL">All Campaigns</option>
            <option value="FLASH">Flash Deals Only</option>
            <option value="STANDARD">Standard Deals</option>
          </select>

          <button 
            type="button"
            onClick={fetchDeals} 
            title="Refresh"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: 'var(--orange, #f97316)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} /> Create Deal
          </button>
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
            <div>Loading deal campaigns...</div>
          </div>
        ) : deals.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Zap size={44} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>No deals configured</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Schedule your first flash deal to power the dynamic homepage countdown.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="primary-button"
            >
              <Plus size={16} /> Schedule Flash Deal
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Deal Price</th>
                <th>Discount</th>
                <th>Quota / Sold</th>
                <th>Time Window</th>
                <th>Homepage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const isExpired = d.endDate && new Date(d.endDate) < new Date();
                const isUpcoming = d.startDate && new Date(d.startDate) > new Date();
                const prod = d.productId;
                const prodTitle = prod?.name || 'Product';
                const prodImg = prod?.images?.[0] || null;

                return (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {prodImg ? (
                          <img src={prodImg} alt={prodTitle} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={18} color="#94a3b8" />
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{prodTitle}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Original: ₹{d.originalPrice}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        backgroundColor: d.isFlashDeal ? '#fee2e2' : '#e0f2fe',
                        color: d.isFlashDeal ? '#dc2626' : '#0369a1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {d.isFlashDeal && <Zap size={12} fill="currentColor" />}
                        {d.isFlashDeal ? 'FLASH DEAL' : 'DEAL'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>₹{d.dealPrice}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.9rem' }}>
                        {d.discountPercentage}% OFF
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>{d.soldQuantity || 0}</strong> / {d.maxQuantity}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: isExpired ? '#b91c1c' : '#334155' }}>
                        {new Date(d.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {isExpired ? (
                        <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: '800' }}>EXPIRED</span>
                      ) : isUpcoming ? (
                        <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '700' }}>UPCOMING</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>LIVE NOW</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: d.showOnHomepage ? '#f0fdf4' : '#f1f5f9',
                        color: d.showOnHomepage ? '#15803d' : '#64748b'
                      }}>
                        {d.showOnHomepage ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: d.isActive && !isExpired ? '#dcfce7' : '#fee2e2',
                        color: d.isActive && !isExpired ? '#15803d' : '#b91c1c',
                      }}>
                        {d.isActive && !isExpired ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#334155',
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleToggleActive(d._id, d.isActive)}
                        >
                          {d.isActive ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(d._id)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fecdd3',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#e11d48',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {deals.length} of <strong>{total}</strong> deals
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--orange, #f97316)" />
                {editingDeal ? 'Edit Deal Campaign' : 'Create New Deal Campaign'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                  Target Product *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={handleProductSelect}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                >
                  <option value="">Select a product from catalog...</option>
                  {availableProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — (Standard Price: ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    readOnly
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Deal Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1999"
                    value={formData.dealPrice}
                    onChange={handlePriceChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Calculated Discount
                  </label>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '800' }}>
                    {formData.discountPercentage}% OFF
                  </div>
                </div>
              </div>

              {/* Start & End Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Campaign Starts (Server Clock) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Campaign Ends (Flash Expiry) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Max Quantity for Deal
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value, 10) || 50 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Display Order on Homepage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '20px', padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFlashDeal}
                    onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                    style={{ accentColor: '#dc2626' }}
                  />
                  Flash Deal (Include in live countdown ticker)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    style={{ accentColor: '#0f172a' }}
                  />
                  Show on Homepage
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ accentColor: '#16a34a' }}
                  />
                  Active / Live
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--orange, #f97316)',
                    color: 'white',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    editingDeal ? 'Update Deal' : 'Schedule Deal Campaign'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
