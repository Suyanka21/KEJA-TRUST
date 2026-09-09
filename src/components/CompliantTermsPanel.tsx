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
                Statutory Terms of Use &amp; Privacy Safeguards
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                Republic of Kenya
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Operating strictly within the legal framework established by the Kenya Data Protection Act 2019,
              the Defamation Act (Cap 36), and the Distress for Rent Act (Cap 293).
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
          <span>1. Data Protection Act 2019 (ODPC)</span>
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
          <span>2. Defamation Act (Cap 36)</span>
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
          <span>3. Distress for Rent Act (Cap 293)</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-xs space-y-6">
        {activeTab === 'dpa' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Statutory Charter Part I
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Kenya Data Protection Act (No. 24 of 2019) Compliance
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enforced by the Office of the Data Protection Commissioner (ODPC).
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Data Controller &amp; Processor Principles (Section 25)
              </h3>
              <p>
                KeJaTrust operates under strict adherence to Section 25 principles: lawfulness, fairness, transparency,
                purpose limitation, and data minimization. We collect only what is strictly necessary to prevent fraudulent
                reviews and verify authentic Kenyan tenancy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Cryptographic Partitioning &amp; Tenant Retaliation Immunity (Section 31)
              </h3>
              <p>
                To shield Kenyan tenants from vindictive landlord harassment, unannounced check-ins, or rental
                blacklisting, the platform performs real-time cryptographic partitioning. A tenant&apos;s Kenyan mobile
                number (+254...) and personal email are decoupled from review entities and irreversibly hashed via
                SHA-256. Public review records reflect only pseudonymous author handles (e.g. &quot;RoysambuRenter82&quot;).
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                3. Section 40 Right to be Forgotten (Data Erasure)
              </h3>
              <p>
                Every user retains full autonomy over their data. Upon exercising the Right to be Forgotten in your
                privacy settings, all user vectors, encrypted payloads, and authored reviews are permanently expunged
                from local client states within milliseconds.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'defamation' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Statutory Charter Part II
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Defamation Act (Cap 36) &amp; Section 14 Justification Protocol
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Notice-and-takedown balance protecting both landlord reputation and tenant truth.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Notice-and-Takedown Protocol (168-Hour Quarantine)
              </h3>
              <p>
                Under Kenya defamation jurisprudence, an intermediary platform that receives formal notice of alleged
                defamatory material must investigate promptly. To prevent abuse, KeJaTrust requires landlords or licensed
                managing agents to lodge formal disputes with either a Kenya Police Occurrence Book (OB) Number or an
                Estate Agents Registration Board (EARB) license.
              </p>
              <p>
                Upon valid filing, the review text is instantly quarantined and replaced with a statutory Cap 36 notice
                banner with an open 168-hour (7-day) rebuttal clock.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Section 14 Justification Defence (Truth in the Public Interest)
              </h3>
              <p>
                Section 14 of the Kenya Defamation Act provides that in an action for libel, the defence of justification
                shall not fail by reason only that the truth of every charge is not proved if the words not proved to be
                true do not materially injure the plaintiff&apos;s reputation.
              </p>
              <p>
                A tenant who produces valid Safaricom M-Pesa rent/deposit receipts or a signed lease conclusively
                establishes bona fide tenancy and factual justification. When submitted, the quarantine is immediately
                dissolved, and the review is awarded a permanent Gold Verified Renter Badge.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'distress' && (
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Statutory Charter Part III
              </span>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Distress for Rent Act (Cap 293) &amp; Unlawful Evictions
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Combating illegal padlock lockouts, utility cut-offs, and unauthorized auctioning.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                1. Prohibition of Landlord Self-Help Lockouts
              </h3>
              <p>
                Under Kenyan law (Section 3 of Cap 293 and Court of Appeal precedents), a landlord or caretaker is
                strictly prohibited from engaging in extra-judicial &quot;self-help&quot; eviction tactics, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <li>Welding or placing secondary padlocks on tenant doors without a court order;</li>
                <li>Disconnecting water supply or sabotaging token electricity meters;</li>
                <li>Removing iron roof sheets, doors, or window panes to coerce departure;</li>
                <li>Seizing tenant household goods without a licensed court bailiff wielding an auctioneer warrant.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                2. Eviction Fairness Vector Tracking
              </h3>
              <p>
                Our 5-Vector rating engine aggregates tenant feedback specifically on landlord compliance with
                statutory 30-day notice periods and fair dispute resolution. Landlords who routinely resort to unlawful
                distress for rent receive degraded Eviction Fairness scores, warning prospective tenants in advance.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
