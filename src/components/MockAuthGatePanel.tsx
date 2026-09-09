import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { generatePseudonym } from '../utils/cryptoSim';
import {
  ShieldCheck,
  Lock,
  Key,
  UserCheck,
  Smartphone,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  LogOut,
} from 'lucide-react';

export const MockAuthGatePanel: React.FC = () => {
  const {
    currentUser,
    users,
    registerUser,
    loginUser,
    logoutUser,
    switchPersona,
    setActivePanel,
    authMode,
    setAuthMode,
  } = useAppState();

  const [pseudonym, setPseudonym] = useState<string>('RoysambuRenter82');
  const [email, setEmail] = useState<string>('tenant@example.ke');
  const [phone, setPhone] = useState<string>('+254 712 345 678');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('RoysambuRenter82');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateRandomPseudonym = () => {
    setPseudonym(generatePseudonym('Roysambu'));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !phone.trim()) {
      setErrorMessage('Please provide a valid email and Kenyan mobile phone number.');
      return;
    }

    try {
      registerUser(pseudonym, email, phone);
      // After registration, AppStateContext triggers lastCryptoPartitionEvent modal
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your pseudonym or email.');
      return;
    }

    const success = loginUser(loginIdentifier);
    if (!success) {
      setErrorMessage(`No account found matching '${loginIdentifier}'. Try one of the demo personas below.`);
    }
  };

  return (
    <div id="mock-auth-gate-panel" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          id="auth-back-to-splash-btn"
          type="button"
          onClick={() => setActivePanel('splash')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Welcome / Splash</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel('showcase')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Explore Directory as Guest →
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                The Mock Gate: Simulated Onboarding &amp; Auth
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Privacy Protected
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Test how Kenyan tenants register without revealing personal identities. KeJaTrust immediately partitions
              your raw phone number and email into a one-way SHA-256 identity fingerprint and encrypted AES payload.
            </p>
          </div>
        </div>

        {/* Investor Showcase / Demo Mode Disclaimer */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Investor Showcase · Simulated Auth &amp; Storage</span>
            <span>
              This project is built for demonstration and testing AI agent capabilities. It does not use real authentication (e.g. Firebase Auth) or an external database. All sessions and tenant credentials remain strictly local to your browser session.
            </span>
          </div>
        </div>
      </div>

      {/* Active User Session Status if logged in */}
      {currentUser && (
        <div
          id="active-session-card"
          className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                {currentUser.pseudonym.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Logged in as:</span>
                  <strong className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                    {currentUser.pseudonym}
                  </strong>
                  {currentUser.isMpesaVerified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Gold Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                  SHA-256 Fingerprint: {currentUser.identityFingerprint.slice(0, 20)}...
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePanel('showcase')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Go to Main Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('tenant-dashboard')}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-xs"
              >
                My Reviews
              </button>
              <button
                type="button"
                onClick={logoutUser}
                className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900 dark:text-emerald-300">
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Simulated AES Enclave: </span>
              <span className="font-mono text-[11px]">{currentUser.encryptedPayload.slice(0, 32)}...</span>
            </div>
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Reviews Authored: </span>
              <span className="font-bold">{currentUser.reviewsCount} reviews</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form & Quick Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Registration / Login Box */}
        <div className="md:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-5">
          {/* Tabs */}
          <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                authMode === 'register'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Sign Up Anonymous Tenant
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                authMode === 'login'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Simulate Login
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {authMode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="reg-pseudonym" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Tenant Pseudonym (Public Handle)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPseudonym}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  id="reg-pseudonym"
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="e.g. RoysambuRenter82"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-neutral-400">
                  This pseudonym is the only identity landlords will ever see on your reviews.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Personal Email (Partitioned &amp; Encrypted)</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenant@example.ke"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-phone" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Kenyan Mobile Phone (+254 / 07...)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-neutral-400">
                  Strictly hashed into a SHA-256 fingerprint. Never disclosed to landlords or managing agents.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="simulate-register-btn"
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register &amp; Generate Cryptographic Enclave</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="login-id" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Pseudonym or Email
                </label>
                <input
                  id="login-id"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. RoysambuRenter82"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  id="simulate-login-btn"
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Log In to Mock Session</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Demo Persona Switcher */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Instant Demo Personas
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Switch directly into any pre-seeded Kenyan tenant session to test reviews and dispute rebuttals:
            </p>

            <div className="space-y-2 pt-1">
              {users.map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => switchPersona(u.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white font-mono">
                        {u.pseudonym}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <span>Switch</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {u.phone} · {u.isMpesaVerified ? 'Gold Badge' : 'Standard'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statutory Data Protection Explainer Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Your Data is Always Protected</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
              We follow strict data minimization and privacy-by-design principles.
              Landlords cannot access your real identity because only irreversible cryptographic hashes are stored — your
              personal details are never revealed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
