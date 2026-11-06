'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  Store,
  ExternalLink,
  LogOut,
  CheckCircle,
  Clock,
  RotateCcw,
  Tag,
  X
} from 'lucide-react';
import styles from '../../app/seller/page.module.css';

export default function SellerSidebar({
  activeTab,
  setActiveTab,
  sellerProfile,
  mobileOpen,
  setMobileOpen,
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/seller/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'inventory', label: 'Inventory & Stock', icon: <Layers size={18} /> },
    { id: 'orders', label: 'Seller Orders', icon: <ShoppingBag size={18} /> },
    { id: 'returns', label: 'Returns & Claims', icon: <RotateCcw size={18} /> },
    { id: 'offers', label: 'Offers & Coupons', icon: <Tag size={18} /> },
    { id: 'earnings', label: 'Earnings & Payouts', icon: <DollarSign size={18} /> },
    { id: 'profile', label: 'Store Profile', icon: <Store size={18} /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <Link href="/seller" className={styles.brandLogo}>
          <span className={styles.brandBadge}>P2M</span>
          <span className={styles.brandName}>
            Merchant <span className={styles.sellerBadge}>Portal</span>
          </span>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className={styles.closeBtn}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.storeInfoCard}>
        <div className={styles.storeName} title={sellerProfile?.businessName || 'Seller Store'}>
          {sellerProfile?.businessName || 'Merchant Store'}
        </div>
        <div className={styles.storeStatus}>
          {sellerProfile?.isApproved ? (
            <span className={styles.statusApproved} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Verified Partner
            </span>
          ) : (
            <span className={styles.statusPending} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Review Pending
            </span>
          )}
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (mobileOpen) setMobileOpen(false);
            }}
            className={`${styles.navButton} ${activeTab === item.id ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/products" target="_blank" className={styles.linkStorefront}>
          <ExternalLink size={16} /> View Storefront
        </Link>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
