import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Mail, Lock, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../api/client.js';

export const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const res = await api.post('/auth/resend-verification', {});
      if (res.success) {
        toast.success('Verification code resent! Check your inbox or console.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-[#B7FF5A]" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-[#A1AAA0] mt-1">
          Manage your verified college credentials, privacy settings, and session security.
        </p>
      </div>

      {/* College Email Status Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
        <h3 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#B7FF5A]" />
          <span>College Email Verification</span>
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[#101310] border border-[#282F28]">
          <div>
            <p className="font-bold text-sm text-[#F4F7F2]">{user?.email}</p>
            <p className="text-xs text-[#70796F] mt-0.5">
              Campus Affiliation: <span className="text-[#A1AAA0]">{user?.college || 'University Student'}</span>
            </p>
          </div>

          {user?.isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20 text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified .edu</span>
            </span>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="btn-primary px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Verify Now'}
            </button>
          )}
        </div>
      </div>

      {/* Security & Access */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
        <h3 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B7FF5A]" />
          <span>Security & Authorization</span>
        </h3>

        <div className="text-xs text-[#A1AAA0] space-y-3 bg-[#101310] border border-[#282F28] p-4 rounded-xl">
          <div className="flex items-center justify-between border-b border-[#282F28]/60 pb-2.5">
            <span className="text-[#70796F]">Platform Role:</span>
            <span className="capitalize font-mono font-bold text-[#F4F7F2] bg-[#1B211B] px-2.5 py-0.5 rounded border border-[#282F28]">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#282F28]/60 pb-2.5">
            <span className="text-[#70796F]">Account Status:</span>
            <span className="text-[#B7FF5A] font-mono font-bold">Active & Good Standing</span>
          </div>
          <div className="pt-0.5 text-[#70796F] leading-relaxed">
            <span className="text-[#A1AAA0] font-medium">Session Security: </span>
            Protected by HTTP-only authenticated cookie encryption and Bcrypt salt hashing on all credentials.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
