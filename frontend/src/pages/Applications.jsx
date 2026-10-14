import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CheckCircle2, XCircle, Clock, ArrowRight, Loader2, Users } from 'lucide-react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, invRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/teams/invitations'),
      ]);

      if (appRes.success) setApplications(appRes.data.applications || []);
      if (invRes.success) setInvitations(invRes.data.invitations || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.patch(`/applications/${appId}/withdraw`, {});
      if (res.success) {
        toast.info('Application withdrawn');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw application');
    }
  };

  const handleRespondInvitation = async (invitationId, response) => {
    try {
      const res = await api.post(`/teams/invitations/${invitationId}/respond`, { response });
      if (res.success) {
        toast.success(`Invitation ${response}!`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to respond to invitation');
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
    <div className="space-y-8 animate-fade-in py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Inbox className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          <span>Applications & Invitations</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track the status of your project applications and manage team membership requests
        </p>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
          <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Pending Team Invitations ({invitations.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-3"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {inv.team?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invited by {inv.inviter?.name} ({inv.inviter?.college})
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'declined')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'accepted')}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700"
                  >
                    Accept & Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Applications List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          My Submitted Project Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              You haven't submitted any project applications yet.
            </p>
            <Link to="/projects" className="text-xs text-brand-600 font-bold hover:underline">
              Explore available projects →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${app.project?._id}`}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {app.project?.title || 'Project'}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500">
                    Applied for: <strong className="text-slate-700 dark:text-slate-300">{app.role}</strong> •{' '}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{app.pitch}"
                  </p>
                  {app.feedback && (
                    <div className="mt-2 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <strong>Lead Feedback:</strong> {app.feedback}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : app.status === 'withdrawn'
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {app.status.toUpperCase()}
                  </span>

                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
