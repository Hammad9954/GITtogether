import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, Loader2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, user } = useAuth();
  const { toast } = useToast();

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email') || location.state?.email || user?.email || '';
  const initialCode = location.state?.verificationCode || '';

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenParam) {
      handleAutoVerify(tokenParam);
    }
  }, [tokenParam]);

  const handleAutoVerify = async (token) => {
    setLoading(true);
    const result = await verifyEmail({ token });
    setLoading(false);
    if (result?.success) {
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    // In our backend, verifyEmail checks token or code
    const result = await verifyEmail({ code });
    setLoading(false);

    if (result?.success) {
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await api.post('/auth/resend-verification', {});
      if (res.success) {
        toast.success('Verification code resent! Check your inbox or console.');
        if (res.data?.verificationCode) {
          setCode(res.data.verificationCode);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 shadow-lg shadow-brand-500/20">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verify your College Email
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We sent a 6-digit verification code to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{emailParam || 'your college email'}</strong>
          </p>
        </div>

        {/* Development simulated code helper box */}
        {initialCode && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Campus Dev Mode: Simulated Code Detected</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-400">
              Your test verification code is <strong className="font-mono text-sm">{initialCode}</strong>.
              It has been pre-filled below.
            </p>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-soft border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Email Verified Successfully!
            </h3>
            <p className="text-sm text-slate-500">Redirecting to your student dashboard...</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-soft border border-slate-200/80 dark:border-slate-800/80 text-left">
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-widest font-mono text-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Activate Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
              <Link to="/dashboard" className="hover:underline">
                Skip for now →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
