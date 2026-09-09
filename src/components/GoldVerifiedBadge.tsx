import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface GoldVerifiedBadgeProps {
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
}

export const GoldVerifiedBadge: React.FC<GoldVerifiedBadgeProps> = ({
  id,
  size = 'md',
  showSubtext = false,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      id={id}
      className={`animate-gold-glint relative inline-flex items-center rounded-full font-bold bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 dark:from-amber-950 dark:via-amber-900 dark:to-amber-950 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs select-none tracking-tight ${sizeClasses}`}
      title="Tenancy verified via Safaricom M-Pesa transaction · Protected under Defamation Act Cap 36 Section 14 (Justification Defence)"
    >
      <ShieldCheck className={`${iconSizes} text-amber-700 dark:text-amber-400 shrink-0`} />
      <span className="truncate">Gold Verified Renter</span>
      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0 animate-pulse" />
      {showSubtext && (
        <span className="text-[10px] opacity-75 font-mono ml-1 hidden sm:inline">
          · Daraja Match
        </span>
      )}
    </span>
  );
};
