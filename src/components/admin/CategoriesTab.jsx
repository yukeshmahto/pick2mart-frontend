'use client';
import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/category.service';
import { Trash2, Edit, Plus, Check, X, ChevronLeft, ChevronRight, Search, RefreshCw, FolderTree } from 'lucide-react';
import styles from '../../app/admin/page.module.css';
import { ImageUpload } from '../ImageUpload';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Server-Side Pagination & Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, [page, limit]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();

      const res = await categoryService.getAll(params);
      if (res.success) {
        setCategories(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive !== false
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formData);
      } else {
        await categoryService.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.delete(id);
        fetchCategories();
      } catch (err) {
        alert(err.message || 'Error deleting category');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await categoryService.update(id, { isActive: !currentStatus });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={22} color="var(--orange, #f97316)" /> Category Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Organize catalog taxonomies, slugs, thumbnails, and storefront visibility.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer' }}
            >
              <Search size={15} />
            </button>
          </form>

          <button 
            type="button"
            onClick={fetchCategories} 
            title="Refresh"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
          </button>

          <button 
            type="button"
            className={styles.addButton} 
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ display: 'inline-block', marginBottom: '8px' }} />
            <div>Loading categories...</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FolderTree size={18} color="#94a3b8" />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td><code style={{ background: '#f1f3f5', padding: '2px 6px', borderRadius: '4px' }}>{cat.slug}</code></td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{cat.description || '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${cat.isActive ? styles.badgeSuccess : styles.badgeDanger}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button 
                        type="button"
                        className={`${styles.actionBtn} ${styles.editBtn}`} 
                        onClick={() => toggleStatus(cat._id, cat.isActive)} 
                        title={cat.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {cat.isActive ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button 
                        type="button"
                        className={`${styles.actionBtn} ${styles.editBtn}`} 
                        onClick={() => handleOpenModal(cat)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                        onClick={() => handleDelete(cat._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {categories.length} of <strong>{total}</strong> categories
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => {
                    const val = e.target.value;
                    if (!editingCategory && formData.slug === formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')) {
                      setFormData({...formData, name: val, slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')});
                    } else {
                      setFormData({...formData, name: val});
                    }
                  }} 
                  required 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Slug</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows="3" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <ImageUpload
                  label="Category Image"
                  multiple={false}
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  helperText="Upload a category thumbnail from your computer (optional)."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#f1f3f5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
