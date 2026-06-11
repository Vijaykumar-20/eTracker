import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PieChart, Users, Settings, LogOut } from 'lucide-react';
import api from '../api';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const fetchRequestsCount = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await api.get(`/v1/friends/requests/${userId}`);
        setPendingRequestsCount(res.data?.length || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequestsCount();

    // Fetch count periodically every 15 seconds to keep it updated in real-time
    const interval = setInterval(fetchRequestsCount, 15000);

    window.addEventListener('friendsUpdate', fetchRequestsCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('friendsUpdate', fetchRequestsCount);
    };
  }, []);

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="gradient-text">eTracker</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/transactions" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <PieChart size={20} />
          <span>Transactions</span>
        </NavLink>
        <NavLink to="/friends" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={20} />
            <span>Friends</span>
          </div>
          {pendingRequestsCount > 0 && (
            <span style={{ 
              background: 'var(--color-danger)', 
              color: 'white', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              borderRadius: '50%', 
              width: '20px', 
              height: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
            }}>
              {pendingRequestsCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Settings size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-link logout-btn" onClick={() => navigate('/login')} style={{ width: '100%' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
