import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '@supabaseClient';
import { User, MapPin, LogOut, Plus, Trash2, Edit2, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const returnTo = searchParams.get('returnTo');

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(action === 'add-address');
  const [formData, setFormData] = useState({
    full_name: '', phone: '', email: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', label: 'Home', is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoading(true);
    const { data } = await supabase.from('addresses').select('*').eq('customer_id', user.id).order('is_default', { ascending: false });
    if (data) setAddresses(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (formData.is_default) {
      // Unset previous defaults
      await supabase.from('addresses').update({ is_default: false }).eq('customer_id', user.id);
    }
    
    if (formData.id) {
      await supabase.from('addresses').update(formData).eq('id', formData.id);
    } else {
      await supabase.from('addresses').insert([{ ...formData, customer_id: user.id }]);
    }
    
    setShowForm(false);
    setFormData({ full_name: '', phone: '', email: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', label: 'Home', is_default: false });
    await fetchAddresses();
    
    if (returnTo) navigate(returnTo);
  };

  const deleteAddress = async (id) => {
    if (window.confirm('Delete this address?')) {
      await supabase.from('addresses').delete().eq('id', id);
      fetchAddresses();
    }
  };

  if (authLoading) return <div className="container section flex-center" style={{ minHeight: '60vh' }}><div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div></div>;
  if (!user) return <Navigate to="/login?returnTo=/profile" replace />;

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="h2">My Account</h1>
        <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Profile Summary */}
        <div style={{ flex: '1 1 300px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary) 0%, #B91C1C 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <User size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{user.user_metadata?.full_name || 'Customer'}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{user.phone || user.email}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 1rem', background: 'var(--color-success-bg, #ecfdf5)', borderRadius: 'var(--radius-full)' }}>
            <ShieldCheck size={16} /> Secure Account
          </div>
        </div>

        {/* Addresses */}
        <div style={{ flex: '2 1 600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="h3">Saved Addresses</h3>
            {!showForm && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)} style={{ padding: '0.5rem 1rem' }}>
                <Plus size={16} /> Add New
              </button>
            )}
          </div>

          {showForm ? (
            <form onSubmit={handleSaveAddress} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{formData.id ? 'Edit Address' : 'Add New Address'}</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input type="text" className="input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Address Line 1 (House No, Building, Street)</label>
                <input type="text" className="input" required value={formData.address_line1} onChange={e => setFormData({...formData, address_line1: e.target.value})} />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Address Line 2 (Area, Landmark)</label>
                <input type="text" className="input" value={formData.address_line2} onChange={e => setFormData({...formData, address_line2: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" className="input" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input type="text" className="input" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <input type="checkbox" id="is_default" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="is_default">Set as default delivery address</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {loading ? (
                <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }}></div>
              ) : addresses.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
                  <MapPin size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No addresses saved yet.</p>
                  <button className="btn btn-outline" onClick={() => setShowForm(true)}>Add Address</button>
                </div>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', background: 'var(--color-bg)' }}>
                    {addr.is_default && <span className="badge" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-primary)', color: 'white' }}>Default</span>}
                    
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '1.0625rem' }}>{addr.full_name}</h4>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{addr.phone}</div>
                    
                    <p style={{ color: 'var(--color-text-main)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                      <br />{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                      <button onClick={() => { setFormData(addr); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => deleteAddress(addr.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
