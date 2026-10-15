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
            <GraduationCap className="w-7 h-7 text-[#B7FF5A]" />
            <span>Peer Skill Sharing</span>
          </h1>
          <p className="text-sm text-[#A1AAA0] mt-1">
            Request 1-on-1 peer learning sessions, mentor fellow students, and earn campus reputation.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#101310] border border-[#282F28] p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`rounded-lg px-4 py-1.5 transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] shadow-sm'
                : 'text-[#70796F] hover:text-[#F4F7F2]'
            }`}
          >
            My Sessions
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`rounded-lg px-4 py-1.5 transition-all ${
              activeTab === 'mentors'
                ? 'bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] shadow-sm'
                : 'text-[#70796F] hover:text-[#F4F7F2]'
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
            <h2 className="text-lg font-bold text-[#F4F7F2] flex items-center gap-2">
              <span>Incoming Mentoring Requests</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A]">
                {providedSessions.length}
              </span>
            </h2>

            {providedSessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#151915] border border-[#282F28] text-xs text-[#70796F]">
                No incoming peer learning requests. Add skills to your profile to offer mentorship!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providedSessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20">
                        {s.skill}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          s.status === 'accepted'
                            ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                            : s.status === 'completed'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#F4F7F2]">{s.topic}</h3>
                      <p className="text-xs text-[#70796F] mt-0.5">
                        Requested by <span className="text-[#A1AAA0]">{s.requester?.name}</span> ({s.requester?.college})
                      </p>
                    </div>

                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B7FF5A] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282F28]">
                      {s.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleRespond(s._id, 'rejected')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespond(s._id, 'accepted')}
                            className="btn-primary px-4 py-1.5 text-xs font-semibold"
                          >
                            Accept Session
                          </button>
                        </>
                      )}
                      {s.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(s._id)}
                          className="btn-primary px-4 py-1.5 text-xs font-semibold"
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
            <h2 className="text-lg font-bold text-[#F4F7F2] flex items-center gap-2">
              <span>My Requested Learning Sessions</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A]">
                {requestedSessions.length}
              </span>
            </h2>

            {requestedSessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#151915] border border-[#282F28] text-xs text-[#70796F]">
                You haven't requested any peer learning sessions yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestedSessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]">
                        Skill: {s.skill}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#101310] text-[#70796F] border border-[#282F28]">
                        {s.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#F4F7F2]">{s.topic}</h3>
                      <p className="text-xs text-[#70796F] mt-0.5">
                        Mentor: <span className="text-[#A1AAA0]">{s.provider?.name}</span> ({s.provider?.college})
                      </p>
                    </div>

                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B7FF5A] hover:underline"
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
              className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] hover:border-[#384238] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold flex items-center justify-center uppercase text-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#F4F7F2]">{m.name}</h3>
                    <p className="text-xs text-[#70796F]">{m.college}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(m.skills || []).slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101310] text-[#A1AAA0] border border-[#282F28]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#282F28]">
                <button
                  onClick={() => openRequestModal(m)}
                  className="w-full btn-primary py-2 text-xs font-semibold"
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
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-surface w-full p-2.5 text-xs rounded-xl"
            >
              {(selectedMentor?.skills || []).map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Topic or Challenge *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Setting up Docker compose or understanding React hooks"
              className="input-surface w-full p-2.5 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="input-surface w-full p-2.5 text-xs rounded-xl"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Preferred Time
              </label>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g. Friday afternoon"
                className="input-surface w-full p-2.5 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#282F28]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#70796F] hover:text-[#F4F7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
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
