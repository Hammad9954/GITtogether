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
  Terminal,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-20 py-8 sm:py-16 animate-fade-in max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto px-4">
        {/* Campus announcement pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151915] border border-[#282F28] text-xs font-medium text-[#A1AAA0]">
          <span className="flex h-2 w-2 rounded-full bg-[#B7FF5A] animate-pulse" />
          <span className="text-[#F4F7F2] font-semibold">Git Together v2.0</span>
          <span className="text-[#70796F]">|</span>
          <span className="text-[#A1AAA0]">Campus Team Formation & Collaboration Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F7F2] leading-[1.1]">
          Find your people. <br />
          <span className="text-[#B7FF5A]">
            Build something great.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#A1AAA0] max-w-2xl mx-auto leading-relaxed">
          The developer-focused platform connecting ambitious university students to build hackathon
          squads, open source tools, and startup MVPs with explainable 0–100 compatibility matching.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF5A] px-6 py-3 text-sm font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all duration-150 shadow-sm"
            >
              <span>Go to Your Workspace</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF5A] px-6 py-3 text-sm font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all duration-150 shadow-sm"
              >
                <span>Join with College Email</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#151915] border border-[#282F28] px-5 py-3 text-sm font-semibold text-[#F4F7F2] hover:bg-[#1B211B] hover:border-[#384238] transition-all"
              >
                <span>Sign In Demo</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[#70796F]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF5A]" />
            <span className="text-[#A1AAA0]">Verified .edu profiles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF5A]" />
            <span className="text-[#A1AAA0]">Explainable skill-based matching</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF5A]" />
            <span className="text-[#A1AAA0]">Real-time collaboration workspaces</span>
          </div>
        </div>
      </section>

      {/* Product Preview Mockup Window */}
      <section className="relative px-4">
        <div className="rounded-2xl border border-[#282F28] bg-[#101310] overflow-hidden shadow-elevated">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#151915] border-b border-[#282F28]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#282F28]" />
              <div className="w-3 h-3 rounded-full bg-[#282F28]" />
              <div className="w-3 h-3 rounded-full bg-[#282F28]" />
              <span className="text-xs text-[#70796F] font-mono ml-2">gittogether.campus.internal/workspace</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#A1AAA0]">
              <span className="flex h-2 w-2 rounded-full bg-[#B7FF5A]" />
              <span className="font-mono text-[11px]">MATCH_ENGINE_ONLINE</span>
            </div>
          </div>

          {/* Interactive Preview Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Card Preview */}
            <div className="rounded-xl border border-[#282F28] bg-[#151915] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1B211B] text-[#B7FF5A] border border-[#282F28]">
                  AI / Systems
                </span>
                <span className="text-xs font-semibold text-[#B7FF5A] border border-[#B7FF5A]/30 bg-[#B7FF5A]/10 px-2 py-0.5 rounded-full">
                  94% Match
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#F4F7F2]">Distributed Vector Search Engine</h3>
              <p className="text-xs text-[#A1AAA0] line-clamp-2">
                High-throughput nearest neighbor retrieval cluster written in Rust and Go with SIMD optimizations.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Rust', 'Go', 'Raft', 'gRPC'].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#1B211B] text-[#70796F]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-[#282F28] flex items-center justify-between text-xs text-[#70796F]">
                <span>2 open positions</span>
                <span className="text-[#F4F7F2] font-semibold">Team of 3/5</span>
              </div>
            </div>

            {/* Teammate Synergy Preview */}
            <div className="rounded-xl border border-[#282F28] bg-[#151915] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F4F7F2]">Priya Sharma</h4>
                    <p className="text-[10px] text-[#70796F]">Stanford University • Junior</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#B7FF5A] border border-[#B7FF5A]/30 bg-[#B7FF5A]/10 px-2 py-0.5 rounded-full">
                  91% Match
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101310] border border-[#282F28] space-y-1 text-xs">
                <div className="text-[11px] font-semibold text-[#F4F7F2] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B7FF5A]" />
                  <span>Explainable Synergy</span>
                </div>
                <p className="text-[11px] text-[#A1AAA0]">
                  Complements your Frontend skills with Deep Learning & PyTorch. Shared 15h/wk hackathon availability.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['PyTorch', 'FastAPI', 'MLOps'].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#1B211B] text-[#70796F]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Real-time Collaboration Preview */}
            <div className="rounded-xl border border-[#282F28] bg-[#151915] p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#F4F7F2] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#B7FF5A]" />
                    <span>Squad Chat</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#B7FF5A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A]" /> Live
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#101310] border border-[#282F28]">
                    <span className="font-semibold text-[#B7FF5A] text-[11px]">Alex: </span>
                    <span className="text-[#A1AAA0] text-[11px]">Pushed the GraphQL schema and WebSocket router. Ready for code review!</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1B211B] border border-[#282F28]">
                    <span className="font-semibold text-[#F4F7F2] text-[11px]">Elena: </span>
                    <span className="text-[#A1AAA0] text-[11px]">Reviewing now. Running benchmarks against our demo cluster.</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#282F28] flex items-center justify-between text-xs text-[#70796F]">
                <span>Hackathon: MIT TechX 2026</span>
                <span className="text-[#B7FF5A] font-semibold">Squad Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 px-4">
        <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3 hover:border-[#384238] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F4F7F2]">Discover Real Projects</h3>
          <p className="text-xs text-[#A1AAA0] leading-relaxed">
            Search active college projects across AI, Web, Mobile, Systems, and Robotics. Filter by required skills and pitch your involvement in one click.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3 hover:border-[#384238] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F4F7F2]">Explainable Matching</h3>
          <p className="text-xs text-[#A1AAA0] leading-relaxed">
            Transparent 0–100% compatibility scores reveal exactly why students match—balancing skill overlap, complementary strengths, and time commitments.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3 hover:border-[#384238] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F4F7F2]">Hackathons & Team Rooms</h3>
          <p className="text-xs text-[#A1AAA0] leading-relaxed">
            Register your team for premier collegiate hackathons, assign responsibilities, and collaborate via authenticated real-time Socket.IO chat rooms.
          </p>
        </div>
      </section>

      {/* Peer Skill Sharing Card */}
      <section className="px-4">
        <div className="rounded-2xl bg-[#101310] border border-[#282F28] p-8 sm:p-10 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Peer-to-Peer Learning</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F2]">
              Learn from peers. Share what you know.
            </h2>
            <p className="text-xs sm:text-sm text-[#A1AAA0] leading-relaxed">
              Book 1-on-1 skill exchange sessions with upperclassmen or peer developers on topics like PyTorch, Next.js, systems architecture, or low-level performance tuning. Earn reputation boosts for teaching.
            </p>
            <div className="pt-2">
              <Link
                to={user ? '/skill-sharing' : '/register'}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF5A] text-[#090B0A] px-5 py-2.5 text-xs font-bold hover:bg-[#CAFF8C] transition-all"
              >
                <span>Explore Skill Sessions</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-[#282F28] px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#70796F]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F4F7F2]">Git<span className="text-[#B7FF5A]">Together</span></span>
          <span>— Find your people. Build something great.</span>
        </div>
        <p>© 2026 Git Together. Built for student innovators.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
