'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  ShieldAlert,
  Store,
  RefreshCw,
  Clock,
  ArrowRight,
  LogOut,
  UserCheck
} from 'lucide-react';
import { userService } from '../../services/user.service';
import { sellerService } from '../../services/seller.service';

import SellerSidebar from '../../components/seller/SellerSidebar';
import SellerDashboardTab from '../../components/seller/SellerDashboardTab';
import SellerProductsTab from '../../components/seller/SellerProductsTab';
import SellerInventoryTab from '../../components/seller/SellerInventoryTab';
import SellerOrdersTab from '../../components/seller/SellerOrdersTab';
import SellerReturnsTab from '../../components/seller/tabs/SellerReturnsTab';
import SellerOffersTab from '../../components/seller/tabs/SellerOffersTab';
import SellerEarningsTab from '../../components/seller/SellerEarningsTab';
import SellerProfileTab from '../../components/seller/SellerProfileTab';

import styles from './page.module.css';

export default function SellerPortalPage() {
  const router = useRouter();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preselectedProductId, setPreselectedProductId] = useState('');

  // Authentication & Authorization State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState(null);

  useEffect(() => {
    const verifySellerAccess = async () => {
      setAuthLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) {
        router.push('/seller/login?redirect=/seller');
        return;
      }

      try {
        // 1. Fetch authenticated user profile
        const userRes = await userService.getProfile();
        if (!userRes.success || !userRes.data) {
          router.push('/seller/login?redirect=/seller');
          return;
        }

        const user = userRes.data;
        setCurrentUser(user);

        // 2. Validate Role (Admin or Seller permitted)
        if (user.role !== 'seller' && user.role !== 'admin') {
          // Check if customer submitted a seller application
          try {
            const profileRes = await sellerService.getProfile();
            if (profileRes.success && profileRes.data) {
              setSellerProfile(profileRes.data);
              setAccessDeniedReason('PENDING_APPROVAL');
            } else {
              setAccessDeniedReason('NOT_A_SELLER');
            }
          } catch (e) {
            setAccessDeniedReason('NOT_A_SELLER');
          }
          return;
        }

        // 3. User is authorized as 'seller', fetch seller profile
        try {
          const profileRes = await sellerService.getProfile();
          if (profileRes.success && profileRes.data) {
            setSellerProfile(profileRes.data);
          }
        } catch (e) {
          console.warn('Seller profile lookup warning:', e);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.push('/seller/login?redirect=/seller');
      } finally {
        setAuthLoading(false);
      }
    };

    verifySellerAccess();
  }, [router]);

  const handleNavigateToInventory = (productId) => {
    setPreselectedProductId(productId);
    setActiveTab('inventory');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/seller/login');
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <RefreshCw className="animate-spin" size={36} style={{ color: '#0284c7', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>Verifying Merchant Credentials...</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Securing merchant session and checking authorization.</p>
      </div>
    );
  }

  // 2. Access Denied: User is a Customer or Delivery Partner without a Seller account
  if (accessDeniedReason === 'NOT_A_SELLER') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1.5rem' }}>
        <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Seller Portal Access Denied
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account (<strong>{currentUser?.email}</strong>) is registered as <strong>{currentUser?.role?.toUpperCase()}</strong>. The Seller Portal is strictly reserved for verified marketplace merchant accounts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href="/become-seller"
              className={styles.primaryBtn}
              style={{ justifyContent: 'center', textDecoration: 'none', padding: '0.8rem' }}
            >
              <Store size={18} /> Apply to Become a Pick2Mart Seller
            </Link>
            <Link
              href="/products"
              className={styles.secondaryBtn}
              style={{ justifyContent: 'center', textDecoration: 'none', padding: '0.8rem' }}
            >
              Return to Customer Storefront
            </Link>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}
            >
              Sign out and log in with different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Access Denied / Review Notice: Application Submitted but Pending Approval
  if (accessDeniedReason === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1.5rem' }}>
        <div style={{ maxWidth: '560px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Clock size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Merchant Application Under Review
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Thank you for applying to sell on Pick2Mart! Your store profile for <strong>{sellerProfile?.businessName || 'your business'}</strong> has been received and is currently undergoing verification by our compliance team.
          </p>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.85rem', color: '#475569' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Submission Summary:</div>
            <div>• Registered Email: {sellerProfile?.businessEmail || currentUser?.email}</div>
            <div>• GST Number: {sellerProfile?.gstNumber || 'Pending'}</div>
            <div>• Dispatch City: {sellerProfile?.city || 'India'}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/products" className={styles.secondaryBtn} style={{ textDecoration: 'none' }}>
              Explore Storefront
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn} style={{ padding: '0.65rem 1rem' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Seller Portal Layout
  const isApproved = Boolean(sellerProfile?.isApproved);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Store Overview & Performance';
      case 'products':
        return 'Product Listings & Catalog';
      case 'inventory':
        return 'Inventory & Variant Stock Management';
      case 'orders':
        return 'Seller Order Processing & Fulfillment';
      case 'earnings':
        return 'Earnings, Commission & Payouts';
      case 'profile':
        return 'Store Profile & Business Settings';
      default:
        return 'Merchant Portal';
    }
  };

  return (
    <div className={styles.portalContainer}>
      {/* Sidebar Navigation */}
      <SellerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sellerProfile={sellerProfile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Viewport */}
      <div className={styles.mainWrapper}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileOpen(true)}
              className={styles.menuToggle}
              aria-label="Open Navigation"
            >
              <Menu size={24} />
            </button>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {currentUser?.fullName || 'Seller'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {sellerProfile?.businessName || 'Pick2Mart Merchant'}
              </div>
            </div>

            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {(currentUser?.fullName?.[0] || 'S').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Tab Content Display */}
        <main className={styles.contentContainer}>
          {activeTab === 'dashboard' && (
            <SellerDashboardTab onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'products' && (
            <SellerProductsTab
              isApproved={isApproved}
              onManageInventory={handleNavigateToInventory}
            />
          )}

          {activeTab === 'inventory' && (
            <SellerInventoryTab
              preselectedProductId={preselectedProductId}
              isApproved={isApproved}
            />
          )}

          {activeTab === 'orders' && (
            <SellerOrdersTab />
          )}

          {activeTab === 'returns' && (
            <SellerReturnsTab />
          )}

          {activeTab === 'offers' && (
            <SellerOffersTab isApproved={isApproved} />
          )}

          {activeTab === 'earnings' && (
            <SellerEarningsTab />
          )}

          {activeTab === 'profile' && (
            <SellerProfileTab
              onProfileUpdated={(updated) => setSellerProfile(updated)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
