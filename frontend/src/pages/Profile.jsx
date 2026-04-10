import { useState, useEffect } from 'react';
import api from '../api';

export default function Profile() {
  const [profile, setProfile] = useState({ userName: '', emailId: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const res = await api.get(`/v1/users/profile/${userId}`);
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);
  return (
    <div className="animate-fade-in">
      <h1 className="gradient-text">Profile</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Manage your profile settings.</p>
      
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Name</label>
          <input type="text" className="input-field" value={profile.userName} readOnly />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Email</label>
          <input type="email" className="input-field" value={profile.emailId} readOnly />
        </div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
