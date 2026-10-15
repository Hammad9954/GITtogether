import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Users,
  Star,
  GraduationCap,
  Inbox,
  Check,
  Loader2,
} from 'lucide-react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setUnreadNotificationsCount } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=30');
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
        setUnreadNotificationsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`, {});
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadNotificationsCount((prev) => Math.max(prev - 1, 0));
      }
    } catch {
      // Non-blocking
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all', {});
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
        toast.success('All marked as read');
      }
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch {
      // Non-blocking
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invitation':
      case 'team_update':
        return <Users className="w-5 h-5 text-[#B7FF5A]" />;
      case 'application_received':
      case 'application_status':
        return <Inbox className="w-5 h-5 text-[#B7FF5A]" />;
      case 'review_received':
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'skill_session':
        return <GraduationCap className="w-5 h-5 text-[#B7FF5A]" />;
      default:
        return <Bell className="w-5 h-5 text-[#A1AAA0]" />;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#B7FF5A]" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-sm text-[#A1AAA0] mt-1">
            Real-time updates on applications, invitations, and team milestones.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 text-[#B7FF5A]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#151915] border border-[#282F28] space-y-3">
            <Bell className="w-10 h-10 text-[#70796F] mx-auto" />
            <p className="text-sm font-semibold text-[#F4F7F2]">
              You are all caught up!
            </p>
            <p className="text-xs text-[#70796F]">No new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-[#151915] border-[#282F28]'
                  : 'bg-[#1B211B] border-[#B7FF5A]/40 shadow-sm shadow-[#B7FF5A]/5'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#101310] border border-[#282F28] flex-shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold truncate ${n.isRead ? 'text-[#F4F7F2]' : 'text-[#B7FF5A]'}`}>{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#B7FF5A] animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#A1AAA0] leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] font-mono text-[#70796F]">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start flex-shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    className="text-xs font-semibold text-[#B7FF5A] hover:underline whitespace-nowrap px-2 py-1"
                  >
                    View
                  </Link>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n._id);
                  }}
                  className="p-1.5 text-[#70796F] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
