import { useState, useEffect } from 'react';
import api from '../api';

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('expense'); // income, expense, split
  const [transactions, setTransactions] = useState([]);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState('equal'); // equal, percentage
  const [splitUsers, setSplitUsers] = useState([{ name: '', share: '' }]);

  const handleAddSplitUser = () => {
    setSplitUsers([...splitUsers, { name: '', share: '' }]);
  };

  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const res = await api.get(`/v1/transactions/user/${userId}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'split') {
        const payload = {
          amount: parseFloat(amount),
          currency,
          splitType,
          userId: localStorage.getItem('userId')
        };
        await api.post('/v1/splits/create', payload);
      } else {
        const payload = {
          amount: parseFloat(amount),
          category: "General",
          type: type.toUpperCase(), // INCOME or EXPENSE
          description,
          date: new Date().toISOString(),
          userId: localStorage.getItem('userId')
        };
        await api.post('/v1/transactions/create', payload);
      }
      
      alert(type + " successfully recorded!");
      // Reset and close
      setShowForm(false);
      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert('Failed to save transaction: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track your expenses and income</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>
      
      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-cyan-glow)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>New Transaction</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {['expense', 'income', 'split'].map(t => (
              <button 
                key={t}
                type="button"
                className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setType(t)}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 2, margin: 0 }}>
                <label className="input-label">Amount</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="input-field" 
                    style={{ flex: '0 0 100px' }}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Description</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="What was this for?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {type === 'split' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Split Details</h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="radio" 
                      checked={splitType === 'equal'} 
                      onChange={() => setSplitType('equal')}
                    /> Equal
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="radio" 
                      checked={splitType === 'percentage'} 
                      onChange={() => setSplitType('percentage')}
                    /> Percentage
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {splitUsers.map((user, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <input 
                        className="input-field" 
                        placeholder="Friend's Name / Email" 
                        value={user.name}
                        onChange={(e) => {
                          const updated = [...splitUsers];
                          updated[idx].name = e.target.value;
                          setSplitUsers(updated);
                        }}
                        style={{ flex: 2 }}
                        required
                      />
                      {splitType === 'percentage' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <input 
                            type="number" 
                            className="input-field" 
                            placeholder="%" 
                            value={user.share}
                            onChange={(e) => {
                              const updated = [...splitUsers];
                              updated[idx].share = e.target.value;
                              setSplitUsers(updated);
                            }}
                            required
                          />
                        </div>
                      )}
                      
                      {splitUsers.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            const updated = splitUsers.filter((_, i) => i !== idx);
                            setSplitUsers(updated);
                          }}
                          style={{ padding: '0.75rem' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={handleAddSplitUser}>
                    + Add Person
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Save Transaction
            </button>
          </form>
        </div>
      )}
      
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>Recent Activity</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No transactions found yet. Create one to get started.
            </div>
          ) : (
            transactions.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `3px solid ${t.type === 'INCOME' ? 'var(--color-cyan)' : 'var(--color-danger)'}` }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{t.description}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: t.type === 'INCOME' ? 'var(--color-cyan)' : 'var(--color-danger)' }}>
                  {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
