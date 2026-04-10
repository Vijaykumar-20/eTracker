import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoginSuccess from './pages/LoginSuccess';
import BackgroundSVG from './components/BackgroundSVG';

function BackgroundManager() {
  const location = useLocation();
  const isAuth = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/login-success';
  return isAuth ? null : <BackgroundSVG />;
}

function App() {
  return (
    <BrowserRouter>
      <BackgroundManager />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          
          {/* Protected routes wrapped in Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
