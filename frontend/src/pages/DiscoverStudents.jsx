import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Search,
  School,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Loader2,
  Send,
  UserPlus,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import MatchScoreBadge from '../components/MatchScoreBadge.jsx';
import Modal from '../components/Modal.jsx';

export const DiscoverStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [recommendations, setRecommendations] = useState(new Map()); // studentId -> { matchScore, matchReasons }
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  // Invite Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteRole, setInviteRole] = useState('Teammate');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchStudents();
    if (user) {
      fetchRecommendations();
      fetchMyTeams();
    }
  }, [collegeFilter, availabilityFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', 20);
      if (searchTerm) params.append('search', searchTerm);
      if (collegeFilter) params.append('college', collegeFilter);
      if (availabilityFilter) params.append('availability', availabilityFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success && res.data?.items) {
        setStudents(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/matching/students?limit=20');
      if (res.success && res.data?.recommendations) {
        const map = new Map();
        res.data.recommendations.forEach((item) => {
          map.set(item.student._id, {
            score: item.matchScore,
            reasons: item.matchReasons,
          });
        });
        setRecommendations(map);
      }
    } catch {
      // Non-blocking
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleStartChat = async (studentId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/messages/conversations/private', { recipientId: studentId });
      if (res.success && res.data?.conversation) {
        navigate('/messages', { state: { activeConversationId: res.data.conversation._id } });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start conversation');
    }
  };

  const openInviteModal = (student) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (myTeams.length === 0) {
      toast.info('You do not lead any teams yet. Create a project or team first!');
      return;
    }
    setSelectedStudent(student);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedStudent) return;

    try {
      setSendingInvite(true);
      const res = await api.post(`/teams/${selectedTeamId}/invite`, {
        inviteeId: selectedStudent._id,
        role: inviteRole,
        message: inviteMessage,
      });

      if (res.success) {
        toast.success(`Invitation sent to ${selectedStudent.name}!`);
        setInviteModalOpen(false);
        setInviteMessage('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          <span>Find Teammates</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect with talented peer builders and explore explainable compatibility scores
        </p>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, skills (e.g. react, python), course, or university..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Availability Statuses</option>
            <option value="actively-looking">Actively Looking for Projects</option>
            <option value="open-to-offers">Open to Offers</option>
            <option value="busy">Busy</option>
          </select>
        </div>
      </div>

      {/* Students Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No students found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const match = recommendations.get(student._id);
            return (
              <div
                key={student._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-base flex items-center justify-center uppercase overflow-hidden flex-shrink-0">
                        {student.avatar ? (
                          <img src={student.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/students/${student._id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block"
                        >
                          {student.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {student.college || 'Student'} • {student.year}
                        </p>
                      </div>
                    </div>

                    {match && (
                      <MatchScoreBadge score={match.score} reasons={match.reasons} size="sm" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {student.bio || 'Passionate student builder exploring new technologies.'}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {(student.skills || []).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Status:{' '}
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">
                        {student.availability?.status?.replace('-', ' ') || 'Active'}
                      </strong>
                    </span>
                    <span className="font-semibold text-brand-600">
                      ★ Rep: {student.reputationScore || 100}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Link
                    to={`/students/${student._id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => handleStartChat(student._id)}
                    className="p-2 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openInviteModal(student)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                    title="Invite to Team"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Member to Team Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite ${selectedStudent?.name} to Team`}
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Team Workspace
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.members?.length || 1}/{t.maxMembers})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Proposed Role
            </label>
            <input
              type="text"
              required
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              placeholder="e.g. Frontend Specialist, ML Engineer"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Personalized Invitation Message
            </label>
            <textarea
              rows={3}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Hey! Loved your profile and skill set. We'd love to have you collaborate with us on..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingInvite}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {sendingInvite && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscoverStudents;
