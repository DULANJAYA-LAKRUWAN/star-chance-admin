import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Bell,
  ShieldAlert,
  CreditCard,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, onCollapseToggle }) => {
  const { logout } = useAuth();
  
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Draws', path: '/draws', icon: <Ticket size={20} /> },
    { name: 'Live Feed', path: '/activities', icon: <Bell size={20} /> },
    { name: 'System Logs', path: '/logs', icon: <ShieldAlert size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
{isOpen && <div className="modal-overlay sidebar-backdrop" onClick={toggleSidebar} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Ticket size={24} />
            </div>
            {!isCollapsed && <span className="brand-title">Star Chance</span>}
          </div>

          <button type="button" className="sidebar-close-btn btn-icon" onClick={toggleSidebar} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => { if (window.innerWidth <= 1024) toggleSidebar(); }}
              className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
              title={isCollapsed ? link.name : ''}
            >
              <span className="nav-icon">{link.icon}</span>
              {!isCollapsed && <span className="nav-label">{link.name}</span>}
            </NavLink>
          ))}

          <button type="button" className={`nav-link-item sign-out${isCollapsed ? ' centered' : ''}`} onClick={logout}>
            <span className="nav-icon"><LogOut size={20} /></span>
            {!isCollapsed && <span className="nav-label">Sign Out</span>}
          </button>
        </nav>

        <button
          type="button"
          className="sidebar-collapse-toggle btn-icon"
          onClick={onCollapseToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;