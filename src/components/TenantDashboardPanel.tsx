import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { FrictionVectorKey, FrictionScores, ReviewSubmissionPayload } from '../types';
import { FRICTION_VECTORS, getScoreColor } from '../utils/frictionVectors';
import { GoldVerifiedBadge } from './GoldVerifiedBadge';
import {
  User,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
  DollarSign,
  Droplets,
  Lock,
  Scale,
  Wrench,
} from 'lucide-react';

const VECTOR_ICONS: Record<FrictionVectorKey, React.ComponentType<{ className?: string }>> = {
  depositRefund: DollarSign,
  waterUtilities: Droplets,
  securityPrivacy: Lock,
  evictionFairness: Scale,
  managementResponsiveness: Wrench,
};

const HOUSE_TYPES = ['Bedsitter', 'Studio', '1-Bedroom', '2-Bedroom', '3-Bedroom', 'Maisonette'];

export const TenantDashboardPanel: React.FC = () => {
  const {
    currentUser,
    properties,
    reviews,
    selectedPropertyId,
    submitReview,
    setActivePanel,
    switchPersona,
  } = useAppState();

  // If no user is logged in, show onboarding prompt
  if (!currentUser) {
    return (
      <div id="tenant-dashboard-guest" className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            Simulated Tenant Session Required
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            You are currently browsing as a Guest. Log in or select an instant demo tenant persona to access the Tenant
            Dashboard and write an M-Pesa verified review.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => switchPersona('usr-001')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Log in as RoysambuRenter82 (Demo)
          </button>
          <button
            type="button"
            onClick={() => switchPersona('usr-002')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Log in as KilimaniTenant14 (Demo)
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('auth')}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors"
          >
            Register New Anonymous Tenant
          </button>
        </div>
      </div>
    );
  }

  // Form State for Review Submission
  const [propertyId, setPropertyId] = useState<string>(selectedPropertyId || properties[0].id);
  const [ratings, setRatings] = useState<FrictionScores>({
    depositRefund: 4,
    waterUtilities: 4,
    securityPrivacy: 5,
    evictionFairness: 4,
    managementResponsiveness: 3,
  });
  const [commentTitle, setCommentTitle] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('35000');
  const [houseType, setHouseType] = useState<string>('1-Bedroom');
  const [startYear, setStartYear] = useState<number>(2024);
  const [endYear, setEndYear] = useState<string>('2026');
  const [mpesaCode, setMpesaCode] = useState<string>('QRT4XYZ7AB');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reviews written by this tenant
  const userReviews = reviews.filter(
    (r) => r.authorUserId === currentUser.id || r.authorPseudonym === currentUser.pseudonym
  );

  const handleScoreChange = (key: FrictionVectorKey, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentTitle.trim() || !commentText.trim()) {
      alert('Please provide a title and honest review description.');
      return;
    }

    setIsSubmitting(true);
    const payload: ReviewSubmissionPayload = {
      propertyId,
      ratings,
      commentTitle: commentTitle.trim(),
      commentText: commentText.trim(),
      monthlyRentPaid: monthlyRent ? Number(monthlyRent) : undefined,
      houseType,
      tenancyStartYear: startYear,
      tenancyEndYear: endYear ? Number(endYear) : undefined,
      mpesaReceiptCode: mpesaCode.trim() || undefined,
    };

    setTimeout(() => {
      submitReview(payload);
      setCommentTitle('');
      setCommentText('');
      setMpesaCode('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="tenant-dashboard-panel" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Profile Card */}
      <div
        id="tenant-profile-card"
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-bold text-xl shadow-md">
              {currentUser.pseudonym.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">
                  {currentUser.pseudonym}
                </h1>
                {currentUser.isMpesaVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                    <span>Gold Verified Renter</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Standard Anonymous
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                Anonymous Identity Fingerprint: {currentUser.identityFingerprint.slice(0, 28)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActivePanel('settings')}
              className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Privacy Controls
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-neutral-400 font-medium">Reviews Authored:</span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white">{userReviews.length}</div>
          </div>
          <div>
            <span className="text-neutral-400 font-medium">Verification Status:</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {currentUser.isMpesaVerified ? 'M-Pesa Certified' : 'Pending Receipt'}
            </div>
          </div>
          <div>
            <span className="text-neutral-400 font-medium">Under Investigation:</span>
            <div className="text-lg font-bold text-amber-600">
              {userReviews.filter((r) => r.lifecycleStatus === 'under_investigation').length}
            </div>
          </div>
          <div>
            <span className="text-neutral-400 font-medium">Review Protection:</span>
            <div className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Active</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submit Review Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Submit a 5-Vector Apartment Review</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Score your property across Kenyan rental friction dimensions and optionally input your Safaricom M-Pesa
              receipt to earn the permanent Gold Badge.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Property Selector */}
            <div className="space-y-1">
              <label htmlFor="target-property" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Target Kenyan Apartment / Estate
              </label>
              <select
                id="target-property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.buildingName} ({p.estateName}, {p.countyName})
                  </option>
                ))}
              </select>
            </div>

            {/* 5-Vector Interactive Sliders */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>5-Vector Rental Friction Ratings</span>
                <span className="text-[11px] text-neutral-400 font-normal">Scale: 1 (Severe Friction) to 5 (Flawless)</span>
              </div>

              <div className="space-y-3">
                {FRICTION_VECTORS.map((vector) => {
                  const score = ratings[vector.key];
                  const colors = getScoreColor(score);
                  const Icon = VECTOR_ICONS[vector.key];

                  return (
                    <div
                      key={vector.key}
                      className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{vector.label}</span>
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text} ${colors.border}`}>
                          {score} / 5
                        </span>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={score}
                        onChange={(e) => handleScoreChange(vector.key, Number(e.target.value))}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />

                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>{vector.lowDesc}</span>
                        <span>{vector.highDesc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Title & Text */}
            <div className="space-y-1">
              <label htmlFor="review-title" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Review Headline
              </label>
              <input
                id="review-title"
                type="text"
                value={commentTitle}
                onChange={(e) => setCommentTitle(e.target.value)}
                placeholder="e.g. Transparent move-out deposit, but borehole rationing on weekends"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="review-comment" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Detailed Rental Experience (Facts &amp; Details)
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Describe deposit return, caretaker response, token meter reliability, and any notices received. Honest factual observations are always protected."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                required
              />
            </div>

            {/* House Type & Rent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="house-type" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  House Typology
                </label>
                <select
                  id="house-type"
                  value={houseType}
                  onChange={(e) => setHouseType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {HOUSE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="monthly-rent" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Monthly Rent Paid (KES)
                </label>
                <input
                  id="monthly-rent"
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="35000"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tenancy Start & End Years */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="start-year" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Tenancy Start Year
                </label>
                <input
                  id="start-year"
                  type="number"
                  min="2015"
                  max="2026"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="end-year" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Tenancy End Year (or Present)
                </label>
                <input
                  id="end-year"
                  type="text"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  placeholder="2026 or Leave empty"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Safaricom M-Pesa 10-Character Verification Gate */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="mpesa-code" className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Safaricom M-Pesa Transaction Receipt (Optional)</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Earns Gold Badge
                </span>
              </div>

              <input
                id="mpesa-code"
                type="text"
                maxLength={10}
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. QRT4XYZ7AB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-amber-500"
              />

              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                Simulation Action: Providing a 10-character code triggers the Safaricom Daraja webhook match,
                granting your review a <strong>Gold Verified Renter Badge</strong> and giving it maximum credibility
                against any landlord disputes.
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="submit-review-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying with Daraja...' : 'Publish Anonymous Review'}</span>
            </button>
          </form>
        </div>

        {/* My Authored Reviews Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>My Authored Reviews</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {userReviews.length} Reviews
              </span>
            </h2>

            {userReviews.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs text-neutral-500">You haven&apos;t written any reviews under this pseudonym yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userReviews.map((r) => {
                  const targetProp = properties.find((p) => p.id === r.propertyId);
                  const isSandboxed = r.lifecycleStatus === 'under_investigation';

                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSandboxed
                          ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            {targetProp?.buildingName || 'Kenyan Flat'}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                            {isSandboxed ? '[Under Review — Fact-Check in Progress]' : r.commentTitle}
                          </h4>
                        </div>
                        {isSandboxed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0">
                            Disputed
                          </span>
                        ) : r.isVerifiedTenant ? (
                          <GoldVerifiedBadge size="sm" />
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      {isSandboxed && (
                        <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 p-2.5 rounded-xl space-y-1">
                          <p className="font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>168-Hour Rebuttal Window Open</span>
                          </p>
                          <p className="text-[10px]">
                            A landlord has challenged this review. You can simulate submitting proof in the Landlord
                            Dispute Center to restore it with a Gold Badge.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActivePanel('dispute-center')}
                            className="text-[11px] font-bold text-amber-950 dark:text-amber-200 hover:underline flex items-center gap-1 pt-1"
                          >
                            <span>Go to Dispute Center to Rebut</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
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
    </div>
  );
};
