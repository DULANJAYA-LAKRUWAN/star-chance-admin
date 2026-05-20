import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Menu } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const Topbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button 
          type="button"
          className="topbar-menu btn-icon" 
          onClick={toggleSidebar}
          title="Open menu"
        >
          <Menu size={24} />
        </button>
        <span className="topbar-title">Admin Console</span>
      </div>

      <div className="topbar-actions">
        <ThemeToggle />

        <div className="profile-card">
          <div className="profile-details">
            <p className="profile-name">{user.userName || user.name || 'Admin'}</p>
            <span className="profile-role">
              <Shield size={10} />
              {user.role}
            </span>
          </div>

          <div className="profile-avatar">
            {(user.userName || user.name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;