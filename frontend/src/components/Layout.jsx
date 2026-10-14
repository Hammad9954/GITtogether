import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Pages that don't need the authenticated sidebar
  const isAuthPage = ['/', '/login', '/register', '/verify-email'].includes(location.pathname);
  const showSidebar = user && !isAuthPage;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? 'lg:pl-64' : ''
          } p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
