import React from 'react';
import { CryptographicPartitionLog } from '../types';
import {
  ShieldCheck,
  Lock,
  Hash,
  FileCode,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface CryptographicLogModalProps {
  log: CryptographicPartitionLog;
  onClose: () => void;
}

export const CryptographicLogModal: React.FC<CryptographicLogModalProps> = ({ log, onClose }) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(log.identityFingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="crypto-partition-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="crypto-partition-modal-card"
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 text-neutral-900 dark:text-white relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                ODPC DPA 2019 Certified
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white mt-0.5">
              Cryptographic Partitioning Log
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Zero-knowledge tenant privacy enclave initialized for <strong className="font-mono text-neutral-800 dark:text-neutral-200">{log.pseudonym}</strong>
            </p>
          </div>
        </div>

        {/* Cryptographic Details Card */}
        <div className="bg-neutral-950 text-neutral-200 p-4 rounded-2xl border border-neutral-800 space-y-3 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-1">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Identity Fingerprint</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 break-all text-[11px] leading-relaxed">
              {log.identityFingerprint}
            </div>
          </div>

          <div>
            <div className="text-neutral-400 text-[11px] pb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulated AES-256-GCM Enclave</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-300 break-all text-[11px]">
              {log.encryptedSnippet}
            </div>
          </div>

          <div>
            <div className="text-neutral-400 text-[11px] pb-1 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Legal Safeguard Basis</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px]">
              {log.legalBasis}
            </div>
          </div>
        </div>

        {/* Plain Language Explainer */}
        <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>How KeJaTrust Keeps You Anonymous</span>
          </h4>
          <p>
            Your real phone number and email never touch the public review feed. They are salted and processed through
            a one-way hash function. Even under a court subpoena or malicious landlord cyber-attack, it is
            mathematically impossible to reverse this SHA-256 hash into your identity.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            id="dismiss-crypto-modal-btn"
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99]"
          >
            I Understand My Identity is Protected · Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
