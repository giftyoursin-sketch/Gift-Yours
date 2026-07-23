import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, Archive, MoreVertical, Package, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductForm from './ProductForm';

const CATEGORIES = ['All', 'Photo Frames', 'Gift Items', 'Personalized Gifts', 'Home Decor', 'Photo Gifts', 'Customized Products', 'Other'];
const STATUS_COLORS = { active: 'success', inactive: 'muted', 'out-of-stock': 'error' };

export default function Products() {
  const { products, deleteProduct, addProduct, updateProduct } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    const matchStatus = status === 'All' || p.status === status;
    return matchSearch && matchCat && matchStatus;
  }), [products, search, category, status]);

  const handleEdit = (p) => { setEditProduct(p); setShowForm(true); setMenuOpen(null); };
  const handleDuplicate = (p) => {
    addProduct({ ...p, id: undefined, name: p.name + ' (Copy)', sku: undefined, createdAt: undefined });
    setMenuOpen(null);
  };
  const handleDelete = (id) => { if (window.confirm('Delete this product?')) { deleteProduct(id); } setMenuOpen(null); };
  const handleArchive = (p) => { updateProduct(p.id, { status: 'inactive' }); setMenuOpen(null); };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search products, SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 160 }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
              {/* Status Badge */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`badge badge-${STATUS_COLORS[p.status] || 'muted'}`}>
                  {p.status || 'active'}
                </span>
                {/* Menu */}
                <div style={{ position: 'relative' }}>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}>
                    <MoreVertical size={15} />
                  </button>
                  {menuOpen === p.id && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(null)} />
                      <div className="dropdown-menu" style={{ zIndex: 20 }}>
                        <div className="dropdown-item" onClick={() => handleEdit(p)}><Edit2 size={14} /> Edit</div>
                        <div className="dropdown-item" onClick={() => handleDuplicate(p)}><Copy size={14} /> Duplicate</div>
                        <div className="dropdown-item" onClick={() => handleArchive(p)}><Archive size={14} /> Archive</div>
                        <div className="dropdown-item danger" onClick={() => handleDelete(p.id)}><Trash2 size={14} /> Delete</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Product Icon */}
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Package size={22} color="var(--primary)" />
              </div>

              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem', paddingRight: '4rem' }}>{p.name}</h3>
              {p.sku && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>SKU: {p.sku}</div>}
              {p.category && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>{p.category}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '0.625rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Selling</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{p.sellingPrice || 0}</div>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '0.625rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Cost</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₹{p.purchasePrice || 0}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: p.stock <= 0 ? 'var(--error)' : p.stock <= (p.minStock || 5) ? 'var(--warning)' : 'var(--success)' }}>
                    {p.stock || 0} in stock
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Profit: ₹{(p.sellingPrice || 0) - (p.purchasePrice || 0)}
                </div>
              </div>

              {/* Low stock warning */}
              {p.stock > 0 && p.stock <= (p.minStock || 5) && (
                <div style={{ marginTop: '0.75rem', padding: '0.375rem 0.625rem', background: 'var(--warning-light)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
                  ⚠️ Low stock alert
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editProduct) await updateProduct(editProduct.id, data);
            else await addProduct(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
