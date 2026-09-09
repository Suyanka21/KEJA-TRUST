import React from 'react';
import { motion } from 'motion/react';
import { Property, FrictionVectorKey } from '../types';
import { FRICTION_VECTORS, getScoreColor } from '../utils/frictionVectors';
import {
  MapPin,
  Star,
  ChevronRight,
  PlusCircle,
  Droplets,
  DollarSign,
  Lock,
  Scale,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelectProperty: (property: Property) => void;
  onRateProperty: (property: Property) => void;
  isSelected?: boolean;
  dataSaverMode?: boolean;
  index?: number;
}

const VECTOR_ICONS: Record<FrictionVectorKey, React.ComponentType<{ className?: string }>> = {
  depositRefund: DollarSign,
  waterUtilities: Droplets,
  securityPrivacy: Lock,
  evictionFairness: Scale,
  managementResponsiveness: Wrench,
};

const getRingColor = (score: number) => {
  if (score >= 4.0) return '#10b981'; // emerald-500
  if (score >= 3.0) return '#f59e0b'; // amber-500
  return '#f43f5e'; // rose-500
};

export const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(({
  property,
  onSelectProperty,
  onRateProperty,
  isSelected = false,
  dataSaverMode = false,
  index = 0,
}, ref) => {
  const overallColors = getScoreColor(property.overallScore);
  const verifiedPercentage =
    property.reviewCount > 0 ? Math.round((property.verifiedTenantCount / property.reviewCount) * 100) : 0;

  const radius = 13;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      ref={ref}
      id={`property-card-${property.id}`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{
        type: 'spring',
        damping: 24,
        stiffness: 140,
        delay: Math.min(index * 0.05, 0.45),
      }}
      whileHover={{ y: -4, transition: { duration: 0.18, ease: 'easeOut' } }}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-white dark:bg-neutral-900 ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
          : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Meta: Estate, Building Name, Overall Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                <MapPin className="w-3 h-3 text-neutral-500" />
                <span className="truncate">{property.estateName}, {property.countyName}</span>
              </span>

              {property.verifiedTenantCount > 0 && (
                <span
                  id={`verified-pill-${property.id}`}
                  className="animate-gold-glint inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 shadow-xs"
                  title="Tenants verified via Safaricom M-Pesa rent confirmation · Protected under Cap 36 Section 14"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>{verifiedPercentage}% M-Pesa Verified</span>
                </span>
              )}
            </div>

            <h3
              id={`building-name-${property.id}`}
              className="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight leading-snug"
            >
              {property.buildingName}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 truncate">
              <span>{property.streetName}</span>
              {property.plotNumber && <span className="text-neutral-400">· {property.plotNumber}</span>}
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="text-right shrink-0">
            <div
              id={`overall-score-${property.id}`}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base border shadow-xs ${overallColors.bg} ${overallColors.text} ${overallColors.border}`}
            >
              <Star className="w-4 h-4 fill-current text-amber-500" />
              <span>{property.overallScore.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
              {property.reviewCount} reviews
            </p>
          </div>
        </div>

        {/* Landlord / Agency Metadata */}
        {property.landlordOrAgency && (
          <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 px-3 py-2 rounded-xl border border-neutral-150 dark:border-neutral-800 flex items-center justify-between">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">Managing Agency:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate ml-2">
              {property.landlordOrAgency}
            </span>
          </div>
        )}

        {/* 5-Vector Rental Friction Indicators */}
        <div id={`friction-vectors-${property.id}`} className="space-y-2 pt-1">
          <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>5-Vector Rental Friction Rings</span>
            <span className="text-[11px] text-neutral-400 font-normal">Score / 5.0</span>
          </div>

          {dataSaverMode ? (
            /* Low-bandwidth textual view */
            <div className="grid grid-cols-1 gap-1.5 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-xl">
              {FRICTION_VECTORS.map((vector) => {
                const score = property.scores[vector.key];
                const colors = getScoreColor(score);
                return (
                  <div key={vector.key} className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-neutral-600 dark:text-neutral-400 truncate mr-2">{vector.shortLabel}</span>
                    <span className={`font-bold font-mono ${colors.text}`}>{score.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Animated Spring SVG Progress Rings */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FRICTION_VECTORS.map((vector, vIdx) => {
                const score = property.scores[vector.key];
                const Icon = VECTOR_ICONS[vector.key];
                const ringColor = getRingColor(score);
                const strokeDashoffset = circumference * (1 - score / 5);

                return (
                  <div
                    key={vector.key}
                    className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-800/30 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-1 rounded-md bg-white dark:bg-neutral-700/60 text-neutral-500 dark:text-neutral-300 shadow-2xs shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium truncate">
                        {vector.shortLabel}
                      </span>
                    </div>

                    {/* Animated SVG Progress Ring with Spring Physics */}
                    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r={radius}
                          className="stroke-neutral-200 dark:stroke-neutral-700"
                          strokeWidth="2.75"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="16"
                          cy="16"
                          r={radius}
                          stroke={ringColor}
                          strokeWidth="2.75"
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 90,
                            delay: Math.min(index * 0.05, 0.3) + vIdx * 0.05,
                          }}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black font-mono text-neutral-800 dark:text-neutral-200">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Featured House Types */}
        {property.featuredHouseTypes && property.featuredHouseTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-400">Typology:</span>
            {property.featuredHouseTypes.map((ht) => (
              <span
                key={ht}
                className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[11px] font-semibold text-neutral-600 dark:text-neutral-300"
              >
                {ht}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <button
            id={`view-reviews-btn-${property.id}`}
            type="button"
            onClick={() => onSelectProperty(property)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Read {property.reviewCount} Reviews</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id={`rate-property-btn-${property.id}`}
            type="button"
            onClick={() => onRateProperty(property)}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 active:scale-[0.98]"
            title="Submit an anonymous or M-Pesa verified review"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">Rate</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

PropertyCard.displayName = 'PropertyCard';
