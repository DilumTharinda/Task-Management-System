import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { useContext } from 'react';
import api from '../api/axios.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      alert('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.description || err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0f172a' : '#f0f2f5', fontFamily: "'Inter', sans-serif", position: 'relative', padding: '20px' }}>
      {/* Animated background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: isDark ? 'rgba(59,158,237,0.06)' : 'rgba(0,120,212,0.06)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', backgroundColor: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.06)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1a1a2e', margin: '0 0 6px' }}>Reset Password</h1>
          <p style={{ fontSize: '14px', color: isDark ? '#64748b' : '#9ca3af', margin: 0 }}>Create a new password for your account</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, color: isDark ? '#f87171' : '#dc2626', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#cbd5e1' : '#374151' }}>New Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
              style={{ width: '100%', padding: '11px 12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, backgroundColor: isDark ? '#0f172a' : '#f9fafb', color: isDark ? '#f1f5f9' : '#1a1a2e', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#cbd5e1' : '#374151' }}>Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
              style={{ width: '100%', padding: '11px 12px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, backgroundColor: isDark ? '#0f172a' : '#f9fafb', color: isDark ? '#f1f5f9' : '#1a1a2e', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={loading}
            style={{ padding: '13px', backgroundColor: loading ? '#6ea8da' : '#0078d4', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
            {loading ? <LoadingSpinner size={20} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
