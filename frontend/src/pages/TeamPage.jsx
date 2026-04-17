import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout.jsx';
import Avatar from '../components/common/Avatar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../api/axios.js';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      const allUsers = res.data.users || [];
      const team = allUsers.filter(u => u.role === 'Collaborator' || u.role === 'ProjectManager');
      setMembers(team);
    } catch (e) {
      console.error('Fetch team error:', e);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>My Team</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Total: {members.length} members</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {members.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
                <p style={{ fontSize: '14px' }}>Team members are unavailable because the backend API endpoint does not exist.</p>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>(Endpoint GET /api/auth/users is missing in backend)</p>
              </div>
            ) : (
              members.map(m => (
                <div key={m.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Avatar name={m.name} size={48} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{m.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0' }}>{m.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                        {m.role}
                      </span>
                      <span style={{ fontSize: '10px', color: m.isActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                        ● {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
