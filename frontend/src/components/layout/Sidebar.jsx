import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/home', icon: '🏠', label: 'Dashboard', roles: ['Admin', 'ProjectManager', 'Collaborator'] },
  { to: '/tasks', icon: '📋', label: 'Tasks', roles: ['Admin', 'ProjectManager', 'Collaborator'] },
  { to: '/users', icon: '👥', label: 'Users', roles: ['Admin'] },
  { to: '/team', icon: '👷', label: 'My Team', roles: ['ProjectManager'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div onClick={onClose} style={styles.overlay} />
      )}

      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Nav links */}
        <nav style={styles.nav}>
          <p style={styles.navLabel}>MENU</p>
          {filtered.map(item => (
            <NavLink key={item.to} to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                ...styles.navItem,
                backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)'
              })}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom user info */}
        <div style={styles.bottomUser}>
          <div style={styles.userDot} />
          <div>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userRole}>{user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 98,
    '@media (min-width: 769px)': { display: 'none' }
  },
  sidebar: {
    position: 'fixed', top: 'var(--navbar-height)',
    left: 0, bottom: 0,
    width: 'var(--sidebar-width)',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex', flexDirection: 'column',
    zIndex: 99, padding: '16px 0',
    transition: 'transform 0.25s ease',
    overflowY: 'auto'
  },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: {
    fontSize: '10px', fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '1px', padding: '8px 12px 4px'
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: 'var(--radius-md)',
    marginBottom: '4px', fontSize: '13px',
    fontWeight: '500', transition: 'all 0.15s',
    textDecoration: 'none'
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },
  navText: {},
  bottomUser: {
    margin: '0 12px 8px',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', gap: '10px'
  },
  userDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: '#10b981', flexShrink: 0
  },
  userName: { fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }
};