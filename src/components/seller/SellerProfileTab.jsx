'use client';
import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle,
  Clock,
  ShieldCheck,
  MapPin,
  FileText,
  Save,
  RefreshCw,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import styles from '../../app/seller/page.module.css';
import { ImageUpload } from '../ImageUpload';

export default function SellerProfileTab({ onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    logo: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          businessName: res.data.businessName || '',
          businessEmail: res.data.businessEmail || '',
          businessPhone: res.data.businessPhone || '',
          gstNumber: res.data.gstNumber || '',
          panNumber: res.data.panNumber || '',
          businessAddress: res.data.businessAddress || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
          description: res.data.description || '',
          logo: res.data.logo || '',
        });
      } else {
        setError(res.message || 'Failed to fetch seller profile');
      }
    } catch (err) {
      setError(err.message || 'Error loading store profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    const payload = {
      businessName: formData.businessName.trim(),
      businessEmail: formData.businessEmail.trim(),
      businessPhone: formData.businessPhone.trim(),
      gstNumber: formData.gstNumber.trim().toUpperCase(),
      panNumber: formData.panNumber.trim().toUpperCase(),
      businessAddress: formData.businessAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      description: formData.description.trim(),
      logo: formData.logo.trim() || undefined,
    };

    try {
      const res = await sellerService.updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Store business profile updated successfully.');
        setProfile(res.data);
        if (onProfileUpdated) onProfileUpdated(res.data);
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem' }}>
        <RefreshCw className="animate-spin" size={28} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading store profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Merchant Store Profile & Verification</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Update your registered business information, legal tax details, and marketplace storefront description.
          </p>
        </div>
      </div>

      {/* Account Verification Status Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: profile?.isApproved ? '#ecfdf5' : '#fffbeb', color: profile?.isApproved ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.isApproved ? <ShieldCheck size={26} /> : <Clock size={26} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              {profile?.isApproved ? 'Verified Merchant Partner' : 'Verification Pending Review'}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
              {profile?.isApproved
                ? 'Your marketplace store is active and approved to publish products and fulfill customer orders.'
                : 'Your registration documents are being reviewed by Pick2Mart compliance team.'}
            </div>
          </div>
        </div>

        <span
          className={`${styles.badge} ${profile?.isApproved ? styles.badgeSuccess : styles.badgeWarning}`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
        >
          {profile?.isApproved ? 'Approved' : 'Pending Review'}
        </span>
      </div>

      {/* Profile Form */}
      <div className={styles.cardSection}>
        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Business Identity */}
          <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#0284c7" /> Store & Business Identity
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Registered Business / Store Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Official Business Email *</label>
                <input
                  type="email"
                  required
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Phone / Mobile *</label>
                <input
                  type="tel"
                  required
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Storefront Description</label>
              <textarea
                rows={3}
                placeholder="Describe your brand, product categories, and quality standards for customers..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.formTextarea}
              />
            </div>

            <div className={styles.formGroup}>
              <ImageUpload
                label="Storefront Brand Logo"
                multiple={false}
                value={formData.logo}
                onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
                helperText="Upload your store brand logo from your computer."
              />
            </div>
          </div>

          {/* Section 2: Statutory Tax Compliance */}
          <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#0284c7" /> Tax & Statutory Registrations
            </h3>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GSTIN (GST Identification Number) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 29ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className={styles.formInput}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PAN (Permanent Account Number) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className={styles.formInput}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business & Warehouse Address */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#0284c7" /> Operating & Dispatch Address
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Street Address / Warehouse Unit *</label>
              <input
                type="text"
                required
                placeholder="Plot/Shop #, Street name, Industrial Area"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.primaryBtn}
            >
              <Save size={16} /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
