'use client';
import { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardTab from '../../components/admin/DashboardTab';
import OrdersTable from '../../components/admin/OrdersTable';
import InventoryTable from '../../components/admin/InventoryTable';
import UsersTable from '../../components/admin/UsersTable';
import SellersTable from '../../components/admin/SellersTable';
import ProductsTable from '../../components/admin/ProductsTable';
import CategoriesTab from '../../components/admin/CategoriesTab';
import CartsWishlistsTab from '../../components/admin/CartsWishlistsTab';
import SettingsTab from '../../components/admin/SettingsTab';
import BannersTab from '../../components/admin/BannersTab';
import PagesTab from '../../components/admin/PagesTab';
import ActivityLogsTab from '../../components/admin/ActivityLogsTab';
import DeliveriesTab from '../../components/admin/DeliveriesTab';
import AdminEarningsTab from '../../components/admin/AdminEarningsTab';
import AdminReturnsTab from '../../components/admin/tabs/AdminReturnsTab';
import PromotionsTab from '../../components/admin/tabs/PromotionsTab';
import DealsTab from '../../components/admin/tabs/DealsTab';
import NewsletterTab from '../../components/admin/tabs/NewsletterTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState('sections');
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDeniedUser, setAccessDeniedUser] = useState(null);

  const handleNavigate = (tab, subTab = null) => {
    setActiveTab(tab);
    if (subTab) {
      setSettingsSubTab(subTab);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/admin/login?redirect=/admin');
        return;
      }
      try {
        const response = await userService.getProfile();
        if (response.success && response.data.role === 'admin') {
          setAuthLoading(false);
        } else {
          setAccessDeniedUser(response.data || { role: 'unauthorized' });
          setAuthLoading(false);
        }
      } catch (err) {
        router.push('/admin/login?redirect=/admin');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  if (authLoading) {
    return <div className={styles.loading}>Loading Dashboard...</div>;
  }

  if (accessDeniedUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#1e293b', borderRadius: '16px', padding: '36px', textAlign: 'center', border: '1px solid #334155', color: '#f8fafc' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            ⚠
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Admin Access Denied</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Your account ({accessDeniedUser.email || 'Current Account'}) is registered as <strong>{accessDeniedUser.role?.toUpperCase()}</strong>. Access to the Pick2Mart Operations Console is strictly restricted to system administrators.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/')} style={{ padding: '10px 18px', backgroundColor: '#334155', color: '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Return to Store
            </button>
            <button onClick={handleLogout} style={{ padding: '10px 18px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'orders':
        return 'Order Management & Fulfillment';
      case 'returns':
        return 'Returns, Refunds & Claims Management';
      case 'deliveries':
        return 'Deliveries & Fleet Dispatch Management';
      case 'inventory':
        return 'Inventory & Stock Management';
      case 'products':
        return 'Product Management & Approvals';
      case 'categories':
        return 'Category Management';
      case 'sellers':
        return 'Seller Management & Verification';
      case 'earnings':
        return 'Commission Rules, Seller Earnings & Payout Management';
      case 'users':
        return 'Customer & User Accounts';
      case 'activity':
        return 'Live Carts & Wishlist Monitoring';
      case 'banners':
        return 'Promotional Banner Management';
      case 'deals':
        return 'Deals & Flash Sale Management';
      case 'promotions':
        return 'Offers, Discounts & Coupon Management';
      case 'newsletter':
        return 'Newsletter Subscribers & VIP Leads';
      case 'pages':
        return 'Content Management (CMS Pages)';
      case 'settings':
        return 'Site Configuration & Settings';
      case 'logs':
        return 'Admin Audit Trail & Activity Logs';
      default:
        return `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.mainContent}>
        <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{getTabTitle()}</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'dashboard' && <DashboardTab onNavigateTab={setActiveTab} />}
          {activeTab === 'orders' && <OrdersTable />}
          {activeTab === 'returns' && <AdminReturnsTab />}
          {activeTab === 'deliveries' && <DeliveriesTab />}
          {activeTab === 'inventory' && <InventoryTable />}
          {activeTab === 'products' && <ProductsTable />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'sellers' && <SellersTable />}
          {activeTab === 'earnings' && <AdminEarningsTab />}
          {activeTab === 'users' && <UsersTable />}
          {activeTab === 'activity' && <CartsWishlistsTab />}
          {activeTab === 'banners' && <BannersTab onNavigateTab={setActiveTab} />}
          {activeTab === 'deals' && <DealsTab />}
          {activeTab === 'promotions' && <PromotionsTab />}
          {activeTab === 'newsletter' && <NewsletterTab onNavigateToSettings={(subTab = 'newsletter') => handleNavigate('settings', subTab)} />}
          {activeTab === 'pages' && <PagesTab />}
          {activeTab === 'settings' && <SettingsTab initialSubTab={settingsSubTab} />}
          {activeTab === 'logs' && <ActivityLogsTab />}
        </div>
      </div>
    </div>
  );
}
