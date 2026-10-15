import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, School, BookOpen, Loader2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    course: '',
    year: '1st Year',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const password = formData.password;
  const passwordCriteria = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number (0–9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character (@, #, $, !, etc.)', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allCriteriaMet) {
      toast.error('Please fulfill all password requirements before registering.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result?.success) {
      navigate('/verify-email', {
        state: {
          email: formData.email,
          verificationCode: result.verificationCode,
        },
      });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">
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
            Create your Student Account
          </h2>
          <p className="text-xs sm:text-sm text-[#A1AAA0]">
            Join thousands of student builders discovering teammates on campus
          </p>
        </div>

        <div className="rounded-2xl bg-[#151915] p-6 sm:p-8 shadow-card border border-[#282F28]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                College / University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@mit.edu"
                  className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                  College Name
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="MIT, Stanford..."
                    className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                  Course / Major
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Computer Science"
                    className="w-full rounded-xl border border-[#282F28] bg-[#101310] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Year of Study
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#282F28] bg-[#101310] px-3.5 py-2.5 text-sm text-[#F4F7F2] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
              >
                <option value="1st Year">1st Year / Freshman</option>
                <option value="2nd Year">2nd Year / Sophomore</option>
                <option value="3rd Year">3rd Year / Junior</option>
                <option value="4th Year">4th Year / Senior</option>
                <option value="Graduate / MS">Graduate / MS / PhD</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

              {/* Password Requirements Checklist */}
              <div className="mt-3 p-3.5 rounded-xl bg-[#101310] border border-[#282F28] space-y-2">
                <p className="text-[11px] font-semibold text-[#A1AAA0]">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {passwordCriteria.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-1.5 text-[11px] transition-colors"
                    >
                      {c.met ? (
                        <Check className="w-3.5 h-3.5 text-[#B7FF5A] flex-shrink-0 stroke-[2.5]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-[#70796F] flex items-center justify-center text-[9px] text-[#70796F] flex-shrink-0">
                          •
                        </span>
                      )}
                      <span className={c.met ? 'text-[#B7FF5A] font-medium' : 'text-[#70796F]'}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B7FF5A] px-4 py-2.5 text-sm font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all disabled:opacity-50 pt-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#090B0A]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#70796F]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#B7FF5A] hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
