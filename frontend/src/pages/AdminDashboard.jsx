import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FolderGit2,
  Inbox,
  Trophy,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Shield,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';

const CHART_COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AdminDashboard = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'reports'
  const [metrics, setMetrics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users tab state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Suspension Modal state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Reports tab state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.success && res.data) {
        setMetrics(res.data.metrics);
        setCategoryData(res.data.categoryDistribution || []);
        setApplicationStats(res.data.applicationStats || []);
      }
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data?.users) {
        setUsersList(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await api.get('/admin/reports');
      if (res.success && res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleToggleSuspension = async (userObj) => {
    if (userObj.isSuspended) {
      // Unsuspend directly
      try {
        const res = await api.patch(`/admin/users/${userObj._id}/suspend`, {
          isSuspended: false,
        });
        if (res.success) {
          toast.success(`User ${userObj.name} unsuspended!`);
          fetchUsers();
          fetchAnalytics();
        }
      } catch (err) {
        toast.error(err.message || 'Action failed');
      }
    } else {
      setSelectedUser(userObj);
      setSuspensionReason('Violation of community guidelines');
      setSuspendModalOpen(true);
    }
  };

  const handleConfirmSuspension = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await api.patch(`/admin/users/${selectedUser._id}/suspend`, {
        isSuspended: true,
        suspensionReason,
      });

      if (res.success) {
        toast.success(`User ${selectedUser.name} suspended.`);
        setSuspendModalOpen(false);
        fetchUsers();
        fetchAnalytics();
      }
    } catch (err) {
      toast.error(err.message || 'Suspension failed');
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        toast.success(`Role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      const res = await api.patch(`/admin/reports/${reportId}/resolve`, {
        status: 'resolved',
        actionTaken,
        resolutionNotes: `Moderation action taken: ${actionTaken}`,
      });

      if (res.success) {
        toast.success(`Report resolved with action: ${actionTaken}`);
        fetchReports();
        fetchAnalytics();
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-purple-600" />
            <span>Admin & Moderation Panel</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Platform governance, telemetry analytics, and community safety enforcement
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Safety Reports ({metrics?.pendingReports || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-400">TOTAL USERS</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.totalUsers}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-400">TOTAL PROJECTS</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.totalProjects}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-400">APPLICATIONS</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.totalApplications}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-400">PENDING REPORTS</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {metrics.pendingReports}
              </p>
            </div>
          </div>

          {/* Visual Recharts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projects by Category BarChart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Projects Distribution by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Pipeline Status PieChart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Application Review Status Pipeline
              </h3>
              <div className="h-64 flex items-center justify-center">
                {applicationStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStats}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {applicationStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">No application telemetry available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name, email, or college..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={fetchUsers}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
            >
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">College</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                      {u.college || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {u.isSuspended ? (
                        <span className="text-rose-600 font-bold">SUSPENDED</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">ACTIVE</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {u.role === 'admin' ? 'Demote to Student' : 'Promote Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleSuspension(u)}
                        className={`font-semibold ${
                          u.isSuspended ? 'text-emerald-600' : 'text-rose-600'
                        } hover:underline`}
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportsLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500">
              No reports filed. The community is clean and compliant!
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Reason: {rep.reason.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      Target: {rep.targetType.toUpperCase()} - {rep.targetName || rep.targetId}
                    </h4>
                    <p className="text-xs text-slate-500">Reported by: {rep.reporter?.name}</p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      rep.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rep.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <p className="italic">"{rep.description}"</p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleResolveReport(rep._id, 'none')}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'content_removed')}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl shadow hover:bg-amber-700"
                    >
                      Take Down Content
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'user_suspended')}
                      className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700"
                    >
                      Suspend Offender
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Suspend User Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={`Suspend User: ${selectedUser?.name}`}
      >
        <form onSubmit={handleConfirmSuspension} className="space-y-4">
          <p className="text-xs text-slate-500">
            Suspending will immediately lock this student out of project applications, messaging, and
            collaboration workspaces.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Suspension *
            </label>
            <textarea
              rows={3}
              required
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSuspendModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Confirm Suspension
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
