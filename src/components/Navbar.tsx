import React from 'react';
import { useAppState } from '../context/AppStateContext';
import {
  ShieldCheck,
  Scale,
  Wifi,
  PlusCircle,
  Sparkles,
  Building,
  Moon,
  Sun,
  FileText,
  Menu,
  X,
  Settings,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activePanel,
    setActivePanel,
    currentUser,
    darkMode,
    dataSaverMode,
    toggleDarkMode,
    toggleDataSaverMode,
    logoutUser,
    openAuth,
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'showcase' as const, label: 'Directory & Ratings', icon: Building },
    { id: 'tenant-dashboard' as const, label: 'Rate & My Reviews', icon: PlusCircle },
    { id: 'dispute-center' as const, label: 'Dispute Center (Cap 36)', icon: Scale },
    { id: 'settings' as const, label: 'ODPC Settings', icon: Settings },
    { id: 'terms' as const, label: 'Statutory Shield', icon: FileText },
  ];

  const handleBrandClick = () => {
    if (currentUser) {
      setActivePanel('showcase');
    } else {
      setActivePanel('splash');
    }
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Identity */}
          <div
            id="brand-logo-button"
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            aria-label="KeJaTrust Home"
          >
            <div
              id="brand-logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/20"
            >
              <ShieldCheck className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  KeJa<span className="text-emerald-600 dark:text-emerald-400">Trust</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                  NyumbaYangu
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden md:block">
                Kenyan Tenant Transparency · Cap 36 Shield · ODPC Safe
              </p>
            </div>
          </div>

          {/* Controls: Theme, Bandwidth, Auth / Profile, Settings, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Dark Mode Toggle */}
            <button
              id="nav-toggle-darkmode-btn"
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Data Saver Mode Toggle */}
            <button
              id="nav-toggle-datasaver-btn"
              type="button"
              onClick={toggleDataSaverMode}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                dataSaverMode
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="Toggle Low-Bandwidth Mode for Kenyan cellular networks"
            >
              <Wifi className={`w-3.5 h-3.5 ${dataSaverMode ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`} />
              <span className="hidden lg:inline">Data Saver:</span>
              <span>{dataSaverMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* User State: Logged in vs Unauthenticated */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Active User Pill */}
                <button
                  type="button"
                  onClick={() => setActivePanel('tenant-dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  title="View your tenant profile and authored reviews"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[110px] truncate">{currentUser.pseudonym}</span>
                  {currentUser.isMpesaVerified && (
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                  )}
                </button>

                {/* Rate flat action */}
                <button
                  id="nav-rate-btn"
                  type="button"
                  onClick={() => setActivePanel('tenant-dashboard')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Rate Flat</span>
                </button>

                {/* Settings Gear Button */}
                <button
                  id="nav-settings-btn"
                  type="button"
                  onClick={() => setActivePanel('settings')}
                  className={`p-2 rounded-xl transition-colors ${
                    activePanel === 'settings'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="App Settings &amp; Privacy Controls"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Log Out Button */}
                <button
                  id="nav-logout-btn"
                  type="button"
                  onClick={logoutUser}
                  className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                  title="Log Out of current session"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Guest Log In Button */}
                <button
                  id="nav-login-btn"
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Log In
                </button>

                {/* Guest Sign Up Button */}
                <button
                  id="nav-signup-btn"
                  type="button"
                  onClick={() => openAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] flex items-center gap-1"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (shown on all authenticated views or when exploring) */}
        {activePanel !== 'splash' && (
          <nav className="hidden lg:flex items-center gap-1 border-t border-neutral-100 dark:border-neutral-800 py-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-panel-${item.id}`}
                  onClick={() => setActivePanel(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1 animate-in fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActivePanel(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-center"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

