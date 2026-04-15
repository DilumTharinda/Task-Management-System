import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      // Save token and user info to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // If user must change password redirect to change password page
      if (response.data.user.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      // Otherwise go to home dashboard
      navigate('/home');

    } catch (err) {
      // Show error message from backend
      setError(
        err.response?.data?.description ||
        err.response?.data?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo / Title area */}
        <div style={styles.header}>
          <h1 style={styles.title}>Task Management System</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} style={styles.form}>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          {/* Forgot password link */}
          <div style={styles.forgotRow}>
            <a href="/forgot-password" style={styles.forgotLink}>
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    border: '1px solid #ffcccc',
    color: '#cc0000',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  forgotRow: {
    textAlign: 'right',
    marginTop: '-10px'
  },
  forgotLink: {
    fontSize: '13px',
    color: '#0078d4',
    textDecoration: 'none'
  },
  button: {
    padding: '12px',
    backgroundColor: '#0078d4',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  buttonDisabled: {
    backgroundColor: '#99c9ef',
    cursor: 'not-allowed'
  }
};