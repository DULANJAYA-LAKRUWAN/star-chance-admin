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
      {isOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 40 }}
          onClick={toggleSidebar} 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
        {/* Desktop Floating Toggle Button */}
        <button
          onClick={onCollapseToggle}
          className="desktop-toggle-btn btn-icon"
          style={{
            position: 'absolute',
            right: '-12px',
            top: '24px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-secondary)',
            padding: 0
          }}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between', 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border-subtle)',
          minHeight: '72px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
            <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={24} />
            </div>
            {!isCollapsed && (
              <span className="sidebar-text" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Star Chance
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              className="btn-icon" 
              onClick={toggleSidebar}
              style={{ display: window.innerWidth <= 1024 ? 'flex' : 'none' }}
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: isCollapsed ? '1rem 0.5rem' : '1rem' }}>
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => { if(window.innerWidth <= 1024) toggleSidebar() }}
              className="nav-link-item"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: isCollapsed ? '0' : '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              })}
              title={isCollapsed ? link.name : ''}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.background.includes('subtle')) {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {link.icon}
              {!isCollapsed && <span className="sidebar-text">{link.name}</span>}
            </NavLink>
          ))}
          
          <div 
            onClick={logout} 
            className="nav-link-item"
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all var(--transition-fast)'
            }}
            title={isCollapsed ? 'Sign Out' : ''}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--error-bg)';
              e.currentTarget.style.color = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="sidebar-text">Sign Out</span>}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;