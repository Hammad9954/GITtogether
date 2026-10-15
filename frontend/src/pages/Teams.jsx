import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  PlusCircle,
  ArrowRight,
  Check,
  X,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-[#B7FF5A]" />
            <span>My Teams & Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1AAA0]">
            Collaborate with your teammates, manage roles, and communicate in real-time
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#151915] border border-[#B7FF5A]/30 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B7FF5A]" />
            <span>Pending Team Invitations ({invitations.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="p-4 rounded-xl bg-[#101310] border border-[#282F28] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#F4F7F2]">
                      {inv.team?.name}
                    </h3>
                    <p className="text-xs text-[#70796F]">
                      Invited by {inv.inviter?.name} ({inv.inviter?.college})
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]">
                    Role: {inv.role || 'Member'}
                  </span>
                </div>

                {inv.message && (
                  <p className="text-xs text-[#A1AAA0] italic">
                    "{inv.message}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#282F28]">
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'declined')}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, 'accepted')}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#B7FF5A] px-3.5 py-1.5 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
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
        <h2 className="text-base font-bold text-[#F4F7F2]">Active Team Workspaces</h2>

        {teams.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#151915] border border-[#282F28] space-y-3">
            <FolderGit2 className="w-10 h-10 text-[#70796F] mx-auto" />
            <h3 className="text-base font-bold text-[#F4F7F2]">
              You are not a member of any teams yet.
            </h3>
            <p className="text-xs text-[#70796F] max-w-sm mx-auto">
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
                  className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isLeader
                            ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                            : 'bg-[#1B211B] text-[#A1AAA0] border-[#282F28]'
                        }`}
                      >
                        {isLeader ? 'TEAM LEADER' : 'MEMBER'}
                      </span>
                      <span className="text-xs font-semibold text-[#70796F]">
                        {team.members?.length || 1} / {team.maxMembers || 5} members
                      </span>
                    </div>

                    <Link
                      to={`/teams/${team._id}`}
                      className="block text-base font-bold text-[#F4F7F2] hover:text-[#B7FF5A] transition-colors truncate"
                    >
                      {team.name}
                    </Link>

                    {team.project && (
                      <p className="text-xs text-[#B7FF5A] font-semibold truncate">
                        Project: {team.project?.title}
                      </p>
                    )}

                    <p className="text-xs text-[#A1AAA0] line-clamp-2">
                      {team.description || 'Dedicated workspace for campus collaboration.'}
                    </p>

                    {/* Member Avatars */}
                    <div className="flex items-center gap-1.5 pt-2">
                      {(team.members || []).slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          title={m.role}
                          className="h-7 w-7 rounded-lg bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-[10px] flex items-center justify-center uppercase overflow-hidden"
                        >
                          {m.user?.avatar ? (
                            <img src={m.user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            m.user?.name?.charAt(0) || 'M'
                          )}
                        </div>
                      ))}
                      {(team.members || []).length > 4 && (
                        <span className="text-[10px] font-bold text-[#70796F]">
                          +{team.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#282F28] flex items-center justify-between text-xs">
                    <span className="text-[#70796F] capitalize">
                      Status: <strong className="text-[#A1AAA0] font-medium">{team.status}</strong>
                    </span>
                    <Link
                      to={`/teams/${team._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#B7FF5A] hover:underline"
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
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Quantum Hackers, Solar Drone Squad"
              className="input-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Description & Purpose
            </label>
            <textarea
              rows={3}
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="What is your team building? What are the sprint goals?"
              className="input-surface resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Max Members Limit
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value, 10) || 5)}
              className="input-surface"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
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
