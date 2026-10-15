import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  School,
  Github,
  Linkedin,
  Globe,
  Star,
  Edit,
  Camera,
  ShieldAlert,
  Loader2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StarRating from '../components/StarRating.jsx';
import Modal from '../components/Modal.jsx';
import ReportModal from '../components/ReportModal.jsx';

export const StudentProfile = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If no ID param, viewing own profile
  const targetId = id || currentUser?._id;
  const isMe = currentUser && currentUser._id === targetId;

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Request Skill Session Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDuration, setSessionDuration] = useState(45);
  const [sendingSession, setSendingSession] = useState(false);

  useEffect(() => {
    if (targetId) {
      fetchProfileData();
    }
  }, [targetId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${targetId}`);
      if (res.success && res.data) {
        setStudent(res.data.user);
        setProjects(res.data.projects || []);
        setTeams(res.data.teams || []);
        setReviews(res.data.reviews || []);
        setEditFormData({
          name: res.data.user.name || '',
          college: res.data.user.college || '',
          course: res.data.user.course || '',
          year: res.data.user.year || '1st Year',
          bio: res.data.user.bio || '',
          skills: res.data.user.skills || [],
          interests: res.data.user.interests || [],
          preferredRoles: res.data.user.preferredRoles || [],
          availability: res.data.user.availability || { hoursPerWeek: 15, status: 'actively-looking' },
          portfolioLinks: res.data.user.portfolioLinks || { github: '', linkedin: '', website: '' },
        });
        if (res.data.user.skills?.length > 0) {
          setSelectedSkill(res.data.user.skills[0]);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData);
      if (res.success && res.data?.user) {
        setStudent(res.data.user);
        toast.success('Profile avatar updated!');
      }
    } catch (err) {
      toast.error(err.message || 'Avatar upload failed');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const result = await updateProfile(editFormData);
      if (result?.success) {
        setStudent(result.user);
        setIsEditOpen(false);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/messages/conversations/private', { recipientId: student._id });
      if (res.success && res.data?.conversation) {
        navigate('/messages', { state: { activeConversationId: res.data.conversation._id } });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start conversation');
    }
  };

  const handleRequestSkillSession = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      setSendingSession(true);
      const res = await api.post('/skills/request', {
        providerId: student._id,
        skill: selectedSkill,
        topic: sessionTopic,
        proposedDurationMinutes: sessionDuration,
      });

      if (res.success) {
        toast.success('Skill session request sent!');
        setIsSkillModalOpen(false);
        setSessionTopic('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request session');
    } finally {
      setSendingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-12 text-center text-[#70796F] max-w-xl mx-auto">
        <p>Profile not found.</p>
        <Link to="/students" className="text-[#B7FF5A] font-bold hover:underline mt-2 inline-block">
          Explore student directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4 px-4">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar & Upload */}
            <div className="relative group">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-extrabold text-3xl flex items-center justify-center uppercase overflow-hidden">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  student.name.charAt(0)
                )}
              </div>

              {isMe && (
                <label className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-[#090B0A]/90 text-[#F4F7F2] border border-[#282F28] cursor-pointer hover:text-[#B7FF5A] shadow transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2]">
                  {student.name}
                </h1>
                {student.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B7FF5A] bg-[#B7FF5A]/10 border border-[#B7FF5A]/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Student</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#A1AAA0]">
                {student.course || 'Student'} • {student.year || '1st Year'}
              </p>

              <div className="flex items-center gap-2 text-xs text-[#70796F] pt-0.5">
                <School className="w-3.5 h-3.5 text-[#70796F]" />
                <span>{student.college || 'University'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isMe ? (
              <button
                onClick={() => setIsEditOpen(true)}
                className="btn-secondary w-full sm:w-auto text-xs py-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartChat}
                  className="btn-primary text-xs py-2 px-3.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Learn From</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 rounded-xl text-[#70796F] hover:text-rose-400 border border-[#282F28] bg-[#101310] transition-colors"
                  title="Report User"
                  aria-label="Report User"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="mt-6 pt-5 border-t border-[#282F28] text-xs sm:text-sm text-[#A1AAA0] leading-relaxed">
            {student.bio}
          </p>
        )}

        {/* Portfolio & Social Links */}
        {student.portfolioLinks && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#A1AAA0]">
            {student.portfolioLinks.github && (
              <a
                href={student.portfolioLinks.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#B7FF5A] transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {student.portfolioLinks.linkedin && (
              <a
                href={student.portfolioLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#B7FF5A] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
            {student.portfolioLinks.website && (
              <a
                href={student.portfolioLinks.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#B7FF5A] transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Portfolio Website</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Skills & Availability */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-4">
            <h3 className="text-sm font-bold text-[#F4F7F2]">Skills & Toolkit</h3>
            <div className="flex flex-wrap gap-1.5">
              {(student.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>

            {student.interests && student.interests.length > 0 && (
              <div className="pt-3 border-t border-[#282F28]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#70796F] mb-2">
                  Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {student.interests.map((int) => (
                    <span
                      key={int}
                      className="px-2 py-0.5 rounded-lg bg-[#101310] border border-[#282F28] text-[#A1AAA0] text-[11px]"
                    >
                      {int}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-3">
            <h3 className="text-sm font-bold text-[#F4F7F2]">Availability</h3>
            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#70796F]">Status:</span>
                <span className="font-semibold text-[#F4F7F2] capitalize">
                  {student.availability?.status?.replace('-', ' ') || 'Actively looking'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70796F]">Hours Commitment:</span>
                <span className="font-semibold text-[#F4F7F2]">
                  {student.availability?.hoursPerWeek || 15} hrs/week
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70796F]">Reputation Score:</span>
                <span className="font-bold text-[#B7FF5A]">
                  ★ {student.reputationScore || 100}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Experience & Peer Reviews */}
        <div className="md:col-span-2 space-y-6">
          {/* Peer Reviews Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Peer Reviews & Feedback ({reviews.length})</span>
                </h3>
                <p className="text-xs text-[#70796F]">
                  Verified evaluations from past collaborators on completed campus projects
                </p>
              </div>

              {!isMe && (
                <Link
                  to="/reviews"
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Write Review
                </Link>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-[#70796F] py-3">No collaboration reviews received yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl bg-[#101310] border border-[#282F28] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F4F7F2]">
                          {rev.reviewer?.name}
                        </span>
                        <span className="text-[#70796F]">•</span>
                        <span className="text-[#A1AAA0]">{rev.reviewer?.college}</span>
                        {rev.project && (
                          <span className="text-[#70796F]">
                            on <em>"{rev.project?.title}"</em>
                          </span>
                        )}
                      </div>
                      <StarRating value={rev.rating} size="sm" />
                    </div>
                    <p className="text-[#A1AAA0] italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience History */}
          {student.experience && student.experience.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-4">
              <h3 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#B7FF5A]" />
                <span>Experience & Background</span>
              </h3>
              <div className="space-y-3">
                {student.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1 text-xs p-3 rounded-xl bg-[#101310] border border-[#282F28]">
                    <p className="font-bold text-xs text-[#F4F7F2]">{exp.title}</p>
                    <p className="text-[#70796F]">
                      {exp.organization} • {exp.duration}
                    </p>
                    {exp.description && (
                      <p className="text-[#A1AAA0]">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isMe && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Profile">
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="input-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                  College / Campus
                </label>
                <input
                  type="text"
                  value={editFormData.college}
                  onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                  className="input-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                  Major / Course
                </label>
                <input
                  type="text"
                  value={editFormData.course}
                  onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                  className="input-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Bio & Vision
              </label>
              <textarea
                rows={3}
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="input-surface resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Skills (Add skill and press Enter)
              </label>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = newSkill.trim().toLowerCase();
                    if (trimmed && !editFormData.skills.includes(trimmed)) {
                      setEditFormData({
                        ...editFormData,
                        skills: [...editFormData.skills, trimmed],
                      });
                      setNewSkill('');
                    }
                  }
                }}
                placeholder="e.g. react, node, pytorch, figma..."
                className="input-surface"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {(editFormData.skills || []).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          skills: editFormData.skills.filter((sk) => sk !== s),
                        })
                      }
                      className="text-[#70796F] hover:text-rose-400 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A1AAA0]">
                Portfolio Links
              </label>
              <input
                type="url"
                placeholder="GitHub URL"
                value={editFormData.portfolioLinks?.github || ''}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    portfolioLinks: { ...editFormData.portfolioLinks, github: e.target.value },
                  })
                }
                className="input-surface"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={editFormData.portfolioLinks?.linkedin || ''}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    portfolioLinks: { ...editFormData.portfolioLinks, linkedin: e.target.value },
                  })
                }
                className="input-surface"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Skill Sharing Request Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title={`Request Peer Session with ${student.name}`}
      >
        <form onSubmit={handleRequestSkillSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Select Skill You Want to Learn
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-surface"
            >
              {(student.skills || []).map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Topic or Question *
            </label>
            <input
              type="text"
              required
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="e.g. Debugging state management or setting up Docker"
              className="input-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Duration
            </label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
              className="input-surface"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes (Recommended)</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsSkillModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingSession}
              className="btn-primary"
            >
              {sendingSession ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="user"
        targetId={student._id}
        targetName={student.name}
      />
    </div>
  );
};

export default StudentProfile;
