import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  UserCheck,
  FolderGit2,
  Inbox,
  Trophy,
  MessageSquare,
  GraduationCap,
  Star,
  ShieldAlert,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Projects', path: '/projects', icon: Compass },
    { label: 'Find Teammates', path: '/students', icon: UserCheck },
    { label: 'My Teams', path: '/teams', icon: FolderGit2 },
    { label: 'Applications', path: '/applications', icon: Inbox },
    { label: 'Hackathons', path: '/hackathons', icon: Trophy },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Skill Sharing', path: '/skill-sharing', icon: GraduationCap },
    { label: 'Peer Reviews', path: '/reviews', icon: Star },
    { label: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      label: 'Admin Panel',
      path: '/admin',
      icon: ShieldAlert,
      badge: 'Admin',
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Quick Card at bottom of sidebar */}
        {user && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-9 w-9 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="truncate text-left text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Reputation: <span className="text-brand-600 font-bold">{user.reputationScore || 100}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
