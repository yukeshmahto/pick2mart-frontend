'use client';
import React, { useState, useEffect } from 'react';
import { bannerService } from '../../services/banner.service';
import { 
  Trash2, 
  Edit, 
  Plus, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  Image as ImageIcon, 
  Layout, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import styles from '../../app/admin/page.module.css';
import { ImageUpload } from '../ImageUpload';

const INITIAL_FORM = {
  title: '',
  subtitle: '',
  description: '',
  ctaText: 'Shop Now',
  imageUrl: '',
  mobileImageUrl: '',
  link: '/products',
  position: 'hero',
  displayOrder: 1,
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function BannersTab({ onNavigateTab }) {
  const [banners, setBanners] = useState([]);
  const [allActiveBanners, setAllActiveBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  // Server-Side Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [positionFilter, setPositionFilter] = useState('');

  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchBanners();
    fetchHeroOverview();
  }, [page, limit, positionFilter]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (positionFilter) params.position = positionFilter;

      const res = await bannerService.getAll(params);
      if (res.success) {
        setBanners(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load banners', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroOverview = async () => {
    try {
      const [heroRes, sideRes] = await Promise.allSettled([
        bannerService.getActive('hero'),
        bannerService.getActive('side'),
      ]);
      const heroData = (heroRes.status === 'fulfilled' && heroRes.value?.success) ? heroRes.value.data : [];
      const sideData = (sideRes.status === 'fulfilled' && sideRes.value?.success) ? sideRes.value.data : [];
      setAllActiveBanners({
        hero: heroData || [],
        side: sideData || [],
      });
    } catch (e) {
      console.error('Failed to load hero overview', e);
    }
  };

  const handleOpenModal = (banner = null, defaultPosition = 'hero') => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        ctaText: banner.ctaText || 'Shop Now',
        imageUrl: banner.imageUrl || '',
        mobileImageUrl: banner.mobileImageUrl || '',
        link: banner.link || '/products',
        position: banner.position || 'hero',
        displayOrder: banner.displayOrder || 1,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
        isActive: banner.isActive !== false,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        ...INITIAL_FORM,
        position: defaultPosition,
        ctaText: defaultPosition === 'side' ? 'Claim Deal' : 'Shop Now',
        subtitle: defaultPosition === 'side' ? 'FEATURED PROMO' : '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Banner image artwork is required.');
      return;
    }

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        displayOrder: parseInt(formData.displayOrder, 10) || 1,
      };

      if (editingBanner) {
        await bannerService.update(editingBanner._id, payload);
      } else {
        await bannerService.create(payload);
      }
      setShowModal(false);
      fetchBanners();
      fetchHeroOverview();
    } catch (err) {
      alert(err.message || 'Error saving banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.delete(id);
        fetchBanners();
        fetchHeroOverview();
      } catch (err) {
        alert(err.message || 'Error deleting banner');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await bannerService.update(id, { isActive: !currentStatus });
      fetchBanners();
      fetchHeroOverview();
    } catch (err) {
      console.error(err);
    }
  };

  const heroCount = allActiveBanners.hero?.length || 0;
  const sideCount = allActiveBanners.side?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '18px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={24} color="var(--orange, #f97316)" /> Homepage Hero & Banner Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Manage the hero slider (left), promotional cards (right side), spotlight strips, and scheduled promo banners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => { fetchBanners(); fetchHeroOverview(); }} 
            title="Refresh list"
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          {/* Quick Action: Add Right-Side Hero Card */}
          <button 
            type="button"
            onClick={() => handleOpenModal(null, 'side')}
            style={{ 
              padding: '9px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: '#059669', 
              color: 'white', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.875rem', 
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
            }}
          >
            <Plus size={16} /> Add Right-Side Card
          </button>

          {/* Quick Action: Add Hero Slider */}
          <button 
            type="button"
            className={styles.addButton} 
            onClick={() => handleOpenModal(null, 'hero')}
            style={{ 
              padding: '9px 16px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.875rem', 
              fontWeight: 700 
            }}
          >
            <Plus size={16} /> Add Main Hero Slide
          </button>
        </div>
      </div>

      {/* Visual Homepage Hero Section Layout Architecture Overview */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Homepage Hero Layout Overview (Live Storefront Wireframe)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Direct visual representation of what customers see at top of homepage
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(340px, 420px)', gap: '16px' }}>
          {/* Hero Left Column (Main Carousel) */}
          <div style={{ 
            backgroundColor: '#0f172a', 
            borderRadius: '12px', 
            padding: '20px', 
            color: 'white', 
            position: 'relative', 
            minHeight: '170px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid #334155'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', letterSpacing: '0.5px' }}>
                  LEFT HERO SLIDER
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                  {heroCount} active slide{heroCount === 1 ? '' : 's'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '12px 0 4px', color: '#f8fafc' }}>
                {allActiveBanners.hero?.[0]?.title || 'Main Rotating Carousel'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, maxWidth: '400px' }}>
                {allActiveBanners.hero?.[0]?.subtitle || 'Auto-sliding full-width promotional banner with CTA'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Recommended: 1920x600px</span>
              <button 
                type="button"
                onClick={() => { setPositionFilter('hero'); setPage(1); }}
                style={{ background: 'transparent', border: '1px solid #475569', color: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                View Slides →
              </button>
            </div>
          </div>

          {/* Hero Right Column (2 Side Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Top Side Card */}
            <div style={{ 
              backgroundColor: '#eff6ff', 
              border: '2px dashed #93c5fd', 
              borderRadius: '10px', 
              padding: '12px 16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              minHeight: '75px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
                  RIGHT SIDE CARD #1
                </span>
                <h5 style={{ margin: '4px 0 2px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {allActiveBanners.side?.[0]?.title || 'No Card #1 Configured'}
                </h5>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {allActiveBanners.side?.[0]?.subtitle || 'Click Add Right-Side Card to configure'}
                </span>
              </div>
              {allActiveBanners.side?.[0]?.imageUrl && (
                <img src={allActiveBanners.side[0].imageUrl} alt="preview" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #bfdbfe' }} />
              )}
            </div>

            {/* Bottom Side Card */}
            <div style={{ 
              backgroundColor: '#fff1f2', 
              border: '2px dashed #fecdd3', 
              borderRadius: '10px', 
              padding: '12px 16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              minHeight: '75px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9f1239', backgroundColor: '#ffe4e6', padding: '2px 6px', borderRadius: '4px' }}>
                  RIGHT SIDE CARD #2
                </span>
                <h5 style={{ margin: '4px 0 2px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {allActiveBanners.side?.[1]?.title || 'No Card #2 Configured'}
                </h5>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {allActiveBanners.side?.[1]?.subtitle || 'Displays directly below Card #1'}
                </span>
              </div>
              {allActiveBanners.side?.[1]?.imageUrl && (
                <img src={allActiveBanners.side[1].imageUrl} alt="preview" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #fecdd3' }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setPositionFilter(''); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: positionFilter === '' ? '2px solid #0f172a' : '1px solid #cbd5e1',
            backgroundColor: positionFilter === '' ? '#0f172a' : '#ffffff',
            color: positionFilter === '' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          All Banners ({total})
        </button>

        <button
          type="button"
          onClick={() => { setPositionFilter('hero'); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: positionFilter === 'hero' ? '2px solid #2563eb' : '1px solid #cbd5e1',
            backgroundColor: positionFilter === 'hero' ? '#eff6ff' : '#ffffff',
            color: positionFilter === 'hero' ? '#1d4ed8' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Hero Carousel (Left Slider) {heroCount > 0 && <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{heroCount}</span>}
        </button>

        <button
          type="button"
          onClick={() => { setPositionFilter('side'); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: positionFilter === 'side' ? '2px solid #059669' : '1px solid #cbd5e1',
            backgroundColor: positionFilter === 'side' ? '#ecfdf5' : '#ffffff',
            color: positionFilter === 'side' ? '#047857' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} color="#059669" /> Hero Right-Side Cards {sideCount > 0 && <span style={{ backgroundColor: '#059669', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{sideCount}</span>}
        </button>

        <button
          type="button"
          onClick={() => { setPositionFilter('spotlight'); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: positionFilter === 'spotlight' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
            backgroundColor: positionFilter === 'spotlight' ? '#f5f3ff' : '#ffffff',
            color: positionFilter === 'spotlight' ? '#6d28d9' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Spotlight Strips
        </button>

        <button
          type="button"
          onClick={() => { setPositionFilter('deal'); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: positionFilter === 'deal' ? '2px solid #d97706' : '1px solid #cbd5e1',
            backgroundColor: positionFilter === 'deal' ? '#fffbeb' : '#ffffff',
            color: positionFilter === 'deal' ? '#b45309' : '#475569',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Deal Banners
        </button>
      </div>

      {/* Spotlight Strips Helper Banner */}
      {positionFilter === 'spotlight' && (
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '2px solid #c4b5fd',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="#7c3aed" />
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#5b21b6' }}>
                Curated Spotlights (4-Card Dynamic Grid on Homepage)
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6d28d9', lineHeight: 1.5 }}>
              The Curated Spotlights section (badges, titles, discount tags, descriptions, themes, and image uploads) is fully managed dynamically under <strong>Site Settings &rarr; Spotlights</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('settings');
              } else {
                window.location.href = '/admin?tab=settings';
              }
            }}
            style={{
              padding: '10px 18px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)'
            }}
          >
            Manage Curated Spotlights <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading banners...</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Banner Preview</th>
                <th>Title / Subtitle</th>
                <th>Placement</th>
                <th>CTA Destination</th>
                <th>Display Order</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '12px' }}>
                      No banners found for {positionFilter ? `position "${positionFilter}"` : 'this filter'}.
                    </div>
                    {positionFilter === 'side' && (
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(null, 'side')}
                        style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Plus size={15} style={{ display: 'inline', marginRight: '4px' }} /> Create First Right-Side Card
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                banners.map((banner) => {
                  const isExpired = banner.endDate && new Date(banner.endDate) < new Date();
                  const isSide = banner.position === 'side';
                  const isHero = banner.position === 'hero';

                  return (
                    <tr key={banner._id}>
                      <td>
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          style={{ width: '90px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }} 
                          onClick={() => setPreviewBanner(banner)}
                          title="Click to preview"
                        />
                      </td>
                      <td>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>{banner.title}</strong>
                        {banner.subtitle && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{banner.subtitle}</span>}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          backgroundColor: isHero ? '#eff6ff' : isSide ? '#ecfdf5' : banner.position === 'spotlight' ? '#f5f3ff' : '#fef3c7',
                          color: isHero ? '#1d4ed8' : isSide ? '#047857' : banner.position === 'spotlight' ? '#6d28d9' : '#b45309',
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isSide && <Sparkles size={12} />}
                          {isSide ? 'RIGHT-SIDE HERO CARD' : isHero ? 'HERO SLIDER (LEFT)' : banner.position}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {banner.link || '/products'}
                        </code>
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'center' }}>{banner.displayOrder || 1}</td>
                      <td>
                        {banner.endDate ? (
                          <div style={{ fontSize: '0.75rem', color: isExpired ? '#b91c1c' : '#475569' }}>
                            Until: {new Date(banner.endDate).toLocaleDateString()}
                            {isExpired && <div style={{ fontWeight: '800', color: '#b91c1c' }}>EXPIRED</div>}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Always active</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${banner.isActive && !isExpired ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {banner.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => setPreviewBanner(banner)}
                          title="Preview Banner"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`} 
                          onClick={() => toggleStatus(banner._id, banner.isActive)} 
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`} 
                          onClick={() => handleOpenModal(banner)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                          onClick={() => handleDelete(banner._id)}
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
              Showing {banners.length} of <strong>{total}</strong> banners
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
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '26px', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingBanner ? 'Edit Banner / Card' : 'Add New Homepage Banner / Card'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {formData.position === 'side' 
                    ? 'Configuring Right-Side Promotional Card for Homepage Hero' 
                    : formData.position === 'hero' 
                    ? 'Configuring Main Left Rotating Hero Slider' 
                    : 'Configuring Promotional Section Banner'}
                </p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Informational Box for Right-Side Hero Cards */}
            {formData.position === 'side' && (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Info size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', color: '#065f46', lineHeight: 1.5 }}>
                  <strong>Hero Right-Side Promo Card:</strong> This card appears in the right column of the homepage hero section. Pick2Mart displays up to <strong>2 active cards</strong> simultaneously. Recommended image size: <strong>500x350px or 600x400px</strong>.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Headline Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder={formData.position === 'side' ? 'e.g. Weekend Flash Drop' : 'e.g. Mega Summer Tech Blowout'}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {formData.position === 'side' ? 'Badge Tag (Upper Label)' : 'Subtitle'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.subtitle} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                    placeholder={formData.position === 'side' ? 'e.g. UP TO 50% OFF' : 'e.g. Top Brands & Best Sellers'}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>CTA Button Text</label>
                  <input 
                    type="text" 
                    value={formData.ctaText} 
                    onChange={e => setFormData({...formData, ctaText: e.target.value})} 
                    placeholder={formData.position === 'side' ? 'Claim Deal' : 'Shop Now'}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Short Description (Optional)</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder={formData.position === 'side' ? 'e.g. Save extra 15% on orders over ₹499' : 'e.g. Discover incredible savings on modern electronics'}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <ImageUpload
                  label={formData.position === 'side' ? 'Side Card Artwork (Recommended: 600x400 / 500x350)' : 'Banner Artwork (Required)'}
                  required={true}
                  multiple={false}
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  helperText={formData.position === 'side' ? 'High-quality product or promo image for the right-side card.' : 'High-resolution desktop banner artwork (1920x600 for Hero slider).'}
                />
              </div>

              {formData.position !== 'side' && (
                <div>
                  <ImageUpload
                    label="Mobile Banner Artwork (Optional)"
                    required={false}
                    multiple={false}
                    value={formData.mobileImageUrl}
                    onChange={(url) => setFormData((prev) => ({ ...prev, mobileImageUrl: url }))}
                    helperText="Optimized portrait/square banner for smartphones (Recommended: 800x800)."
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Destination Link</label>
                  <input 
                    type="text" 
                    value={formData.link} 
                    onChange={e => setFormData({...formData, link: e.target.value})} 
                    placeholder="/products or /category/electronics"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Placement</label>
                  <select 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: 600 }}
                  >
                    <option value="hero">Hero Carousel (Left Slider)</option>
                    <option value="side">Hero Right-Side Card (Right of Hero)</option>
                    <option value="spotlight">Spotlight Strip (Mid-page)</option>
                    <option value="deal">Deal Strip (Bottom Promo)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Display Order</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.displayOrder} 
                    onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value, 10) || 1})} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Start Date (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>End Date (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0f172a' }}
                />
                <label htmlFor="bannerIsActive" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Publish Banner Immediately (Active on Storefront)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', background: formData.position === 'side' ? '#059669' : 'var(--orange, #f97316)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANNER PREVIEW MODAL */}
      {previewBanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Storefront Banner Preview</h3>
              <button type="button" onClick={() => setPreviewBanner(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', minHeight: '260px', display: 'flex', alignItems: 'center', backgroundColor: '#0f172a' }}>
              <img src={previewBanner.imageUrl} alt={previewBanner.title} style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px', color: 'white' }}>
                {previewBanner.subtitle && <span style={{ color: '#34d399', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '8px' }}>{previewBanner.subtitle}</span>}
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 16px 0', maxWidth: '450px' }}>{previewBanner.title}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'var(--orange, #f97316)', color: 'white', borderRadius: '8px', fontWeight: 700, width: 'fit-content' }}>
                  {previewBanner.ctaText || 'Shop Now'} <ArrowRight size={15} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <span>Destination Link: <strong>{previewBanner.link || '/products'}</strong></span>
              <span>Placement: <strong>{previewBanner.position?.toUpperCase()}</strong></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
