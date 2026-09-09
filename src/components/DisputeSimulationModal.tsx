import React, { useState } from 'react';
import { Review } from '../types';
import { Scale, X } from 'lucide-react';

interface DisputeSimulationModalProps {
  review: Review;
  onClose: () => void;
  onConfirmDispute: (reviewId: string, obNumber: string, claimDetails: string) => void;
}

export const DisputeSimulationModal: React.FC<DisputeSimulationModalProps> = ({
  review,
  onClose,
  onConfirmDispute,
}) => {
  const [standingType, setStandingType] = useState<'police_ob' | 'earb'>('police_ob');
  const [policeOb, setPoliceOb] = useState('OB 42/08/09/2026');
  const [earbLicense, setEarbLicense] = useState('EARB/A/1234');
  const [claimDetails, setClaimDetails] = useState(
    'The statement regarding unreturned deposit is defamatory and factual records show notice was not served in writing.'
  );
  const [error, setError] = useState('');

  const OB_REGEX = /^OB\s+\d{1,4}\/\d{1,2}\/\d{1,2}\/\d{4}$/;
  const EARB_REGEX = /^EARB\/[A-Z]{1,4}\/\d{3,6}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (standingType === 'police_ob') {
      if (!OB_REGEX.test(policeOb.trim())) {
        setError("Invalid Kenya Police OB format. Must match '^OB \\d{1,4}/\\d{1,2}/\\d{1,2}/\\d{4}$' (e.g. 'OB 42/08/09/2026').");
        return;
      }
    } else {
      if (!EARB_REGEX.test(earbLicense.trim().toUpperCase())) {
        setError("Invalid EARB License format. Must match '^EARB/[A-Z]{1,4}/\\d{3,6}$' (e.g. 'EARB/A/1234').");
        return;
      }
    }

    if (claimDetails.trim().length < 20) {
      setError('Defamation claim details must be at least 20 characters.');
      return;
    }

    const ref = standingType === 'police_ob' ? policeOb.trim() : earbLicense.trim().toUpperCase();
    onConfirmDispute(review.id, ref, claimDetails.trim());
    onClose();
  };

  return (
    <div
      id="dispute-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="dispute-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-start justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Request Review Fact-Check</h3>
              <p className="text-xs text-neutral-500">Fair Tenancy Verification Procedure</p>
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
          <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 border border-neutral-200 leading-relaxed">
            To prevent false takedowns, requesting a review fact-check requires verified reference standing.
            Upon filing with a valid Police OB or EARB registration, the review will be{' '}
            <strong className="text-neutral-900">placed under fact-check review</strong> and temporarily hidden
            for 7 days while the tenant confirms their tenancy.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700">Official Reference Standing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStandingType('police_ob')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  standingType === 'police_ob'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Kenya Police OB Number
              </button>
              <button
                type="button"
                onClick={() => setStandingType('earb')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  standingType === 'earb'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                EARB License
              </button>
            </div>
          </div>

          {standingType === 'police_ob' ? (
            <div>
              <label htmlFor="police-ob-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                Kenya Police Occurrence Book Number
              </label>
              <input
                id="police-ob-input"
                type="text"
                value={policeOb}
                onChange={(e) => setPoliceOb(e.target.value)}
                placeholder="e.g. OB 42/08/09/2026"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="earb-license-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                Estate Agents Registration Board Number
              </label>
              <input
                id="earb-license-input"
                type="text"
                value={earbLicense}
                onChange={(e) => setEarbLicense(e.target.value.toUpperCase())}
                placeholder="e.g. EARB/A/1234"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono"
              />
            </div>
          )}

          <div>
            <label htmlFor="claim-details-input" className="block text-xs font-semibold text-neutral-700 mb-1">
              Statutory Claim of Defamation / Factual Dispute
            </label>
            <textarea
              id="claim-details-input"
              rows={3}
              value={claimDetails}
              onChange={(e) => setClaimDetails(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">{error}</p>
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
              id="confirm-dispute-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
            >
              Submit Fact-Check Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
