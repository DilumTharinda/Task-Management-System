import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Layout from '../../components/layout/Layout.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import api from '../../api/axios.js';
import { toast } from 'react-hot-toast';

export default function TaskForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assigneeIds: []
  });
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (isEdit) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const endpoint = user?.role === 'Admin' ? '/users' : '/users/team';
      const res = await api.get(endpoint);
      setUsers(res.data.users || res.data || []);
    } catch (e) {
      console.error('Fetch users error:', e);
    }
  };

  const fetchTaskDetails = async () => {
    setFormLoading(true);
    try {
      const res = await api.get(`/tasks/${id}`);
      const task = res.data.task;
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeIds: task.assignees?.map(a => a.id) || []
      });
    } catch (e) {
      toast.error('Failed to fetch task details');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/tasks/${id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      navigate('/tasks');
    } catch (e) {
      toast.error(e.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  if (formLoading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Title</label>
            <input
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical' }}
              placeholder="Enter task description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>Assignees</label>
            <div style={{ marginBottom: '12px' }}>
              <input
                placeholder="Search members..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
              {users
                .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                .map(u => (
                <div
                  key={u.id}
                  onClick={() => toggleAssignee(u.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid',
                    borderColor: formData.assigneeIds.includes(u.id) ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: formData.assigneeIds.includes(u.id) ? 'var(--accent-light)' : 'var(--bg-primary)',
                    color: formData.assigneeIds.includes(u.id) ? 'var(--accent)' : 'var(--text-primary)',
                    transition: 'all 0.2s'
                  }}
                >
                  {u.name}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
