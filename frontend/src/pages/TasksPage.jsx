import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/layout/Layout.jsx';
import Avatar from '../components/common/Avatar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../api/axios.js';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks || []);
    } catch (e) {
      console.error('Fetch tasks error:', e);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const statusColor = { 'To Do': '#6b7280', 'In Progress': '#3b9eed', 'Completed': '#10b981' };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Tasks</h1>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '200px' }}
            />
            <select
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            {(user?.role === 'Admin' || user?.role === 'ProjectManager') && (
              <button
                onClick={() => navigate('/tasks/new')}
                style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                + New Task
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {tasks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>📋</p>
                <p style={{ fontSize: '14px' }}>No tasks found matching your criteria</p>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  style={{ backgroundColor: 'var(--bg-card)', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>{task.title}</h3>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority], whiteSpace: 'nowrap' }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '12px', backgroundColor: `${statusColor[task.status]}18`, color: statusColor[task.status] }}>
                      {task.status}
                    </span>
                    {task.dueDate && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
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
