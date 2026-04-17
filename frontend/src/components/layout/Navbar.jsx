import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import NotificationPanel from '../common/NotificationPanel';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    Admin: '#ef4444',
    ProjectManager: '#f59e0b',
    Collaborator: '#10b981'
  };

  return (
    <nav style={styles.navbar}>
      {/* Left — hamburger + brand */}
      <div style={styles.left}>
        <button onClick={onToggleSidebar} style={styles.hamburger} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="4" width="12" height="12" rx="2" fill="#6EE7B7" />
              <rect x="20" y="4" width="12" height="12" rx="2" fill="#34D399" opacity="0.7" />
              <rect x="4" y="20" width="12" height="12" rx="2" fill="#34D399" opacity="0.7" />
              <rect x="20" y="20" width="12" height="12" rx="2" fill="#6EE7B7" />
            </svg>
          </div>
          <span style={styles.brandName}>TMS</span>
        </div>
      </div>

      {/* Right — theme, notifications, profile */}
      <div style={styles.right}>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={styles.iconBtn} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
            style={styles.iconBtn} aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={styles.badge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
        </div>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
            style={styles.profileBtn}>
            <Avatar name={user?.name || ''} size={32} />
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{user?.name}</span>
              <span style={{
                ...styles.profileRole,
                color: roleColors[user?.role] || 'var(--accent)'
              }}>
                {user?.role}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" style={{
                transform: showProfile ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s', flexShrink: 0,
                color: 'var(--text-muted)'
              }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showProfile && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <Avatar name={user?.name || ''} size={40} />
                <div>
                  <p style={styles.dropName}>{user?.name}</p>
                  <p style={styles.dropEmail}>{user?.email}</p>
                </div>
              </div>
              <div style={styles.dropDivider} />
              <button onClick={() => { navigate('/change-password'); setShowProfile(false); }}
                style={styles.dropItem}>
                🔒 Change Password
              </button>
              <div style={styles.dropDivider} />
              <button onClick={handleLogout} style={{ ...styles.dropItem, color: 'var(--danger)' }}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: 'var(--navbar-height)',
    backgroundColor: 'var(--bg-navbar)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px', zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
    transition: 'background-color var(--transition)'
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  hamburger: {
    background: 'none', border: 'none',
    color: 'var(--text-secondary)', padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center',
    transition: 'background-color 0.15s'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  brandIcon: { display: 'flex', alignItems: 'center' },
  brandName: {
    fontWeight: '700', fontSize: '18px',
    color: 'var(--text-primary)', letterSpacing: '-0.5px'
  },
  right: { display: 'flex', alignItems: 'center', gap: '4px' },
  iconBtn: {
    position: 'relative',
    background: 'none', border: 'none',
    color: 'var(--text-secondary)', padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center',
    transition: 'background-color 0.15s, color 0.15s'
  },
  badge: {
    position: 'absolute', top: '4px', right: '4px',
    backgroundColor: 'var(--danger)', color: '#fff',
    borderRadius: '10px', fontSize: '10px',
    fontWeight: '700', minWidth: '16px', height: '16px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '0 4px'
  },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'none', border: 'none',
    padding: '6px 10px', borderRadius: 'var(--radius-md)',
    cursor: 'pointer', transition: 'background-color 0.15s',
    marginLeft: '4px'
  },
  profileInfo: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'flex-start',
    '@media (max-width: 640px)': { display: 'none' }
  },
  profileName: {
    fontSize: '13px', fontWeight: '600',
    color: 'var(--text-primary)', lineHeight: '1.2'
  },
  profileRole: { fontSize: '11px', fontWeight: '500', lineHeight: '1.2' },
  dropdown: {
    position: 'absolute', top: '48px', right: 0,
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '220px', zIndex: 1000, overflow: 'hidden'
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 16px 12px'
  },
  dropName: { fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' },
  dropEmail: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
  dropDivider: { height: '1px', backgroundColor: 'var(--border)' },
  dropItem: {
    display: 'block', width: '100%', textAlign: 'left',
    background: 'none', border: 'none',
    padding: '12px 16px', fontSize: '13px',
    color: 'var(--text-primary)', cursor: 'pointer',
    transition: 'background-color 0.15s'
  }
};