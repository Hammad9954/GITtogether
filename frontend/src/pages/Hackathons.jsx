import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';

export const Hackathons = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register Team Modal
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [registeringTeam, setRegisteringTeam] = useState(false);

  useEffect(() => {
    fetchHackathons();
    if (user) {
      fetchMyTeams();
    }
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hackathons');
      if (res.success && res.data?.items) {
        setHackathons(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load hackathons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      const res = await api.get('/teams/my');
      if (res.success && res.data?.teams) {
        setMyTeams(res.data.teams);
        if (res.data.teams.length > 0) {
          setSelectedTeamId(res.data.teams[0]._id);
        }
      }
    } catch {
      // Non-blocking
    }
  };

  const handleJoinSolo = async (hackathonId) => {
    if (!user) {
      toast.info('Please sign in to register for hackathons');
      return;
    }

    try {
      const res = await api.post(`/hackathons/${hackathonId}/join`, {});
      if (res.success) {
        toast.success(res.message);
        fetchHackathons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update registration');
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!selectedHackathon || !selectedTeamId) return;

    try {
      setRegisteringTeam(true);
      const res = await api.post(`/hackathons/${selectedHackathon._id}/register-team`, {
        teamId: selectedTeamId,
      });

      if (res.success) {
        toast.success('Your team is now registered for the hackathon! 🚀');
        setTeamModalOpen(false);
        fetchHackathons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register team');
    } finally {
      setRegisteringTeam(false);
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
          <Trophy className="w-7 h-7 text-[#B7FF5A]" />
          <span>Hackathons & Competitions</span>
        </h1>
        <p className="text-sm text-[#A1AAA0] mt-1">
          Form collegiate squads, compete for prize grants, and test your prototypes on global stages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hackathons.map((h) => {
          const isParticipating = user && (h.participants || []).some((p) => p === user._id || p._id === user._id);
          return (
            <div
              key={h._id}
              className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] hover:border-[#384238] transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20">
                    {h.mode} Event
                  </span>
                  <span className="text-xs text-[#70796F] font-mono">
                    Organizer: {h.organizer}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#F4F7F2]">
                    {h.title}
                  </h2>
                  {h.tagline && (
                    <p className="text-xs font-medium text-[#B7FF5A] mt-1">
                      {h.tagline}
                    </p>
                  )}
                </div>

                <p className="text-xs text-[#A1AAA0] leading-relaxed line-clamp-3">
                  {h.description}
                </p>

                {/* Event Schedule & Location */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#A1AAA0] bg-[#101310] border border-[#282F28] p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#B7FF5A]" />
                    <span className="font-mono">{new Date(h.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{h.location || 'Virtual'}</span>
                  </div>
                </div>

                {/* Themes */}
                <div className="flex flex-wrap gap-1.5">
                  {(h.themes || []).map((theme) => (
                    <span
                      key={theme}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]"
                    >
                      {theme}
                    </span>
                  ))}
                </div>

                {/* Prizes preview */}
                {h.prizes && h.prizes.length > 0 && (
                  <div className="text-xs pt-1 space-y-1">
                    <span className="text-[#70796F]">Top Prize: </span>
                    <span className="text-[#B7FF5A] font-mono font-bold">
                      {h.prizes[0].place}: {h.prizes[0].reward}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#282F28] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleJoinSolo(h._id)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    isParticipating
                      ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/30'
                      : 'btn-primary'
                  }`}
                >
                  {isParticipating ? '✓ Registered Solo' : 'Register Solo'}
                </button>

                <button
                  onClick={() => {
                    setSelectedHackathon(h);
                    setTeamModalOpen(true);
                  }}
                  className="btn-secondary px-4 py-2.5 text-xs font-semibold"
                >
                  Register Team
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Team to Hackathon Modal */}
      <Modal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        title={`Register Team for ${selectedHackathon?.title}`}
      >
        <form onSubmit={handleRegisterTeam} className="space-y-4">
          <p className="text-xs text-[#A1AAA0]">
            Select one of your existing team workspaces to represent in this hackathon.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Select Your Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="input-surface w-full p-2.5 text-xs rounded-xl"
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.members?.length || 1} members)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#282F28]">
            <button
              type="button"
              onClick={() => setTeamModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#70796F] hover:text-[#F4F7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registeringTeam || !selectedTeamId}
              className="btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {registeringTeam ? 'Registering...' : 'Confirm Team Registration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Hackathons;
