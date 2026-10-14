import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Compass,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-6 sm:py-12 animate-fade-in">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Campus Team Formation Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Find your people. <br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Build something great.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Git Together connects ambitious college students by matching complementary skills, project
          passions, and hackathon ambitions using explainable compatibility scores.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-[1.02]"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-[1.02]"
              >
                <span>Join with College Email</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3.5 text-base font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <span>Sign In Demo</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Verified .edu student profiles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Explainable 0–100% skill matching</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Real-time Socket.IO workspaces</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discover Projects</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse real campus projects across AI, Web, Mobile, and IoT. Filter by required skills
            and open positions, and pitch to join in one click.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Explainable Matching</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            No black-box guesses. Our deterministic matching engine calculates a transparent 0–100%
            compatibility score showing the exact synergy reasons.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hackathons & Teams</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Register for top collegiate hackathons, form multi-disciplinary squads, assign team roles,
            and collaborate in shared real-time chat rooms.
          </p>
        </div>
      </section>

      {/* Peer Skill Sharing Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-900 via-navy-900 to-slate-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-sm">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Peer-to-Peer Learning</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Learn from peers. Share what you know.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Request 1-on-1 mentorship sessions with upperclassmen or peer developers on topics like
            PyTorch, React, Figma auto-layouts, or low-level systems. Earn reputation score for teaching.
          </p>
          <div className="pt-2">
            <Link
              to={user ? '/skill-sharing' : '/register'}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-2.5 text-sm font-bold shadow hover:bg-slate-100 transition-all"
            >
              <span>Explore Skill Sessions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
