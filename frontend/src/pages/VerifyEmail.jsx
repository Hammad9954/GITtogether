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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#151915] border border-[#282F28] text-[#B7FF5A] shadow-card">
          <MailCheck className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F2]">
            Verify your College Email
          </h2>
          <p className="text-xs sm:text-sm text-[#A1AAA0] max-w-sm mx-auto">
            We sent a 6-digit verification code to{' '}
            <strong className="text-[#F4F7F2] font-semibold">{emailParam || 'your college email'}</strong>
          </p>
        </div>

        {/* Development simulated code helper box */}
        {initialCode && (
          <div className="p-3.5 rounded-xl bg-[#101310] border border-[#282F28] text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#B7FF5A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Dev Mode: Simulated Code Detected</span>
            </div>
            <p className="text-[#A1AAA0]">
              Your test verification code is <strong className="font-mono text-sm text-[#F4F7F2]">{initialCode}</strong>.
              It has been pre-filled below.
            </p>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#151915] shadow-card border border-[#B7FF5A]/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#B7FF5A] mx-auto" />
            <h3 className="text-base font-bold text-[#F4F7F2]">
              Email Verified Successfully!
            </h3>
            <p className="text-xs text-[#A1AAA0]">Redirecting to your student workspace...</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#151915] p-6 sm:p-8 shadow-card border border-[#282F28] text-left">
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-widest font-mono text-2xl rounded-xl border border-[#282F28] bg-[#101310] py-3 text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B7FF5A] px-4 py-2.5 text-sm font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#090B0A]" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Activate Profile</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-[#70796F]">
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-semibold text-[#B7FF5A] hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
              <Link to="/dashboard" className="text-[#A1AAA0] hover:text-[#F4F7F2] transition-colors">
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
