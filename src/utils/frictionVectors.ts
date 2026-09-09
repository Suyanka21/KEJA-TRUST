import { FrictionVectorKey } from '../types';

export interface VectorDefinition {
  key: FrictionVectorKey;
  label: string;
  shortLabel: string;
  kenyanContext: string;
  lowDesc: string;
  highDesc: string;
}

export const FRICTION_VECTORS: VectorDefinition[] = [
  {
    key: 'depositRefund',
    label: 'Deposit Refund Reliability',
    shortLabel: 'Deposit Refund',
    kenyanContext: 'Move-out inspection fairness, promptness of refund, no fabricated deductions',
    lowDesc: 'Withholds deposit or demands illegal repainting charges',
    highDesc: 'Full refund promptly within statutory 14-30 days',
  },
  {
    key: 'waterUtilities',
    label: 'Water & Utility Consistency',
    shortLabel: 'Water & Utilities',
    kenyanContext: 'Borehole backup, tokens reliability, water rationing, cartel-free',
    lowDesc: 'Frequent dry taps, extortionate private water bowser rates',
    highDesc: '24/7 uninterrupted borehole or reliable municipal supply',
  },
  {
    key: 'securityPrivacy',
    label: 'Security & Quiet Enjoyment',
    shortLabel: 'Security & Privacy',
    kenyanContext: 'Guards, CCTV, perimeter fence, caretaker respecting tenant privacy',
    lowDesc: 'Frequent break-ins, unannounced caretaker entry into house',
    highDesc: 'Vetted 24/7 security, strict biometric or gate entry, total privacy',
  },
  {
    key: 'evictionFairness',
    label: 'Eviction Fairness & Notice',
    shortLabel: 'Eviction Fairness',
    kenyanContext: 'Strict adherence to 30-day notice, no midnight padlocking or roof removals',
    lowDesc: 'Illegal lockouts, water disconnections without notice',
    highDesc: 'Dignified communication, lawful standard 30-day notice periods',
  },
  {
    key: 'managementResponsiveness',
    label: 'Caretaker & Repair Responsiveness',
    shortLabel: 'Caretaker & Repairs',
    kenyanContext: 'Fixing leaks, electrical faults, common area lighting, garbage collection',
    lowDesc: 'Ignores repair texts for weeks, defective wiring left unaddressed',
    highDesc: 'Same-day technician visits, professional property manager',
  },
];

export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  bar: string;
} {
  if (score >= 4.0) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
    };
  }
  if (score >= 3.0) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
    };
  }
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    bar: 'bg-rose-500',
  };
}

export function formatKenyanCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount);
}
