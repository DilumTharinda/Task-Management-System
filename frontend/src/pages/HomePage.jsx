import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const stored = localStorage.getItem('user');
    if (!stored) {
      // No user found means not logged in
      navigate('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    // Clear everything from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={styles.container}>

      {/* Top navigation bar */}
      <nav style={styles.navbar}>
        <span style={styles.navTitle}>Task Management System</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>
            {user.name} — <span style={styles.navRole}>{user.role}</span>
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <div style={styles.content}>

        {/* Welcome banner */}
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>Welcome back, {user.name}</h2>
          <p style={styles.welcomeSub}>
            You are logged in as <strong>{user.role}</strong>.
            Use the menu below to navigate the system.
          </p>
        </div>

        {/* Quick access cards based on role */}
        <div style={styles.cardGrid}>

          {/* Tasks card — all roles see this */}
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>📋</div>
            <h3 style={styles.cardTitle}>My Tasks</h3>
            <p style={styles.cardDesc}>View and manage your assigned tasks</p>
            <button style={styles.cardBtn} onClick={() => navigate('/tasks')}>
              Go to Tasks
            </button>
          </div>

          {/* User management — Admin only */}
          {user.role === 'Admin' && (
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>👥</div>
              <h3 style={styles.cardTitle}>User Management</h3>
              <p style={styles.cardDesc}>Create and manage system users</p>
              <button style={styles.cardBtn} onClick={() => navigate('/users')}>
                Manage Users
              </button>
            </div>
          )}

          {/* Team view — Project Manager */}
          {user.role === 'ProjectManager' && (
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>👷</div>
              <h3 style={styles.cardTitle}>My Team</h3>
              <p style={styles.cardDesc}>View team members and their roles</p>
              <button style={styles.cardBtn} onClick={() => navigate('/team')}>
                View Team
              </button>
            </div>
          )}

          {/* Change password — all roles */}
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🔒</div>
            <h3 style={styles.cardTitle}>Change Password</h3>
            <p style={styles.cardDesc}>Update your account password</p>
            <button style={styles.cardBtn} onClick={() => navigate('/change-password')}>
              Change Password
            </button>
          </div>

        </div>

        {/* Role info panel */}
        <div style={styles.infoPanel}>
          <h4 style={styles.infoPanelTitle}>Your Permissions</h4>
          {user.role === 'Admin' && (
            <p style={styles.infoPanelText}>
              As an Admin you have full access to user management,
              task management, and all system features.
            </p>
          )}
          {user.role === 'ProjectManager' && (
            <p style={styles.infoPanelText}>
              As a Project Manager you can create and assign tasks,
              monitor progress, view team members, and manage all task communications.
            </p>
          )}
          {user.role === 'Collaborator' && (
            <p style={styles.infoPanelText}>
              As a Collaborator you can view your assigned tasks,
              update task status, add comments, and upload attachments.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif'
  },
  navbar: {
    backgroundColor: '#1a1a2e',
    padding: '0 32px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  navUser: {
    color: '#cccccc',
    fontSize: '14px'
  },
  navRole: {
    color: '#4fc3f7',
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #cccccc',
    color: '#cccccc',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px 32px',
    marginBottom: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #0078d4'
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 8px 0'
  },
  welcomeSub: {
    fontSize: '14px',
    color: '#555',
    margin: 0
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px'
  },
  cardIcon: {
    fontSize: '32px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0
  },
  cardDesc: {
    fontSize: '13px',
    color: '#666',
    margin: 0
  },
  cardBtn: {
    marginTop: '8px',
    padding: '8px 20px',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  infoPanel: {
    backgroundColor: '#e8f4fd',
    borderRadius: '12px',
    padding: '20px 24px',
    border: '1px solid #b3d9f5'
  },
  infoPanelTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0078d4',
    margin: '0 0 8px 0'
  },
  infoPanelText: {
    fontSize: '14px',
    color: '#333',
    margin: 0,
    lineHeight: '1.6'
  }
};