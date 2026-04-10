import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PieChart, Users, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

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
