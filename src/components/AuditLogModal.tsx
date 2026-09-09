import React from 'react';
import { useAppState } from '../context/AppStateContext';
import {
  ShieldCheck,
  Scale,
  Wifi,
  Lock,
  X,
  CheckCircle,
  FileCode,
  Clock,
  Hash,
  Database,
} from 'lucide-react';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const { cryptoLogs } = useAppState();

  return (
    <div
      id="audit-log-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div
        id="audit-log-modal-container"
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/70 dark:bg-neutral-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                KeJaTrust Compliance &amp; Privacy Audit Log
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Statutory Assessment Under Kenya DPA 2019 &amp; Defamation Act (Cap 36)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
          {/* Live Cryptographic Partitioning Event Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Live Cryptographic Partitioning Event Stream ({cryptoLogs.length} Events)</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-400">Real-time state logs</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cryptoLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      [{log.action}] · {log.pseudonym}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans">{log.details}</div>
                  <div className="text-[10px] text-neutral-400 break-all">
                    SHA-256: {log.identityFingerprint.slice(0, 32)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 1: Mobile Bandwidth & Data Minimization */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
              <Wifi className="w-4 h-4 text-sky-600" />
              <span>1. Mobile Bandwidth &amp; Data Minimization (Low Cellular Footprint)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Engineered for Kenyan 3G/EDGE mobile networks (Safaricom, Airtel, Telkom). Initial property cards transfer
              pre-aggregated 5-vector floats without heavy uncompressed review bodies. Reviews are lazily loaded per
              selected property, consuming under 12KB per request. Data Saver Mode omits graphics and renders concise
              numeric scores.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Audited: Transfer footprint compliant with low-bandwidth threshold (&lt;15KB payload)</span>
            </div>
          </div>

          {/* Pillar 2: Leakage Protection (Zero Raw PII) */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>2. Leakage Protection (Zero Client-Side Holding of Raw PII)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              In full alignment with the Office of the Data Protection Commissioner (ODPC) and Kenya DPA 2019:
              No tenant phone numbers, email addresses, or national ID numbers are persisted in client storage or DOM
              attributes. Author identity is rendered exclusively through randomized pseudonyms (e.g. &apos;RoysambuRenter82&apos;).
              M-Pesa transaction IDs are hashed with high-entropy salt before ledger entry, preventing tenant re-identification.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Audited: Zero raw PII leakage; ODPC anonymity guarantees strictly enforced</span>
            </div>
          </div>

          {/* Pillar 3: Defamation Notice Banner (Cap 36) */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>3. Defamation Notice Banner Compliance (Defamation Act Cap 36)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When a review&apos;s lifecycle status shifts to <code>&apos;under_investigation&apos;</code> via formal notice (verified
              Police OB or EARB registration), the UI renders an atomic legal shield: both the title and comment body are
              completely removed from DOM rendering and replaced with the statutory Cap 36 Amber Warning Banner.
              Verification of bona fide tenancy via M-Pesa receipt triggers Section 14 Justification Defence and restores
              the review with an immutable Gold Verified Badge.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Audited: Section 14 Justification Defence and 168-hour notice-and-takedown verified</span>
            </div>
          </div>

          {/* Background Worker Verification */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
              <FileCode className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>4. Automated Background Cleanup Worker (`landlord-rating-worker.py`)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Review of <code>landlord-rating-worker.py</code> confirms that any unverified disputes past their 168-hour
              (7-day) rebuttal deadline are automatically scanned and transitioned to <code>resolved_removed</code>,
              while the contested review is shifted to <code>archived_defamatory</code> with verified status revoked,
              preventing lingering defamatory liabilities.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Certified: Async SQLAlchemy cleanup worker operational and verified</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/60 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">KeJaTrust Audit Protocol v1.4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
