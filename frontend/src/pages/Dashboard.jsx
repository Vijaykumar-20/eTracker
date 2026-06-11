import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ParticleText from '../components/ParticleText';

export default function Dashboard() {
  const [stats, setStats] = useState({ monthly: 0, weekly: 0, daily: 0 });
  const [splitBalance, setSplitBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Fetch user profile first to get matching details
        const resProfile = await api.get(`/v1/users/profile/${userId}`);
        const profile = resProfile.data || {};
        if (profile.userName) setUserName(profile.userName);

        const [resTx, resSplit] = await Promise.all([
          api.get(`/v1/transactions/user/${userId}`),
          api.get(`/v1/splits/user/${userId}`)
        ]);
        const transactions = resTx.data || [];
        const splits = resSplit.data || [];

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

        // Compute split balance
        let balance = 0;
        splits.forEach(s => {
          if (s.userId === userId) {
            // User is creator: they are owed the sum of what all participants owe
            const owed = (s.participants || []).reduce((sum, p) => sum + p.amountOwed, 0);
            balance += owed;
          } else {
            // User is participant: find what they owe
            const myParticipant = (s.participants || []).find(p => 
              (profile.userName && p.name.toLowerCase() === profile.userName.toLowerCase()) ||
              (profile.emailId && p.name.toLowerCase() === profile.emailId.toLowerCase()) ||
              (profile.mobileNumber && p.name === profile.mobileNumber)
            );
            if (myParticipant) {
              balance -= myParticipant.amountOwed;
            }
          }
        });

        setStats({ monthly, weekly, daily });
        setSplitBalance(balance);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div 
          className="glass-panel dashboard-tile" 
          onClick={() => navigate('/transactions', { state: { highlightType: 'expense' } })}
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ color: 'var(--text-secondary)' }}>Monthly Spending</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-cyan)' }}>₹{stats.monthly.toFixed(2)}</h2>
        </div>
        <div 
          className="glass-panel dashboard-tile" 
          onClick={() => navigate('/transactions', { state: { highlightType: 'expense' } })}
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ color: 'var(--text-secondary)' }}>Weekly Spending</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-purple)' }}>₹{stats.weekly.toFixed(2)}</h2>
        </div>
        <div 
          className="glass-panel dashboard-tile" 
          onClick={() => navigate('/transactions', { state: { highlightType: 'expense' } })}
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ color: 'var(--text-secondary)' }}>Daily Avg</h3>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>₹{stats.daily.toFixed(2)}</h2>
        </div>
        <div 
          className="glass-panel dashboard-tile" 
          onClick={() => navigate('/transactions', { state: { highlightType: 'split' } })}
          style={{ 
            padding: '1.5rem', 
            borderLeft: `4px solid ${splitBalance > 0 ? 'var(--color-success)' : splitBalance < 0 ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)'}` 
          }}
        >
          <h3 style={{ color: 'var(--text-secondary)' }}>Split Balance</h3>
          <h2 style={{ 
            fontSize: '2rem', 
            margin: '0.5rem 0', 
            color: splitBalance > 0 ? 'var(--color-success)' : splitBalance < 0 ? 'var(--color-danger)' : 'var(--text-primary)' 
          }}>
            {splitBalance > 0 ? '+' : splitBalance < 0 ? '-' : ''}₹{Math.abs(splitBalance).toFixed(2)}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {splitBalance > 0 ? 'You are owed overall' : splitBalance < 0 ? 'You owe overall' : 'No active splits'}
          </span>
        </div>
      </div>
    </div>
  );
}
