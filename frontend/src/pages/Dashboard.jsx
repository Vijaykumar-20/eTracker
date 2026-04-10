import { useState, useEffect } from 'react';
import api from '../api';
import ParticleText from '../components/ParticleText';

export default function Dashboard() {
  const [stats, setStats] = useState({ monthly: 0, weekly: 0, daily: 0 });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const res = await api.get(`/v1/transactions/user/${userId}`);
        const transactions = res.data || [];

        let monthly = 0;
        let weekly = 0;
        let daily = 0;

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        transactions.forEach(t => {
          if (t.type === 'EXPENSE') {
            const d = new Date(t.date);
            if (d >= thirtyDaysAgo) monthly += t.amount;
            if (d >= sevenDaysAgo) weekly += t.amount;
            if (d >= startOfDay) daily += t.amount;
          }
        });

        setStats({ monthly, weekly, daily });
      } catch (e) {
        console.error(e);
      }
    };

    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const res = await api.get(`/v1/users/profile/${userId}`);
        if (res.data?.userName) setUserName(res.data.userName);
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
    fetchProfile();
  }, []);
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="gradient-text" style={{ margin: 0 }}>Dashboard</h1>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          Hello {userName ? <ParticleText text={userName} /> : 'User'} <span style={{ display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%' }}>👋</span>
        </h2>
      </div>
      <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's your financial overview.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Monthly Spending</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-cyan)' }}>₹{stats.monthly.toFixed(2)}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Weekly Spending</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-purple)' }}>₹{stats.weekly.toFixed(2)}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Daily Avg</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>₹{stats.daily.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
}
