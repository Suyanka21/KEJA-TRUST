import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import {
  Menu,
  Search,
  PenLine,
  Shield,
  Sparkles,
  Building,
  User,
  ChevronDown,
  X,
  FileCheck,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenWriteReviewModal: () => void;
  onOpenAuditModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMobileMenu,
  onOpenWriteReviewModal,
  onOpenAuditModal,
}) => {
  const {
    activePanel,
    setActivePanel,
    currentUser,
    switchPersona,
    properties,
    setSelectedPropertyId,
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter properties based on search query
  const searchResults = searchQuery.trim()
    ? properties.filter(
        (p) =>
          p.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.estateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.countyName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectProperty = (propId: string) => {
    setSelectedPropertyId(propId);
    setActivePanel('properties');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const getPanelBreadcrumb = () => {
    switch (activePanel) {
      case 'tenant-dashboard':
        return 'Tenant Workspace / Dashboard';
      case 'showcase':
        return 'Discovery / Browse Apartments';
      case 'properties':
        return 'Discovery / Property Reviews';
      case 'dispute-center':
        return 'Trust & Safety / Dispute Desk';
      case 'settings':
        return 'Security / Privacy & Erasure';
      case 'terms':
        return 'Platform / Guidelines & Rights';
      case 'pricing':
        return 'Membership / M-Pesa Shield';
      case 'auth':
        return 'Account / Access Portal';
      default:
        return 'KeJaTrust / Anonymous Kenya Reviews';
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block truncate">
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 font-mono tracking-wide">
              {getPanelBreadcrumb()}
            </span>
          </div>
        </div>

        {/* Center: Quick Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search building, estate, county..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-neutral-100/80 dark:bg-neutral-800/80 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Autocomplete Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden z-30 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Matching Apartments ({searchResults.length})
              </div>
              <div className="p-1 space-y-0.5">
                {searchResults.map((prop) => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => handleSelectProperty(prop.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white">
                          {prop.buildingName}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {prop.estateName}, {prop.countyName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        ★ {prop.overallScore}
                      </span>
                      <div className="text-[10px] text-neutral-400">
                        {prop.reviewCount} reviews
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Action CTAs & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Write Review Button */}
          <button
            type="button"
            onClick={onOpenWriteReviewModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write Review</span>
          </button>

          {/* Audit Log Trigger */}
          <button
            type="button"
            onClick={onOpenAuditModal}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Trust & Safety Audit Log"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Persona Switcher Dropdown */}
          <div ref={personaRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPersonaMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {currentUser ? (
                <>
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {currentUser.pseudonym.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                    {currentUser.pseudonym}
                  </span>
                  {currentUser.isMpesaVerified && (
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-neutral-500" />
                  <span className="hidden md:inline text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Guest
                  </span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* Persona Menu Popover */}
            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-2 z-30 animate-in fade-in-50 zoom-in-95 duration-150 space-y-1">
                <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    {currentUser ? currentUser.pseudonym : 'Guest Session'}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {currentUser
                      ? currentUser.isMpesaVerified
                        ? 'Gold Verified Renter'
                        : 'Standard Anonymous Renter'
                      : 'Browsing without saved credentials'}
                  </div>
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-bold text-neutral-400 px-2 py-1 uppercase tracking-wider">
                    Quick Switch Demo Persona
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      switchPersona('usr-001');
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      currentUser?.id === 'usr-001' ? 'font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>RoysambuRenter82</span>
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Gold
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchPersona('usr-002');
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      currentUser?.id === 'usr-002' ? 'font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>KilimaniTenant14</span>
                    <span className="text-[10px] text-neutral-400">Standard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchPersona('usr-003');
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      currentUser?.id === 'usr-003' ? 'font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>WestlandsResident</span>
                    <span className="text-[10px] text-neutral-400">Standard</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePanel('auth');
                      setIsPersonaMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  >
                    Register New Anonymous Persona
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePanel('settings');
                      setIsPersonaMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Privacy &amp; Data Controls
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
