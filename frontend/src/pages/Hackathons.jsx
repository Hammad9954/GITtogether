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
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          <span>Hackathons & Competitions</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Form collegiate squads, compete for prize grants, and test your prototypes on global stages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hackathons.map((h) => {
          const isParticipating = user && (h.participants || []).some((p) => p === user._id || p._id === user._id);
          return (
            <div
              key={h._id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {h.mode} Event
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Organizer: {h.organizer}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {h.title}
                  </h2>
                  {h.tagline && (
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                      {h.tagline}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {h.description}
                </p>

                {/* Event Schedule & Location */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>{new Date(h.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="truncate">{h.location || 'Virtual'}</span>
                  </div>
                </div>

                {/* Themes */}
                <div className="flex flex-wrap gap-1.5">
                  {(h.themes || []).map((theme) => (
                    <span
                      key={theme}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {theme}
                    </span>
                  ))}
                </div>

                {/* Prizes preview */}
                {h.prizes && h.prizes.length > 0 && (
                  <div className="text-xs pt-1 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Top Prize: </span>
                    <span className="text-emerald-600 font-bold">
                      {h.prizes[0].place}: {h.prizes[0].reward}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleJoinSolo(h._id)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    isParticipating
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow'
                  }`}
                >
                  {isParticipating ? '✓ Registered Solo' : 'Register Solo'}
                </button>

                <button
                  onClick={() => {
                    setSelectedHackathon(h);
                    setTeamModalOpen(true);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
          <p className="text-xs text-slate-500">
            Select one of your existing team workspaces to represent in this hackathon.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Your Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.members?.length || 1} members)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTeamModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registeringTeam || !selectedTeamId}
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
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
