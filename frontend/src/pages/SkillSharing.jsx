import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlusCircle,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';

export const SkillSharing = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'mentors'
  const [providedSessions, setProvidedSessions] = useState([]);
  const [requestedSessions, setRequestedSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Session Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [topic, setTopic] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [duration, setDuration] = useState(45);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchMentors();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/skills/sessions');
      if (res.success && res.data) {
        setProvidedSessions(res.data.providedSessions || []);
        setRequestedSessions(res.data.requestedSessions || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await api.get('/skills/mentors');
      if (res.success && res.data?.mentors) {
        setMentors(res.data.mentors);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleRespond = async (sessionId, response) => {
    try {
      const res = await api.patch(`/skills/sessions/${sessionId}/respond`, {
        response,
        meetingLink: response === 'accepted' ? 'https://meet.google.com/new' : '',
      });
      if (res.success) {
        toast.success(`Session ${response}!`);
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to respond to session');
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      const res = await api.patch(`/skills/sessions/${sessionId}/complete`, {
        notes: 'Session successfully concluded.',
      });
      if (res.success) {
        toast.success('Session marked completed! Reputation points awarded. 🎓');
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark session complete');
    }
  };

  const handleRequestSession = async (e) => {
    e.preventDefault();
    if (!selectedMentor || !selectedSkill || !topic) return;

    try {
      setSubmitting(true);
      const res = await api.post('/skills/request', {
        providerId: selectedMentor._id,
        skill: selectedSkill,
        topic,
        proposedDurationMinutes: duration,
        preferredTime,
      });

      if (res.success) {
        toast.success('Session request sent to mentor!');
        setIsModalOpen(false);
        setTopic('');
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request session');
    } finally {
      setSubmitting(false);
    }
  };

  const openRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    if (mentor.skills?.length > 0) {
      setSelectedSkill(mentor.skills[0]);
    }
    setIsModalOpen(true);
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
            <GraduationCap className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>Peer Skill Sharing</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Request 1-on-1 peer learning sessions, mentor fellow students, and earn campus reputation
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'sessions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Sessions
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'mentors'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Browse Peer Mentors ({mentors.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: MY SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-8">
          {/* Incoming Mentoring Requests */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Incoming Mentoring Requests</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {providedSessions.length}
              </span>
            </h2>

            {providedSessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500">
                No incoming peer learning requests. Add skills to your profile to offer mentorship!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providedSessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {s.skill}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : s.status === 'completed'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.topic}</h3>
                      <p className="text-xs text-slate-500">
                        Requested by {s.requester?.name} ({s.requester?.college})
                      </p>
                    </div>

                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {s.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleRespond(s._id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespond(s._id, 'accepted')}
                            className="px-4 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-xl shadow hover:bg-brand-700"
                          >
                            Accept Session
                          </button>
                        </>
                      )}
                      {s.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(s._id)}
                          className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests (Sessions I Want to Learn) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>My Requested Learning Sessions</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {requestedSessions.length}
              </span>
            </h2>

            {requestedSessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500">
                You haven't requested any peer learning sessions yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestedSessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Skill: {s.skill}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.topic}</h3>
                      <p className="text-xs text-slate-500">
                        Mentor: {s.provider?.name} ({s.provider?.college})
                      </p>
                    </div>

                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Meeting Room</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BROWSE PEER MENTORS */}
      {activeTab === 'mentors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((m) => (
            <div
              key={m._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-bold flex items-center justify-center uppercase">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-slate-500">{m.college}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(m.skills || []).slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openRequestModal(m)}
                  className="w-full rounded-xl bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow"
                >
                  Request Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request Peer Session with ${selectedMentor?.name}`}
      >
        <form onSubmit={handleRequestSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {(selectedMentor?.skills || []).map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Challenge *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Setting up Docker compose or understanding React hooks"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Time
              </label>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g. Friday afternoon"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillSharing;
