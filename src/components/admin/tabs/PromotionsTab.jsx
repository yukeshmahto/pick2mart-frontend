'use client';
import React, { useState, useEffect } from 'react';
import { promotionService } from '../../../services/promotion.service';
import { Tag, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X, Loader2, Calendar, Percent, RefreshCw, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import styles from '../../../app/admin/page.module.css';

const INITIAL_FORM = {
  code: '',
  title: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderValue: 0,
  maxDiscountAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  usageLimit: 500,
  perCustomerLimit: 1,
  fundingSource: 'PLATFORM',
  sellerSharePercentage: 0,
  freeShipping: false,
  showOnHomepage: true,
  displayOrder: 1,
  isFeatured: false,
  isActive: true,
};

export default function PromotionsTab() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Server-Side Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, [page, limit]);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await promotionService.getAllPromotions({ page, limit });
      if (res.success) {
        setPromotions(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setError(res.message || 'Failed to fetch promotions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData(INITIAL_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code || '',
      title: promo.title || '',
      description: promo.description || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue !== undefined ? promo.discountValue : '',
      minOrderValue: promo.minOrderValue || 0,
      maxDiscountAmount: promo.maxDiscountAmount || '',
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      usageLimit: promo.usageLimit || 500,
      perCustomerLimit: promo.perCustomerLimit || 1,
      fundingSource: promo.fundingSource || 'PLATFORM',
      sellerSharePercentage: promo.sellerSharePercentage || 0,
      freeShipping: !!promo.freeShipping,
      showOnHomepage: promo.showOnHomepage !== false,
      displayOrder: promo.displayOrder || 1,
      isFeatured: !!promo.isFeatured,
      isActive: promo.isActive !== undefined ? promo.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Promotion title is required.');
      return;
    }
    if (formData.discountValue === '' || isNaN(Number(formData.discountValue)) || Number(formData.discountValue) <= 0) {
      setFormError('Discount value must be greater than zero.');
      return;
    }

    setSubmitting(true);
    const payload = {
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderValue: parseFloat(formData.minOrderValue || 0),
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      usageLimit: parseInt(formData.usageLimit, 10) || 500,
      perCustomerLimit: parseInt(formData.perCustomerLimit, 10) || 1,
      fundingSource: formData.fundingSource,
      sellerSharePercentage: parseFloat(formData.sellerSharePercentage || 0),
      freeShipping: formData.freeShipping,
      showOnHomepage: formData.showOnHomepage,
      displayOrder: parseInt(formData.displayOrder, 10) || 1,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editingPromo) {
        res = await promotionService.updatePromotion(editingPromo._id, payload);
      } else {
        res = await promotionService.createPromotion(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        setSuccessMsg(editingPromo ? 'Promotion updated successfully!' : 'New promotion created successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchPromotions();
      } else {
        setFormError(res.message || 'Failed to save promotion');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await promotionService.updatePromotion(id, { isActive: !currentStatus });
      fetchPromotions();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon code "${code}"?`)) {
      try {
        await promotionService.deletePromotion(id);
        setSuccessMsg(`Coupon "${code}" deleted.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPromotions();
      } catch (err) {
        alert(err.message || 'Failed to delete promotion');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color="var(--orange, #f97316)" /> Promotions & Coupon Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Configure percentage/fixed discounts, minimum cart values, redemption limits, and homepage banner visibility.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={fetchPromotions} 
            title="Refresh"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
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
              padding: '10px 20px',
              backgroundColor: 'var(--orange, #f97316)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
            }}
          >
            <Plus size={18} /> Create New Coupon
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
            <div>Loading active promotion codes...</div>
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Tag size={44} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>No promotions configured</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Create your first coupon code to drive festive or category-wide sales.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="primary-button"
            >
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Offer Details</th>
                <th>Discount</th>
                <th>Min Cart / Cap</th>
                <th>Homepage</th>
                <th>Usage</th>
                <th>Validity Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const isExpired = p.endDate && new Date(p.endDate) < new Date();
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                          {p.code}
                        </code>
                        {p.isFeatured && <Star size={14} fill="#f59e0b" color="#f59e0b" title="Featured Offer" />}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>{p.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.description || 'General discount'}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--orange, #f97316)' }}>
                        {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `₹${p.discountValue} FLAT`}
                      </strong>
                      {p.freeShipping && (
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>+ Free Shipping</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        Min: <strong>₹{p.minOrderValue || 0}</strong>
                      </div>
                      {p.maxDiscountAmount && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Max cap: ₹{p.maxDiscountAmount}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: p.showOnHomepage ? '#f0fdf4' : '#f1f5f9',
                        color: p.showOnHomepage ? '#15803d' : '#64748b'
                      }}>
                        {p.showOnHomepage ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <strong>{p.usedCount || 0}</strong> / {p.usageLimit || '∞'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Max {p.perCustomerLimit || 1}x / user
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: isExpired ? '#b91c1c' : '#334155' }}>
                        {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'No expiry'}
                      </div>
                      {isExpired && (
                        <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: '700' }}>EXPIRED</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: p.isActive && !isExpired ? '#dcfce7' : '#fee2e2',
                        color: p.isActive && !isExpired ? '#15803d' : '#b91c1c',
                      }}>
                        {p.isActive && !isExpired ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          title="Edit Coupon"
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
                          onClick={() => handleToggleActive(p._id, p.isActive)}
                        >
                          {p.isActive ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.code)}
                          title="Delete Coupon"
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
              Showing {promotions.length} of <strong>{total}</strong> coupons
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {editingPromo ? 'Edit Promotion Coupon' : 'Create New Promotion Coupon'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. WELCOME200"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Flat ₹200 OFF on First Order"
                    value={formData.title}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                  Description / Terms Summary
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Valid on all orders above ₹999 for first-time shoppers"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Discount details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '200'}
                    value={formData.discountValue}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Min Cart (₹)
                  </label>
                  <input
                    type="number"
                    name="minOrderValue"
                    min="0"
                    placeholder="999"
                    value={formData.minOrderValue}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    min="0"
                    placeholder="500"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Dates & Usage limits */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Total Uses
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    min="1"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    name="perCustomerLimit"
                    min="1"
                    value={formData.perCustomerLimit}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Homepage display & featured toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="showOnHomepage"
                      checked={formData.showOnHomepage}
                      onChange={handleChange}
                      style={{ accentColor: '#0f172a' }}
                    />
                    Display in Homepage Offer Strips
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      style={{ accentColor: '#f59e0b' }}
                    />
                    Mark as Featured Campaign
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Homepage Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    min="1"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Funding attribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Discount Funded By:
                  </label>
                  <select
                    name="fundingSource"
                    value={formData.fundingSource}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="PLATFORM">Platform Funded (Default)</option>
                    <option value="SELLER">Seller Funded</option>
                    <option value="SHARED">Shared Funding</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleChange}
                      style={{ accentColor: '#16a34a' }}
                    />
                    Grants Free Shipping
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={{ accentColor: '#2563eb' }}
                    />
                    Active / Live
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                    editingPromo ? 'Update Coupon' : 'Create & Activate Coupon'
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
