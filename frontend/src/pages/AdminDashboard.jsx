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

const CHART_COLORS = ['#B7FF5A', '#384238', '#70796F', '#CAFF8C', '#A1AAA0', '#1B211B'];

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
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in py-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-[#B7FF5A]" />
            <span>Admin & Moderation Panel</span>
          </h1>
          <p className="text-sm text-[#A1AAA0] mt-1">
            Platform governance, telemetry analytics, and community safety enforcement.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#101310] border border-[#282F28] p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] shadow-sm'
                : 'text-[#70796F] hover:text-[#F4F7F2]'
            }`}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] shadow-sm'
                : 'text-[#70796F] hover:text-[#F4F7F2]'
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'reports'
                ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] shadow-sm'
                : 'text-[#70796F] hover:text-[#F4F7F2]'
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
            <div className="p-5 rounded-2xl bg-[#151915] border border-[#282F28]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#70796F]">TOTAL USERS</span>
              <p className="text-2xl font-mono font-black text-[#F4F7F2] mt-1">
                {metrics.totalUsers}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#151915] border border-[#282F28]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#70796F]">TOTAL PROJECTS</span>
              <p className="text-2xl font-mono font-black text-[#F4F7F2] mt-1">
                {metrics.totalProjects}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#151915] border border-[#282F28]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#70796F]">APPLICATIONS</span>
              <p className="text-2xl font-mono font-black text-[#F4F7F2] mt-1">
                {metrics.totalApplications}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#151915] border border-[#282F28]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#70796F]">PENDING REPORTS</span>
              <p className="text-2xl font-mono font-black text-rose-400 mt-1">
                {metrics.pendingReports}
              </p>
            </div>
          </div>

          {/* Visual Recharts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projects by Category BarChart */}
            <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
              <h3 className="text-base font-bold text-[#F4F7F2]">
                Projects Distribution by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="category" tick={{ fill: '#70796F', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#70796F', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: '#101310',
                        color: '#F4F7F2',
                        border: '1px solid #282F28',
                      }}
                    />
                    <Bar dataKey="count" fill="#B7FF5A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Pipeline Status PieChart */}
            <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
              <h3 className="text-base font-bold text-[#F4F7F2]">
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
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: '#101310',
                          color: '#F4F7F2',
                          border: '1px solid #282F28',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-[#70796F]">No application telemetry available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name, email, or college..."
              className="flex-1 input-surface px-4 py-2 text-xs rounded-xl"
            />
            <button
              onClick={fetchUsers}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#282F28] text-[#70796F] font-mono uppercase">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">College</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282F28]/50">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1B211B] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#F4F7F2]">{u.name}</p>
                      <p className="text-[#70796F] text-[11px]">{u.email}</p>
                    </td>
                    <td className="py-3 px-3 text-[#A1AAA0]">
                      {u.college || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/20'
                            : 'bg-[#101310] text-[#70796F] border-[#282F28]'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {u.isSuspended ? (
                        <span className="text-rose-400 font-mono font-bold text-[11px]">SUSPENDED</span>
                      ) : (
                        <span className="text-[#B7FF5A] font-mono font-bold text-[11px]">ACTIVE</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-3">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="font-semibold text-[#B7FF5A] hover:underline"
                      >
                        {u.role === 'admin' ? 'Demote to Student' : 'Promote Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleSuspension(u)}
                        className={`font-semibold ${
                          u.isSuspended ? 'text-[#B7FF5A]' : 'text-rose-400'
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
              <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#151915] border border-[#282F28] text-xs text-[#70796F]">
              No reports filed. The community is clean and compliant!
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Reason: {rep.reason.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-sm text-[#F4F7F2] mt-1.5">
                      Target: {rep.targetType.toUpperCase()} - {rep.targetName || rep.targetId}
                    </h4>
                    <p className="text-xs text-[#70796F] mt-0.5">Reported by: <span className="text-[#A1AAA0]">{rep.reporter?.name}</span></p>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      rep.status === 'resolved'
                        ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {rep.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#101310] border border-[#282F28] text-xs text-[#A1AAA0]">
                  <p className="italic">"{rep.description}"</p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282F28]">
                    <button
                      onClick={() => handleResolveReport(rep._id, 'none')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#70796F] hover:text-[#F4F7F2] hover:bg-[#1B211B] rounded-xl transition-colors border border-[#282F28]"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'content_removed')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors"
                    >
                      Take Down Content
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'user_suspended')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors"
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
          <p className="text-xs text-[#A1AAA0]">
            Suspending will immediately lock this student out of project applications, messaging, and
            collaboration workspaces.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Reason for Suspension *
            </label>
            <textarea
              rows={3}
              required
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="input-surface w-full p-2.5 text-xs rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#282F28]">
            <button
              type="button"
              onClick={() => setSuspendModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#70796F] hover:text-[#F4F7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors"
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
