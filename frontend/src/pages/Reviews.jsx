import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, PlusCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StarRating from '../components/StarRating.jsx';
import Modal from '../components/Modal.jsx';

export const Reviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 5, total: 0 });
  const [loading, setLoading] = useState(true);

  // New Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState('');
  const [rating, setRating] = useState(5);
  const [collabRating, setCollabRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [punctRating, setPunctRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyReviews();
      fetchCollaborations();
    }
  }, [user]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/user/${user._id}`);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborations = async () => {
    try {
      const res = await api.get('/teams/my');
      if (res.success && res.data?.teams) {
        setMyTeams(res.data.teams);
        if (res.data.teams.length > 0) {
          handleSelectTeam(res.data.teams[0]);
        }
      }
    } catch {
      // Non-blocking
    }
  };

  const handleSelectTeam = (teamObj) => {
    setSelectedTeam(teamObj);
    // Find teammates in this team excluding current user
    const others = (teamObj.members || [])
      .map((m) => m.user)
      .filter((u) => u && u._id !== user._id);
    setCollaborators(others);
    if (others.length > 0) {
      setSelectedRevieweeId(others[0]._id);
    } else {
      setSelectedRevieweeId('');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedRevieweeId || !selectedTeam?.project) {
      toast.error('Please select a project collaborator to review');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reviews', {
        revieweeId: selectedRevieweeId,
        projectId: selectedTeam.project._id || selectedTeam.project,
        rating,
        collaborationSkillsRating: collabRating,
        communicationRating: commRating,
        punctualityRating: punctRating,
        comment,
      });

      if (res.success) {
        toast.success('Peer review submitted! Thank you for encouraging high-trust collaboration.');
        setIsModalOpen(false);
        setComment('');
        fetchMyReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>Peer Reviews & Trust Score</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transparent evaluations from student teammates after collaborative project milestones
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write a Peer Review</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="text-center sm:text-left">
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              {(stats.avgRating || 5).toFixed(1)}
            </p>
            <StarRating value={Math.round(stats.avgRating || 5)} size="sm" />
            <p className="text-xs text-slate-400 mt-1">Based on {stats.total || reviews.length} reviews</p>
          </div>

          <div className="border-l border-slate-100 dark:border-slate-800 pl-5 text-xs space-y-1.5 text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Collaboration:</span>
              <span className="font-bold text-emerald-600">{(stats.avgCollab || 5).toFixed(1)} / 5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Communication:</span>
              <span className="font-bold text-emerald-600">{(stats.avgComm || 5).toFixed(1)} / 5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Punctuality:</span>
              <span className="font-bold text-emerald-600">{(stats.avgPunct || 5).toFixed(1)} / 5</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 max-w-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
            🛡️ Verified Collaborator Protocol
          </p>
          Reviews can only be authored by students who actually shared a team workspace or project with you.
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Received Collaboration Feedback ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No peer reviews yet.
            </p>
            <p className="text-xs text-slate-400">
              Complete sprint milestones with teammates to build your campus reputation score!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {rev.reviewer?.name}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{rev.reviewer?.college}</span>
                    {rev.project && (
                      <span className="text-slate-400">
                        on <em>"{rev.project?.title}"</em>
                      </span>
                    )}
                  </div>
                  <StarRating value={rev.rating} size="sm" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Submitted {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Peer Review">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Workspace Project
            </label>
            <select
              value={selectedTeam?._id || ''}
              onChange={(e) => {
                const target = myTeams.find((t) => t._id === e.target.value);
                if (target) handleSelectTeam(target);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} (Project: {t.project?.title || 'Standalone'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Teammate to Review
            </label>
            {collaborators.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No other teammates in this workspace.</p>
            ) : (
              <select
                value={selectedRevieweeId}
                onChange={(e) => setSelectedRevieweeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {collaborators.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.college})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overall Collaboration Rating
            </label>
            <StarRating value={rating} onChange={setRating} editable size="lg" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Feedback Comment *
            </label>
            <textarea
              rows={4}
              required
              minLength={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made collaborating with this student great? How was their communication and contribution?"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
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
              disabled={submitting || !selectedRevieweeId}
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reviews;
