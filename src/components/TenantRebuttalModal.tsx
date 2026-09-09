import React, { useState } from 'react';
import { Review } from '../types';
import { ShieldCheck, X, Sparkles, AlertCircle, Lock } from 'lucide-react';

interface TenantRebuttalModalProps {
  review: Review;
  onClose: () => void;
  onConfirmRebuttal: (reviewId: string, mpesaTransId: string) => void;
}

export const TenantRebuttalModal: React.FC<TenantRebuttalModalProps> = ({
  review,
  onClose,
  onConfirmRebuttal,
}) => {
  const [mpesaReceipt, setMpesaReceipt] = useState('SAB89412KL');
  const [error, setError] = useState('');

  const MPESA_REGEX = /^[A-Z0-9]{10}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mpesaReceipt.trim().toUpperCase();

    if (!MPESA_REGEX.test(clean)) {
      setError('Safaricom M-Pesa transaction code must be exactly 10 alphanumeric characters (e.g. SAB89412KL).');
      return;
    }

    onConfirmRebuttal(review.id, clean);
    onClose();
  };

  return (
    <div
      id="rebuttal-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="rebuttal-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-start justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Prove You're a Real Tenant</h3>
              <p className="text-xs text-neutral-500">Restore your review with verified M-Pesa proof</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-emerald-50/70 rounded-xl text-xs text-emerald-900 border border-emerald-200 leading-relaxed">
            Submitting a valid Safaricom M-Pesa rent receipt proves you're a <strong>verified paying tenant</strong>.
            Once confirmed, your review is immediately restored with a permanent <strong>Gold Verified Renter Badge</strong> —
            giving your review maximum credibility and trust.
          </div>

          <div>
            <label htmlFor="rebuttal-mpesa-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Safaricom M-Pesa Rent Receipt Code
            </label>
            <input
              id="rebuttal-mpesa-input"
              type="text"
              maxLength={10}
              value={mpesaReceipt}
              onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
              placeholder="e.g. SAB89412KL"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-sm uppercase tracking-wider text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-neutral-400" />
              Your transaction code is hashed (SHA-256 + salt) and never revealed to landlords.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              id="confirm-rebuttal-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verify &amp; Restore Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
