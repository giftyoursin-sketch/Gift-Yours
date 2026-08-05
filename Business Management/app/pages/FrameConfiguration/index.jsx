import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { Plus, Edit2, Trash2, Search, Layout } from 'lucide-react';
import ConfigModal from './ConfigModal';

const TABS = [
  'Size', 'Color', 'Margin', 'PaperType', 'CanvasType', 
  'Thickness', 'Wrap', 'Border', 'Orientation', 'Finish'
];

export default function FrameConfiguration() {
  const { frameConfigurations, addFrameConfig, updateFrameConfig, deleteFrameConfig } = useApp();
  const [activeTab, setActiveTab] = useState('Size');
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const filteredConfigs = (frameConfigurations || [])
    .filter(c => c.type === activeTab)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = () => {
    setEditingConfig(null);
    setModalOpen(true);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteFrameConfig(id);
    }
  };

  const handleSave = async (data) => {
    if (editingConfig) {
      await updateFrameConfig(editingConfig.id, data);
    } else {
      await addFrameConfig(data);
    }
    setModalOpen(false);
  };

  return (
    <div className="fade-in">
      <div className="header-actions">
        <h1 className="h2">Frame Configurations</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Configuration
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
            <Layout size={20} />
            <h2 className="h3">Manage {activeTab} Options</h2>
          </div>
          <div className="search-box">
            <Search size={20} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Value</th>
                <th>Price Mod</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No configurations found for {activeTab}.</p>
                    <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={handleAdd}>
                      Add First {activeTab}
                    </button>
                  </td>
                </tr>
              ) : (
                filteredConfigs.map(config => (
                  <tr key={config.id}>
                    <td>{config.sortOrder}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {config.type === 'Color' && (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: config.value || '#000', border: '1px solid var(--color-border)' }} />
                        )}
                        {config.thumbnailUrl && (
                          <img src={config.thumbnailUrl} alt={config.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        {config.name}
                      </div>
                    </td>
                    <td>{config.value || '-'}</td>
                    <td>
                      {config.price > 0 ? `+₹${config.price}` : config.price < 0 ? `-₹${Math.abs(config.price)}` : 'Base Price'}
                      {config.offerPrice && <span style={{ marginLeft: '0.5rem', textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>₹{config.offerPrice}</span>}
                    </td>
                    <td>
                      <span className={`badge ${config.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => handleEdit(config)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(config.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfigModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        config={editingConfig}
        onSave={handleSave}
      />
    </div>
  );
}
