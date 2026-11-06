'use client';
import React from 'react';
import styles from '../../app/admin/page.module.css';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Users, 
  Store, 
  FolderTree, 
  ShoppingCart, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  History,
  Truck,
  DollarSign,
  RotateCcw,
  Tag,
  Zap,
  Mail
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { id: 'returns', label: 'Returns & Refunds', icon: <RotateCcw size={18} /> },
    { id: 'deliveries', label: 'Deliveries & Fleet', icon: <Truck size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Boxes size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'sellers', label: 'Sellers', icon: <Store size={18} /> },
    { id: 'earnings', label: 'Earnings & Payouts', icon: <DollarSign size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'activity', label: 'Carts & Wishlists', icon: <ShoppingCart size={18} /> },
    { id: 'banners', label: 'Hero & Banners', icon: <ImageIcon size={18} /> },
    { id: 'deals', label: 'Deals & Flash Sales', icon: <Zap size={18} /> },
    { id: 'promotions', label: 'Coupons & Offers', icon: <Tag size={18} /> },
    { id: 'newsletter', label: 'Newsletter Subscribers', icon: <Mail size={18} /> },
    { id: 'pages', label: 'CMS Pages', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Site Settings', icon: <Settings size={18} /> },
    { id: 'logs', label: 'Activity Logs', icon: <History size={18} /> },
  ];

  return (
    <div className={styles.sidebar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '0.5rem', marginBottom: '1.5rem' }}>
        <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', borderRadius: '4px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Admin Panel</h2>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
