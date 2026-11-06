'use client';
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { categoryService } from '../../services/category.service';
import { Search, RefreshCw, CheckCircle2, XCircle, AlertCircle, X, Plus, Edit, Trash2, Loader2, Package } from 'lucide-react';
import styles from '../../app/admin/page.module.css';
import { ImageUpload } from '../ImageUpload';

const INITIAL_FORM = {
  name: '',
  brand: '',
  sku: '',
  categoryId: '',
  sellerId: '',
  price: '',
  compareAtPrice: '',
  discount: 0,
  taxPercentage: 18,
  stockQuantity: 50,
  shortDescription: '',
  description: '',
  images: '',
  status: 'active',
  isApproved: true,
  isActive: true,
};

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Add / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rejection Dialog
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, approvalFilter]);

  useEffect(() => {
    loadCategoriesAndSellers();
  }, []);

  const loadCategoriesAndSellers = async () => {
    try {
      const [catRes, sellersRes] = await Promise.allSettled([
        categoryService.getActive(),
        adminService.getAllSellers(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        const validCats = (catRes.value.data || []).filter(
          (c) => c?.name && !c.name.match(/^(FinCat|ReturnCat|TestCat)_/i)
        );
        setCategories(validCats);
      }

      if (sellersRes.status === 'fulfilled' && sellersRes.value?.success) {
        setSellers(sellersRes.value.data || sellersRes.value.sellers || []);
      }
    } catch (err) {
      console.warn('Could not load categories/sellers for admin modal:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllProducts({
        search,
        isApproved: approvalFilter,
        page,
        limit: 15,
      });
      if (response.success) {
        setProducts(response.data);
        if (response.meta) setMeta(response.meta);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...INITIAL_FORM,
      categoryId: categories[0]?._id || '',
      sellerId: sellers[0]?.user?._id || sellers[0]?._id || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p) => {
    setEditingProduct(p);
    const catId = p.categoryId?._id || p.categoryId || '';
    const sId = p.sellerId?._id || p.sellerId || '';
    const imgStr = Array.isArray(p.images)
      ? p.images.map((img) => (typeof img === 'string' ? img : img?.url)).join(', ')
      : '';

    setFormData({
      name: p.name || '',
      brand: p.brand || '',
      sku: p.sku || '',
      categoryId: catId,
      sellerId: sId,
      price: p.price !== undefined ? p.price : '',
      compareAtPrice: p.compareAtPrice !== undefined ? p.compareAtPrice : '',
      discount: p.discount || 0,
      taxPercentage: p.taxPercentage || 18,
      stockQuantity: p.stockQuantity || 50,
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      images: imgStr,
      status: p.status || 'active',
      isApproved: p.isApproved !== undefined ? p.isApproved : true,
      isActive: p.isActive !== undefined ? p.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validation
    if (!formData.name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (!formData.brand.trim()) {
      setFormError('Brand is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setFormError('SKU code is required.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a product category.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }
    if (!formData.shortDescription.trim()) {
      setFormError('Short summary is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Detailed description is required.');
      return;
    }

    setSubmitting(true);

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
      sellerId: formData.sellerId || undefined,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      taxPercentage: formData.taxPercentage ? parseFloat(formData.taxPercentage) : 18,
      stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity, 10) : 50,
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      images: imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      status: formData.status,
      isApproved: formData.isApproved,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editingProduct) {
        res = await adminService.updateProduct(editingProduct._id, payload);
      } else {
        res = await adminService.createProduct(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        setSuccessMsg(editingProduct ? 'Product updated successfully!' : 'Product added and published successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchProducts();
      } else {
        setFormError(res.message || 'Failed to save product');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.updateProductApproval(id, true);
      setSuccessMsg('Product approved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to approve product');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingProduct) return;
    setRejectLoading(true);
    try {
      await adminService.updateProductApproval(rejectingProduct._id, false, rejectionReason);
      setRejectingProduct(null);
      setRejectionReason('');
      setSuccessMsg('Product marked as rejected.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to reject product');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newActive = !currentStatus;
      await adminService.updateProductStatus(id, newActive, newActive ? 'active' : 'inactive');
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to update product status');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This removes its catalog listing and associated stock records.`)) {
      try {
        await adminService.deleteProduct(id);
        setSuccessMsg('Product removed successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header with Search, Filter & Add Product Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search products by title, SKU, brand..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={approvalFilter} 
            onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
          >
            <option value="">All Approvals</option>
            <option value="true">Approved</option>
            <option value="false">Pending / Rejected</option>
          </select>

          <button 
            onClick={fetchProducts} 
            title="Refresh Products"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--orange, #f97316)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
            }}
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>

      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {/* Products Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading products catalog...</div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>No products found</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>There are currently no items matching your criteria.</p>
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Create First Product
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Pricing & MRP</th>
                <th>Approval</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const imgUrl = Array.isArray(p.images) && p.images.length > 0
                  ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100';

                return (
                  <tr key={p._id}>
                    <td>
                      <img 
                        src={imgUrl} 
                        alt={p.name} 
                        className={styles.productImg}
                        style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        SKU: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{p.sku}</code> • {p.brand}
                      </span>
                      {p.rejectionReason && !p.isApproved && (
                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>
                          Reason: {p.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
                        {p.categoryId?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                        {p.sellerId?.fullName || p.sellerId?.businessName || p.sellerId?.email || 'Platform Direct'}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>₹{p.price?.toLocaleString()}</strong>
                      {p.compareAtPrice > p.price && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>
                          ₹{p.compareAtPrice?.toLocaleString()}
                        </span>
                      )}
                      {p.discount > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--orange, #f97316)', fontWeight: '700' }}>
                          {p.discount}% OFF
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: p.isApproved ? '#dcfce7' : '#fee2e2',
                        color: p.isApproved ? '#15803d' : '#b91c1c',
                      }}>
                        {p.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: p.isActive ? '#eff6ff' : '#f1f5f9',
                        color: p.isActive ? '#1d4ed8' : '#64748b',
                      }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#334155',
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>

                        {/* Approval Toggle */}
                        {!p.isApproved ? (
                          <button
                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
                            style={{ backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534', padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleApprove(p._id)}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            className={styles.actionBtn}
                            style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b', padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => { setRejectingProduct(p); setRejectionReason(''); }}
                          >
                            Reject
                          </button>
                        )}

                        {/* Status Toggle */}
                        <button
                          className={styles.actionBtn}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleToggleStatus(p._id, p.isActive)}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          title="Delete Product"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fecdd3',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#e11d48',
                          }}
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
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} products)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page <= 1 ? '#f1f5f9' : 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button 
              disabled={page >= meta.totalPages} 
              onClick={() => setPage(page + 1)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: page >= meta.totalPages ? '#f1f5f9' : 'white', cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  {editingProduct ? `Updating SKU: ${editingProduct.sku}` : 'Fill in the verified details to publish on Pick2Mart storefront.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {formError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title, Brand, SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    value={formData.name}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    placeholder="e.g. Sony"
                    value={formData.brand}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    placeholder="e.g. SNY-WH-XM5"
                    value={formData.sku}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Category & Seller Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Assign to Seller / Merchant
                  </label>
                  <select
                    name="sellerId"
                    value={formData.sellerId}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
                  >
                    <option value="">Platform Direct / Default Seller</option>
                    {sellers.map((s) => {
                      const uId = s.user?._id || s._id;
                      const name = s.businessName || s.user?.fullName || s.user?.email || 'Seller';
                      return (
                        <option key={uId} value={uId}>
                          {name} ({s.businessEmail || s.user?.email || ''})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="24999"
                    value={formData.price}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    MRP / Compare (₹)
                  </label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    min="0"
                    step="0.01"
                    placeholder="29999"
                    value={formData.compareAtPrice}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={formData.discount}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    GST Tax (%)
                  </label>
                  <input
                    type="number"
                    name="taxPercentage"
                    min="0"
                    max="100"
                    value={formData.taxPercentage}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Product Gallery Images Upload */}
              <div>
                <ImageUpload
                  label="Product Gallery Images"
                  multiple={true}
                  value={formData.images}
                  onChange={(newImages) =>
                    setFormData((prev) => ({ ...prev, images: newImages }))
                  }
                  helperText="Upload files from your computer. The first uploaded image serves as the primary storefront image."
                />
              </div>

              {/* Short Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Short Summary *
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  required
                  placeholder="e.g. Industry-leading noise canceling with Auto NC Optimizer"
                  value={formData.shortDescription}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Full Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Detailed Product Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Provide comprehensive product specifications, in-box contents, and warranty details..."
                  value={formData.description}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {/* Status and Flags */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={handleFormChange}
                    style={{ accentColor: '#16a34a' }}
                  />
                  Pre-Approved for Marketplace
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Live & Visible on Storefront
                </label>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--orange, #f97316)',
                    color: 'white',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Product...
                    </>
                  ) : (
                    editingProduct ? 'Save Changes' : 'Publish Product to Catalog'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reject Product Feedback Modal */}
      {rejectingProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setRejectingProduct(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#64748b" />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Reject Product Submission
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Product: <strong>{rejectingProduct.name}</strong>
            </p>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Rejection Reason (Feedback for Seller)
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Explain why this product was rejected (e.g. low resolution image, missing regulatory compliance info, incorrect category)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRejectingProduct(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
