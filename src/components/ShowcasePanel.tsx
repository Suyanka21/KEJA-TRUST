import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../context/AppStateContext';
import { PropertyCard } from './PropertyCard';
import { KENYA_COUNTIES } from '../data/kenyaData';
import {
  ShieldCheck,
  Scale,
  Lock,
  Search,
  Building,
  Sparkles,
  AlertOctagon,
  Award,
  ChevronDown,
  Flame,
} from 'lucide-react';

const POPULAR_ESTATES = ['Kilimani', 'Roysambu', 'Westlands', "Lang'ata", 'Ruaka', 'Nyali', 'South B', 'Parklands'];

export const ShowcasePanel: React.FC = () => {
  const {
    properties,
    reviews,
    dataSaverMode,
    setSelectedPropertyId,
    setActivePanel,
  } = useAppState();

  const [selectedCounty, setSelectedCounty] = useState<number | null>(null);
  const [estateSearch, setEstateSearch] = useState<string>('');
  const [keywordSearch, setKeywordSearch] = useState<string>('');

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedCounty !== null && p.countyCode !== selectedCounty) {
        return false;
      }
      if (estateSearch.trim() !== '') {
        const query = estateSearch.trim().toLowerCase();
        if (!p.estateName.toLowerCase().includes(query)) return false;
      }
      if (keywordSearch.trim() !== '') {
        const query = keywordSearch.trim().toLowerCase();
        const nameMatch = p.buildingName.toLowerCase().includes(query);
        const streetMatch = p.streetName.toLowerCase().includes(query);
        const agencyMatch = p.landlordOrAgency?.toLowerCase().includes(query) ?? false;
        if (!nameMatch && !streetMatch && !agencyMatch) return false;
      }
      return true;
    });
  }, [properties, selectedCounty, estateSearch, keywordSearch]);

  const verifiedReviewsCount = useMemo(() => {
    return reviews.filter((r) => r.isVerifiedTenant && r.lifecycleStatus === 'active').length;
  }, [reviews]);

  return (
    <div id="showcase-panel" className="space-y-12 pb-12">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC "TRUST" HERO SECTION (MengTo's Cinematic Architecture) */}
      {/* ========================================================================= */}
      <motion.section
        id="hero-mission-section"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 120, duration: 0.8 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white p-8 sm:p-12 lg:p-16 border border-neutral-800 shadow-2xl"
      >
        {/* Ambient Multi-Layer Cinematic Background Expansion */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute -top-36 -right-36 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 1.6, delay: 0.2, ease: 'easeOut' }}
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Choreographed Badge Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Republic of Kenya · Statutory Tenancy Protection &amp; Defamation Shield</span>
          </motion.div>

          {/* High-Contrast Typography Mask */}
          <div className="space-y-2">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white"
              >
                Bringing trust &amp; truth to the{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Kenyan rental market.
                </span>
              </motion.h1>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed max-w-2xl font-normal"
          >
            No more hidden borehole water levies, withheld deposit deductions, or illegal padlock lockouts.
            KeJaTrust empowers verified Kenyan tenants to share immutable, cryptographically shielded apartment reviews
            safeguarded by privacy-first encryption and Kenya’s data protection standards.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="pt-2 flex flex-wrap items-center gap-4"
          >
            <button
              id="hero-explore-btn"
              type="button"
              onClick={() => {
                const el = document.getElementById('search-explore-island');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>Explore All 47 Counties</span>
            </button>

            <button
              id="hero-rate-btn"
              type="button"
              onClick={() => setActivePanel('tenant-dashboard')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-100 border border-neutral-700/80 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Rate Your Apartment</span>
            </button>
          </motion.div>

          {/* Key Metrics Banner with Staggered Numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="pt-8 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{properties.length}</div>
              <div className="text-neutral-400 font-medium mt-0.5">Mapped Kenyan Flats</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-1.5">
                <span>{verifiedReviewsCount}</span>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <div className="text-neutral-400 font-medium mt-0.5">M-Pesa Verified Reviews</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-neutral-400 font-medium mt-0.5">Anonymous &amp; Private</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">47</div>
              <div className="text-neutral-400 font-medium mt-0.5">Kenyan ISO Counties</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 2. CORE PLATFORM PILLARS GRID */}
      {/* ========================================================================= */}
      <section id="features-grid-section" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
            Statutory Architecture Designed for Kenyan Tenancy Realities
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Engineered around local friction points: delayed deposits, rationing water carts, and unlawful lockouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <motion.div
            id="pillar-verified"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Gold Badge Verification</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono font-bold">
                  Daraja
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Tenants substantiate residency using Safaricom M-Pesa rent receipt codes, filtering out fake claims and landlord astroturfing.
              </p>
            </div>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            id="pillar-cap36"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Fair Review Shield</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                  Active
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Your honest reviews are protected. If a landlord disputes a claim, a 7-day fact-check window is triggered before any action.
              </p>
            </div>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            id="pillar-privacy"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>100% Tenant Anonymity</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  Privacy Shield
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Phone numbers and emails are decoupled via client-side encryption. Landlords never see your contact details, preventing retaliation.
              </p>
            </div>
          </motion.div>

          {/* Pillar 4 */}
          <motion.div
            id="pillar-distress"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Anti-Lockout (Cap 293)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-mono font-bold">
                  Anti-Lockout
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Monitors landlord compliance against illegal door-welding, roof removal, or utility cuts without court orders.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SEARCH KENYAN PROPERTIES BY COUNTY & ESTATE */}
      {/* ========================================================================= */}
      <section id="search-explore-island" className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Search className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                  Search Kenyan Properties by County &amp; Estate
                </h2>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Filter across all 47 counties or type specific estates (Kilimani, Roysambu, Lang&apos;ata, Westlands).
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                {filteredProperties.length} Properties Matching
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* County Selector (ISO 1-47) */}
            <div className="space-y-1.5">
              <label htmlFor="county-select" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>County (ISO 1–47)</span>
                {selectedCounty && (
                  <button
                    type="button"
                    onClick={() => setSelectedCounty(null)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </label>
              <div className="relative">
                <select
                  id="county-select"
                  value={selectedCounty ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCounty(val === '' ? null : Number(val));
                  }}
                  className="w-full appearance-none px-3.5 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 pr-9 transition-colors shadow-2xs"
                >
                  <option value="">All 47 Counties (National Registry)</option>
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code.toString().padStart(2, '0')} - {c.name} County
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Estate Input */}
            <div className="space-y-1.5">
              <label htmlFor="estate-input" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Estate / Neighborhood
              </label>
              <input
                id="estate-input"
                type="text"
                value={estateSearch}
                onChange={(e) => setEstateSearch(e.target.value)}
                placeholder="e.g. Kilimani, Roysambu, Ruaka"
                className="w-full px-3.5 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Building / Agency Search */}
            <div className="space-y-1.5">
              <label htmlFor="keyword-input" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Building Name / Agency
              </label>
              <input
                id="keyword-input"
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="e.g. Muringa Heights, Roysambu Palace"
                className="w-full px-3.5 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-colors shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Estate Filter Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trending Estates:</span>
            </span>
            {POPULAR_ESTATES.map((estate) => (
              <button
                key={estate}
                type="button"
                onClick={() => setEstateSearch(estate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  estateSearch.toLowerCase() === estate.toLowerCase()
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {estate}
              </button>
            ))}
            {(selectedCounty !== null || estateSearch || keywordSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCounty(null);
                  setEstateSearch('');
                  setKeywordSearch('');
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. ENTRANCE CHOREOGRAPHY PROPERTY GRID (Task 2) */}
        {/* ========================================================================= */}
        <div id="properties-results-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProperties.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-12 text-center space-y-4"
              >
                <Building className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">No Kenyan properties found</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    No matching apartments found for your filter criteria. Try searching for Kilimani, Roysambu, Lang&apos;ata,
                    or clearing your county selection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCounty(null);
                    setEstateSearch('');
                    setKeywordSearch('');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 shadow-sm"
                >
                  Reset All Filters
                </button>
              </motion.div>
            ) : (
              filteredProperties.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={idx}
                  dataSaverMode={dataSaverMode}
                  onSelectProperty={(p) => {
                    setSelectedPropertyId(p.id);
                    setActivePanel('properties');
                  }}
                  onRateProperty={(p) => {
                    setSelectedPropertyId(p.id);
                    setActivePanel('tenant-dashboard');
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
