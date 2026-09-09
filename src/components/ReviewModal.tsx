import React, { useState } from 'react';
import { Property, FrictionVectorKey, FrictionScores, ReviewSubmissionPayload } from '../types';
import { FRICTION_VECTORS } from '../utils/frictionVectors';
import {
  X,
  Star,
  ShieldCheck,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Building,
  Banknote,
} from 'lucide-react';

interface ReviewModalProps {
  property: Property;
  onClose: () => void;
  onSubmit: (payload: ReviewSubmissionPayload) => void;
}

const HOUSE_TYPES = [
  'Bedsitter',
  'Studio',
  '1-Bedroom',
  '2-Bedroom',
  '3-Bedroom',
  '4-Bedroom+',
  'Maisonette / Townhouse',
  'Penthouse',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export const ReviewModal: React.FC<ReviewModalProps> = ({
  property,
  onClose,
  onSubmit,
}) => {
  // 5-Vector Ratings (default to 3)
  const [ratings, setRatings] = useState<FrictionScores>({
    depositRefund: 3,
    waterUtilities: 3,
    securityPrivacy: 4,
    evictionFairness: 3,
    managementResponsiveness: 3,
  });

  // Text inputs
  const [commentTitle, setCommentTitle] = useState('');
  const [commentText, setCommentText] = useState('');

  // Metadata
  const [monthlyRentPaid, setMonthlyRentPaid] = useState<string>('');
  const [houseType, setHouseType] = useState<string>('1-Bedroom');
  const [tenancyStartYear, setTenancyStartYear] = useState<number>(CURRENT_YEAR - 1);
  const [tenancyEndYear, setTenancyEndYear] = useState<string>('');

  // Safaricom M-Pesa TransID
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [mpesaTouched, setMpesaTouched] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validation regex for Safaricom Daraja C2B TransID: 10 alphanumeric chars
  const MPESA_REGEX = /^[A-Z0-9]{10}$/;
  const cleanMpesa = mpesaReceipt.trim().toUpperCase();
  const isMpesaValid = cleanMpesa.length === 0 || MPESA_REGEX.test(cleanMpesa);
  const hasValidMpesa = cleanMpesa.length === 10 && MPESA_REGEX.test(cleanMpesa);

  const handleRatingChange = (key: FrictionVectorKey, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (commentTitle.trim().length < 5) {
      errors.commentTitle = 'Title must be at least 5 characters long.';
    }

    if (commentText.trim().length < 20) {
      errors.commentText = 'Review comment must be at least 20 characters to provide meaningful context.';
    }

    if (cleanMpesa.length > 0 && !MPESA_REGEX.test(cleanMpesa)) {
      errors.mpesaReceipt = 'Safaricom M-Pesa receipt code must be exactly 10 alphanumeric characters (e.g. QRT4XYZ7AB).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: ReviewSubmissionPayload = {
      propertyId: property.id,
      ratings,
      commentTitle: commentTitle.trim(),
      commentText: commentText.trim(),
      monthlyRentPaid: monthlyRentPaid ? parseFloat(monthlyRentPaid) : undefined,
      houseType,
      tenancyStartYear,
      tenancyEndYear: tenancyEndYear ? parseInt(tenancyEndYear, 10) : undefined,
      mpesaReceiptCode: hasValidMpesa ? cleanMpesa : undefined,
    };

    setTimeout(() => {
      try {
        onSubmit(payload);
      } catch (err: any) {
        setFormErrors((prev) => ({
          ...prev,
          commentTitle: err.message || 'Submission failed.',
        }));
      } finally {
        setIsSubmitting(false);
      }
    }, 350);
  };

  return (
    <div
      id="review-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="review-modal-container"
        className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/70">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Tenant Review Submission
            </span>
            <h2 id="modal-property-title" className="text-lg sm:text-xl font-bold text-neutral-900">
              {property.buildingName}
            </h2>
            <p className="text-xs text-neutral-500">
              {property.estateName}, {property.countyName} · {property.streetName}
            </p>
          </div>

          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Tenant Privacy & Anonymity Banner */}
          <div
            id="tenant-privacy-banner"
            className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Anonymous &amp; Private Review</span>
            </div>
            <p className="leading-relaxed text-emerald-800">
              Your phone and email are strictly encrypted and never shared with landlords. You post under a private
              pseudonym (e.g., <strong>&apos;RoysambuRenter42&apos;</strong>) so you are completely safe from retaliation.
            </p>
          </div>

          {/* 5-Vector Rating Grid */}
          <div className="space-y-4">
            <div className="border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-900">1. Rate the 5 Kenyan Rental Friction Vectors</h3>
              <p className="text-xs text-neutral-500">
                Score each dimension from 1 (unacceptable/unlawful) to 5 (excellent/professional).
              </p>
            </div>

            <div className="space-y-4">
              {FRICTION_VECTORS.map((vector) => {
                const currentScore = ratings[vector.key];
                return (
                  <div
                    key={vector.key}
                    id={`vector-row-${vector.key}`}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-150 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-neutral-900">{vector.label}</div>
                        <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                          {vector.kenyanContext}
                        </div>
                      </div>

                      {/* Interactive 1-5 Star Picker */}
                      <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-neutral-200">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isFilled = starVal <= currentScore;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => handleRatingChange(vector.key, starVal)}
                              className="p-1 hover:scale-115 transition-transform focus:outline-none"
                              title={`${starVal} / 5 stars`}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-bold text-neutral-700 ml-1">{currentScore}/5</span>
                      </div>
                    </div>

                    {/* Vector Guidance */}
                    <div className="text-[11px] text-neutral-600 flex items-center justify-between pt-1 border-t border-neutral-200/60">
                      <span className="text-rose-600 truncate mr-2">1 = {vector.lowDesc}</span>
                      <span className="text-emerald-700 truncate text-right">5 = {vector.highDesc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Title & Body */}
          <div className="space-y-3">
            <div className="border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-900">2. Review Content</h3>
              <p className="text-xs text-neutral-500">Provide factual, constructive feedback for prospective renters.</p>
            </div>

            <div>
              <label htmlFor="review-title-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="review-title-input"
                type="text"
                value={commentTitle}
                onChange={(e) => setCommentTitle(e.target.value)}
                placeholder="e.g. Prompt deposit return but borehole water runs saline"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {formErrors.commentTitle && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.commentTitle}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="review-body-input" className="block text-xs font-semibold text-neutral-700">
                  Detailed Experience <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[11px] ${
                    commentText.trim().length >= 20 ? 'text-emerald-600 font-medium' : 'text-neutral-400'
                  }`}
                >
                  {commentText.trim().length}/20 min chars
                </span>
              </div>
              <textarea
                id="review-body-input"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Detail what future tenants should know about the landlord, deposit return process, electricity tokens, caretaker responsiveness, and security..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed"
              />
              {formErrors.commentText && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.commentText}
                </p>
              )}
            </div>
          </div>

          {/* Tenancy Metadata (Rent, Unit, Years) */}
          <div className="space-y-3">
            <div className="border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-900">3. Tenancy Details (Optional)</h3>
              <p className="text-xs text-neutral-500">Helps renters evaluate market rates and unit specs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="rent-paid-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Monthly Rent (KES)
                </label>
                <div className="relative">
                  <input
                    id="rent-paid-input"
                    type="number"
                    value={monthlyRentPaid}
                    onChange={(e) => setMonthlyRentPaid(e.target.value)}
                    placeholder="e.g. 35000"
                    min="1000"
                    max="1000000"
                    className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Banknote className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="house-type-select" className="block text-xs font-semibold text-neutral-700 mb-1">
                  House / Unit Type
                </label>
                <select
                  id="house-type-select"
                  value={houseType}
                  onChange={(e) => setHouseType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {HOUSE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tenancy-start-select" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Tenancy Period
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    id="tenancy-start-select"
                    value={tenancyStartYear}
                    onChange={(e) => setTenancyStartYear(parseInt(e.target.value, 10))}
                    className="w-1/2 px-2 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <span className="text-neutral-400 text-xs">to</span>
                  <select
                    id="tenancy-end-select"
                    value={tenancyEndYear}
                    onChange={(e) => setTenancyEndYear(e.target.value)}
                    className="w-1/2 px-2 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Present</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y.toString()}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Safaricom M-Pesa Gating & Instant Gold Badge Verification */}
          <div
            id="mpesa-verification-container"
            className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Safaricom M-Pesa Tenancy Gating
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    Instant Gold Badge
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Optional: Enter any genuine rent payment transaction code (e.g. paybill or till receipt).
                  Your receipt is hashed and never revealed.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="mpesa-code-input" className="block text-xs font-semibold text-neutral-800 mb-1">
                Safaricom Transaction Code (10 Alphanumeric Characters)
              </label>
              <div className="relative">
                <input
                  id="mpesa-code-input"
                  type="text"
                  maxLength={10}
                  value={mpesaReceipt}
                  onChange={(e) => {
                    setMpesaReceipt(e.target.value.toUpperCase());
                    setMpesaTouched(true);
                  }}
                  placeholder="e.g. QRT4XYZ7AB"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 transition-colors ${
                    hasValidMpesa
                      ? 'border-emerald-500 text-emerald-900 focus:ring-emerald-500'
                      : mpesaTouched && cleanMpesa.length > 0 && !isMpesaValid
                      ? 'border-rose-400 text-rose-900 focus:ring-rose-500'
                      : 'border-amber-300 text-neutral-900 focus:ring-amber-500'
                  }`}
                />
                {hasValidMpesa && (
                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gold Eligible</span>
                  </div>
                )}
              </div>

              {/* Real-time regex feedback */}
              {hasValidMpesa ? (
                <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Valid Safaricom TransID format! This review will receive an instant Gold Verified Badge.</span>
                </p>
              ) : cleanMpesa.length > 0 ? (
                <p className="text-xs text-amber-800 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    Must be exactly 10 alphanumeric characters (currently {cleanMpesa.length}/10).
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Unlocks the <strong>Gold Verified Renter Badge</strong> — giving your review maximum protection and credibility.
                </p>
              )}

              {formErrors.mpesaReceipt && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.mpesaReceipt}</p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-between gap-3">
          <button
            id="cancel-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            id="submit-review-action-btn"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Encrypting &amp; Submitting...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Publish Anonymous Review</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
