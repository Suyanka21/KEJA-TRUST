import React, { useState } from 'react';
import {
  Scale,
  AlertOctagon,
  Lock,
} from 'lucide-react';

export const CompliantTermsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dpa' | 'defamation' | 'distress'>('dpa');

  return (
    <div id="compliant-terms-panel" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Platform Terms of Use &amp; Privacy Safeguards
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                Republic of Kenya
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Operating with an uncompromising commitment to tenant privacy, authentic reviews, and protection against illegal rental practices in Kenya.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('dpa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dpa'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>1. Privacy &amp; Data Protection</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defamation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'defamation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>2. Fair Review Policy &amp; Disputes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distress')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'distress'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>3. Anti-Lockout &amp; Eviction Rules</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-xs space-y-6">
        {activeTab === 'dpa' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Privacy Standard
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Kenyan Data Privacy &amp; Anonymity Protection
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Adhering to Kenyan national privacy standards and data commissioner guidelines.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Data Minimization &amp; Privacy First
              </h3>
              <p>
                KeJaTrust operates under strict privacy principles: lawfulness, fairness, transparency,
                and minimal data retention. We collect only what is strictly necessary to prevent fraudulent
                reviews and verify authentic Kenyan tenancy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Real-Time Cryptographic Privacy &amp; Anti-Retaliation Shield
              </h3>
              <p>
                To shield Kenyan renters from landlord harassment, surprise lockouts, or rental
                blacklisting, KeJaTrust performs instant cryptographic privacy isolation. A tenant&apos;s Kenyan mobile
                number (+254...) and personal contact details are completely disconnected from public reviews and permanently
                hashed. Public review records display only pseudonymous author tags (e.g. &quot;RoysambuRenter82&quot;).
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                3. Permanent Right to Complete Data Erasure
              </h3>
              <p>
                Every renter retains full autonomy over their data. Upon exercising your erasure options in your
                privacy settings, all user profile traces, encrypted session tokens, and authored reviews are permanently expunged
                from local client states within milliseconds.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'defamation' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Review Integrity Standard
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Fair Review Policy &amp; Transparent Dispute Protocol
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                A balanced, evidence-based process protecting both landlord reputation and tenant truth.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Fair Fact-Checking Protocol (7-Day Review Window)
              </h3>
              <p>
                When a property owner or licensed agent disputes a review, KeJaTrust investigates promptly and fairly.
                To prevent frivolous disputes, landlords or registered agents must provide formal verification — such as a
                Police Occurrence Book (OB) Number or Estate Agents Registration Board (EARB) license.
              </p>
              <p>
                Upon filing, the review text is temporarily flagged for fact-checking with an open 7-day (168-hour)
                window for the reviewer to verify their genuine tenant experience.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Verified Tenant Truth Defence (Truth in the Public Interest)
              </h3>
              <p>
                Under Kenyan rental practices and legal precedent, truthful feedback shared in the public interest is fully protected.
                Reviews backed by authentic documentation cannot be silenced by landlord threats.
              </p>
              <p>
                A tenant who produces valid Safaricom M-Pesa rent/deposit receipts or a signed lease agreement conclusively
                confirms authentic tenancy. When submitted, the temporary flag is immediately lifted, and the review is awarded
                a permanent Gold Verified Renter Badge.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'distress' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Tenant Rights Standard
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Anti-Lockout Protections &amp; Unlawful Eviction Prevention
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Combating illegal padlock lockouts, utility cut-offs, and unauthorized harassment.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Prohibition of Landlord Self-Help Lockouts
              </h3>
              <p>
                Under Kenyan rental laws and Court of Appeal precedents, a landlord or caretaker is
                strictly prohibited from engaging in illegal &quot;self-help&quot; eviction tactics, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <li>Welding doors shut or placing secondary padlocks on tenant doors without a valid court order;</li>
                <li>Disconnecting water supply or tampering with token electricity meters;</li>
                <li>Removing iron roof sheets, doors, or window panes to coerce departure;</li>
                <li>Seizing tenant household goods without a licensed court bailiff and auctioneer warrant.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Eviction Fairness Tracking
              </h3>
              <p>
                Our 5-Vector rating engine aggregates tenant feedback specifically on landlord compliance with
                mandatory 30-day notice periods and fair dispute resolution. Landlords who routinely resort to unlawful
                evictions receive degraded Eviction Fairness scores, warning prospective tenants in advance.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
