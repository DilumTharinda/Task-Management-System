import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => { fetchTasks(); }, [filters]);

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
  const statusColor   = { 'To Do': '#6b7280', 'In Progress': '#3b9eed', 'Completed': '#10b981' };

  const isAdminOrPM = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const inputStyle = {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Tasks</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {isAdminOrPM && (
            <button
              onClick={() => navigate('/tasks/new')}
              style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Task
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              style={{ ...inputStyle, paddingLeft: '32px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            style={{ ...inputStyle, minWidth: '140px' }}>
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority filter — separate from status */}
          <select
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
            style={{ ...inputStyle, minWidth: '140px' }}>
            <option value="">All Priorities</option>
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          {/* Clear filters */}
          {(filters.status || filters.priority || filters.search) && (
            <button
              onClick={() => setFilters({ status: '', priority: '', search: '' })}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>

        {/* Task grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {tasks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>No tasks found</p>
                <p style={{ fontSize: '13px' }}>Try adjusting your filters or create a new task</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}
                  style={{ backgroundColor: 'var(--bg-card)', borderRadius: '14px', padding: '18px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>

                  {/* Task thumbnail + title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    {/* Avatar thumbnail generated from task title */}
                    <Avatar name={task.title} size={40} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority + Status badges */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', backgroundColor: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority] }}>
                      {task.priority}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px', backgroundColor: `${statusColor[task.status]}18`, color: statusColor[task.status] }}>
                      {task.status}
                    </span>
                  </div>

                  {/* Footer: due date + assignees */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {task.dueDate ? (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : <span />}

                    {/* Assignee avatars */}
                    {task.assignees?.length > 0 && (
                      <div style={{ display: 'flex' }}>
                        {task.assignees.slice(0, 3).map((a, i) => (
                          <div key={a.id} style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: task.assignees.length - i, border: '2px solid var(--bg-card)', borderRadius: '50%' }} title={a.name}>
                            <Avatar name={a.name} size={24} />
                          </div>
                        ))}
                        {task.assignees.length > 3 && (
                          <div style={{ marginLeft: '-8px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', zIndex: 0 }}>
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
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