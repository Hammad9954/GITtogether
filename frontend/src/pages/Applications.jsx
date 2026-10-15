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
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
          <Inbox className="w-7 h-7 text-[#B7FF5A]" />
          <span>Applications & Invitations</span>
        </h1>
        <p className="text-sm text-[#A1AAA0] mt-1">
          Track the status of your project applications and manage incoming team membership invitations.
        </p>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#151915] border border-[#B7FF5A]/30 shadow-lg shadow-[#B7FF5A]/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B7FF5A]" />
              <span>Pending Team Invitations ({invitations.length})</span>
            </h2>
            <span className="text-xs font-mono text-[#B7FF5A] bg-[#B7FF5A]/10 px-2 py-0.5 rounded-full border border-[#B7FF5A]/20">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="p-5 rounded-xl bg-[#101310] border border-[#282F28] space-y-3"
              >
                <div>
                  <h3 className="font-bold text-sm text-[#F4F7F2]">
                    {inv.team?.name}
                  </h3>
                  <p className="text-xs text-[#70796F] mt-0.5">
                    Invited by <span className="text-[#A1AAA0] font-medium">{inv.inviter?.name}</span> ({inv.inviter?.college})
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282F28]">
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'declined')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'accepted')}
                    className="btn-primary px-4 py-1.5 text-xs font-semibold"
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#F4F7F2]">
            My Submitted Applications ({applications.length})
          </h2>
          <span className="text-xs text-[#70796F] font-mono">Real-time status tracking</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#151915] border border-[#282F28] space-y-3">
            <p className="text-sm font-medium text-[#A1AAA0]">
              You haven't submitted any project applications yet.
            </p>
            <Link to="/projects" className="inline-block text-xs font-semibold text-[#B7FF5A] hover:underline">
              Explore available projects & open positions →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] hover:border-[#384238] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${app.project?._id}`}
                      className="font-bold text-base text-[#F4F7F2] hover:text-[#B7FF5A] transition-colors"
                    >
                      {app.project?.title || 'Project'}
                    </Link>
                  </div>
                  <p className="text-xs text-[#70796F]">
                    Role applied: <strong className="text-[#A1AAA0]">{app.role}</strong> •{' '}
                    <span className="font-mono">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-xs text-[#A1AAA0] italic bg-[#101310] p-3 rounded-xl border border-[#282F28]/60">
                    "{app.pitch}"
                  </p>
                  {app.feedback && (
                    <div className="mt-2 text-xs p-2.5 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#F4F7F2]">
                      <strong className="text-[#B7FF5A]">Lead Feedback:</strong> {app.feedback}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      app.status === 'accepted'
                        ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : app.status === 'withdrawn'
                        ? 'bg-[#1B211B] text-[#70796F] border-[#282F28]'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {app.status.toUpperCase()}
                  </span>

                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline px-2 py-1 rounded transition-colors"
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
