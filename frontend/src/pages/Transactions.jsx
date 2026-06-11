import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Transactions() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('expense'); // income, expense, split
  const [transactions, setTransactions] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState('equal'); // equal, percentage
  const [splitUsers, setSplitUsers] = useState([{ name: '', share: '' }]);
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [activeDropdownIdx, setActiveDropdownIdx] = useState(null);

  const handleAddSplitUser = () => {
    setSplitUsers([...splitUsers, { name: '', share: '' }]);
  };

  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const [resTx, resSplit] = await Promise.all([
        api.get(`/v1/transactions/user/${userId}`),
        api.get(`/v1/splits/user/${userId}`)
      ]);
      
      const txs = (resTx.data || []).map(t => ({ ...t, _category: 'transaction' }));
      const splits = (resSplit.data || []).map(s => ({ ...s, _category: 'split' }));
      const all = [...txs, ...splits].sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      
      setTransactions(all);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriends = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await api.get(`/v1/friends/list/${userId}`);
      setFriends(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await api.get(`/v1/users/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
      fetchTransactions();
      fetchFriends();
    };
    init();
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && location.state?.highlightType) {
      const targetType = location.state.highlightType;
      const targetTx = transactions.find(t => {
        if (targetType === 'expense') {
          return t._category === 'transaction' && t.type === 'EXPENSE';
        } else if (targetType === 'split') {
          return t._category === 'split';
        }
        return false;
      });

      if (targetTx) {
        setTimeout(() => {
          const element = document.getElementById(`tx-${targetTx._category}-${targetTx.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('zoom-highlight');
            // Clear location state so it only highlights once
            window.history.replaceState(null, '');
            setTimeout(() => {
              element.classList.remove('zoom-highlight');
            }, 2500);
          }
        }, 150);
      }
    }
  }, [transactions, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'split') {
        // Form Validation: Enforce participant exists in friends list
        const invalidUsers = splitUsers.filter(u => {
          const match = friends.find(f => 
            f.userName.toLowerCase() === u.name.toLowerCase() ||
            f.mobileNumber === u.name ||
            f.emailId.toLowerCase() === u.name.toLowerCase()
          );
          return !match;
        });
        if (invalidUsers.length > 0) {
          alert(`Please select valid friends from your friends list. Unrecognized friends: ${invalidUsers.map(u => u.name).join(', ')}`);
          return;
        }

        const payload = {
          description,
          amount: parseFloat(amount),
          currency,
          splitType,
          date: new Date().toISOString(),
          splitUsers,
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
      setSplitUsers([{ name: '', share: '' }]);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert('Failed to save transaction: ' + (err.response?.data?.message || err.message));
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount'];
    const rows = transactions.map(t => [
      new Date(t.date || t.createdAt).toLocaleDateString(),
      t.description || (t._category === 'split' ? 'Split Transaction' : 'Unknown'),
      t.type || t.splitType || t._category.toUpperCase(),
      t.amount.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("eTracker Activity Report", 14, 15);
    
    const tableData = transactions.map(t => [
      new Date(t.date || t.createdAt).toLocaleDateString(),
      t.description || (t._category === 'split' ? 'Split Transaction' : 'Unknown'),
      t.type || t.splitType || t._category.toUpperCase(),
      (t.currency === 'USD' ? '$' : '₹') + t.amount.toFixed(2)
    ]);

    autoTable(doc, {
      head: [['Date', 'Description', 'Type', 'Amount']],
      body: tableData,
      startY: 20
    });
    doc.save('transactions.pdf');
    setShowExportMenu(false);
  };

  const handleSyncPaytm = async () => {
    try {
      setIsSyncing(true);
      const userId = localStorage.getItem('userId');
      await api.post(`/v1/transactions/mock-paytm-sync?userId=${userId}`);
      await fetchTransactions();
      alert("Successfully synced mock Paytm transactions!");
      setShowImportMenu(false);
    } catch (err) {
      alert("Failed to sync: " + (err.response?.data || err.message));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    // Spring Boot expects userId as a request param or multipart part
    // Let's pass it as a query param since that matches @RequestParam easily
    const userId = localStorage.getItem('userId');

    try {
      await api.post(`/v1/transactions/upload-statement?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchTransactions();
      alert("Statement uploaded successfully!");
    } catch (err) {
      alert("Upload failed: " + (err.response?.data || err.message));
    }
    
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setShowImportMenu(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track your expenses and income</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
          <div>
             <button className="btn btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
              Export ▼
            </button>
            {showExportMenu && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 10, overflow: 'hidden', minWidth: '120px' }}>
                <button onClick={exportPDF} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background='none'}>As PDF</button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <button onClick={exportCSV} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background='none'}>As CSV</button>
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => setShowImportMenu(!showImportMenu)}>
              Import ▼
            </button>
            {showImportMenu && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 10, overflow: 'hidden', minWidth: '160px' }}>
                <button onClick={handleSyncPaytm} disabled={isSyncing} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', opacity: isSyncing ? 0.5 : 1 }} onMouseOver={(e) => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background='none'}>{isSyncing ? 'Syncing...' : '💳 Sync Paytm (Mock)'}</button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <label style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background='none'}>
                  📄 Upload CSV
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>
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
                
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.08)', 
                  border: '1px solid rgba(168, 85, 247, 0.25)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem', 
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--color-purple)' }}>💡 Quick Tip</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    You can only split bills with users from your <strong>Friends Directory</strong>. Make sure to add them in the <strong>Friends section</strong> by their mobile number before initiating the split!
                  </span>
                </div>
                
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
                  {splitUsers.map((user, idx) => {
                    const matches = friends.filter(f => 
                      f.userName.toLowerCase().includes(user.name.toLowerCase()) || 
                      f.mobileNumber.includes(user.name)
                    );
                    
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                        <div style={{ flex: 2, position: 'relative' }}>
                          <input 
                            className="input-field" 
                            placeholder="Type friend's name..." 
                            value={user.name}
                            onChange={(e) => {
                              const updated = [...splitUsers];
                              updated[idx].name = e.target.value;
                              setSplitUsers(updated);
                            }}
                            onFocus={() => setActiveDropdownIdx(idx)}
                            onBlur={() => setTimeout(() => setActiveDropdownIdx(null), 200)}
                            style={{ width: '100%' }}
                            required
                          />
                          {activeDropdownIdx === idx && matches.length > 0 && (
                            <div className="autocomplete-dropdown">
                              {matches.map(friend => (
                                <div 
                                  key={friend.id} 
                                  className="autocomplete-item"
                                  onMouseDown={() => {
                                    const updated = [...splitUsers];
                                    updated[idx].name = friend.userName;
                                    setSplitUsers(updated);
                                    setActiveDropdownIdx(null);
                                  }}
                                >
                                  <span style={{ fontWeight: '500' }}>{friend.userName}</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{friend.mobileNumber}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                    );
                  })}
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
            transactions.map((t, idx) => {
              const userId = localStorage.getItem('userId');
              const isCreator = t._category === 'split' && t.userId === userId;
              
              // Find my participant entry if I am not the creator
              const myParticipant = !isCreator && profile ? (t.participants || []).find(p => 
                (profile.userName && p.name.toLowerCase() === profile.userName.toLowerCase()) ||
                (profile.emailId && p.name.toLowerCase() === profile.emailId.toLowerCase()) ||
                (profile.mobileNumber && p.name === profile.mobileNumber)
              ) : null;

              const displayAmount = t._category === 'split'
                ? (isCreator ? t.amount : (myParticipant ? myParticipant.amountOwed : 0))
                : t.amount;

              const displaySubtitle = t._category === 'split'
                ? `${new Date(t.date || t.createdAt).toLocaleDateString()} • SPLIT • ${isCreator ? 'You split this' : `Owed to ${t.creatorName || 'Friend'}`}`
                : `${new Date(t.date || t.createdAt).toLocaleDateString()} • ${t.type}`;

              const displayColor = t._category === 'split'
                ? 'var(--color-purple)'
                : (t.type === 'INCOME' ? 'var(--color-cyan)' : 'var(--color-danger)');

              return (
                <div 
                  key={idx} 
                  id={`tx-${t._category}-${t.id}`}
                  style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `3px solid ${displayColor}`, transition: 'all 0.3s ease' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0' }}>{t.description || (t._category === 'split' ? 'Split Transaction' : 'Unknown')}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{displaySubtitle}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: displayColor }}>
                      {t._category === 'split' ? '-' : (t.type === 'INCOME' ? '+' : '-')}₹{displayAmount.toFixed(2)}
                    </div>
                  </div>
                  {t._category === 'split' && t.participants && t.participants.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isCreator ? 'Owed by Participants:' : 'Split Details:'}
                      </p>
                      {t.participants.map((p, i) => {
                        const isMe = profile && (
                          (profile.userName && p.name.toLowerCase() === profile.userName.toLowerCase()) ||
                          (profile.emailId && p.name.toLowerCase() === profile.emailId.toLowerCase()) ||
                          (profile.mobileNumber && p.name === profile.mobileNumber)
                        );
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: isMe ? 'bold' : 'normal', color: isMe ? 'var(--color-cyan)' : 'var(--text-primary)' }}>
                            <span>{p.name} {p.share && `(${p.share}${t.splitType === 'PERCENTAGE' ? '%' : ''})`}{isMe ? ' (You)' : ''}</span>
                            <span>₹{p.amountOwed.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
