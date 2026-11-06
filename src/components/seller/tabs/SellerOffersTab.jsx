'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { promotionService } from '../../../services/promotion.service';
import styles from '../../../app/seller/page.module.css';

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
  freeShipping: false,
  isActive: true,
};

export default function SellerOffersTab({ isApproved = true }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Close modal on Escape key and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await promotionService.getSellerPromotions();
      if (res.success) {
        setPromotions(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch seller offers');
      }
    } catch (err) {
      setError(err.message || 'Failed to load seller offers');
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
      freeShipping: !!promo.freeShipping,
      isActive: promo.isActive !== undefined ? promo.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Offer title is required.');
      return;
    }
    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid discount value greater than 0.');
      return;
    }
    if (formData.discountType === 'PERCENTAGE' && val > 90) {
      setFormError('Percentage discount cannot exceed 90%.');
      return;
    }

    setSubmitting(true);

    const payload = {
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: val,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : 500,
      perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit, 10) : 1,
      freeShipping: !!formData.freeShipping,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editingPromo) {
        res = await promotionService.updateSellerPromotion(editingPromo._id, payload);
      } else {
        res = await promotionService.createSellerPromotion(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        setSuccessMsg(editingPromo ? 'Offer updated successfully!' : 'Offer promotion published successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchPromotions();
      } else {
        setFormError(res.message || 'Failed to save offer');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete offer '${code}'?`)) return;
    try {
      const res = await promotionService.deleteSellerPromotion(id);
      if (res.success) {
        setSuccessMsg(`Offer '${code}' deleted successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPromotions();
      } else {
        alert(res.message || 'Failed to delete offer');
      }
    } catch (err) {
      alert(err.message || 'Error occurred deleting offer');
    }
  };

  const handleToggleStatus = async (promo) => {
    try {
      const res = await promotionService.updateSellerPromotion(promo._id, {
        isActive: !promo.isActive,
      });
      if (res.success) {
        fetchPromotions();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle offer status');
    }
  };

  // Metrics
  const activeOffersCount = promotions.filter((p) => p.isActive).length;
  const totalRedemptions = promotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Merchant Store Offers & Coupons</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Create exclusive seller discounts, festive coupons, and free delivery offers to boost your storefront sales.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchPromotions}
            className={styles.secondaryBtn}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            disabled={!isApproved}
            className={styles.primaryBtn}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={18} />
            <span>Create Offer</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.kpiGrid} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Total Active Offers</div>
          <div className={styles.kpiValue} style={{ color: '#0284c7' }}>
            {activeOffersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {promotions.length} total coupons configured
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Total Redemptions</div>
          <div className={styles.kpiValue} style={{ color: '#16a34a' }}>
            {totalRedemptions}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Times your coupons were applied at checkout
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Offer Funding</div>
          <div className={styles.kpiValue} style={{ color: '#d97706', fontSize: '1.4rem' }}>
            Seller Funded
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            100% applied to your store order items
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Offers Table / List */}
      <div className={styles.cardSection}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading store offers & coupons...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Tag size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No Store Offers Created Yet
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Create discount coupons and seasonal offers to incentivize customer purchases and boost your conversion rate.
            </p>
            <button
              onClick={openCreateModal}
              disabled={!isApproved}
              className={styles.primaryBtn}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} />
              <span>Create Your First Offer</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Offer Title & Details</th>
                  <th>Discount Value</th>
                  <th>Min Order</th>
                  <th>Usage / Limit</th>
                  <th>Validity Window</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => {
                  const now = new Date();
                  const isExpired = promo.endDate && now > new Date(promo.endDate);
                  const isUpcoming = promo.startDate && now < new Date(promo.startDate);

                  return (
                    <tr key={promo._id}>
                      {/* Code */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              backgroundColor: '#f1f5f9',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              color: '#0369a1',
                              fontSize: '0.9rem',
                              border: '1px solid #cbd5e1',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(promo.code)}
                            title="Copy Code"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedCode === promo.code ? '#16a34a' : '#64748b',
                            }}
                          >
                            {copiedCode === promo.code ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          {promo.title}
                        </div>
                        {promo.description && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {promo.description}
                          </div>
                        )}
                        {promo.freeShipping && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              fontSize: '0.7rem',
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            Includes Free Shipping
                          </span>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% OFF`
                            : `₹${promo.discountValue} FLAT`}
                        </span>
                        {promo.maxDiscountAmount ? (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Max ₹{promo.maxDiscountAmount}
                          </div>
                        ) : null}
                      </td>

                      {/* Min Order */}
                      <td style={{ fontSize: '0.875rem', color: '#475569' }}>
                        {promo.minOrderValue > 0 ? `₹${promo.minOrderValue}` : 'No Minimum'}
                      </td>

                      {/* Usage */}
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                          {promo.usedCount || 0} / {promo.usageLimit || '∞'}
                        </div>
                        <div
                          style={{
                            width: '80px',
                            height: '5px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '3px',
                            marginTop: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, (((promo.usedCount || 0) / (promo.usageLimit || 1)) * 100))}%`,
                              height: '100%',
                              backgroundColor: '#0284c7',
                            }}
                          />
                        </div>
                      </td>

                      {/* Validity */}
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <div>
                          {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Immediate'}
                        </div>
                        <div>to {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Ongoing'}</div>
                        {isExpired && (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                            Expired
                          </span>
                        )}
                        {isUpcoming && (
                          <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.75rem' }}>
                            Starts soon
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(promo)}
                          className={`${styles.badge} ${promo.isActive && !isExpired ? styles.badgeSuccess : styles.badgeSecondary}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle Active status"
                        >
                          {promo.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(promo)}
                            className={styles.actionBtn}
                            title="Edit Offer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(promo._id, promo.code)}
                            className={styles.actionBtn}
                            style={{ color: '#dc2626' }}
                            title="Delete Offer"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* Create / Edit Offer Modal */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className={styles.modalCard}>
            {/* Header (Pinned) */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle} style={{ margin: 0 }}>
                  {editingPromo ? 'Edit Store Offer' : 'Create New Store Offer'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {editingPromo
                    ? 'Update discount terms, limits, and customer conditions'
                    : 'Set up discount rates, validity dates, and redemption caps'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                title="Close dialog (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className={styles.modalBody}>
              {formError && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form id="sellerOfferForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., FESTIVE20, FLAT100"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
                        })
                      }
                      className={styles.formInput}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Offer Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 20% Off Weekend Sale"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description / Conditions</label>
                  <textarea
                    rows={2}
                    placeholder="Terms for customers (e.g., Valid on all store orders above ₹499)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className={styles.formSelect}
                    >
                      <option value="PERCENTAGE">Percentage (%) Discount</option>
                      <option value="FIXED">Flat Fixed Amount (₹) Off</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Discount Value {formData.discountType === 'PERCENTAGE' ? '(%) *' : '(₹) *'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={formData.discountType === 'PERCENTAGE' ? '90' : undefined}
                      required
                      placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 150'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Min Order Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for no minimum"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Leave blank for no cap"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>End Date (Expiry)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Total Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 500"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Per-Customer Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      value={formData.perCustomerLimit}
                      onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.freeShipping}
                      onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                      style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                    />
                    <span>Grant Free Shipping to Customer</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ accentColor: '#16a34a', width: '16px', height: '16px' }}
                    />
                    <span>Publish Offer as Active Immediately</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer Actions (Pinned) */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="sellerOfferForm"
                disabled={submitting}
                className={styles.primaryBtn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                <span>{submitting ? 'Saving Offer...' : editingPromo ? 'Update Offer' : 'Publish Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
