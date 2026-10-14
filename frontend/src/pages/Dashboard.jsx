import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  Inbox,
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import MatchScoreBadge from '../components/MatchScoreBadge.jsx';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, studRes, teamsRes, appsRes, invRes] = await Promise.all([
          api.get('/matching/projects?limit=4'),
          api.get('/matching/students?limit=4'),
          api.get('/teams/my'),
          api.get('/applications/my'),
          api.get('/teams/invitations'),
        ]);

        if (projRes.success) setRecommendedProjects(projRes.data.recommendations || []);
        if (studRes.success) setRecommendedStudents(studRes.data.recommendations || []);
        if (teamsRes.success) setMyTeams(teamsRes.data.teams || []);
        if (appsRes.success) setPendingApplications(appsRes.data.applications || []);
        if (invRes.success) setInvitations(invRes.data.invitations || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const profilePct = user?.profileCompletion || 60;
  const pendingAppsCount = pendingApplications.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-brand-200 backdrop-blur-sm">
                Student Workspace
              </span>
              {user?.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <Link
                  to="/verify-email"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:underline"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Verify Email Now
                </Link>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {user?.college || 'University'} • {user?.course || 'Student'} • Reputation Score:{' '}
              <span className="font-bold text-white">{user?.reputationScore || 100}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-500 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-all backdrop-blur-sm"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="font-semibold text-slate-300">Profile Completion:</span>
            <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${profilePct}%` }}
              />
            </div>
            <span className="font-bold text-emerald-300">{profilePct}%</span>
          </div>

          {profilePct < 100 && (
            <Link to="/profile" className="text-brand-300 hover:text-white font-semibold">
              Add skills & portfolio links to reach 100% →
            </Link>
          )}
        </div>
      </section>

      {/* Metric Counters */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/teams"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:border-brand-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Teams
            </span>
            <FolderGit2 className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{myTeams.length}</p>
        </Link>

        <Link
          to="/applications"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:border-brand-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Applications
            </span>
            <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingAppsCount}</p>
        </Link>

        <Link
          to="/applications"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:border-brand-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Invitations
            </span>
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{invitations.length}</p>
        </Link>

        <Link
          to="/reviews"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:border-brand-500/50 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reputation
            </span>
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {user?.reputationScore || 100}
          </p>
        </Link>
      </section>

      {/* Pending Invitations Alert Banner if any */}
      {invitations.length > 0 && (
        <section className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                You have {invitations.length} pending team invitation{invitations.length > 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                A team wants you to collaborate. Review and accept your spot.
              </p>
            </div>
          </div>
          <Link
            to="/applications"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all whitespace-nowrap"
          >
            Review Invites
          </Link>
        </section>
      )}

      {/* Explainable Recommended Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Recommended Projects For You
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recommendedProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No matching projects found yet.
            </p>
            <p className="text-xs text-slate-400">
              Update your skills or be the first to create an innovative project!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedProjects.map(({ project, matchScore, matchReasons }) => (
              <div
                key={project._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {project.category}
                    </span>
                    <MatchScoreBadge score={matchScore} reasons={matchReasons} />
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="block text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {project.title}
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Required Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(project.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      by {project.owner?.name}
                    </span>
                    <span>•</span>
                    <span>{project.owner?.college}</span>
                  </div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Student Teammates */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Recommended Teammates
            </h2>
          </div>
          <Link
            to="/students"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All Students</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedStudents.map(({ student, matchScore, matchReasons }) => (
            <div
              key={student._id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-sm flex items-center justify-center uppercase overflow-hidden">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      student.name.charAt(0)
                    )}
                  </div>
                  <MatchScoreBadge score={matchScore} reasons={matchReasons} size="sm" />
                </div>

                <div>
                  <Link
                    to={`/students/${student._id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block truncate"
                  >
                    {student.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {student.college || 'Student'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(student.skills || []).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={`/students/${student._id}`}
                  className="block text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors"
                >
                  View Profile & Match
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
