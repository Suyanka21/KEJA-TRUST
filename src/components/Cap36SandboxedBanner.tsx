import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ShieldAlert,
  Scale,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { DisputeNotice } from '../types';

interface Cap36SandboxedBannerProps {
  reviewId: string;
  disputeNotice?: DisputeNotice;
  onSimulateRebuttal?: () => void;
}

export const Cap36SandboxedBanner: React.FC<Cap36SandboxedBannerProps> = ({
  reviewId,
  disputeNotice,
  onSimulateRebuttal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const clockBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // GSAP Distortion / Blur consumption overlay animation
    const tl = gsap.timeline();
    tl.fromTo(
      containerRef.current,
      {
        filter: 'blur(16px) contrast(1.6) brightness(1.2)',
        opacity: 0,
        scale: 0.96,
      },
      {
        filter: 'blur(0px) contrast(1) brightness(1)',
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
      }
    );

    // Laser / statutory scan line sweep
    if (scanLineRef.current) {
      tl.fromTo(
        scanLineRef.current,
        { left: '-15%', opacity: 0.8 },
        { left: '115%', opacity: 0, duration: 0.85, ease: 'power2.inOut' },
        '-=0.4'
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id={`cap36-sandboxed-banner-${reviewId}`}
      className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border-2 border-amber-400 dark:border-amber-600/80 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-md space-y-4"
    >
      {/* GSAP Laser Sweep Line */}
      <div
        ref={scanLineRef}
        className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-amber-300/40 dark:via-amber-400/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      {/* Main Notice Header */}
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-200/90 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 shrink-0 mt-0.5 border border-amber-300 dark:border-amber-700 shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black tracking-wider text-amber-950 dark:text-amber-200 uppercase bg-amber-200/70 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
              Under Fact-Check Review
            </span>
            <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 font-bold">
              Tenancy Verification Active
            </span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-amber-900 dark:text-amber-200/90 font-medium">
            Under Fact-Check Review — This post is temporarily hidden while tenancy records are verified. The tenant author has been sent a secure notification to confirm their stay via M-Pesa rent confirmation.
          </p>
        </div>
      </div>

      {/* Verification Reference & 7-Day Countdown Clock */}
      <div className="pt-3 border-t border-amber-200/80 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Reference Verification */}
          <span className="inline-flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            <Scale className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Ref: <strong>{disputeNotice?.policeObNumber || 'OB 42/02/09/2026'}</strong></span>
          </span>

          {/* 7-Day Countdown Clock with Subtle Pulse Animation */}
          <div
            ref={clockBadgeRef}
            className="animate-countdown-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-200/90 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 font-bold font-mono border border-amber-300 dark:border-amber-700 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />
            <span>7-Day Fact-Check Window</span>
          </div>
        </div>

        {/* Interactive M-Pesa Rebuttal Trigger */}
        {onSimulateRebuttal && (
          <button
            id={`rebuttal-simulate-btn-${reviewId}`}
            type="button"
            onClick={onSimulateRebuttal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
            title="Confirm tenancy with an M-Pesa receipt to restore review with a Gold Verified badge"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Tenancy with M-Pesa</span>
          </button>
        )}
      </div>
    </div>
  );
};
