import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/layout/Layout.jsx';
import Avatar from '../components/common/Avatar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../api/axios.js';
import { toast } from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.task);

      const commentsRes = await api.get(`/comments/${id}`);
      setComments(commentsRes.data.comments || commentsRes.data || []);
    } catch (e) {
      console.error('Fetch task detail error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      await fetchTask();
    } catch (e) {
      console.error('Update status error:', e);
    } finally {
      setUpdating(false);
    }
  };

  const priorityColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (!task) return <Layout><div>Task not found</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>← Back to Tasks</button>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Task Details</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{task.title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px', backgroundColor: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority] }}>
                    {task.priority}
                  </span>
                  {(user?.role === 'Admin' || user?.role === 'ProjectManager') && (
                    <button
                      onClick={() => navigate(`/tasks/edit/${id}`)}
                      style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>Discussion & Attachments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <textarea
                    id="comment-text"
                    placeholder="Write a comment..."
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'none', height: '60px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ cursor: 'pointer', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', color: 'var(--text-primary)' }}>
                      📎 Attach
                      <input type="file" style={{ display: 'none' }} id="comment-file" />
                    </label>
                    <button
                      onClick={async () => {
                        const text = document.getElementById('comment-text').value;
                        const file = document.getElementById('comment-file').files[0];
                        if (!text && !file) return toast.error('Please enter a comment or attach a file');
                        const fd = new FormData();
                        fd.append('content', text);
                        if (file) fd.append('file', file);
                        try {
                          await api.post(`/comments/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                          toast.success('Comment added');
                          fetchTask();
                          document.getElementById('comment-text').value = '';
                          document.getElementById('comment-file').value = '';
                        } catch (e) { toast.error('Failed to add comment'); }
                      }}
                      style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.user?.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{c.content}</p>
                      {c.attachment && (
                        <a href={`/api/comments/download/${c.id}`} target="_blank" style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none' }}>📎 Download Attachment</a>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No comments yet.</p>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Assignees</h3>
                {(user?.role === 'Admin' || user?.role === 'ProjectManager') && (
                   <button
                   onClick={() => navigate(`/tasks/edit/${id}`)}
                   style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                 >
                   Manage
                 </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {task.assignees?.length > 0 ? (
                  task.assignees.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <Avatar name={a.name} size={24} />
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{a.name}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No assignees assigned</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['To Do', 'In Progress', 'Completed'].map(s => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => updateStatus(s)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: task.status === s ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: task.status === s ? 'var(--accent-light)' : 'transparent',
                      color: task.status === s ? 'var(--accent)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: task.status === s ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Metadata</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created by</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{task.creator?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
