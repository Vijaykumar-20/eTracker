import { useState, useEffect } from 'react';
import api from '../api';

export default function Profile() {
  const [profile, setProfile] = useState({ userName: '', emailId: '', mobileNumber: '' });
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  const fetchProfile = async () => {
    try {
      if (!userId) return;
      const res = await api.get(`/v1/users/profile/${userId}`);
      setProfile(res.data || {});
      setUserName(res.data?.userName || '');
      setMobileNumber(res.data?.mobileNumber || '');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.put(`/v1/users/profile/${userId}?userName=${encodeURIComponent(userName)}&mobileNumber=${encodeURIComponent(mobileNumber)}`);
      setSuccess('Profile updated successfully!');
      setProfile(res.data || {});
      setUserName(res.data?.userName || '');
      setMobileNumber(res.data?.mobileNumber || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please verify input length is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Profile Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your account details and contact information.</p>

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Name</label>
          <input
            type="text"
            className="input-field"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Email ID</label>
          <input
            type="email"
            className="input-field"
            value={profile.emailId || ''}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label className="input-label">Mobile Number</label>
          <input
            type="text"
            className="input-field"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Enter 10-digit mobile number"
            required
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
          </span>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: '6px', color: 'var(--color-success)', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
