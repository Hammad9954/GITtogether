import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Calendar,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Loader2,
  Edit,
  ArrowRight,
  Send,
  Eye,
  Check,
  X,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import ReportModal from '../components/ReportModal.jsx';
import MatchScoreBadge from '../components/MatchScoreBadge.jsx';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);

  // Apply Modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);

  // Owner Review Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  const isOwner = user && project && project.owner?._id === user._id;

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project && user && !isOwner) {
      fetchMatchScore();
    }
    if (project && isOwner) {
      fetchApplications();
    }
  }, [project, user, isOwner]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.success && res.data?.project) {
        setProject(res.data.project);
        setUserApplication(res.data.userApplication);
        if (res.data.project.openPositions?.length > 0) {
          setSelectedRole(res.data.project.openPositions[0].role);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchScore = async () => {
    try {
      const res = await api.get(`/matching/compare/${user._id}/${id}`);
      if (res.success && res.data) {
        setMatchData(res.data);
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await api.get(`/applications/project/${id}`);
      if (res.success && res.data?.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      const res = await api.post(`/applications/project/${id}`, {
        role: selectedRole,
        pitch,
        skills: user.skills || [],
      });

      if (res.success && res.data?.application) {
        toast.success('Application submitted successfully!');
        setUserApplication(res.data.application);
        setIsApplyOpen(false);
        setPitch('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleReviewApplication = async (appId, status) => {
    try {
      const res = await api.patch(`/applications/${appId}/review`, { status });
      if (res.success) {
        toast.success(`Application ${status}`);
        fetchApplications();
        fetchProject();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to review application');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/projects/${id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setProject((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Project not found.</p>
        <Link to="/projects" className="text-brand-600 font-bold hover:underline mt-2 inline-block">
          Return to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Project Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {project.category}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                project.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {project.status.toUpperCase()}
            </span>
            {matchData && (
              <MatchScoreBadge score={matchData.matchScore} reasons={matchData.matchReasons} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <div className="flex items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
                <Link
                  to={`/projects/${project._id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setIsReportOpen(true)}
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Created by:</span>
            <Link
              to={`/students/${project.owner?._id}`}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              {project.owner?.name}
            </Link>
            <span>({project.owner?.college})</span>
          </div>

          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Target: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.viewsCount || 1} views</span>
          </div>
        </div>

        {/* External links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex items-center gap-3 pt-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About the Project</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>

            {/* Required Skills */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Required Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {(project.requiredSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Open Positions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Open Team Positions</h3>
            {project.openPositions && project.openPositions.length > 0 ? (
              <div className="space-y-3">
                {project.openPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {pos.role}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pos.filled >= pos.count
                              ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {pos.filled >= pos.count ? 'FILLED' : `${pos.count - pos.filled} OPEN`}
                        </span>
                      </div>
                      {pos.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {pos.description}
                        </p>
                      )}
                    </div>

                    {!isOwner && project.status === 'published' && pos.filled < pos.count && (
                      <button
                        onClick={() => {
                          setSelectedRole(pos.role);
                          setIsApplyOpen(true);
                        }}
                        className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition-colors whitespace-nowrap self-start sm:self-auto"
                      >
                        Apply for this Role
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">General collaboration open to all roles.</p>
            )}
          </div>

          {/* Owner Moderation: Project Applications Review */}
          {isOwner && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Applications to Review ({applications.length})
                </h3>
              </div>

              {loadingApps ? (
                <div className="py-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No applications submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                            {app.applicant?.name?.charAt(0)}
                          </div>
                          <div>
                            <Link
                              to={`/students/${app.applicant?._id}`}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:underline block"
                            >
                              {app.applicant?.name}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {app.applicant?.college} • {app.applicant?.course}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                          Applying for: {app.role}
                        </span>
                        <p className="italic">"{app.pitch}"</p>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleReviewApplication(app._id, 'rejected')}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app._id, 'accepted')}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept into Team</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Team Workspace Info & Apply Action */}
        <div className="space-y-6">
          {/* Apply Card (For Non-Owners) */}
          {!isOwner && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interested in Building this?
              </h3>

              {userApplication ? (
                <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-xs space-y-1">
                  <span className="font-bold text-brand-800 dark:text-brand-300 block">
                    Your Application Status: {userApplication.status.toUpperCase()}
                  </span>
                  <p className="text-brand-700 dark:text-brand-400">
                    You applied for <strong>{userApplication.role}</strong> on{' '}
                    {new Date(userApplication.createdAt).toLocaleDateString()}.
                  </p>
                  {userApplication.status === 'accepted' && (
                    <Link
                      to={`/teams/${project.team?._id || project.team}`}
                      className="inline-block mt-2 font-bold text-brand-600 hover:underline"
                    >
                      Open Team Workspace & Chat →
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsApplyOpen(true)}
                  disabled={project.status !== 'published'}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Pitch to Join Team</span>
                </button>
              )}
            </div>
          )}

          {/* Team Members List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Members</h3>
              <span className="text-xs font-semibold text-slate-400">
                {project.team?.members?.length || 1} / {project.teamSize || 4}
              </span>
            </div>

            <div className="space-y-3">
              {project.team?.members && project.team.members.length > 0 ? (
                project.team.members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center uppercase overflow-hidden">
                        {m.user?.avatar ? (
                          <img src={m.user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          m.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/students/${m.user?._id}`}
                          className="font-bold text-slate-900 dark:text-white hover:underline block"
                        >
                          {m.user?.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{m.role}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">
                  <p className="font-semibold">{project.owner?.name} (Lead)</p>
                </div>
              )}
            </div>

            {project.team && (
              <div className="pt-2">
                <Link
                  to={`/teams/${project.team._id || project.team}`}
                  className="block text-center rounded-xl bg-slate-100 dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  View Team Workspace
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply to Project Modal */}
      <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Join this Project">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Position / Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {project.openPositions?.map((p, i) => (
                <option key={i} value={p.role}>
                  {p.role} {p.filled >= p.count ? '(Filled)' : ''}
                </option>
              ))}
              <option value="General Contributor">General Contributor / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Pitch & Why You're a Fit
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Highlight relevant past projects, tech stack experience, and how many hours you can commit..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {applying && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Application</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="project"
        targetId={project._id}
        targetName={project.title}
      />
    </div>
  );
};

export default ProjectDetails;
