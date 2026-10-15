import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, PlusCircle, CheckCircle2, Loader2, Sparkles, Shield } from 'lucide-react';
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
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            <span>Peer Reviews & Trust Score</span>
          </h1>
          <p className="text-sm text-[#A1AAA0] mt-1">
            Transparent evaluations from student teammates after collaborative project milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write a Peer Review</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-4xl font-mono font-black text-[#F4F7F2]">
              {(stats.avgRating || 5).toFixed(1)}
            </p>
            <div className="my-1">
              <StarRating value={Math.round(stats.avgRating || 5)} size="sm" />
            </div>
            <p className="text-xs font-mono text-[#70796F]">Based on {stats.total || reviews.length} reviews</p>
          </div>

          <div className="border-l border-[#282F28] pl-6 text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#A1AAA0]">Collaboration:</span>
              <span className="font-mono font-bold text-[#B7FF5A]">{(stats.avgCollab || 5).toFixed(1)} / 5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A1AAA0]">Communication:</span>
              <span className="font-mono font-bold text-[#B7FF5A]">{(stats.avgComm || 5).toFixed(1)} / 5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A1AAA0]">Punctuality:</span>
              <span className="font-mono font-bold text-[#B7FF5A]">{(stats.avgPunct || 5).toFixed(1)} / 5</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#A1AAA0] max-w-xs bg-[#101310] border border-[#282F28] p-4 rounded-xl">
          <p className="font-bold text-[#F4F7F2] mb-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#B7FF5A]" />
            <span>Verified Collaborator Protocol</span>
          </p>
          Reviews can only be authored by students who actually shared a verified team workspace or project with you.
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F4F7F2]">
          Received Collaboration Feedback ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#151915] border border-[#282F28] space-y-2">
            <p className="text-sm font-semibold text-[#A1AAA0]">
              No peer reviews yet.
            </p>
            <p className="text-xs text-[#70796F]">
              Complete sprint milestones with teammates to build your campus reputation score!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] hover:border-[#384238] transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F4F7F2]">
                      {rev.reviewer?.name}
                    </span>
                    <span className="text-[#70796F]">•</span>
                    <span className="text-[#A1AAA0]">{rev.reviewer?.college}</span>
                    {rev.project && (
                      <span className="text-[#70796F]">
                        on <em className="text-[#B7FF5A]">"{rev.project?.title}"</em>
                      </span>
                    )}
                  </div>
                  <StarRating value={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-[#F4F7F2] leading-relaxed italic bg-[#101310] p-3 rounded-xl border border-[#282F28]/60">
                  "{rev.comment}"
                </p>
                <p className="text-[10px] font-mono text-[#70796F] pt-1">
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
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Select Workspace Project
            </label>
            <select
              value={selectedTeam?._id || ''}
              onChange={(e) => {
                const target = myTeams.find((t) => t._id === e.target.value);
                if (target) handleSelectTeam(target);
              }}
              className="input-surface w-full p-2.5 text-xs rounded-xl"
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} (Project: {t.project?.title || 'Standalone'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Select Teammate to Review
            </label>
            {collaborators.length === 0 ? (
              <p className="text-xs text-[#70796F] italic">No other teammates in this workspace.</p>
            ) : (
              <select
                value={selectedRevieweeId}
                onChange={(e) => setSelectedRevieweeId(e.target.value)}
                className="input-surface w-full p-2.5 text-xs rounded-xl"
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
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Overall Collaboration Rating
            </label>
            <div className="p-3 rounded-xl bg-[#101310] border border-[#282F28] w-fit">
              <StarRating value={rating} onChange={setRating} editable size="lg" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Feedback Comment *
            </label>
            <textarea
              rows={4}
              required
              minLength={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made collaborating with this student great? How was their communication and contribution?"
              className="input-surface w-full p-3 text-xs rounded-xl"
            />
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
              disabled={submitting || !selectedRevieweeId}
              className="btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
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
