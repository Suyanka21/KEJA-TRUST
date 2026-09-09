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
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Calendar,
  Layers,
  Award,
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

  // Active Tab State inside Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'verification' | 'disputes'>('overview');

  // Filter state for authored reviews
  const [reviewFilter, setReviewFilter] = useState<'all' | 'active' | 'disputed'>('all');

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
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
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
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Standalone M-Pesa verification simulator input
  const [standaloneMpesaCode, setStandaloneMpesaCode] = useState<string>('');
  const [isVerifyingStandalone, setIsVerifyingStandalone] = useState<boolean>(false);
  const [standaloneSuccess, setStandaloneSuccess] = useState<boolean>(false);

  // Reviews written by this tenant
  const userReviews = reviews.filter(
    (r) => r.authorUserId === currentUser.id || r.authorPseudonym === currentUser.pseudonym
  );

  const disputedReviews = userReviews.filter((r) => r.lifecycleStatus === 'under_investigation');

  const filteredReviews = userReviews.filter((r) => {
    if (reviewFilter === 'active') return r.lifecycleStatus === 'active';
    if (reviewFilter === 'disputed') return r.lifecycleStatus === 'under_investigation';
    return true;
  });

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
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('overview');
      }, 1200);
    }, 400);
  };

  const handleStandaloneMpesaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (standaloneMpesaCode.length < 8) {
      alert('Please enter a valid 10-character Safaricom M-Pesa receipt code.');
      return;
    }
    setIsVerifyingStandalone(true);
    setTimeout(() => {
      setIsVerifyingStandalone(false);
      setStandaloneSuccess(true);
      setStandaloneMpesaCode('');
    }, 600);
  };

  return (
    <div id="tenant-dashboard-panel" className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Profile Banner */}
      <div
        id="tenant-profile-card"
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-bold text-xl shadow-md shrink-0">
              {currentUser.pseudonym.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono tracking-tight">
                  {currentUser.pseudonym}
                </h1>
                {currentUser.isMpesaVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                    <span>Gold Verified Renter</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Standard Anonymous
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                Anonymous Fingerprint: {currentUser.identityFingerprint.slice(0, 28)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActivePanel('pricing')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-bold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shield Membership</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('settings')}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Tiles */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Reviews Authored
            </span>
            <div className="text-xl font-black text-neutral-900 dark:text-white">{userReviews.length}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Verification Status
            </span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {currentUser.isMpesaVerified ? 'M-Pesa Certified' : 'Standard (Unverified)'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Fact-Check
            </span>
            <div className={`text-xl font-black ${disputedReviews.length > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
              {disputedReviews.length}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Review Shield
            </span>
            <div className="text-base font-bold text-neutral-800 dark:text-neutral-200">Active (Protected)</div>
          </div>
        </div>
      </div>

      {/* 2. Modular Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Reviews &amp; Overview</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
            activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          }`}>
            {userReviews.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write a Review</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>M-Pesa Tenancy Shield</span>
          {currentUser.isMpesaVerified && (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'disputes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Dispute Fact-Checks</span>
          {disputedReviews.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-white font-bold animate-pulse">
              {disputedReviews.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB 1: OVERVIEW & MY REVIEWS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Write Review Prompt Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Lived in a Kenyan flat or apartment recently?</span>
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 max-w-xl leading-relaxed">
                Your review helps thousands of Kenyan renters avoid bad caretakers, water shortages, deposit fraud, and
                illegal lockouts. 100% anonymous &amp; protected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Write Review Now</span>
            </button>
          </div>

          {/* Review Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Filter:</span>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  reviewFilter === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                All ({userReviews.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  reviewFilter === 'active'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Active ({userReviews.filter((r) => r.lifecycleStatus === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('disputed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  reviewFilter === 'disputed'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Under Fact-Check ({disputedReviews.length})
              </button>
            </div>
          </div>

          {/* Authored Reviews Feed */}
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
              <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No reviews found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {reviewFilter !== 'all'
                    ? `No reviews currently match the '${reviewFilter}' filter.`
                    : 'You have not written any apartment reviews under this persona yet.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Write Your First Review</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((r) => {
                const targetProp = properties.find((p) => p.id === r.propertyId);
                const isDisputed = r.lifecycleStatus === 'under_investigation';
                const avgScore = (
                  (r.ratings.depositRefund +
                    r.ratings.waterUtilities +
                    r.ratings.securityPrivacy +
                    r.ratings.evictionFairness +
                    r.ratings.managementResponsiveness) /
                  5
                ).toFixed(1);

                return (
                  <div
                    key={r.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-neutral-900 border transition-all space-y-4 shadow-xs ${
                      isDisputed
                        ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-400">
                            {targetProp?.buildingName || 'Kenyan Apartment'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {targetProp?.estateName}, {targetProp?.countyName} · {r.houseType || 'Apartment'}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDisputed ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Under Fact-Check
                          </span>
                        ) : r.isVerifiedTenant ? (
                          <GoldVerifiedBadge size="sm" />
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            Active
                          </span>
                        )}
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                          ★ {avgScore}
                        </span>
                      </div>
                    </div>

                    {/* Title & Comment Text */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {isDisputed ? '[Under Review — Fact-Check in Progress]' : r.commentTitle}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                        {isDisputed
                          ? 'This review is temporarily under fact-checking following a formal notice. Submit your rent receipt to prove tenancy and restore it permanently.'
                          : r.commentText}
                      </p>
                    </div>

                    {/* Tenancy details chip */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                      {r.monthlyRentPaid && (
                        <span>Rent: KES {r.monthlyRentPaid.toLocaleString()}/mo</span>
                      )}
                      {r.tenancyStartYear && (
                        <span>Tenancy: {r.tenancyStartYear} - {r.tenancyEndYear || 'Present'}</span>
                      )}
                    </div>

                    {/* Disputed Alert Callout & Action */}
                    {isDisputed && (
                      <div className="p-3 rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Formal Fact-Check Notice Active</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          A property representative challenged this review. You have 7 days to confirm authentic tenancy
                          using an M-Pesa receipt or lease copy.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActivePanel('dispute-center')}
                          className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Prove Tenancy &amp; Restore Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: WRITE A REVIEW COMPOSER */}
      {activeTab === 'submit' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Write an Anonymous 5-Vector Apartment Review</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Rate your apartment across Kenyan rental friction vectors. Input your Safaricom M-Pesa receipt code to earn
              the permanent Gold Verified Badge and shield your review from false takedown disputes.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Review submitted successfully! Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Property & Tenancy Metadata */}
              <div className="space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="house-type" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      House Type
                    </label>
                    <select
                      id="house-type"
                      value={houseType}
                      onChange={(e) => setHouseType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs"
                    >
                      {HOUSE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="monthly-rent" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Monthly Rent (KES)
                    </label>
                    <input
                      id="monthly-rent"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="start-year" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Tenancy Start Year
                    </label>
                    <input
                      id="start-year"
                      type="number"
                      min={2015}
                      max={2026}
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="end-year" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      End Year (or Present)
                    </label>
                    <input
                      id="end-year"
                      type="number"
                      min={2015}
                      max={2026}
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                {/* M-Pesa Receipt Code Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="mpesa-code" className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Safaricom M-Pesa Code (Optional)</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      Gold Shield
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
                    Entering a 10-character code unlocks the <strong>Gold Verified Renter Badge</strong>, giving your review
                    permanent credibility against landlord dispute attempts.
                  </p>
                </div>
              </div>

              {/* Right Column: 5-Vector Ratings & Review Text */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>5-Vector Rental Friction Ratings</span>
                  <span className="text-[11px] text-neutral-400 font-normal">1 (Friction) to 5 (Flawless)</span>
                </div>

                <div className="space-y-2.5">
                  {FRICTION_VECTORS.map((vector) => {
                    const score = ratings[vector.key];
                    const colors = getScoreColor(score);
                    const Icon = VECTOR_ICONS[vector.key];

                    return (
                      <div
                        key={vector.key}
                        className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1"
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
                          className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1 pt-1">
                  <label htmlFor="review-title" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Review Headline / Title
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    required
                    value={commentTitle}
                    onChange={(e) => setCommentTitle(e.target.value)}
                    placeholder="e.g. Fair management, but regular water rationing on weekends"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="review-body" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Detailed Honest Review
                  </label>
                  <textarea
                    id="review-body"
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share specific facts regarding deposit return timing, caretaker responsiveness, water availability, electricity token fees..."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-normal focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-400 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying with Daraja...' : 'Publish Anonymous Review'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 5. TAB 3: M-PESA TENANCY SHIELD */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>M-Pesa Tenancy Shield &amp; Verification</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                How KeJaTrust uses Safaricom Daraja cryptographic verification to protect honest tenants from defamation intimidation.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Gold Protection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Why Get Verified?</span>
                </h3>
                <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>Instant Credibility:</strong> Renters looking for apartments trust Gold Verified reviews 4x more.</li>
                  <li><strong>Dispute Immunity:</strong> Landlords cannot easily suppress or delete reviews backed by authentic rent payment proof.</li>
                  <li><strong>Zero Identity Leak:</strong> Safaricom transaction IDs are hashed before storage; your real phone number is never revealed.</li>
                </ul>
              </div>

              {standaloneSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>M-Pesa receipt validated! Your tenant persona now holds Gold Badge protection.</span>
                </div>
              )}

              <form onSubmit={handleStandaloneMpesaVerify} className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Verify an M-Pesa Rent Receipt
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Enter any 10-character M-Pesa receipt code (e.g., from your monthly rent or deposit SMS) to test verification.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={standaloneMpesaCode}
                    onChange={(e) => setStandaloneMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SAB89412KL"
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-bold uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingStandalone}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
                  >
                    {isVerifyingStandalone ? 'Checking...' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>

            {/* Certificate Card */}
            <div className="p-6 rounded-3xl bg-neutral-950 text-white border border-neutral-800 space-y-4 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-neutral-400 text-[11px]">VERIFICATION BADGE:</span>
                  <GoldVerifiedBadge size="sm" />
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 text-[11px]">ACTIVE PSEUDONYM:</span>
                  <div className="text-white font-bold text-sm">{currentUser.pseudonym}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 text-[11px]">DARAJA C2B ENCLAVE HASH:</span>
                  <div className="text-emerald-400 text-[10px] break-all bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                    sha256:{currentUser.identityFingerprint}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                <span>SECURITY: AES-256-GCM</span>
                <span>STATUS: VERIFIED SECURE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: DISPUTE FACT-CHECKS */}
      {activeTab === 'disputes' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Dispute Fact-Checks &amp; Rebuttals</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                When a landlord disputes an apartment review, KeJaTrust gives you a protected 7-day fact-check window
                to submit proof and restore your review with Gold Badge immunity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel('dispute-center')}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-colors shrink-0"
            >
              Open Dispute Desk
            </button>
          </div>

          {disputedReviews.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">All Clear! No Active Disputes</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                None of your authored reviews are currently under landlord dispute or fact-checking. All reviews are active
                and visible to Kenyan renters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputedReviews.map((r) => {
                const prop = properties.find((p) => p.id === r.propertyId);
                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {prop?.buildingName || 'Apartment'}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                          {r.commentTitle}
                        </h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white">
                        7-Day Window Open
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-white/70 dark:bg-neutral-900/70 p-3 rounded-xl border border-amber-200 dark:border-amber-800 leading-relaxed">
                      {r.disputeNotice?.groundsSummary ||
                        'Claimant alleges defamatory review. Tenancy verification required to establish factual justification.'}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Ref: {r.disputeNotice?.policeObNumber || r.disputeNotice?.earbLicenseNumber || 'OB Verified'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivePanel('dispute-center')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Submit Rebuttal Proof Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
