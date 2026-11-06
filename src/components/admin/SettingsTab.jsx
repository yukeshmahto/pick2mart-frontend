'use client';
import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  RefreshCw,
  Megaphone,
  Truck,
  Building,
  Menu,
  Mail,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
  Palette,
  QrCode,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import styles from '../../app/admin/page.module.css';
import { ImageUpload } from '../ImageUpload';

export default function SettingsTab({ initialSubTab }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'sections'); 
  // 'sections' | 'headerNav' | 'newsletter' | 'trending' | 'spotlights' | 'general' | 'announcement' | 'policies'

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // General Settings state
  const [formData, setFormData] = useState({
    siteName: '',
    logoUrl: '',
    supportEmail: '',
    supportPhone: '',
    address: '',
    footerText: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
    },
    storeMaintenanceMode: false,
    storeCurrency: 'INR',
    storeCurrencySymbol: '₹',
  });

  // Header Navigation state
  const [headerNavigation, setHeaderNavigation] = useState([
    { label: 'All Categories', url: '/category', isFeatured: false, order: 1 },
    { label: 'Shop', url: '/products', isFeatured: false, order: 2 },
    { label: 'Flash Deals', url: '/#flash_deals', isFeatured: true, order: 3 },
    { label: 'About Us', url: '/about', isFeatured: false, order: 4 },
    { label: 'Become a Seller', url: '/become-seller', isFeatured: false, order: 5 },
  ]);

  // Newsletter Config state
  const [newsletterConfig, setNewsletterConfig] = useState({
    headline: 'Claim Flat ₹200 OFF on Your Next Order',
    subtitle: 'Subscribe to personalized weekly flash drops, exclusive price crash alerts, and member-only coupons.',
    kicker: 'VIP Perks Club',
    ctaText: 'Claim Coupon',
    couponCode: 'WELCOME200',
    isActive: true,
    enabled: true,
    disclaimer: 'Zero spam. Unsubscribe anytime with one tap.',
    inputPlaceholder: 'Enter your email address...',
    showAppOffer: true,
    appTitle: 'Shop Faster on Pick2Mart App',
    appDescription: 'Enjoy app-exclusive hourly deals, live dispatch order tracking, and easy one-click checkout.',
    appStats: '★ 4.8 ◉ 10M+ Installs',
    qrCodeText: 'SCAN TO INSTALL',
    qrCodeImage: '',
    appStoreUrl: '',
    playStoreUrl: '',
  });

  // Trending Config state
  const [trendingConfig, setTrendingConfig] = useState({
    title: 'Trending Right Now',
    subtitle: 'Handpicked bestsellers and fast-moving daily deals.',
    maxProducts: 8,
    autoMode: true,
  });

  // Spotlights state
  const [spotlights, setSpotlights] = useState([]);
  const [spotlightConfig, setSpotlightConfig] = useState({
    enabled: true,
    title: 'Curated Spotlights',
    kicker: 'Seasonal highlights',
    subtitle: 'Handpicked deals verified for top value and quality score.',
  });

  // Announcement state
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    badge: 'FESTIVE VALUE',
    text: 'Mega Savings Festival: Flat 50% Off on 10K+ Products | Use Code: PICKFAST | Free Delivery on Orders Above ₹999',
    linkText: 'Claim Bank Offers',
    linkUrl: '/products',
  });

  // Shipping & Policies state
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 999,
    standardShippingFee: 49,
    expressShippingFee: 99,
  });

  const [policyConfig, setPolicyConfig] = useState({
    returnWindowDays: 7,
    cancellationWindowHours: 24,
    codEnabled: true,
    codMaxLimit: 10000,
    defaultTaxPercentage: 18,
    minOrderValue: 199,
  });

  // Homepage Sections state
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, sectionsRes] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getHomepageSections(),
      ]);

      if (settingsRes.success && settingsRes.data) {
        const d = settingsRes.data;
        setFormData({
          siteName: d.siteName || '',
          logoUrl: d.logoUrl || '',
          supportEmail: d.supportEmail || '',
          supportPhone: d.supportPhone || '',
          address: d.address || '',
          footerText: d.footerText || '',
          socialLinks: d.socialLinks || { facebook: '', twitter: '', instagram: '' },
          storeMaintenanceMode: !!d.storeMaintenanceMode,
          storeCurrency: d.storeCurrency || 'INR',
          storeCurrencySymbol: d.storeCurrencySymbol || '₹',
        });

        if (d.headerNavigation && Array.isArray(d.headerNavigation) && d.headerNavigation.length > 0) {
          setHeaderNavigation(d.headerNavigation);
        }

        if (d.newsletterConfig) {
          setNewsletterConfig({
            headline: d.newsletterConfig.headline || 'Claim Flat ₹200 OFF on Your Next Order',
            subtitle: d.newsletterConfig.subtitle || d.newsletterConfig.description || 'Subscribe to personalized weekly flash drops, exclusive price crash alerts, and member-only coupons.',
            kicker: d.newsletterConfig.kicker || d.newsletterConfig.badgeText || 'VIP Perks Club',
            ctaText: d.newsletterConfig.ctaText || 'Claim Coupon',
            couponCode: d.newsletterConfig.couponCode || 'WELCOME200',
            isActive: d.newsletterConfig.isActive !== false && d.newsletterConfig.enabled !== false,
            enabled: d.newsletterConfig.enabled !== false && d.newsletterConfig.isActive !== false,
            disclaimer: d.newsletterConfig.disclaimer || 'Zero spam. Unsubscribe anytime with one tap.',
            inputPlaceholder: d.newsletterConfig.inputPlaceholder || 'Enter your email address...',
            showAppOffer: d.newsletterConfig.showAppOffer !== false,
            appTitle: d.newsletterConfig.appTitle || 'Shop Faster on Pick2Mart App',
            appDescription: d.newsletterConfig.appDescription || 'Enjoy app-exclusive hourly deals, live dispatch order tracking, and easy one-click checkout.',
            appStats: d.newsletterConfig.appStats || '★ 4.8 ◉ 10M+ Installs',
            qrCodeText: d.newsletterConfig.qrCodeText || 'SCAN TO INSTALL',
            qrCodeImage: d.newsletterConfig.qrCodeImage || '',
            appStoreUrl: d.newsletterConfig.appStoreUrl || '',
            playStoreUrl: d.newsletterConfig.playStoreUrl || '',
          });
        }

        if (d.trendingConfig) {
          setTrendingConfig({
            title: d.trendingConfig.title || 'Trending Right Now',
            subtitle: d.trendingConfig.subtitle || '',
            maxProducts: d.trendingConfig.maxProducts || 8,
            autoMode: d.trendingConfig.autoMode !== false,
          });
        }

        if (d.spotlightConfig) {
          setSpotlightConfig({
            enabled: d.spotlightConfig.enabled !== false,
            title: d.spotlightConfig.title || 'Curated Spotlights',
            kicker: d.spotlightConfig.kicker || 'Seasonal highlights',
            subtitle: d.spotlightConfig.subtitle || 'Handpicked deals verified for top value and quality score.',
          });
        }

        if (d.spotlights && Array.isArray(d.spotlights) && d.spotlights.length > 0) {
          setSpotlights(d.spotlights);
        } else {
          setSpotlights([
            {
              badge: 'MUST HAVE',
              title: 'Kitchen Essentials',
              discountText: 'Min 50% OFF',
              description: 'Cookware, blenders & prep tools.',
              linkUrl: '/products?category=home-kitchen',
              imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=85',
              themeColor: 'coral',
              ctaText: 'Explore',
            },
            {
              badge: 'BUDGET HUB',
              title: 'Footwear Frenzy',
              discountText: 'Under ₹499',
              description: 'Sneakers, slides & sandals.',
              linkUrl: '/products?category=fashion',
              imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=85',
              themeColor: 'lavender-card',
              ctaText: 'Explore',
            },
            {
              badge: 'FESTIVE CHOICE',
              title: 'Beauty Bestsellers',
              discountText: 'Buy 2 Get 1 Free',
              description: 'Skin, haircare & makeup essentials.',
              linkUrl: '/products?category=beauty',
              imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=85',
              themeColor: 'mint-card',
              ctaText: 'Explore',
            },
            {
              badge: 'HOME MAKEOVER',
              title: 'Home Decor Refresh',
              discountText: 'Starting ₹299',
              description: 'Cushions, lamps, wall frames & rugs.',
              linkUrl: '/products?category=home-kitchen',
              imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=85',
              themeColor: 'peach-card',
              ctaText: 'Explore',
            },
          ]);
        }

        if (d.announcement) {
          setAnnouncement({
            enabled: d.announcement.enabled !== false,
            badge: d.announcement.badge || 'FESTIVE VALUE',
            text: d.announcement.text || '',
            linkText: d.announcement.linkText || '',
            linkUrl: d.announcement.linkUrl || '/products',
          });
        }

        if (d.shippingConfig) {
          setShippingConfig({
            freeShippingThreshold: d.shippingConfig.freeShippingThreshold ?? 999,
            standardShippingFee: d.shippingConfig.standardShippingFee ?? 49,
            expressShippingFee: d.shippingConfig.expressShippingFee ?? 99,
          });
        }

        if (d.policyConfig) {
          setPolicyConfig({
            returnWindowDays: d.policyConfig.returnWindowDays ?? 7,
            cancellationWindowHours: d.policyConfig.cancellationWindowHours ?? 24,
            codEnabled: d.policyConfig.codEnabled !== false,
            codMaxLimit: d.policyConfig.codMaxLimit ?? 10000,
            defaultTaxPercentage: d.policyConfig.defaultTaxPercentage ?? 18,
            minOrderValue: d.policyConfig.minOrderValue ?? 199,
          });
        }
      }

      if (sectionsRes.success && Array.isArray(sectionsRes.data)) {
        setSections(sectionsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        headerNavigation,
        newsletterConfig: {
          ...newsletterConfig,
          enabled: newsletterConfig.isActive,
          badgeText: newsletterConfig.kicker,
          description: newsletterConfig.subtitle,
        },
        trendingConfig,
        spotlights,
        spotlightConfig,
        announcement,
        shippingConfig,
        policyConfig,
      };
      const response = await settingsService.updateSettings(payload);
      if (response.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionEnabled = (index) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  const handleSaveSections = async () => {
    setSavingSections(true);
    setError(null);
    try {
      const res = await settingsService.updateHomepageSections(sections);
      if (res.success) {
        setSuccess('Homepage section order & visibility updated!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update homepage sections');
    } finally {
      setSavingSections(false);
    }
  };

  // Header Navigation Helpers
  const addNavItem = () => {
    setHeaderNavigation((prev) => [
      ...prev,
      { label: 'New Link', url: '/products', isFeatured: false, order: prev.length + 1 },
    ]);
  };

  const updateNavItem = (index, field, value) => {
    setHeaderNavigation((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeNavItem = (index) => {
    setHeaderNavigation((prev) => prev.filter((_, i) => i !== index));
  };

  // Spotlight Helpers
  // Spotlight Helpers
  const addSpotlightItem = () => {
    const themeCycle = ['coral', 'lavender-card', 'mint-card', 'peach-card'];
    setSpotlights((prev) => [
      ...prev,
      {
        badge: 'NEW DEAL',
        title: 'New Spotlight Collection',
        discountText: 'Special Savings',
        description: 'Explore trending arrivals and handpicked quality picks.',
        linkUrl: '/products',
        imageUrl: '',
        themeColor: themeCycle[prev.length % themeCycle.length],
        ctaText: 'Explore',
      },
    ]);
  };

  const updateSpotlightItem = (index, field, value) => {
    setSpotlights((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      if (field === 'imageUrl') copy[index].image = value;
      if (field === 'image') copy[index].imageUrl = value;
      if (field === 'linkUrl') copy[index].link = value;
      if (field === 'link') copy[index].linkUrl = value;
      return copy;
    });
  };

  const removeSpotlightItem = (index) => {
    setSpotlights((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSpotlightItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= spotlights.length) return;
    setSpotlights((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const resetSpotlightsToDefault = () => {
    if (typeof window !== 'undefined' && window.confirm('Reset spotlights to the 4 verified default cards?')) {
      setSpotlights([
        {
          badge: 'MUST HAVE',
          title: 'Kitchen Essentials',
          discountText: 'Min 50% OFF',
          description: 'Cookware, blenders & prep tools.',
          linkUrl: '/products?category=home-kitchen',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=85',
          themeColor: 'coral',
          ctaText: 'Explore',
        },
        {
          badge: 'BUDGET HUB',
          title: 'Footwear Frenzy',
          discountText: 'Under ₹499',
          description: 'Sneakers, slides & sandals.',
          linkUrl: '/products?category=fashion',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=85',
          themeColor: 'lavender-card',
          ctaText: 'Explore',
        },
        {
          badge: 'FESTIVE CHOICE',
          title: 'Beauty Bestsellers',
          discountText: 'Buy 2 Get 1 Free',
          description: 'Skin, haircare & makeup essentials.',
          linkUrl: '/products?category=beauty',
          imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=85',
          themeColor: 'mint-card',
          ctaText: 'Explore',
        },
        {
          badge: 'HOME MAKEOVER',
          title: 'Home Decor Refresh',
          discountText: 'Starting ₹299',
          description: 'Cushions, lamps, wall frames & rugs.',
          linkUrl: '/products?category=home-kitchen',
          imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=85',
          themeColor: 'peach-card',
          ctaText: 'Explore',
        },
      ]);
      setSpotlightConfig({
        enabled: true,
        title: 'Curated Spotlights',
        kicker: 'Seasonal highlights',
        subtitle: 'Handpicked deals verified for top value and quality score.',
      });
    }
  };

  if (loading) return <div className={styles.spinner}>Loading settings & layout...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-tab navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('sections')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'sections' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'sections' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'sections' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Sliders size={15} /> Homepage Layout
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('headerNav')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'headerNav' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'headerNav' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'headerNav' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Menu size={15} /> Header Navigation
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('newsletter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'newsletter' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'newsletter' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'newsletter' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Mail size={15} /> VIP Perks & App Banner
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('trending')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'trending' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'trending' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'trending' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <TrendingUp size={15} /> Trending Section
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('spotlights')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'spotlights' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'spotlights' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'spotlights' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Sparkles size={15} /> Spotlights
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('announcement')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'announcement' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'announcement' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'announcement' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Megaphone size={15} /> Announcement Bar
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'general' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'general' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'general' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Building size={15} /> Branding & Contact
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('policies')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: activeSubTab === 'policies' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeSubTab === 'policies' ? '#f8fafc' : 'white',
              fontWeight: '700',
              color: activeSubTab === 'policies' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Truck size={15} /> Shipping & Policies
          </button>
        </div>

        <button
          type="button"
          onClick={fetchData}
          title="Refresh Settings"
          style={{
            padding: '9px 13px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div
          style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* SECTIONS MANAGER TAB */}
      {activeSubTab === 'sections' && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
              Dynamic Homepage Layout Configurator
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Reorder homepage blocks and toggle sections on or off in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sections.map((sec, idx) => (
              <div
                key={sec.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: sec.enabled ? '#ffffff' : '#f8fafc',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      color: '#475569',
                      fontSize: '0.85rem',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: '700',
                        color: sec.enabled ? '#0f172a' : '#94a3b8',
                        fontSize: '1rem',
                      }}
                    >
                      {sec.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Identifier: <code>{sec.key}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, -1)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: idx === 0 ? '#f1f5f9' : 'white',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      }}
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, 1)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: idx === sections.length - 1 ? '#f1f5f9' : 'white',
                        cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer',
                      }}
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSectionEnabled(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: sec.enabled ? '#dcfce7' : '#fee2e2',
                      color: sec.enabled ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {sec.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    {sec.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              disabled={savingSections}
              onClick={handleSaveSections}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: savingSections ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={18} />
              {savingSections ? 'Saving Layout...' : 'Save Homepage Layout'}
            </button>
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION CONFIGURATOR */}
      {activeSubTab === 'headerNav' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Storefront Header Navigation Menu
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
                Manage navigation links, order, and promotional highlights visible under the top search bar.
              </p>
            </div>
            <button
              type="button"
              onClick={addNavItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--orange, #f97316)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Menu Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {headerNavigation.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr auto auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Label Text</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateNavItem(idx, 'label', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Destination URL</label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => updateNavItem(idx, 'url', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Order</label>
                  <input
                    type="number"
                    value={item.order || idx + 1}
                    onChange={(e) => updateNavItem(idx, 'order', parseInt(e.target.value, 10) || 1)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                  <input
                    type="checkbox"
                    id={`feat_${idx}`}
                    checked={item.isFeatured}
                    onChange={(e) => updateNavItem(idx, 'isFeatured', e.target.checked)}
                    style={{ accentColor: 'var(--orange, #f97316)' }}
                  />
                  <label htmlFor={`feat_${idx}`} style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Highlight
                  </label>
                </div>
                <div style={{ paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => removeNavItem(idx)}
                    style={{ padding: '6px 10px', border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              disabled={saving}
              onClick={handleGeneralSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Navigation Menu'}
            </button>
          </div>
        </div>
      )}

      {/* NEWSLETTER & APP OFFER CAMPAIGN TAB */}
      {activeSubTab === 'newsletter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={22} color="var(--orange, #f97316)" /> Homepage VIP Newsletter & App Download Section
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  Control the promotional discount copy, delivered coupon code, and the mobile app download card with QR code.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleGeneralSubmit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Section Settings'}
              </button>
            </div>
          </div>

          {/* LIVE PREVIEW BANNER */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#0f172a" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Live Storefront Preview</h4>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '12px',
                background: newsletterConfig.isActive ? '#dcfce7' : '#fee2e2',
                color: newsletterConfig.isActive ? '#15803d' : '#b91c1c'
              }}>
                {newsletterConfig.isActive ? 'Active on Storefront' : 'Currently Hidden'}
              </span>
            </div>

            <div
              style={{
                borderRadius: '14px',
                padding: '30px',
                background: 'linear-gradient(105deg, #03060d 0%, #111b30 48%, #1e293b 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px',
                opacity: newsletterConfig.isActive ? 1 : 0.6,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
              }}
            >
              <div style={{ maxWidth: '580px', flex: '1 1 320px' }}>
                <span style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  background: '#ff5b1f',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '12px',
                }}>
                  {newsletterConfig.kicker || 'VIP Perks Club'}
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>
                  {newsletterConfig.headline || 'Claim Flat ₹200 OFF on Your Next Order'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 18px', lineHeight: 1.5 }}>
                  {newsletterConfig.subtitle || 'Subscribe to personalized weekly flash drops, exclusive price crash alerts, and member-only coupons.'}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '480px' }}>
                  <input
                    type="text"
                    readOnly
                    placeholder={newsletterConfig.inputPlaceholder || 'Enter your email address...'}
                    style={{
                      flex: '1 1 200px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#1e293b',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      background: '#ff5a1f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {newsletterConfig.ctaText || 'Claim Coupon'} <ArrowRight size={14} />
                  </button>
                </div>
                <small style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginTop: '10px' }}>
                  {newsletterConfig.disclaimer || 'Zero spam. Unsubscribe anytime with one tap.'}
                </small>
              </div>

              {newsletterConfig.showAppOffer && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    maxWidth: '460px',
                    flex: '1 1 300px',
                  }}
                >
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: '4px',
                    }}
                  >
                    {newsletterConfig.qrCodeImage ? (
                      <img
                        src={newsletterConfig.qrCodeImage}
                        alt="QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <QrCode size={46} color="#0f172a" />
                        <span style={{ fontSize: '7px', fontWeight: 800, marginTop: '2px', color: '#475569' }}>
                          {newsletterConfig.qrCodeText || 'SCAN TO INSTALL'}
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', display: 'block', color: '#ffffff', marginBottom: '4px' }}>
                      {newsletterConfig.appTitle || 'Shop Faster on Pick2Mart App'}
                    </strong>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 8px', lineHeight: 1.4 }}>
                      {newsletterConfig.appDescription || 'Enjoy app-exclusive hourly deals, live dispatch order tracking, and easy one-click checkout.'}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                      {newsletterConfig.appStats || '★ 4.8 ◉ 10M+ Installs'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DUAL CONFIGURATION CARDS */}
          <form onSubmit={handleGeneralSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
            {/* PANEL 1: VIP PERKS & NEWSLETTER SETTINGS */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="#0f172a" /> Newsletter & VIP Drops
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Headline copy, discount coupon, and subscription form behavior.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="newsActive"
                  checked={newsletterConfig.isActive}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, isActive: e.target.checked, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'pointer' }}
                />
                <label htmlFor="newsActive" style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontSize: '0.88rem' }}>
                  Show Newsletter Section on Homepage
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Badge / Kicker Tag
                </label>
                <input
                  type="text"
                  value={newsletterConfig.kicker}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, kicker: e.target.value })}
                  placeholder="VIP Perks Club"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterConfig.headline}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, headline: e.target.value })}
                  placeholder="Claim Flat ₹200 OFF on Your Next Order"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Supporting Description
                </label>
                <textarea
                  rows="3"
                  value={newsletterConfig.subtitle}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, subtitle: e.target.value })}
                  placeholder="Subscribe to personalized weekly flash drops..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Delivered Coupon Code
                  </label>
                  <input
                    type="text"
                    value={newsletterConfig.couponCode}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, couponCode: e.target.value.toUpperCase() })}
                    placeholder="WELCOME200"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>
                    Presented to user on submission
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={newsletterConfig.ctaText}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, ctaText: e.target.value })}
                    placeholder="Claim Coupon"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Input Field Placeholder
                </label>
                <input
                  type="text"
                  value={newsletterConfig.inputPlaceholder}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, inputPlaceholder: e.target.value })}
                  placeholder="Enter your email address..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Disclaimer Note
                </label>
                <input
                  type="text"
                  value={newsletterConfig.disclaimer}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, disclaimer: e.target.value })}
                  placeholder="Zero spam. Unsubscribe anytime with one tap."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* PANEL 2: MOBILE APP PROMO & QR CODE SETTINGS */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color="#0f172a" /> Mobile App Promo & QR Code Card
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Right-hand card promoting mobile downloads, QR scanning, and store links.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="showAppOffer"
                  checked={newsletterConfig.showAppOffer}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, showAppOffer: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'pointer' }}
                />
                <label htmlFor="showAppOffer" style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontSize: '0.88rem' }}>
                  Enable Mobile App Download Card
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  App Card Title
                </label>
                <input
                  type="text"
                  value={newsletterConfig.appTitle}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, appTitle: e.target.value })}
                  placeholder="Shop Faster on Pick2Mart App"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  App Benefits / Description
                </label>
                <textarea
                  rows="3"
                  value={newsletterConfig.appDescription}
                  onChange={(e) => setNewsletterConfig({ ...newsletterConfig, appDescription: e.target.value })}
                  placeholder="Enjoy app-exclusive hourly deals, live dispatch order tracking..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Rating & Installs Badge
                  </label>
                  <input
                    type="text"
                    value={newsletterConfig.appStats}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, appStats: e.target.value })}
                    placeholder="★ 4.8 ◉ 10M+ Installs"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    QR Code Subtext
                  </label>
                  <input
                    type="text"
                    value={newsletterConfig.qrCodeText}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, qrCodeText: e.target.value })}
                    placeholder="SCAN TO INSTALL"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Custom QR Code Image (Optional)
                </label>
                <ImageUpload
                  value={newsletterConfig.qrCodeImage}
                  onChange={(url) => setNewsletterConfig({ ...newsletterConfig, qrCodeImage: url })}
                  helperText="Upload a custom QR code (e.g. from Google Play / Branch.io). If left empty, clean vector QR icon is displayed."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Google Play Store URL
                  </label>
                  <input
                    type="url"
                    value={newsletterConfig.playStoreUrl}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, playStoreUrl: e.target.value })}
                    placeholder="https://play.google.com/store/apps/..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Apple App Store URL
                  </label>
                  <input
                    type="url"
                    value={newsletterConfig.appStoreUrl}
                    onChange={(e) => setNewsletterConfig({ ...newsletterConfig, appStoreUrl: e.target.value })}
                    placeholder="https://apps.apple.com/app/..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={18} /> {saving ? 'Saving Changes...' : 'Save All Section Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TRENDING SECTION TAB */}
      {activeSubTab === 'trending' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                Trending Right Now Section Configuration
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Configure the headline, supporting copy, and product catalog limit.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Section Title</label>
                <input
                  type="text"
                  value={trendingConfig.title}
                  onChange={(e) => setTrendingConfig({ ...trendingConfig, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Subtitle</label>
                <input
                  type="text"
                  value={trendingConfig.subtitle}
                  onChange={(e) => setTrendingConfig({ ...trendingConfig, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Max Products Displayed</label>
                <input
                  type="number"
                  min="4"
                  max="24"
                  value={trendingConfig.maxProducts}
                  onChange={(e) => setTrendingConfig({ ...trendingConfig, maxProducts: parseInt(e.target.value, 10) || 8 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                <input
                  type="checkbox"
                  id="trendAuto"
                  checked={trendingConfig.autoMode}
                  onChange={(e) => setTrendingConfig({ ...trendingConfig, autoMode: e.target.checked })}
                  style={{ accentColor: '#0f172a' }}
                />
                <label htmlFor="trendAuto" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Auto-sort by review count and order volume
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save Trending Config'}
            </button>
          </form>
        </div>
      )}

      {/* SPOTLIGHTS TAB */}
      {activeSubTab === 'spotlights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Sparkles size={22} color="var(--orange, #f97316)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Curated Spotlights Section Configurator
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                Control section visibility, headers, cards count, artwork, discount badges, and links dynamically on the storefront.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={resetSpotlightsToDefault}
                title="Reset to 4 default cards"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} /> Reset Defaults
              </button>

              <button
                type="button"
                onClick={addSpotlightItem}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--orange, #f97316)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(249, 115, 22, 0.25)',
                }}
              >
                <Plus size={16} /> Add Spotlight Card
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleGeneralSubmit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
                }}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>

          {/* Section Header Controls */}
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Section Visibility & Header Settings
              </h4>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: spotlightConfig.enabled ? '#15803d' : '#b91c1c',
                  backgroundColor: spotlightConfig.enabled ? '#dcfce7' : '#fee2e2',
                  padding: '6px 14px',
                  borderRadius: '20px',
                }}
              >
                <input
                  type="checkbox"
                  checked={spotlightConfig.enabled}
                  onChange={(e) => setSpotlightConfig({ ...spotlightConfig, enabled: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#15803d', cursor: 'pointer' }}
                />
                {spotlightConfig.enabled ? 'Section Enabled on Store' : 'Section Hidden from Store'}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr) minmax(0, 2fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Section Kicker (Top Tag)
                </label>
                <input
                  type="text"
                  value={spotlightConfig.kicker || ''}
                  onChange={(e) => setSpotlightConfig({ ...spotlightConfig, kicker: e.target.value })}
                  placeholder="e.g. Seasonal highlights"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Section Main Heading *
                </label>
                <input
                  type="text"
                  value={spotlightConfig.title || ''}
                  onChange={(e) => setSpotlightConfig({ ...spotlightConfig, title: e.target.value })}
                  placeholder="e.g. Curated Spotlights"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Supporting Subtitle / Note
                </label>
                <input
                  type="text"
                  value={spotlightConfig.subtitle || ''}
                  onChange={(e) => setSpotlightConfig({ ...spotlightConfig, subtitle: e.target.value })}
                  placeholder="e.g. Handpicked deals verified for top value and quality score."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          {/* Live Storefront Preview Wireframe */}
          <div
            style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Storefront Preview
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {spotlightConfig.title || 'Curated Spotlights'}
                </h4>
                <small style={{ color: '#64748b' }}>
                  {spotlightConfig.kicker && `✦ ${spotlightConfig.kicker} — `}
                  {spotlightConfig.subtitle}
                </small>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {spotlights.length} Spotlight Card{spotlights.length === 1 ? '' : 's'} Active
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
              }}
            >
              {spotlights.map((item, idx) => {
                const themeBg =
                  item.themeColor === 'coral'
                    ? 'linear-gradient(135deg, #fff5f2 0%, #ffedd5 100%)'
                    : item.themeColor === 'lavender-card'
                    ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
                    : item.themeColor === 'mint-card'
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)';

                const themeBorder =
                  item.themeColor === 'coral'
                    ? '#fed7aa'
                    : item.themeColor === 'lavender-card'
                    ? '#ddd6fe'
                    : item.themeColor === 'mint-card'
                    ? '#bbf7d0'
                    : '#fecdd3';

                const badgeBg =
                  item.themeColor === 'coral'
                    ? '#f97316'
                    : item.themeColor === 'lavender-card'
                    ? '#4f46e5'
                    : item.themeColor === 'mint-card'
                    ? '#059669'
                    : '#e11d48';

                const discountColor =
                  item.themeColor === 'coral'
                    ? '#c2410c'
                    : item.themeColor === 'lavender-card'
                    ? '#4338ca'
                    : item.themeColor === 'mint-card'
                    ? '#047857'
                    : '#be123c';

                const previewImg = item.imageUrl || item.image;

                return (
                  <div
                    key={idx}
                    style={{
                      background: themeBg,
                      border: `1px solid ${themeBorder}`,
                      borderRadius: '12px',
                      padding: '16px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '170px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ maxWidth: previewImg ? '58%' : '100%' }}>
                      <span
                        style={{
                          backgroundColor: badgeBg,
                          color: '#ffffff',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '6px',
                        }}
                      >
                        {item.badge || 'HOT DEAL'}
                      </span>
                      <h5
                        style={{
                          margin: '0 0 4px',
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#0f172a',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.title || `Card #${idx + 1}`}
                      </h5>
                      {item.discountText && (
                        <div style={{ fontSize: '12px', fontWeight: 800, color: discountColor, marginBottom: '4px' }}>
                          {item.discountText}
                        </div>
                      )}
                      {item.description && (
                        <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: badgeBg }}>
                      {item.ctaText || 'Explore'} <ArrowRight size={12} />
                    </div>

                    {previewImg && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '84px',
                          height: '84px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '2px solid #ffffff',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <img
                          src={previewImg}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards Manager List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Configured Spotlight Cards ({spotlights.length})
              </h4>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Cards are displayed side-by-side in a responsive grid across tablet and desktop.
              </span>
            </div>

            {spotlights.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                {/* Card Item Header */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#0f172a',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {item.title || `Spotlight Card #${idx + 1}`}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSpotlightItem(idx, -1)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: idx === 0 ? '#f1f5f9' : 'white',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        color: idx === 0 ? '#94a3b8' : '#334155',
                      }}
                      title="Move Left / Up"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === spotlights.length - 1}
                      onClick={() => moveSpotlightItem(idx, 1)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: idx === spotlights.length - 1 ? '#f1f5f9' : 'white',
                        cursor: idx === spotlights.length - 1 ? 'not-allowed' : 'pointer',
                        color: idx === spotlights.length - 1 ? '#94a3b8' : '#334155',
                      }}
                      title="Move Right / Down"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSpotlightItem(idx)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        cursor: 'pointer',
                      }}
                      title="Delete Spotlight Card"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card Item Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Row 1: Badge, Title, Discount */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr) minmax(0, 1.5fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Badge Pill (e.g. MUST HAVE)
                      </label>
                      <input
                        type="text"
                        value={item.badge || ''}
                        onChange={(e) => updateSpotlightItem(idx, 'badge', e.target.value)}
                        placeholder="MUST HAVE"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Card Title *
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => updateSpotlightItem(idx, 'title', e.target.value)}
                        placeholder="Kitchen Essentials"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Discount Tag (e.g. Min 50% OFF)
                      </label>
                      <input
                        type="text"
                        value={item.discountText || ''}
                        onChange={(e) => updateSpotlightItem(idx, 'discountText', e.target.value)}
                        placeholder="Min 50% OFF or Under ₹499"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem', color: '#c2410c' }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Theme Color, Button CTA, Destination Link */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1.2fr) minmax(0, 2fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Theme Color Palette
                      </label>
                      <select
                        value={item.themeColor || 'coral'}
                        onChange={(e) => updateSpotlightItem(idx, 'themeColor', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <option value="coral">🟠 Coral Sunset (Orange / Home)</option>
                        <option value="lavender-card">🟣 Royal Lavender (Indigo / Fashion)</option>
                        <option value="mint-card">🟢 Fresh Mint (Emerald / Beauty)</option>
                        <option value="peach-card">🌸 Sweet Peach (Rose / Decor)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Button CTA Label
                      </label>
                      <input
                        type="text"
                        value={item.ctaText || 'Explore'}
                        onChange={(e) => updateSpotlightItem(idx, 'ctaText', e.target.value)}
                        placeholder="Explore"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Destination URL Link
                      </label>
                      <input
                        type="text"
                        value={item.linkUrl || item.link || '/products'}
                        onChange={(e) => updateSpotlightItem(idx, 'linkUrl', e.target.value)}
                        placeholder="/products?category=home-kitchen"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Supporting Description (Short summary displayed below discount tag)
                    </label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateSpotlightItem(idx, 'description', e.target.value)}
                      placeholder="Cookware, blenders & prep tools."
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Row 4: Image Artwork Upload */}
                  <ImageUpload
                    label="Spotlight Image Artwork"
                    multiple={false}
                    value={item.imageUrl || item.image || ''}
                    onChange={(url) => updateSpotlightItem(idx, 'imageUrl', url)}
                    helperText="Upload image or paste image link (Recommended: Square 400x400 to 500x500)."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginTop: '4px',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Ensure changes are saved. Storefront Curated Spotlights will update immediately.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleGeneralSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
              }}
            >
              <Save size={18} /> {saving ? 'Saving Spotlights...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      )}

      {/* TOP ANNOUNCEMENT TAB */}
      {activeSubTab === 'announcement' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                Top Announcement Bar Configurator
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Configure the promotional banner visible at the very top of all storefront pages.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="announcementEnabled"
                checked={announcement.enabled}
                onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'pointer' }}
              />
              <label htmlFor="announcementEnabled" style={{ fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>
                Enable Announcement Bar on Storefront
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE VALUE, FLASH SALE"
                  value={announcement.badge}
                  onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>

              <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Banner Text</label>
                <input
                  type="text"
                  placeholder="Promotional headline or discount announcement"
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Action Button / Link Text</label>
                <input
                  type="text"
                  placeholder="e.g. Claim Bank Offers, Shop Now"
                  value={announcement.linkText}
                  onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>

              <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Destination URL</label>
                <input
                  type="text"
                  placeholder="e.g. /products, /promotions"
                  value={announcement.linkUrl}
                  onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
              }}
            >
              {saving ? 'Saving...' : 'Save Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* GENERAL BRANDING TAB */}
      {activeSubTab === 'general' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem', color: '#0f172a' }}>
              General Settings
            </h3>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                  required
                />
              </div>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <ImageUpload
                  label="Marketplace Brand Logo"
                  required={true}
                  multiple={false}
                  value={formData.logoUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
                  helperText="Upload your official brand logo from your computer (transparent PNG or WEBP recommended)."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Store Currency Code</label>
                <input
                  type="text"
                  value={formData.storeCurrency}
                  onChange={(e) => setFormData({ ...formData, storeCurrency: e.target.value.toUpperCase() })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Currency Symbol</label>
                <input
                  type="text"
                  value={formData.storeCurrencySymbol}
                  onChange={(e) => setFormData({ ...formData, storeCurrencySymbol: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem', marginTop: '1rem', color: '#0f172a' }}>
              Contact Information
            </h3>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Support Phone</label>
                <input
                  type="text"
                  name="supportPhone"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Physical Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
              />
            </div>

            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem', marginTop: '1rem', color: '#0f172a' }}>
              Footer & Social Links
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Footer Text</label>
              <input
                type="text"
                name="footerText"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Facebook URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Twitter URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Instagram URL</label>
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
              }}
            >
              {saving ? 'Saving...' : 'Save Site Settings'}
            </button>
          </form>
        </div>
      )}

      {/* POLICIES & SHIPPING TAB */}
      {activeSubTab === 'policies' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                Shipping, COD & Operational Rules
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Central business parameters enforced server-side during cart calculations, order placement, and returns.
              </p>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              Shipping Rules
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingConfig.freeShippingThreshold}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingThreshold: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Orders at or above this value get FREE shipping</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingConfig.standardShippingFee}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, standardShippingFee: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Applied to orders below threshold</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Express Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingConfig.expressShippingFee}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, expressShippingFee: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginTop: '1rem' }}>
              Payment & Returns Rules
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Return Window (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={policyConfig.returnWindowDays}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, returnWindowDays: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer return eligibility cutoff</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cancellation Window (Hours)</label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={policyConfig.cancellationWindowHours}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, cancellationWindowHours: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>COD Maximum Order Limit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={policyConfig.codMaxLimit}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, codMaxLimit: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Above this, online payment is mandatory</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Minimum Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={policyConfig.minOrderValue}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, minOrderValue: Number(e.target.value) })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="codEnabled"
                checked={policyConfig.codEnabled}
                onChange={(e) => setPolicyConfig({ ...policyConfig, codEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'pointer' }}
              />
              <label htmlFor="codEnabled" style={{ fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>
                Allow Cash on Delivery (COD) Checkout
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
              }}
            >
              {saving ? 'Saving...' : 'Save Operational Policies'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
