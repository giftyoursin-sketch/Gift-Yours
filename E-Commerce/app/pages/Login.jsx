import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Mail, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { user, sendOtp, verifyOtp, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If a returnTo param is passed, we go back there after login, otherwise home
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/';

  const [mode, setMode] = useState('phone'); // phone, email-login, email-register
  const [step, setStep] = useState('input'); // input, otp, success
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Ensure SMS auth is enabled in Supabase.');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      setStep('success');
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'email-login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, { full_name: name });
      }
      setStep('success');
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle2 size={64} color="var(--color-success)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="h2" style={{ marginBottom: '0.5rem' }}>Login Successful!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-center" style={{ minHeight: '80vh', padding: '4rem 1rem' }}>
      <div style={{ 
        width: '100%', maxWidth: '420px', 
        background: 'var(--color-bg)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-xl)', 
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="h2" style={{ marginBottom: '0.5rem' }}>
            {mode === 'phone' ? 'Welcome Back' : mode === 'email-login' ? 'Sign In with Email' : 'Create an Account'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {mode === 'phone' ? 'Enter your mobile number to get an OTP' : 'Enter your details below'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--color-danger-bg, #fef2f2)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* PHONE Flow */}
        {mode === 'phone' && (
          step === 'input' ? (
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontWeight: 600 }}>+91</span>
                  <input 
                    type="tel" 
                    className="input" 
                    placeholder="9876543210" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    required
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} disabled={loading || phone.length < 10}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Enter OTP sent to +91 {phone}</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="000000" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  required
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 600 }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => setStep('input')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
                  Change mobile number
                </button>
              </div>
            </form>
          )
        )}

        {/* EMAIL Flow */}
        {(mode === 'email-login' || mode === 'email-register') && (
          <form onSubmit={handleEmailAuth}>
            {mode === 'email-register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Full Name</label>
                <input type="text" className="input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} disabled={loading}>
              {loading ? 'Processing...' : mode === 'email-login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggles */}
        {step === 'input' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode !== 'phone' && (
                <button onClick={() => setMode('phone')} className="btn btn-outline" style={{ width: '100%' }}>
                  <Phone size={18} /> Continue with Mobile
                </button>
              )}
              {mode !== 'email-login' && (
                <button onClick={() => setMode('email-login')} className="btn btn-outline" style={{ width: '100%' }}>
                  <Mail size={18} /> Continue with Email
                </button>
              )}
            </div>

            {(mode === 'email-login' || mode === 'email-register') && (
              <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {mode === 'email-login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setMode(mode === 'email-login' ? 'email-register' : 'email-login')} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {mode === 'email-login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
