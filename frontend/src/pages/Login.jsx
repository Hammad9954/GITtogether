import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result?.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151915] border border-[#282F28] text-[#B7FF5A] shadow-card">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M6 9v12" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F2]">
            Welcome back to Git Together
          </h2>
          <p className="text-xs sm:text-sm text-[#A1AAA0]">
            Sign in to access your projects, teams, and match recommendations
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl bg-[#151915] p-6 sm:p-8 shadow-card border border-[#282F28]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-10 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-2.5 text-[#70796F] hover:text-[#B7FF5A] focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B7FF5A] px-4 py-2.5 text-sm font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#090B0A]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#70796F]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#B7FF5A] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
