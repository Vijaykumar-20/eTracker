import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoginSuccess from './pages/LoginSuccess';

function BackgroundManager() {
  return null;
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
            <Route path="friends" element={<Friends />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
