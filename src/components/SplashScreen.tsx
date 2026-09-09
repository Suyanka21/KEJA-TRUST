import React from 'react';
import { useAppState } from '../context/AppStateContext';
import {
  ShieldCheck,
  Lock,
  Scale,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Building,
  Droplets,
  Coins,
  FileCheck,
  ChevronRight,
  Shield,
  EyeOff,
  Search,
} from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const {
    openAuth,
    setActivePanel,
    switchPersona,
    users,
    properties,
    reviews,
  } = useAppState();

  const demoGoldUser = users.find((u) => u.isMpesaVerified) || users[0];
  const demoStandardUser = users.find((u) => !u.isMpesaVerified) || users[1] || users[0];

  return (
    <div id="splash-screen-container" className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Hero Presentation Card */}
      <section className="relative overflow-hidden rounded-3xl bg-radial-[at_top_right] from-emerald-950 via-neutral-900 to-neutral-950 text-white p-8 sm:p-12 lg:p-16 border border-emerald-900/40 shadow-2xl">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Statutory badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ODPC Kenya DPA 2019 Registered</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Cap 36 Defamation Shield</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              <span>Safaricom M-Pesa Verified</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Know Your Next Apartment{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Before Paying Deposit.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-2xl">
              Decentralized, anonymous Kenyan tenant ratings across Nairobi, Kiambu, Mombasa, and Nakuru.
              Inspect withheld deposit trends, water rationing frequency, and rogue landlord warnings without risking your identity.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            {/* Create Account / Sign Up */}
            <button
              id="splash-signup-btn"
              type="button"
              onClick={() => openAuth('register')}
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Create Free Anonymous Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Log In */}
            <button
              id="splash-login-btn"
              type="button"
              onClick={() => openAuth('login')}
              className="px-7 py-3.5 rounded-2xl bg-neutral-800/90 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700/80 hover:border-neutral-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Log In</span>
            </button>

            {/* Browse Directory as Guest */}
            <button
              id="splash-guest-browse-btn"
              type="button"
              onClick={() => setActivePanel('showcase')}
              className="px-5 py-3.5 rounded-2xl text-neutral-300 hover:text-white font-semibold text-xs sm:text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span>Explore Directory as Guest</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Personas for zero-friction evaluation */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Evaluator Demo:</span>
            </span>
            {demoGoldUser && (
              <button
                type="button"
                onClick={() => switchPersona(demoGoldUser.id)}
                className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 hover:border-amber-400 text-amber-200 hover:text-white font-mono text-[11px] transition-all flex items-center gap-1.5"
                title="Log in immediately as RoysambuRenter82 (M-Pesa Gold Verified)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Log in as {demoGoldUser.pseudonym} (Gold M-Pesa)</span>
              </button>
            )}
            {demoStandardUser && (
              <button
                type="button"
                onClick={() => switchPersona(demoStandardUser.id)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-mono text-[11px] transition-all flex items-center gap-1.5"
                title="Log in immediately as standard tenant"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Log in as {demoStandardUser.pseudonym}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3 Value Proposition Columns */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 5 Friction Vectors */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            5 Kenyan Friction Vectors
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Standard 5-star ratings don&apos;t work in Kenya. KeJaTrust rates apartment buildings on Deposit Refunds,
            Water/Token reliability, Security &amp; Privacy, Eviction Fairness (Cap 293), and Management Responsiveness.
          </p>
        </div>

        {/* Card 2: Defamation Shield */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            Cap 36 Statutory Shield
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Protected under Section 14 Justification of Kenya Defamation Act. Landlords who contest reviews must
            enter a 168-hour evidence sandbox before taking action, safeguarding whistleblowing tenants.
          </p>
        </div>

        {/* Card 3: ODPC Cryptographic Enclave */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <EyeOff className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            ODPC Zero Raw PII Enclave
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your phone number and email are converted into one-way SHA-256 fingerprints. Neither landlords nor managing agents
            can subpoena your raw contact details. Exercise Section 40 Right to be Forgotten at any time.
          </p>
        </div>
      </section>

      {/* Directory Teaser / Preview */}
      <section className="bg-neutral-50 dark:bg-neutral-900/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <span>Featured Properties in Nairobi &amp; Counties</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {properties.length} Kenyan buildings catalogued · {reviews.length} authentic verified reviews
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePanel('showcase')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.slice(0, 3).map((property) => (
            <div
              key={property.id}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {property.buildingName}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {property.estateName}, {property.countyName}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                    property.overallScore >= 4.0
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      : property.overallScore >= 2.5
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {property.overallScore.toFixed(1)} / 5.0
                </span>
              </div>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <span>{property.reviewCount} tenant reviews</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {property.verifiedTenantCount} M-Pesa verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-emerald-600 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black">
            Ready to Protect Yourself or Rate Your Apartment?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Join thousands of Kenyan tenants making the rental market transparent. No landlords with access to your identity, guaranteed.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => openAuth('register')}
            className="px-6 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
          >
            Create Anonymous Account
          </button>
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="px-5 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-500/50 transition-all active:scale-[0.98]"
          >
            Log In
          </button>
        </div>
      </section>
    </div>
  );
};
