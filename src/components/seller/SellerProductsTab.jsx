'use client';
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { sellerService } from '../../services/seller.service';
import styles from '../../app/seller/page.module.css';
import { ImageUpload } from '../ImageUpload';

export default function SellerProductsTab({ isApproved, onManageInventory }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    categoryId: '',
    price: '',
    compareAtPrice: '',
    discount: '0',
    taxPercentage: '18',
    shortDescription: '',
    description: '',
    images: '',
    status: 'draft',
  });

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        sellerService.getProducts(),
        sellerService.getCategories(),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data || []);
      } else {
        setError(prodRes.message || 'Failed to fetch seller products');
      }

      if (catRes.success) {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'An error occurred loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      sku: '',
      categoryId: categories[0]?._id || '',
      price: '',
      compareAtPrice: '',
      discount: '0',
      taxPercentage: '18',
      shortDescription: '',
      description: '',
      images: '',
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      sku: product.sku || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
      discount: product.discount !== undefined ? product.discount.toString() : '0',
      taxPercentage: product.taxPercentage !== undefined ? product.taxPercentage.toString() : '18',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      status: product.status || 'draft',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await sellerService.deleteProduct(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert(res.message || 'Failed to delete product');
      }
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    // Parse images (array or comma-separated string)
    const imageList = Array.isArray(formData.images)
      ? formData.images.filter(Boolean)
      : (formData.images || '')
          .split(',')
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      sku: formData.sku.trim(),
      categoryId: formData.categoryId,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      taxPercentage: formData.taxPercentage ? parseFloat(formData.taxPercentage) : 18,
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      images: imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      status: formData.status,
    };

    try {
      let res;
      if (editingProduct) {
        res = await sellerService.updateProduct(editingProduct._id, payload);
      } else {
        res = await sellerService.createProduct(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchProductsAndCategories();
      } else {
        setFormError(res.message || 'Failed to save product');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit product');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    const catId = p.categoryId?._id || p.categoryId;
    const matchesCategory = categoryFilter === '' || catId === categoryFilter;
    const matchesStatus = statusFilter === '' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Header & Controls */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Merchant Product Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Manage your store offerings, pricing, SKU codes, and listing statuses.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!isApproved}
          className={styles.primaryBtn}
          title={!isApproved ? 'Account approval required to publish products' : ''}
          style={{ opacity: !isApproved ? 0.6 : 1, cursor: !isApproved ? 'not-allowed' : 'pointer' }}
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.formSelect}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.formSelect}
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="inactive">Inactive</option>
        </select>

        <button onClick={fetchProductsAndCategories} className={styles.secondaryBtn} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Product Table */}
      <div className={styles.cardSection} style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading catalog...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <ImageIcon className={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>No products found</h3>
            <p style={{ fontSize: '0.875rem' }}>
              {products.length === 0
                ? 'Your catalog is empty. Click "Add New Product" to publish your first item.'
                : 'No products match your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Platform Status</th>
                  <th>Admin Review</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                  return (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={img}
                          alt={p.name}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            backgroundColor: '#f1f5f9',
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                          SKU: <span style={{ fontFamily: 'monospace' }}>{p.sku}</span> • {p.brand}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: '#475569' }}>
                          {p.categoryId?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0284c7' }}>₹{p.price?.toLocaleString('en-IN')}</div>
                        {p.compareAtPrice && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{p.compareAtPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            p.status === 'active'
                              ? styles.badgeSuccess
                              : p.status === 'draft'
                              ? styles.badgeNeutral
                              : p.status === 'out_of_stock'
                              ? styles.badgeWarning
                              : styles.badgeDanger
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.isApproved ? (
                          <span className={styles.statusApproved} style={{ fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={13} /> Approved
                          </span>
                        ) : (
                          <span className={styles.statusPending} style={{ fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={13} /> Pending Review
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => onManageInventory(p._id, p.name)}
                            className={styles.secondaryBtn}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                            title="Manage Variants & Stock"
                          >
                            <Layers size={14} /> Variants
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className={styles.secondaryBtn}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className={styles.dangerBtn}
                            style={{ padding: '0.35rem 0.65rem' }}
                            title="Delete Product"
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
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product to Store'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {formError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {formError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wireless Noise Cancelling Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sony, Pick2Mart"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Master SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ELEC-HDPHN-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Listing Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="599.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Compare at Price (MRP ₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="999.00"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tax Percentage (GST %)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxPercentage}
                    onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Short Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Key highlight shown on product cards"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full specifications, features, warranty, and care guide..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <ImageUpload
                  label="Product Gallery Images"
                  multiple={true}
                  value={formData.images}
                  onChange={(newImages) =>
                    setFormData((prev) => ({ ...prev, images: newImages }))
                  }
                  helperText="Upload photos from your computer. The first uploaded image serves as the primary display image."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={styles.primaryBtn}
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
