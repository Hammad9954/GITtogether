import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  PlusCircle,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Shield,
  Loader2,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';

export const Teams = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Team Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTeamsAndInvites();
  }, []);

  const fetchTeamsAndInvites = async () => {
    try {
      setLoading(true);
      const [teamsRes, invRes] = await Promise.all([
        api.get('/teams/my'),
        api.get('/teams/invitations'),
      ]);

      if (teamsRes.success) setTeams(teamsRes.data.teams || []);
      if (invRes.success) setInvitations(invRes.data.invitations || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInvitation = async (invitationId, response) => {
    try {
      const res = await api.post(`/teams/invitations/${invitationId}/respond`, { response });
      if (res.success) {
        toast.success(`Invitation ${response}!`);
        fetchTeamsAndInvites();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to respond to invitation');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName) return;

    try {
      setCreating(true);
      const res = await api.post('/teams', {
        name: teamName,
        description: teamDescription,
        maxMembers,
      });

      if (res.success && res.data?.team) {
        toast.success('Team created successfully!');
        setIsCreateOpen(false);
        setTeamName('');
        setTeamDescription('');
        fetchTeamsAndInvites();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>My Teams & Workspaces</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Collaborate with your teammates, manage roles, and communicate in real-time
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
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
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {inv.team?.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Invited by {inv.inviter?.name} ({inv.inviter?.college})
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Role: {inv.role || 'Member'}
                  </span>
                </div>

                {inv.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    "{inv.message}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'declined')}
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'accepted')}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Team Workspaces</h2>

        {teams.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              You are not a member of any teams yet.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Join an existing campus project or create a team to start collaborating!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => {
              const isLeader = team.leader?._id === user?._id;
              return (
                <div
                  key={team._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLeader
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        }`}
                      >
                        {isLeader ? 'TEAM LEADER' : 'MEMBER'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {team.members?.length || 1} / {team.maxMembers || 5} members
                      </span>
                    </div>

                    <Link
                      to={`/teams/${team._id}`}
                      className="block text-lg font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate"
                    >
                      {team.name}
                    </Link>

                    {team.project && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold truncate">
                        Project: {team.project?.title}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {team.description || 'Dedicated workspace for campus collaboration.'}
                    </p>

                    {/* Member Avatars */}
                    <div className="flex items-center gap-1.5 pt-2">
                      {(team.members || []).slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          title={m.role}
                          className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center border border-white dark:border-slate-900 uppercase overflow-hidden"
                        >
                          {m.user?.avatar ? (
                            <img src={m.user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            m.user?.name?.charAt(0) || 'M'
                          )}
                        </div>
                      ))}
                      {(team.members || []).length > 4 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          +{team.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 capitalize">
                      Status: <strong>{team.status}</strong>
                    </span>
                    <Link
                      to={`/teams/${team._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Quantum Hackers, Solar Drone Squad"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={3}
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="What is your team building? What are the sprint goals?"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Members Limit
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value, 10) || 5)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
