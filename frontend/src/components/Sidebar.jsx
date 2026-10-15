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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-[#282F28] bg-[#101310] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
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
                  `flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]'
                      : 'text-[#A1AAA0] hover:bg-[#151915] hover:text-[#F4F7F2]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-[#B7FF5A]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#B7FF5A] border border-[#B7FF5A]/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Quick Card at bottom of sidebar */}
        {user && (
          <div className="p-3 border-t border-[#282F28]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#151915] border border-[#282F28]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="truncate text-left text-xs">
                  <p className="font-semibold text-[#F4F7F2] truncate">
                    {user.name}
                  </p>
                  <p className="text-[#70796F]">
                    Rep: <span className="text-[#B7FF5A] font-bold">{user.reputationScore || 100}</span>
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
