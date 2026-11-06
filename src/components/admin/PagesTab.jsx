'use client';
import React, { useState, useEffect } from 'react';
import { pageService } from '../../services/page.service';
import { Trash2, Edit, Plus, Check, X, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, FileText, Sparkles, Image as ImageIcon, Eye, Code } from 'lucide-react';
import Link from 'next/link';
import styles from '../../app/admin/page.module.css';
import { ImageUpload } from '../ImageUpload';
import { formatCmsContent } from '../../utils/cmsFormatter';

const INITIAL_ABOUT_CONFIG = {
  headline: 'About Pick2Mart',
  subheadline: 'Redefining online shopping with quality products, exceptional service, and unbeatable prices.',
  story: '',
  mission: '',
  vision: '',
  heroImage: '',
  teamImage: '',
  values: [
    { title: 'Quality Guaranteed', desc: 'Every product is verified for authenticity and top-notch quality.' },
    { title: 'Fast Delivery', desc: 'Our logistics network ensures your orders reach you in record time.' },
    { title: 'Secure Checkout', desc: 'Industry-leading encryption keeps your payment information safe.' },
    { title: '24/7 Support', desc: 'Our dedicated customer service team is always here to help you.' },
  ],
  stats: [
    { label: 'Happy Customers', value: '2M+' },
    { label: 'Products Available', value: '50K+' },
    { label: 'Brands Partnered', value: '500+' },
    { label: 'Cities Covered', value: '120+' },
  ],
  ctaText: 'Explore Our Catalog',
  ctaUrl: '/products',
};

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&+/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanTypingSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/&+/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function PagesTab() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  // Server-Side Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Active editor tab in modal
  const [modalTab, setModalTab] = useState('general'); // 'general' | 'aboutConfig'
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    aboutConfig: INITIAL_ABOUT_CONFIG,
    isActive: true
  });

  useEffect(() => {
    fetchPages();
  }, [page, limit]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await pageService.getAll({ page, limit });
      if (res.success) {
        setPages(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pageDoc = null) => {
    setShowPreview(false);
    if (pageDoc) {
      setEditingPage(pageDoc);
      setFormData({
        title: pageDoc.title || '',
        slug: pageDoc.slug || '',
        content: pageDoc.content || '',
        metaTitle: pageDoc.metaTitle || pageDoc.seoTitle || '',
        metaDescription: pageDoc.metaDescription || pageDoc.seoDescription || '',
        aboutConfig: pageDoc.aboutConfig || INITIAL_ABOUT_CONFIG,
        isActive: pageDoc.isActive !== false
      });
      setModalTab(pageDoc.slug === 'about' ? 'aboutConfig' : 'general');
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        aboutConfig: INITIAL_ABOUT_CONFIG,
        isActive: true
      });
      setModalTab('general');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanSlug = slugify(formData.slug || formData.title);
      if (!cleanSlug) {
        alert('Please provide a valid slug');
        return;
      }

      // Build payload matching backend CreatePageDto / UpdatePageDto exactly
      const payload = {
        title: formData.title.trim(),
        slug: cleanSlug,
        content: formData.content,
        metaTitle: formData.metaTitle?.trim() || '',
        metaDescription: formData.metaDescription?.trim() || '',
        isActive: Boolean(formData.isActive),
      };

      // Only include aboutConfig if this is the dedicated 'about' page
      if (cleanSlug === 'about' || editingPage?.slug === 'about') {
        payload.aboutConfig = formData.aboutConfig;
      }

      if (editingPage) {
        await pageService.update(editingPage._id, payload);
      } else {
        await pageService.create(payload);
      }
      setShowModal(false);
      fetchPages();
    } catch (err) {
      alert(err.message || 'Error saving page');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      try {
        await pageService.delete(id);
        fetchPages();
      } catch (err) {
        alert(err.message || 'Error deleting page');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await pageService.update(id, { isActive: !currentStatus });
      fetchPages();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAboutConfig = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      aboutConfig: {
        ...prev.aboutConfig,
        [key]: value,
      },
    }));
  };

  const updateStatItem = (index, field, value) => {
    const newStats = [...(formData.aboutConfig?.stats || [])];
    if (newStats[index]) {
      newStats[index] = { ...newStats[index], [field]: value };
      updateAboutConfig('stats', newStats);
    }
  };

  const updateValueItem = (index, field, value) => {
    const newValues = [...(formData.aboutConfig?.values || [])];
    if (newValues[index]) {
      newValues[index] = { ...newValues[index], [field]: value };
      updateAboutConfig('values', newValues);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="var(--orange, #f97316)" /> Content Management (CMS Pages)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Manage the About Us experience, Company Story, verified statistics, and public legal documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={fetchPages} 
            title="Refresh"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            type="button"
            className={styles.addButton} 
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Add CMS Page
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading CMS pages...</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>URL Slug</th>
                <th>Special Layout</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No pages found.</td></tr>
              ) : (
                pages.map((p) => {
                  const isAbout = p.slug === 'about';
                  const publicUrl = isAbout ? '/about' : `/pages/${p.slug}`;
                  return (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</td>
                      <td>
                        <code style={{ background: '#f1f3f5', padding: '2px 6px', borderRadius: '4px' }}>
                          {publicUrl}
                        </code>
                        <a href={publicUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: '#007bff' }}>
                          <ExternalLink size={14} />
                        </a>
                      </td>
                      <td>
                        {isAbout ? (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#fef3c7', color: '#92400e' }}>
                            ★ DYNAMIC ABOUT US
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Standard Page</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${p.isActive ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`} 
                          onClick={() => toggleStatus(p._id, p.isActive)} 
                          title={p.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {p.isActive ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`} 
                          onClick={() => handleOpenModal(p)} 
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                          onClick={() => handleDelete(p._id)} 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {pages.length} of <strong>{total}</strong> pages
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

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                {editingPage ? `Edit Page: ${formData.title}` : 'Add New CMS Page'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* If slug is 'about', show tab switch */}
            {formData.slug === 'about' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('aboutConfig')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: modalTab === 'aboutConfig' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: modalTab === 'aboutConfig' ? '#f8fafc' : 'white',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  About Us Structured Sections
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('general')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: modalTab === 'general' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: modalTab === 'general' ? '#f8fafc' : 'white',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  General Page & SEO Meta
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalTab === 'aboutConfig' ? (
                <>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800 }}>Hero Header & CTA</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Headline Title</label>
                        <input
                          type="text"
                          value={formData.aboutConfig?.headline || ''}
                          onChange={(e) => updateAboutConfig('headline', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Subheadline</label>
                        <input
                          type="text"
                          value={formData.aboutConfig?.subheadline || ''}
                          onChange={(e) => updateAboutConfig('subheadline', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>CTA Button Text</label>
                        <input
                          type="text"
                          value={formData.aboutConfig?.ctaText || ''}
                          onChange={(e) => updateAboutConfig('ctaText', e.target.value)}
                          placeholder="Explore Our Catalog"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>CTA Destination URL</label>
                        <input
                          type="text"
                          value={formData.aboutConfig?.ctaUrl || ''}
                          onChange={(e) => updateAboutConfig('ctaUrl', e.target.value)}
                          placeholder="/products"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Our Journey & Story</label>
                    <textarea
                      value={formData.aboutConfig?.story || ''}
                      onChange={(e) => updateAboutConfig('story', e.target.value)}
                      rows="4"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Our Mission</label>
                      <textarea
                        value={formData.aboutConfig?.mission || ''}
                        onChange={(e) => updateAboutConfig('mission', e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Our Vision</label>
                      <textarea
                        value={formData.aboutConfig?.vision || ''}
                        onChange={(e) => updateAboutConfig('vision', e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <ImageUpload
                      label="Hero Background Artwork"
                      multiple={false}
                      value={formData.aboutConfig?.heroImage || ''}
                      onChange={(url) => updateAboutConfig('heroImage', url)}
                      helperText="Optional custom high-resolution banner for About Us header."
                    />
                    <ImageUpload
                      label="Team / Warehouse Photo"
                      multiple={false}
                      value={formData.aboutConfig?.teamImage || ''}
                      onChange={(url) => updateAboutConfig('teamImage', url)}
                      helperText="Photo accompanying the Our Story section."
                    />
                  </div>

                  {/* Verified Statistics */}
                  <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Verified Statistics Highlights (4 items)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {[0, 1, 2, 3].map((idx) => {
                        const item = formData.aboutConfig?.stats?.[idx] || { label: '', value: '' };
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="text"
                              placeholder="Value (e.g. 15K+)"
                              value={item.value}
                              onChange={(e) => updateStatItem(idx, 'value', e.target.value)}
                              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                            />
                            <input
                              type="text"
                              placeholder="Label (e.g. Products)"
                              value={item.label}
                              onChange={(e) => updateStatItem(idx, 'label', e.target.value)}
                              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Page Title</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => {
                          const val = e.target.value;
                          const currentAutoSlug = slugify(formData.title);
                          if (!editingPage && (formData.slug === currentAutoSlug || !formData.slug)) {
                            setFormData({...formData, title: val, slug: slugify(val)});
                          } else {
                            setFormData({...formData, title: val});
                          }
                        }} 
                        required 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Slug (URL path)</label>
                      <input 
                        type="text" 
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: cleanTypingSlug(e.target.value)})}
                        onBlur={() => setFormData(prev => ({ ...prev, slug: slugify(prev.slug) }))}
                        required 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>SEO Meta Title</label>
                      <input 
                        type="text" 
                        value={formData.metaTitle || ''} 
                        onChange={e => setFormData({...formData, metaTitle: e.target.value})} 
                        placeholder="Pick2Mart — About Us"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>SEO Meta Description</label>
                      <input 
                        type="text" 
                        value={formData.metaDescription || ''} 
                        onChange={e => setFormData({...formData, metaDescription: e.target.value})} 
                        placeholder="Pick2Mart marketplace overview and mission"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        Page Content (Markdown & HTML Supported)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: showPreview ? '#0f172a' : '#f8fafc',
                          color: showPreview ? '#ffffff' : '#334155',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {showPreview ? <Code size={13} /> : <Eye size={13} />}
                        {showPreview ? 'Edit Content' : 'Live Preview'}
                      </button>
                    </div>

                    {!showPreview && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, content: prev.content ? `${prev.content}\n\n## Section Title` : '## Section Title' }))}
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + Section (##)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, content: prev.content ? `${prev.content}\n- Bullet point` : '- Bullet point' }))}
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + Bullet List (-)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, content: prev.content ? `${prev.content} **bold text**` : '**bold text**' }))}
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}
                        >
                          **Bold**
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, content: prev.content ? `${prev.content}\n> Important callout note` : '> Important callout note' }))}
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}
                        >
                          &gt; Callout Note
                        </button>
                      </div>
                    )}

                    {showPreview ? (
                      <div
                        style={{
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: '#ffffff',
                          maxHeight: '320px',
                          overflowY: 'auto',
                          fontSize: '0.95rem',
                          lineHeight: '1.7',
                          color: '#334155',
                        }}
                        dangerouslySetInnerHTML={{ __html: formatCmsContent(formData.content, formData.title) || '<em>No content entered yet.</em>' }}
                      />
                    ) : (
                      <textarea 
                        value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})} 
                        rows="10" 
                        placeholder="Write policy content using Markdown or HTML...&#10;&#10;## 1. Introduction&#10;Welcome to Pick2Mart...&#10;&#10;## 2. Order Processing&#10;- Item 1&#10;- Item 2"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}
                      />
                    )}
                    <small style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
                      Tip: Supports Markdown (## Headings, - Lists, **bold**) and HTML tags. Headings, sections, and lists will automatically render with clean typography.
                    </small>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input
                  type="checkbox"
                  id="pageIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0f172a' }}
                />
                <label htmlFor="pageIsActive" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Publish page live on storefront
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#f1f3f5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save CMS Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
