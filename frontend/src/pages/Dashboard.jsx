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
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-32 bg-[#151915] border border-[#282F28] rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#151915] border border-[#282F28] rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-[#151915] border border-[#282F28] rounded-2xl" />
      </div>
    );
  }

  const profilePct = user?.profileCompletion || 60;
  const pendingAppsCount = pendingApplications.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#101310] border border-[#282F28] text-[#F4F7F2] p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#151915] text-[#B7FF5A] border border-[#282F28]">
                Student Workspace
              </span>
              {user?.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B7FF5A]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <Link
                  to="/verify-email"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Verify Email Now
                </Link>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F2]">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#A1AAA0] max-w-xl">
              {user?.college || 'University'} • {user?.course || 'Student'} • Reputation Score:{' '}
              <span className="font-bold text-[#B7FF5A]">{user?.reputationScore || 100}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF5A] px-4 py-2.5 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all duration-150 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Create Project</span>
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-[#151915] hover:bg-[#1B211B] border border-[#282F28] px-4 py-2.5 text-xs font-semibold text-[#F4F7F2] transition-all"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-[#282F28] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <span className="font-medium text-[#A1AAA0]">Profile Strength:</span>
            <div className="flex-1 h-2 rounded-full bg-[#1B211B] border border-[#282F28] overflow-hidden">
              <div
                className="h-full bg-[#B7FF5A] rounded-full transition-all duration-500"
                style={{ width: `${profilePct}%` }}
              />
            </div>
            <span className="font-bold text-[#B7FF5A]">{profilePct}%</span>
          </div>

          {profilePct < 100 && (
            <Link to="/profile" className="text-[#B7FF5A] hover:underline font-semibold text-xs">
              Add skills & portfolio links to reach 100% →
            </Link>
          )}
        </div>
      </section>

      {/* Metric Counters */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/teams"
          className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#70796F]">
              Active Teams
            </span>
            <FolderGit2 className="w-4 h-4 text-[#B7FF5A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-[#F4F7F2]">{myTeams.length}</p>
        </Link>

        <Link
          to="/applications"
          className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#70796F]">
              Applications
            </span>
            <Inbox className="w-4 h-4 text-[#B7FF5A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-[#F4F7F2]">{pendingAppsCount}</p>
        </Link>

        <Link
          to="/applications"
          className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#70796F]">
              Invitations
            </span>
            <Users className="w-4 h-4 text-[#B7FF5A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-[#F4F7F2]">{invitations.length}</p>
        </Link>

        <Link
          to="/reviews"
          className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#70796F]">
              Reputation
            </span>
            <ShieldCheck className="w-4 h-4 text-[#B7FF5A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-[#F4F7F2]">
            {user?.reputationScore || 100}
          </p>
        </Link>
      </section>

      {/* Pending Invitations Alert Banner if any */}
      {invitations.length > 0 && (
        <section className="p-4 rounded-2xl bg-[#151915] border border-[#B7FF5A]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F4F7F2]">
                You have {invitations.length} pending team invitation{invitations.length > 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-[#A1AAA0]">
                A team wants you to collaborate. Review and accept your spot.
              </p>
            </div>
          </div>
          <Link
            to="/applications"
            className="rounded-xl bg-[#B7FF5A] px-4 py-2 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all whitespace-nowrap"
          >
            Review Invites
          </Link>
        </section>
      )}

      {/* Explainable Recommended Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B7FF5A]" />
            <h2 className="text-base sm:text-lg font-bold text-[#F4F7F2]">
              Recommended Projects For You
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-[#B7FF5A] hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recommendedProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#151915] border border-[#282F28]">
            <FolderGit2 className="w-8 h-8 text-[#70796F] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#F4F7F2]">
              No matching projects found yet.
            </p>
            <p className="text-xs text-[#70796F]">
              Update your skills or be the first to create an innovative project!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedProjects.map(({ project, matchScore, matchReasons }) => (
              <div
                key={project._id}
                className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]">
                      {project.category}
                    </span>
                    <MatchScoreBadge score={matchScore} reasons={matchReasons} />
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="block text-sm font-bold text-[#F4F7F2] hover:text-[#B7FF5A] transition-colors"
                  >
                    {project.title}
                  </Link>

                  <p className="text-xs text-[#A1AAA0] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Required Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(project.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#282F28] flex items-center justify-between text-xs text-[#70796F]">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <span className="font-medium text-[#A1AAA0] truncate">
                      by {project.owner?.name}
                    </span>
                    <span>•</span>
                    <span className="truncate">{project.owner?.college}</span>
                  </div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="font-bold text-[#B7FF5A] hover:underline flex items-center gap-1 whitespace-nowrap"
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
            <Users className="w-4 h-4 text-[#B7FF5A]" />
            <h2 className="text-base sm:text-lg font-bold text-[#F4F7F2]">
              Recommended Teammates
            </h2>
          </div>
          <Link
            to="/students"
            className="text-xs font-bold text-[#B7FF5A] hover:underline flex items-center gap-1"
          >
            <span>Explore All Students</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedStudents.map(({ student, matchScore, matchReasons }) => (
            <div
              key={student._id}
              className="p-4 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-xs flex items-center justify-center uppercase overflow-hidden">
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
                    className="font-bold text-xs text-[#F4F7F2] hover:text-[#B7FF5A] block truncate"
                  >
                    {student.name}
                  </Link>
                  <p className="text-[11px] text-[#70796F] truncate">
                    {student.college || 'Student'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(student.skills || []).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#282F28]">
                <Link
                  to={`/students/${student._id}`}
                  className="block text-center rounded-xl bg-[#1B211B] text-[#F4F7F2] border border-[#282F28] text-xs font-semibold py-1.5 hover:border-[#B7FF5A]/40 hover:text-[#B7FF5A] transition-colors"
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
