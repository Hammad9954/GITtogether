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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your verified college credentials, privacy, and notifications
        </p>
      </div>

      {/* College Email Status Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-brand-600" />
          <span>College Email Verification</span>
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">{user?.email}</p>
            <p className="text-xs text-slate-500">
              Campus Affiliation: {user?.college || 'University Student'}
            </p>
          </div>

          {user?.isVerified ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified .edu</span>
            </span>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Verify Now'}
            </button>
          )}
        </div>
      </div>

      {/* Security & Access */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>Security & Authorization</span>
        </h3>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p>
            <strong>Role:</strong> <span className="capitalize">{user?.role}</span>
          </p>
          <p>
            <strong>Account Status:</strong>{' '}
            <span className="text-emerald-600 font-bold">Active & Good Standing</span>
          </p>
          <p>
            <strong>Session Security:</strong> Protected by HTTP-only authenticated cookie encryption
            and Bcrypt hashing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
