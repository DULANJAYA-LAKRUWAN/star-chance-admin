const fs = require('fs');
const path = require('path');

const files = {
  'src/App.jsx': `
import React from 'react';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
  `,
  'src/router/AppRouter.jsx': `
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import DrawsPage from '../pages/DrawsPage';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<div>Login (Simulated)</div>} />
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="draws" element={<DrawsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
  `,
  'src/context/AuthContext.jsx': `
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for dev
  const [user, setUser] = useState({ role: 'superadmin', name: 'Admin User' });

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
  `,
  'src/context/ToastContext.jsx': `
import React, { createContext } from 'react';

export const ToastContext = createContext();
export const ToastProvider = ({ children }) => {
  return <ToastContext.Provider value={{ showToast: () => {} }}>{children}</ToastContext.Provider>;
};
  `,
  'src/hooks/useAuth.js': `
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => useContext(AuthContext);
  `,
  'src/layouts/MainLayout.jsx': `
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="admin-layout" style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
  `,
  'src/layouts/Sidebar.jsx': `
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, CreditCard, Activity, Settings } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Draws', path: '/draws', icon: <Ticket size={20} /> },
  ];

  return (
    <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Star Chance</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Enterprise Console</p>
      </div>
      <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(link => (
          <NavLink 
            key={link.name} 
            to={link.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
              borderRadius: '8px', color: isActive ? '#2563eb' : '#475569',
              background: isActive ? '#eff6ff' : 'transparent',
              textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s'
            })}
          >
            {link.icon} {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
  `,
  'src/layouts/Topbar.jsx': `
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Topbar = () => {
  const { user } = useAuth();
  return (
    <header style={{ height: '70px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{user.role}</p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
  `,
  'src/pages/DashboardPage.jsx': `
import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulated SSE Connection
    console.log("Connecting to SSE Activity Stream...");
    const interval = setInterval(() => {
      setActivities(prev => [{ id: Date.now(), msg: 'New activity ' + Date.now() }, ...prev].slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {['Total Revenue', 'Active Users', 'Open Draws', 'Pending Payouts'].map(title => (
          <div key={title} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase' }}>{title}</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>--</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>Real-time Activity (SSE Demo)</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {activities.map(act => (
            <li key={act.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>{act.msg}</li>
          ))}
          {activities.length === 0 && <p style={{ color: '#94a3b8' }}>Waiting for stream...</p>}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
  `,
  'src/pages/UsersPage.jsx': `
import React from 'react';
const UsersPage = () => <div><h1>Users Management</h1><p>Enterprise DataTable placeholder</p></div>;
export default UsersPage;
  `,
  'src/pages/DrawsPage.jsx': `
import React from 'react';
const DrawsPage = () => <div><h1>Lottery Draws</h1><p>Enterprise DataTable placeholder</p></div>;
export default DrawsPage;
  `
};

for (const [filePath, content] of Object.entries(files)) {
  const p = path.join(__dirname, filePath);
  fs.writeFileSync(p, content.trim() + '\\n');
  console.log('Wrote:', filePath);
}
