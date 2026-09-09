import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../context/AppStateContext';
import {
  ShieldCheck,
  Check,
  Smartphone,
  Building2,
  Building,
  Sparkles,
  HelpCircle,
  ArrowRight,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const PricingPanel: React.FC = () => {
  const { setActivePanel, showToast, currentUser } = useAppState();

  // Billing Frequency: monthly vs annual (20% discount)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // M-Pesa STK Push Modal Simulation State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    id: 'starter' | 'agency';
    name: string;
    amount: number;
    billingPeriod: string;
  } | null>(null);

  const [checkoutPhone, setCheckoutPhone] = useState<string>(currentUser?.phone || '0712 345 678');
  const [checkoutStep, setCheckoutStep] = useState<'input' | 'pushing' | 'pin_prompt' | 'success'>('input');
  const [mockPin, setMockPin] = useState<string>('');
  const [generatedMpesaReceipt, setGeneratedMpesaReceipt] = useState<string>('');

  const starterPrice = billingCycle === 'monthly' ? 1999 : 1599;
  const starterAnnualTotal = 1599 * 12;

  const agencyPrice = billingCycle === 'monthly' ? 8500 : 6800;
  const agencyAnnualTotal = 6800 * 12;

  const handleOpenCheckout = (planId: 'starter' | 'agency') => {
    if (planId === 'starter') {
      setSelectedPlanForCheckout({
        id: 'starter',
        name: 'Landlord Starter Plan',
        amount: starterPrice,
        billingPeriod: billingCycle === 'monthly' ? 'month' : 'month (billed KES ' + starterAnnualTotal.toLocaleString() + '/year)',
      });
    } else {
      setSelectedPlanForCheckout({
        id: 'agency',
        name: 'Agency Portfolio Plan',
        amount: agencyPrice,
        billingPeriod: billingCycle === 'monthly' ? 'month' : 'month (billed KES ' + agencyAnnualTotal.toLocaleString() + '/year)',
      });
    }
    setCheckoutStep('input');
    setMockPin('');
    setGeneratedMpesaReceipt('');
  };

  const handleTriggerStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPhone.trim()) return;

    setCheckoutStep('pushing');

    // Simulate network delay for Safaricom Daraja STK push dispatch
    setTimeout(() => {
      setCheckoutStep('pin_prompt');
    }, 1500);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'QKT';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedMpesaReceipt(code);
    setCheckoutStep('success');
    showToast(`M-Pesa payment of KES ${selectedPlanForCheckout?.amount.toLocaleString()} received! Ref: ${code}`);
  };

  const handleCloseCheckout = () => {
    setSelectedPlanForCheckout(null);
    setCheckoutStep('input');
  };

  return (
    <div id="pricing-panel-container" className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300 pb-16">
      {/* 1. FREE FOR RENTERS — ALWAYS GUARANTEE BANNER */}
      <div
        id="renters-free-guarantee"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wide uppercase backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Tenant Core Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Free for Renters — Always.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              KeJaTrust will <strong>never charge tenants</strong> to search apartments, read unfiltered community experiences, or submit anonymous reviews. Our mission is total transparency for Kenyan renters. Landlords and agencies subscribe to manage reputation, post verified replies, and request fact-check reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePanel('showcase')}
            className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] shrink-0 flex items-center gap-2"
          >
            <span>Explore Ratings Free</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* 2. HEADER & BILLING TOGGLE */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold border border-neutral-200 dark:border-neutral-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Simple, Transparent Kenyan Pricing</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Plans for Renters, Landlords &amp; Property Agencies
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Built for the Kenyan urban rental ecosystem. Instant activation via Safaricom M-Pesa.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-2 inline-flex items-center p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 select-none">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3. THREE-TIER PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Free Renter */}
        <div
          id="tier-free-renter"
          className="relative rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                For Tenants
              </span>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                Free Renter
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                For tenants searching and rating homes anonymously across Kenya.
              </p>
            </div>

            {/* Pricing */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">KES 0</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">/ forever</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                No credit card, deposit, or fees needed
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Search all apartment buildings &amp; estates in Kenya</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Read 100% candid, anonymous tenant reviews</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>5 Kenyan friction vector scores (Deposits, Water, Caretakers)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Submit reviews with algorithmic pseudonyms (Zero PII stored)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Free <strong>M-Pesa Gold Verified Renter Badge</strong> verification</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Full protection against unfair review removal</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => setActivePanel('showcase')}
              className="w-full py-3.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm transition-colors active:scale-[0.98]"
            >
              Start Browsing Free
            </button>
          </div>
        </div>

        {/* Tier 2: Landlord Starter (Featured) */}
        <div
          id="tier-landlord-starter"
          className="relative rounded-3xl bg-white dark:bg-neutral-900 border-2 border-emerald-500 dark:border-emerald-500 p-6 sm:p-8 flex flex-col justify-between shadow-xl ring-4 ring-emerald-500/10"
        >
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
            Most Popular for Owners
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                For Building Owners
              </span>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Landlord Starter</span>
                <Building className="w-5 h-5 text-emerald-600" />
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                For landlords wanting official badges, review replies, and building analytics.
              </p>
            </div>

            {/* Pricing */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
                  KES {starterPrice.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">/ month</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {billingCycle === 'annual'
                  ? `Billed annually (KES ${starterAnnualTotal.toLocaleString()} / year · 2 months free)`
                  : 'Per apartment building · Billed monthly via M-Pesa'}
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Verified Landlord / Owner badge</strong> on your building</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct public replies (<strong>&quot;Official Landlord Response&quot;</strong>)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant notifications when your apartment receives a new review</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Fast-track <strong>Review Fact-Check requests</strong> with dedicated portal</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Monthly tenant satisfaction &amp; utility reliability analytics</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>1 building included (KES 1,499/mo per additional building)</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleOpenCheckout('starter')}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-900/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Get Landlord Starter — M-Pesa STK</span>
            </button>
          </div>
        </div>

        {/* Tier 3: Agency Portfolio */}
        <div
          id="tier-agency-portfolio"
          className="relative rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                For Real Estate Agencies
              </span>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Agency Portfolio</span>
                <Building2 className="w-5 h-5 text-indigo-600" />
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                For property management agencies managing multiple estates.
              </p>
            </div>

            {/* Pricing */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
                  KES {agencyPrice.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">/ month</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {billingCycle === 'annual'
                  ? `Billed annually (KES ${agencyAnnualTotal.toLocaleString()} / year · 2 months free)`
                  : 'Unlimited buildings · Billed monthly via M-Pesa'}
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited properties &amp; estates</strong> managed in one dashboard</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Official Agency Verification badge (EARB compliant)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Multi-agent team logins &amp; role-based permissions</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Priority <strong>24-hour fact-check resolution queue</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Portfolio-wide tenant churn &amp; caretaker sentiment analytics</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>PDF &amp; CSV reporting exports for property owner meetings</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Dedicated Kenyan account manager &amp; direct phone line</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleOpenCheckout('agency')}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-900/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Upgrade Portfolio — M-Pesa STK</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SAFARICOM M-PESA DARAJA CHECKOUT MODAL (INTERACTIVE SIMULATION) */}
      <AnimatePresence>
        {selectedPlanForCheckout && (
          <div
            id="mpesa-checkout-modal-backdrop"
            className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              id="mpesa-checkout-modal-container"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Safaricom M-Pesa Express (STK Push)
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Paybill: 888222 · KeJaTrust Subscriptions
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCheckout}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content depending on step */}
              <div className="p-6 space-y-5">
                {/* Plan Summary Badge */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">
                      Selected Plan
                    </span>
                    <strong className="text-sm text-neutral-900 dark:text-white">
                      {selectedPlanForCheckout.name}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      KES {selectedPlanForCheckout.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                      /{selectedPlanForCheckout.billingPeriod}
                    </span>
                  </div>
                </div>

                {/* Step 1: Input Kenyan MSISDN */}
                {checkoutStep === 'input' && (
                  <form onSubmit={handleTriggerStkPush} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="mpesa-phone-input" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Safaricom Mobile Phone Number
                      </label>
                      <div className="relative">
                        <input
                          id="mpesa-phone-input"
                          type="text"
                          required
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder="e.g. 0712 345 678"
                          className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        We will send a prompt directly to your Safaricom SIM card to authorize payment.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>Send M-Pesa STK Push to Phone</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Pushing STK Prompt */}
                {checkoutStep === 'pushing' && (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                    <h5 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Connecting to Safaricom Daraja...
                    </h5>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                      Sending STK prompt to {checkoutPhone}. Please check your phone screen.
                    </p>
                  </div>
                )}

                {/* Step 3: Realistic Simulated Phone PIN Prompt */}
                {checkoutStep === 'pin_prompt' && (
                  <form onSubmit={handleConfirmPin} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-neutral-950 text-white border-2 border-emerald-500 shadow-xl space-y-3 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-700">
                        <Smartphone className="w-3 h-3" />
                        <span>SIM Toolkit Prompt Received</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                        Do you want to pay <strong>KES {selectedPlanForCheckout.amount.toLocaleString()}</strong> to{' '}
                        <strong>KeJaTrust Ltd</strong> for {selectedPlanForCheckout.name}?
                      </p>
                      <div className="space-y-1.5 pt-2">
                        <label htmlFor="mock-pin-input" className="block text-[11px] font-mono text-emerald-400">
                          Enter M-Pesa PIN:
                        </label>
                        <input
                          id="mock-pin-input"
                          type="password"
                          maxLength={4}
                          value={mockPin}
                          onChange={(e) => setMockPin(e.target.value)}
                          placeholder="••••"
                          className="w-32 mx-auto text-center px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-base tracking-widest text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMockPin('1234');
                          setTimeout(() => {
                            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                            let code = 'QKT';
                            for (let i = 0; i < 7; i++) {
                              code += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            setGeneratedMpesaReceipt(code);
                            setCheckoutStep('success');
                            showToast(`Payment received! Ref: ${code}`);
                          }, 400);
                        }}
                        className="flex-1 py-3 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Auto-Fill Demo PIN (1234)
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Confirm PIN
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 4: Success Confirmation */}
                {checkoutStep === 'success' && (
                  <div className="py-4 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-base font-black text-neutral-900 dark:text-white">
                        Subscription Activated!
                      </h5>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        M-Pesa Receipt: <strong className="text-emerald-600">{generatedMpesaReceipt}</strong>
                      </p>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      Your <strong>{selectedPlanForCheckout.name}</strong> is now live on this simulated session. You can now reply to tenant reviews and manage fact-checks.
                    </p>
                    <button
                      type="button"
                      onClick={handleCloseCheckout}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Done &amp; Return to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Frequently Asked Questions</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Everything you need to know about KeJaTrust pricing and renter protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Why is KeJaTrust always 100% free for tenants?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Renters in Kenya already carry high financial burdens (deposits, utility hookup fees, agent commissions). Our core public utility mission is to eliminate rental information asymmetry. We never charge renters for browsing, rating, or reading reviews.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Can landlords pay to delete negative reviews?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>Never.</strong> Paid plans only unlock official replies, building verification badges, and fast-track fact-checking. KeJaTrust scores are computed cryptographically and cannot be altered or removed for payment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              How does Safaricom M-Pesa STK Push billing work?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When subscribing, enter your Kenyan Safaricom phone number. A secure prompt appears on your phone screen via Daraja C2B. Simply enter your M-Pesa PIN and your subscription activates instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Can property management agencies manage multiple estates?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Yes. The Agency Portfolio tier gives property management firms unlimited building listings across all 47 counties, team member accounts, and exportable PDF audit reports for property owner updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
