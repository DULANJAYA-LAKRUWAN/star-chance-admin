import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Menu } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const Topbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Only show hamburger on mobile/tablet */}
        <button 
          className="btn-icon" 
          onClick={toggleSidebar}
          style={{ display: window.innerWidth <= 1024 ? 'flex' : 'none' }}
          title="Open Menu"
        >
          <Menu size={24} color="var(--text-main)" />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <ThemeToggle />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user.userName || user.name || 'Admin'}
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginTop: '2px',
              }}
            >
              <Shield size={10} />
              {user.role}
            </span>
          </div>
          
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {(user.userName || user.name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;