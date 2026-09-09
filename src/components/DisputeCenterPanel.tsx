import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { DisputeTicket } from '../types';
import { GoldVerifiedBadge } from './GoldVerifiedBadge';
import {
  Scale,
  ShieldAlert,
  Clock,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { validateKenyaPoliceOb, validateEarbLicense } from '../utils/cryptoSim';

export const DisputeCenterPanel: React.FC = () => {
  const {
    reviews,
    properties,
    disputes,
    fileDispute,
    rebutDispute,
  } = useAppState();

  // Form State
  const [targetReviewId, setTargetReviewId] = useState<string>(() => {
    const activeReviews = reviews.filter((r) => r.lifecycleStatus === 'active');
    return activeReviews.length > 0 ? activeReviews[0].id : '';
  });
  const [claimantType, setClaimantType] = useState<'Landlord' | 'Managing Agent'>('Landlord');
  const [claimantName, setClaimantName] = useState<string>('Kariuki Realties & Trust');
  const [identifier, setIdentifier] = useState<string>('OB 58/08/09/2026');
  const [grounds, setGrounds] = useState<string>(
    'The tenant damaged the sanitary fixtures and failed to provide the statutory 30-day notice under the lease agreement. The review statement regarding deposit withholding is false.'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Rebuttal Simulation Modal State
  const [selectedDisputeForRebuttal, setSelectedDisputeForRebuttal] = useState<DisputeTicket | null>(null);
  const [rebuttalProofType, setRebuttalProofType] = useState<string>('M-Pesa Rent & Deposit Receipt');
  const [rebuttalDetails, setRebuttalDetails] = useState<string>(
    'Safaricom Daraja Receipt: SAB89412KL confirming payment of KES 24,000 move-in deposit, plus documented move-out inspection photo sheet.'
  );

  const activeReviews = reviews.filter((r) => r.lifecycleStatus === 'active');

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const isOb = validateKenyaPoliceOb(identifier);
    const isEarb = validateEarbLicense(identifier);

    if (!isOb && !isEarb) {
      setValidationError(
        'Invalid Statutory Identifier! You must enter either a Kenya Police OB number (e.g. "OB 42/02/09/2026") or an EARB license (e.g. "EARB/A/3819").'
      );
      return;
    }

    if (!targetReviewId) {
      setValidationError('Please select an active review to challenge.');
      return;
    }

    const ok = fileDispute(targetReviewId, claimantType, claimantName, identifier, grounds);
    if (ok) {
      // Clear or reset identifier
      setIdentifier('OB ' + Math.floor(10 + Math.random() * 89) + '/08/09/2026');
    }
  };

  const handleConfirmRebuttal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeForRebuttal) return;

    rebutDispute(selectedDisputeForRebuttal.reviewId, rebuttalProofType, rebuttalDetails);
    setSelectedDisputeForRebuttal(null);
  };

  return (
    <div id="dispute-center-panel" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                The Landlord &amp; Agent Dispute Center
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                Fair Dispute Protocol
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Statutory notice-and-takedown protocol. Landlords and licensed agents may challenge contested reviews by
              providing official Kenya Police Occurrence Book (OB) numbers or EARB licenses. Reviews are immediately
              quarantined for 168 hours pending tenant rebuttal.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dispute Submission Form (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>File a Formal Dispute Notice</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Challenging a review will immediately redact its comment text and display an amber quarantine banner.
            </p>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold leading-relaxed">
              {validationError}
            </div>
          )}

          <form onSubmit={handleDisputeSubmit} className="space-y-4">
            {/* Review Selector */}
            <div className="space-y-1">
              <label htmlFor="target-review" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Select Contested Review
              </label>
              {activeReviews.length === 0 ? (
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-500">
                  All current reviews are already under investigation or sandboxed. Submit a new review in the Tenant
                  Dashboard to dispute it.
                </div>
              ) : (
                <select
                  id="target-review"
                  value={targetReviewId}
                  onChange={(e) => setTargetReviewId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500"
                >
                  {activeReviews.map((r) => {
                    const prop = properties.find((p) => p.id === r.propertyId);
                    return (
                      <option key={r.id} value={r.id}>
                        {prop?.buildingName || 'Flat'} · &quot;{r.commentTitle.slice(0, 40)}...&quot; by {r.authorPseudonym}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Standing Choice */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Legal Standing of Claimant
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClaimantType('Landlord')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    claimantType === 'Landlord'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Landlord (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => setClaimantType('Managing Agent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    claimantType === 'Managing Agent'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Licensed Managing Agent
                </button>
              </div>
            </div>

            {/* Claimant Name */}
            <div className="space-y-1">
              <label htmlFor="claimant-name" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Landlord or Agency Registered Name
              </label>
              <input
                id="claimant-name"
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. Kariuki Realties & Trust"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Police OB or EARB License Input with Regex Validation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="statutory-id" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Kenya Police OB Number or EARB License
                </label>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                  OB \d+/\d+/\d+ or EARB/A/\d+
                </span>
              </div>
              <input
                id="statutory-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. OB 42/02/09/2026 or EARB/A/3819"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-neutral-400">
                To prevent frivolous takedowns, we require official police or statutory agency
                verification before any review is removed.
              </p>
            </div>

            {/* Grounds Details */}
            <div className="space-y-1">
              <label htmlFor="grounds-text" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Formal Grounds for Dispute (Defamation / Non-Tenant Fraud)
              </label>
              <textarea
                id="grounds-text"
                rows={3}
                value={grounds}
                onChange={(e) => setGrounds(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 leading-relaxed"
                required
              />
            </div>

            {/* Submit Dispute Button */}
            <button
              id="file-dispute-submit-btn"
              type="submit"
              disabled={activeReviews.length === 0}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>Issue Statutory Notice &amp; Sandbox Review</span>
            </button>
          </form>
        </div>

        {/* Active Dispute Tickets & Rebuttal Queue (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Active &amp; Historical Dispute Tickets</span>
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                {disputes.length} Logged
              </span>
            </div>

            {disputes.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No active dispute tickets in the registry.
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((ticket) => {
                  const isInvestigating = ticket.status === 'under_investigation';
                  const isResolved = ticket.status === 'rebutted_resolved';

                  return (
                    <div
                      key={ticket.id}
                      id={`ticket-card-${ticket.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isInvestigating
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                              {ticket.propertyName}
                            </span>
                            <span className="text-xs text-neutral-400">·</span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {ticket.policeObNumber || ticket.earbLicenseNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Claimant: <strong>{ticket.claimantName}</strong> ({ticket.claimantType})
                          </p>
                        </div>

                        {isInvestigating ? (
                          <span className="animate-countdown-pulse text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700 flex items-center gap-1 shrink-0 font-mono shadow-xs">
                            <Clock className="w-3 h-3 text-amber-800 dark:text-amber-300" />
                            <span>168h Countdown</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <GoldVerifiedBadge size="sm" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
                        {ticket.grounds}
                      </p>

                      {isInvestigating && (
                        <div className="mt-3 pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-800 dark:text-amber-300">
                            Review quarantined in public feed.
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDisputeForRebuttal(ticket)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Simulate Rebuttal</span>
                          </button>
                        </div>
                      )}

                      {isResolved && ticket.rebuttalProof && (
                        <div className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/40 p-2 rounded-xl">
                          <strong>Verified tenant proof accepted:</strong> {ticket.rebuttalProof}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Rebuttal Modal */}
      {selectedDisputeForRebuttal && (
        <div
          id="rebuttal-modal-overlay"
          className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div
            id="rebuttal-modal-card"
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Prove You’re a Real Tenant — Lift the Quarantine
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Simulate submitting lease or M-Pesa proof to lift the quarantine on review {selectedDisputeForRebuttal.reviewId}.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmRebuttal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Proof Type Submitted
                </label>
                <select
                  value={rebuttalProofType}
                  onChange={(e) => setRebuttalProofType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="M-Pesa Rent & Deposit Receipt">Safaricom M-Pesa Rent / Deposit Transaction</option>
                  <option value="Stamped Lease Agreement">Executed Kenyan Tenancy Lease Agreement</option>
                  <option value="Move-Out Inspection Photo Sheet">Signed Move-Out Inventory & Inspection Sheet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Proof Details &amp; Transaction Reference
                </label>
                <textarea
                  rows={3}
                  value={rebuttalDetails}
                  onChange={(e) => setRebuttalDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                Proving you’re a genuine, paying tenant instantly dissolves the dispute claim
                and restores your review with a permanent Gold Verified Badge.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeForRebuttal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  id="confirm-rebuttal-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  Resolve Dispute &amp; Award Gold Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
