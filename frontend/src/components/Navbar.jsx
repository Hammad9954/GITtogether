import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Bell,
  PlusCircle,
  LogOut,
  User,
  Shield,
  Menu,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadNotificationsCount } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#282F28] bg-[#090B0A]/95 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Mobile menu toggle + Brand */}
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-[#A1AAA0] hover:bg-[#151915] hover:text-[#F4F7F2] transition-colors lg:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151915] border border-[#282F28] text-[#B7FF5A] group-hover:border-[#B7FF5A]/50 transition-all duration-200">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M6 9v12" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#F4F7F2]">
              Git<span className="text-[#B7FF5A]">Together</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]">
              Campus
            </span>
          </div>
        </Link>
      </div>

      {/* Right side navigation actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            {/* Create Project Button */}
            <Link
              to="/projects/create"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#B7FF5A] px-3.5 py-1.5 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all duration-150 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Project</span>
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative rounded-xl p-2 text-[#A1AAA0] hover:bg-[#151915] hover:text-[#F4F7F2] border border-transparent hover:border-[#282F28] transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B7FF5A] text-[10px] font-bold text-[#090B0A]">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 bg-[#101310] hover:bg-[#151915] border border-[#282F28] transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-[#1B211B] border border-[#282F28] flex items-center justify-center text-[#B7FF5A] font-bold text-xs uppercase overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="hidden md:block text-left text-xs leading-tight">
                  <p className="font-semibold text-[#F4F7F2] max-w-[110px] truncate">{user.name}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#70796F]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#151915] p-2 shadow-elevated border border-[#282F28] animate-fade-in z-50">
                  <div className="px-3 py-2.5 border-b border-[#282F28]">
                    <p className="text-sm font-semibold text-[#F4F7F2] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#70796F] truncate">{user.email}</p>
                    {user.isVerified && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#B7FF5A]">
                        ✓ Verified Student
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#A1AAA0] hover:text-[#F4F7F2] hover:bg-[#1B211B] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#70796F]" />
                      <span>My Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#B7FF5A] hover:bg-[#1B211B] transition-colors font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#282F28]">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-[#A1AAA0] hover:text-[#F4F7F2] hover:bg-[#151915] border border-[#282F28] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[#B7FF5A] px-3.5 py-1.5 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
