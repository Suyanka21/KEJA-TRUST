import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Review, FrictionVectorKey } from '../types';
import { FRICTION_VECTORS, getScoreColor, formatKenyanCurrency } from '../utils/frictionVectors';
import { Cap36SandboxedBanner } from './Cap36SandboxedBanner';
import { GoldVerifiedBadge } from './GoldVerifiedBadge';
import {
  ShieldCheck,
  AlertTriangle,
  Scale,
  Star,
  Lock,
  ChevronLeft,
  FileText,
  UserCheck,
  DollarSign,
  Droplets,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface ReviewFeedProps {
  property: Property;
  reviews: Review[];
  onBackToProperties: () => void;
  onOpenSubmitModal: () => void;
  onSimulateDisputeSandbox: (reviewId: string) => void;
  onSimulateTenantRebuttal: (reviewId: string) => void;
}

const VECTOR_ICONS: Record<FrictionVectorKey, React.ComponentType<{ className?: string }>> = {
  depositRefund: DollarSign,
  waterUtilities: Droplets,
  securityPrivacy: Lock,
  evictionFairness: Scale,
  managementResponsiveness: Wrench,
};

export const ReviewFeed: React.FC<ReviewFeedProps> = ({
  property,
  reviews,
  onBackToProperties,
  onOpenSubmitModal,
  onSimulateDisputeSandbox,
  onSimulateTenantRebuttal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'sandboxed'>('all');

  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'verified') return r.isVerifiedTenant && r.lifecycleStatus !== 'under_investigation';
    if (filterType === 'sandboxed') return r.lifecycleStatus === 'under_investigation';
    return true;
  });

  const sandboxedCount = reviews.filter((r) => r.lifecycleStatus === 'under_investigation').length;
  const verifiedCount = reviews.filter((r) => r.isVerifiedTenant && r.lifecycleStatus === 'active').length;

  return (
    <div id="review-feed-section" className="space-y-6">
      {/* Top Navigation & Property Hero Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 140 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 shadow-xs space-y-5"
      >
        <button
          id="back-to-properties-btn"
          type="button"
          onClick={onBackToProperties}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Kenyan Properties</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {property.estateName}, {property.countyName}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{property.streetName}</span>
            </div>

            <h1 id="feed-property-name" className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {property.buildingName}
            </h1>

            {property.landlordOrAgency && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Managing Agency: <strong className="text-neutral-800 dark:text-neutral-200">{property.landlordOrAgency}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-neutral-900 dark:text-white justify-end">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{property.overallScore.toFixed(1)}</span>
                <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{reviews.length} total reviews</p>
            </div>

            <button
              id="feed-add-review-btn"
              type="button"
              onClick={onOpenSubmitModal}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Rate Property
            </button>
          </div>
        </div>

        {/* 5-Vector Summary Pills */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {FRICTION_VECTORS.map((v) => {
            const score = property.scores[v.key];
            const colors = getScoreColor(score);
            return (
              <div
                key={v.key}
                className={`p-3 rounded-2xl border ${colors.bg} ${colors.border} space-y-1`}
              >
                <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 truncate">{v.shortLabel}</div>
                <div className={`text-base sm:text-lg font-black font-mono ${colors.text}`}>{score.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Review Filters & Legal Disclosure Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-all-btn"
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Reviews ({reviews.length})
          </button>

          <button
            id="filter-verified-btn"
            type="button"
            onClick={() => setFilterType('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'verified'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Gold Verified ({verifiedCount})</span>
          </button>

          {sandboxedCount > 0 && (
            <button
              id="filter-sandboxed-btn"
              type="button"
              onClick={() => setFilterType('sandboxed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'sandboxed'
                  ? 'bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-400 dark:border-amber-600 shadow-xs'
                  : 'text-amber-800 dark:text-amber-400 hover:text-amber-950'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cap 36 Sandboxed ({sandboxedCount})</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 self-start sm:self-auto font-medium">
          <Scale className="w-3.5 h-3.5 text-neutral-400" />
          <span>Statutory Notice-and-Takedown Protocol Compliant</span>
        </div>
      </div>

      {/* Reviews Feed List with Staggered Entrance */}
      <div id="reviews-list-container" className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <motion.div
              key="empty-reviews"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-10 text-center space-y-3"
            >
              <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No reviews found under this filter</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Be the first to share an anonymous rental experience for this Kenyan flat.
              </p>
              <button
                type="button"
                onClick={onOpenSubmitModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-sm"
              >
                Write First Review
              </button>
            </motion.div>
          ) : (
            filteredReviews.map((review, rIdx) => {
              const isSandboxed = review.lifecycleStatus === 'under_investigation';
              const reviewDate = new Date(review.createdAt).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={review.id}
                  id={`review-item-${review.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{
                    type: 'spring',
                    damping: 24,
                    stiffness: 140,
                    delay: Math.min(rIdx * 0.05, 0.35),
                  }}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-white dark:bg-neutral-900 p-5 sm:p-7 space-y-4 ${
                    isSandboxed
                      ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs'
                      : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
                  }`}
                >
                  {/* Review Header: Pseudonym, Gold Badge (with 5s periodic glint), Tenancy Specs */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Randomized Anonymous Pseudonym */}
                      <span
                        id={`author-pseudonym-${review.id}`}
                        className="font-bold text-sm text-neutral-900 dark:text-white font-mono tracking-tight"
                      >
                        {review.authorPseudonym}
                      </span>

                      {/* Task 4: Gold Verified Renter Badge with 5-Second CSS Shimmer Glint */}
                      {review.isVerifiedTenant && !isSandboxed ? (
                        <GoldVerifiedBadge id={`gold-badge-${review.id}`} size="md" showSubtext />
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          <UserCheck className="w-3 h-3 text-neutral-400" />
                          <span>Tenant</span>
                        </span>
                      )}

                      {review.houseType && (
                        <span className="text-xs text-neutral-400 font-medium">· {review.houseType}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        Tenancy: {review.tenancyStartYear}–{review.tenancyEndYear ?? 'Present'}
                      </span>
                      <span>·</span>
                      <span>{reviewDate}</span>
                    </div>
                  </div>

                  {/* 5-Vector Mini Score Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {FRICTION_VECTORS.map((v) => {
                      const score = review.ratings[v.key];
                      const colors = getScoreColor(score);
                      const Icon = VECTOR_ICONS[v.key];
                      return (
                        <div
                          key={v.key}
                          className={`p-2 rounded-xl border ${colors.bg} ${colors.border} flex items-center justify-between`}
                        >
                          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate mr-1 flex items-center gap-1">
                            <Icon className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>{v.shortLabel}</span>
                          </span>
                          <span className={`font-bold font-mono ${colors.text}`}>{score}/5</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Task 3: THE CAP 36 DEFAMATION SHIELD & NOTICE BANNER */}
                  {isSandboxed ? (
                    <Cap36SandboxedBanner
                      reviewId={review.id}
                      disputeNotice={review.disputeNotice}
                      onSimulateRebuttal={() => onSimulateTenantRebuttal(review.id)}
                    />
                  ) : (
                    /* Standard Active Review Content */
                    <div className="space-y-2">
                      <h4
                        id={`review-title-${review.id}`}
                        className="text-base font-bold text-neutral-900 dark:text-white leading-snug"
                      >
                        {review.commentTitle}
                      </h4>
                      <p
                        id={`review-comment-${review.id}`}
                        className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line"
                      >
                        {review.commentText}
                      </p>

                      {review.monthlyRentPaid && (
                        <div className="pt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          <span>Verified Rent Paid:</span>
                          <strong className="text-neutral-800 dark:text-neutral-200">
                            {formatKenyanCurrency(review.monthlyRentPaid)} / month
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Controls & Dispute Testing Trigger */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      <span>ODPC Anonymized · Cryptographically Saltened</span>
                    </span>

                    {!isSandboxed && (
                      <button
                        id={`simulate-dispute-btn-${review.id}`}
                        type="button"
                        onClick={() => onSimulateDisputeSandbox(review.id)}
                        className="text-[11px] text-neutral-500 hover:text-amber-700 dark:hover:text-amber-400 hover:underline flex items-center gap-1 transition-colors font-medium"
                        title="Simulate landlord filing a Cap 36 dispute with Police OB number to sandbox this review"
                      >
                        <Scale className="w-3 h-3 text-neutral-400" />
                        <span>Landlord: File Cap 36 Dispute</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
