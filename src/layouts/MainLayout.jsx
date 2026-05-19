import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDesktopCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="dashboard-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleMobileSidebar} 
        isCollapsed={isCollapsed} 
        onCollapseToggle={toggleDesktopCollapse}
      />
      
      <div className="main-content">
        <Topbar toggleSidebar={toggleMobileSidebar} />
        <main className="content-viewport fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;