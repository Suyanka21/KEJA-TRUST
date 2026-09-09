import React, { useState, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import {
  Moon,
  Sun,
  Wifi,
  ShieldCheck,
  Trash2,
  Lock,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Flame,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

export const SettingsPrivacyPanel: React.FC = () => {
  const {
    currentUser,
    darkMode,
    dataSaverMode,
    cryptoLogs,
    toggleDarkMode,
    toggleDataSaverMode,
    rightToBeForgotten,
    resetToDefaults,
    logoutUser,
    setActivePanel,
  } = useAppState();

  const [confirmForgetModal, setConfirmForgetModal] = useState<boolean>(false);
  const [isShredding, setIsShredding] = useState<boolean>(false);
  const [wasShredded, setWasShredded] = useState<boolean>(false);

  const shredTargetRef = useRef<HTMLDivElement>(null);

  const handleTriggerForget = () => {
    if (!currentUser) return;

    setIsShredding(true);

    // Particle dissolve explosion using confetti with security ashes & red alert fragments
    confetti({
      particleCount: 110,
      spread: 95,
      origin: { y: 0.55 },
      colors: ['#e11d48', '#f59e0b', '#71717a', '#18181b', '#fb7185'],
      ticks: 140,
      shapes: ['square'],
      scalar: 0.9,
    });

    // GSAP shredder disintegration timeline
    if (shredTargetRef.current) {
      gsap.to(shredTargetRef.current, {
        scaleY: 0.85,
        opacity: 0.3,
        filter: 'blur(8px) contrast(2)',
        duration: 0.8,
        ease: 'power2.in',
      });
    }

    // After shredder visual completes, wipe the state permanently
    setTimeout(() => {
      rightToBeForgotten(currentUser.id);
      setIsShredding(false);
      setConfirmForgetModal(false);
      setWasShredded(true);
    }, 1100);
  };

  return (
    <div id="settings-privacy-panel" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          id="settings-back-btn"
          type="button"
          onClick={() => setActivePanel('showcase')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {currentUser && (
          <button
            id="settings-logout-top-btn"
            type="button"
            onClick={logoutUser}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Session</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Settings &amp; Privacy Controls
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                100% Private &amp; Erasable
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Manage display preferences, inspect your anonymous identity fingerprint, or permanently delete your account
              and reviews with one click.
            </p>
          </div>
        </div>
      </div>

      {/* Erasure Notice Banner after Shredding */}
      {wasShredded && (
        <div
          id="shredded-confirmation-banner"
          className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-xs"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold">Section 40 Permanent Erasure Complete</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              All personal identity records, local encryption seeds, and reviews linked to your session have been shredded
              and permanently purged from the client enclave.
            </p>
          </div>
        </div>
      )}

      {/* Toggles Card: Dark Mode & Data Saver */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Display &amp; Bandwidth Preferences</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Toggle */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                {darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <span className="text-sm font-bold text-neutral-900 dark:text-white block">Dark Mode</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {darkMode ? 'High-contrast dark canvas' : 'Sophisticated clean light theme'}
                </span>
              </div>
            </div>

            <button
              id="settings-toggle-dark-mode"
              type="button"
              onClick={toggleDarkMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                darkMode ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Data Saver Mode Toggle */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                <Wifi className={`w-5 h-5 ${dataSaverMode ? 'text-emerald-500' : 'text-neutral-500'}`} />
              </div>
              <div>
                <span className="text-sm font-bold text-neutral-900 dark:text-white block">Data Saver Mode</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Converts visual progress rings to lightweight text
                </span>
              </div>
            </div>

            <button
              id="settings-toggle-data-saver"
              type="button"
              onClick={toggleDataSaverMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                dataSaverMode ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Control Block */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Tenant Privacy &amp; Encryption Shield</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Active cryptographic protection ensuring your real identity stays private.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Privacy Shield
          </span>
        </div>

        {currentUser ? (
          <div ref={shredTargetRef} className="space-y-4 transition-all">
            <div className="bg-neutral-950 text-neutral-200 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-neutral-800">
                <span className="text-neutral-400 text-[11px]">Active Public Handle:</span>
                <span className="font-bold text-white text-sm">{currentUser.pseudonym}</span>
              </div>

              <div>
                <span className="text-neutral-400 text-[11px] block pb-1">One-Way SHA-256 Identity Fingerprint:</span>
                <div className="bg-neutral-900 px-3 py-2 rounded-xl text-neutral-300 break-all text-[11px] border border-neutral-800">
                  {currentUser.identityFingerprint}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 text-[11px] block pb-1">Client Enclave AES-256-GCM Encrypted Payload:</span>
                <div className="bg-neutral-900 px-3 py-2 rounded-xl text-neutral-300 break-all text-[11px] border border-neutral-800">
                  {currentUser.encryptedPayload}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Account Created: {new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                <span>Storage: Local Client Enclave</span>
              </div>
            </div>

            {/* Right to be Forgotten Action (Task 5: Shredder Trigger) */}
            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                    Permanent Data Erasure (Right to be Forgotten)
                  </h3>
                  <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed mt-0.5">
                    Exercising this right permanently wipes your account, destroys your encryption keys, and deletes
                    all reviews authored by {currentUser.pseudonym} from the local database.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="trigger-forget-btn"
                  type="button"
                  onClick={() => setConfirmForgetModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete My Data</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-center space-y-3">
            <Eye className="w-6 h-6 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No active user account currently logged in. Your guest browsing session does not hold any personal data.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActivePanel('auth')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Log In or Sign Up
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('splash')}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Return to Welcome
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic Event Log Stream */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <span>Cryptographic Privacy &amp; Erasure Event Stream</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">{cryptoLogs.length} Events</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {cryptoLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      log.action === 'ODPC_RIGHT_TO_BE_FORGOTTEN' || log.action === 'DATA_ERASURE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        : log.action === 'MPESA_VERIFY'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : log.action === 'DISPUTE_SANDBOX'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 font-bold">{log.pseudonym}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{log.details}</p>
              <div className="text-[10px] text-neutral-400 font-mono truncate">{log.legalBasis}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Workspace Reset */}
      <div className="pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">Need to restore original demo seed state?</span>
        <button
          id="reset-demo-workspace-btn"
          type="button"
          onClick={resetToDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Mock Data to Kenya Seeds</span>
        </button>
      </div>

      {/* Task 5: Confirmation & Particle Dissolve / Shredder Modal */}
      {confirmForgetModal && currentUser && (
        <div
          id="confirm-forget-modal"
          className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 text-neutral-900 dark:text-white">
            {/* Shredder Active Visual Effect Overlay */}
            {isShredding && (
              <div className="absolute inset-0 bg-neutral-950/90 z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-full flex justify-between gap-1 overflow-hidden px-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((strip) => (
                    <div
                      key={strip}
                      className="animate-shredder-strip w-3 h-28 bg-gradient-to-b from-rose-500 via-amber-400 to-neutral-700 rounded-sm"
                      style={{ animationDelay: `${strip * 0.08}s` }}
                    />
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span>Cryptographic Erasure In Progress</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono">
                    Scrubbing SHA-256 keys &amp; shredding all tenant review records...
                  </p>
                </div>
              </div>
            )}

            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Confirm Permanent Data Erasure
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Are you sure you want to permanently erase the mock account for{' '}
                <strong>{currentUser.pseudonym}</strong>? This action triggers a cryptographic shredder that permanently
                purges all reviews you authored. This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isShredding}
                onClick={() => setConfirmForgetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-erase-action-btn"
                type="button"
                disabled={isShredding}
                onClick={handleTriggerForget}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isShredding ? 'Shredding Data...' : 'Yes, Permanently Purge Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
