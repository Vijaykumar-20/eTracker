import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');

    if (userId) {
      localStorage.setItem('userId', userId);
      // Small delay to ensure localStorage is set before navigation
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Logging you in...</h2>
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Please wait while we finalize your session.
        </div>
      </div>
    </div>
  );
}
