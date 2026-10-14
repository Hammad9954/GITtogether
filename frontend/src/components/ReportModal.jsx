import React, { useState } from 'react';
import Modal from './Modal.jsx';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('inappropriate_content');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      toast.error('Please enter at least 5 characters describing the issue');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reports', {
        targetType,
        targetId,
        targetName,
        reason,
        description,
      });

      if (res.success) {
        toast.success('Report submitted to moderation. Thank you for keeping our campus safe.');
        onClose();
        setDescription('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetName || targetType}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>Our safety team reviews all flags confidentially within 24 hours.</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Reason for Report
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="inappropriate_content">Inappropriate Content / Behavior</option>
            <option value="spam">Spam or Unsolicited Promotion</option>
            <option value="harassment">Harassment or Offensive Language</option>
            <option value="plagiarism">Plagiarism / Intellectual Property</option>
            <option value="fake_profile">Fake Profile or Impersonation</option>
            <option value="other">Other Violation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Details & Context
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please explain why you are reporting this content..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Submit Report</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;
