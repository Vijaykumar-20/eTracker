import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Search, UserCheck, X, Check, Trash } from 'lucide-react';

export default function Friends() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [searchStatus, setSearchStatus] = useState(null); // 'checking', 'found', 'not_found', 'idle'
  const [foundUser, setFoundUser] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const userId = localStorage.getItem('userId');

  const fetchFriends = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/v1/friends/list/${userId}`);
      setFriendsList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/v1/friends/requests/${userId}`);
      setPendingRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshData = () => {
    fetchFriends();
    fetchRequests();
    // Dispatch custom event to notify sidebar about pending requests update
    window.dispatchEvent(new Event('friendsUpdate'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClear = () => {
    setMobileNumber('');
    setSearchStatus('idle');
    setFoundUser(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle typing mobile number to check user existence in real-time
  const handleMobileChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
    setSearchStatus('idle');
    setFoundUser(null);
    setErrorMessage('');
    setSuccessMessage('');

    if (value.length === 10) {
      setSearchStatus('checking');
      try {
        const res = await api.get(`/v1/users/check-mobile?mobileNumber=${value}`);
        if (res.data?.exists) {
          setSearchStatus('found');
          setFoundUser(res.data.userName);
        } else {
          setSearchStatus('not_found');
        }
      } catch (err) {
        console.error(err);
        setSearchStatus('idle');
      }
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!userId || mobileNumber.length !== 10 || searchStatus !== 'found') return;
    
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.post(`/v1/friends/add?userId=${userId}&mobileNumber=${mobileNumber}`);
      setSuccessMessage(`Friend request sent to ${foundUser}!`);
      setMobileNumber('');
      setFoundUser(null);
      setSearchStatus('idle');
      refreshData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send friend request.');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      await api.post(`/v1/friends/accept?senderId=${senderId}&receiverId=${userId}`);
      setSuccessMessage("Friend request accepted!");
      refreshData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleDeclineRequest = async (senderId) => {
    try {
      await api.post(`/v1/friends/decline?senderId=${senderId}&receiverId=${userId}`);
      setSuccessMessage("Friend request declined.");
      refreshData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to decline request.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1 className="gradient-text" style={{ marginBottom: '1.5rem' }}>My Friends</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Add your friends using their registered 10-digit mobile number. You can split bills with anyone in your friends list.
      </p>

      {/* Add Friend Form */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} color="var(--color-cyan)" />
          Add Friend
        </h3>
        
        <form onSubmit={handleAddFriend}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mobile Number</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="Enter 10-digit mobile number"
                  className="input-field"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                 <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {searchStatus === 'checking' && (
                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  )}
                  {searchStatus === 'found' && (
                    <UserCheck size={18} color="var(--color-success)" />
                  )}
                  {mobileNumber.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: searchStatus === 'not_found' ? 'var(--color-danger)' : 'var(--text-secondary)'
                      }}
                      title="Clear input"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={searchStatus !== 'found'}
                className="btn btn-primary"
                style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Send Request
              </button>
            </div>

            {/* Real-time Validation Message */}
            {searchStatus === 'found' && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>
                ✓ Found user: <strong>{foundUser}</strong>
              </span>
            )}
            {searchStatus === 'not_found' && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                ✗ No registered user found with this mobile number.
              </span>
            )}
            
            {errorMessage && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.9rem' }}>
                {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: '6px', color: 'var(--color-success)', fontSize: '0.9rem' }}>
                {successMessage}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Pending Friend Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-purple)' }}>
            🔔 Pending Requests ({pendingRequests.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map((req) => (
              <div 
                key={req.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '10px' 
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{req.userName}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📞 {req.mobileNumber}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleAcceptRequest(req.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-success)' }}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineRequest(req.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <X size={16} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>Friends Directory</h3>
        
        {friendsList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
            No friends added yet. Add friends by search to split expenses.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-cyan)' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{friend.userName}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  📞 {friend.mobileNumber || 'No Mobile Number'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ✉️ {friend.emailId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
