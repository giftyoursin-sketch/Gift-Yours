import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, FolderTree, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '@business/app/AppContext';
import CategoryForm from './CategoryForm';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [collapsedParents, setCollapsedParents] = useState({});

  // Group by parent
  const tree = useMemo(() => {
    const parentMap = new Map();
    const childrenMap = new Map();
    
    (categories || []).forEach(cat => {
      if (!cat.parentId) {
        parentMap.set(cat.id, cat);
        if (!childrenMap.has(cat.id)) childrenMap.set(cat.id, []);
      } else {
        if (!childrenMap.has(cat.parentId)) childrenMap.set(cat.parentId, []);
        childrenMap.get(cat.parentId).push(cat);
      }
    });

    // Sort parents
    const sortedParents = Array.from(parentMap.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return sortedParents.map(parent => ({
      ...parent,
      children: (childrenMap.get(parent.id) || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    }));
  }, [categories]);

  const topLevelCategories = useMemo(() => {
    return (categories || []).filter(c => !c.parentId);
  }, [categories]);

  const handleSave = async (data) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await addCategory(data);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  const confirmDelete = (cat) => {
    if (window.confirm(`Are you sure you want to delete "${cat.name}"?`)) {
      deleteCategory(cat.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>🏷️ Category Management</h3>
        <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowForm(true); }}>
          <Plus size={15} />
          <span className="desktop-only">Add Category</span>
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        {tree.length === 0 ? (
          <div className="empty-state">
            <FolderTree size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No categories found</h3>
            <p>Create your first category to organize products</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tree.map(parent => (
              <div key={parent.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {/* Parent Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-2)', borderBottom: (parent.children.length > 0 && !collapsedParents[parent.id]) ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={16} /></div>
                    {parent.children.length > 0 ? (
                      <button 
                        className="btn-icon" 
                        style={{ padding: 0, color: 'var(--text-muted)' }} 
                        onClick={() => setCollapsedParents(prev => ({ ...prev, [parent.id]: !prev[parent.id] }))}
                      >
                        {collapsedParents[parent.id] ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      </button>
                    ) : (
                      <div style={{ width: 18 }} />
                    )}
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{parent.name}</div>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{parent.children.length} sub</span>
                    {parent.status === 'inactive' && <span className="badge badge-accent">Inactive</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => { setEditingCategory(parent); setShowForm(true); }}><Edit2 size={16} /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => confirmDelete(parent)} style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                
                {/* Children Rows */}
                {(parent.children.length > 0 && !collapsedParents[parent.id]) && (
                  <div style={{ padding: '0.5rem 0' }}>
                    {parent.children.map(child => (
                      <div key={child.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.75rem 3.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={14} /></div>
                          <div style={{ color: 'var(--text-main)' }}>{child.name}</div>
                          {child.status === 'inactive' && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Inactive</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={() => { setEditingCategory(child); setShowForm(true); }}><Edit2 size={14} /></button>
                          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--error)' }} onClick={() => confirmDelete(child)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CategoryForm 
          category={editingCategory} 
          parentCategories={topLevelCategories}
          onClose={() => { setShowForm(false); setEditingCategory(null); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
