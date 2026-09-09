import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { ActivePanel } from '../types';
import {
  Building2,
  LayoutDashboard,
  PenLine,
  Scale,
  ShieldCheck,
  Sparkles,
  FileText,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  X,
  Zap,
  Users,
  LogOut,
} from 'lucide-react';

interface AppSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  onOpenWriteReviewModal?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  onOpenWriteReviewModal,
}) => {
  const {
    activePanel,
    setActivePanel,
    currentUser,
    logoutUser,
    switchPersona,
    disputes,
    reviews,
    darkMode,
    toggleDarkMode,
    dataSaverMode,
    toggleDataSaverMode,
  } = useAppState();

  const userReviewsCount = currentUser
    ? reviews.filter((r) => r.authorUserId === currentUser.id || r.authorPseudonym === currentUser.pseudonym).length
    : 0;

  const activeDisputesCount = disputes.filter((d) => d.status === 'under_investigation').length;

  interface NavItem {
    id: ActivePanel | 'write-review';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    action?: () => void;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Explore',
      items: [
        {
          id: 'showcase',
          label: 'Browse Apartments',
          icon: Building2,
        },
      ],
    },
    {
      title: 'Tenant Workspace',
      items: [
        {
          id: 'tenant-dashboard',
          label: 'My Dashboard',
          icon: LayoutDashboard,
          badge: userReviewsCount > 0 ? userReviewsCount : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
          id: 'write-review',
          label: 'Write a Review',
          icon: PenLine,
          action: () => {
            if (onOpenWriteReviewModal) {
              onOpenWriteReviewModal();
            } else {
              setActivePanel('tenant-dashboard');
            }
          },
        },
      ],
    },
    {
      title: 'Trust & Safety',
      items: [
        {
          id: 'dispute-center',
          label: 'Dispute Desk',
          icon: Scale,
          badge: activeDisputesCount > 0 ? `${activeDisputesCount} Open` : undefined,
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        },
        {
          id: 'settings',
          label: 'Privacy & Erasure',
          icon: ShieldCheck,
        },
        {
          id: 'terms',
          label: 'Guidelines & Rights',
          icon: FileText,
        },
      ],
    },
    {
      title: 'Monetization',
      items: [
        {
          id: 'pricing',
          label: 'M-Pesa Shield Plans',
          icon: Sparkles,
          badge: '20% OFF',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-extrabold',
        },
      ],
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.id !== 'write-review') {
      setActivePanel(item.id);
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setActivePanel('showcase');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            KJ
          </div>
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-neutral-900 dark:text-white tracking-tight text-sm">
                  KeJaTrust
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                  KE 🇰🇪
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                Anonymous Kenyan Rentals
              </p>
            </div>
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapseDesktop}
          className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isCollapsedDesktop ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsedDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Persona Profile Card */}
      {(!isCollapsedDesktop || isOpenMobile) && (
        <div className="p-3 mx-3 my-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.pseudonym.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate font-mono">
                      {currentUser.pseudonym}
                    </p>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      {currentUser.isMpesaVerified ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Gold Verified
                        </span>
                      ) : (
                        <span>Standard Renter</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Persona Switch Quick Buttons */}
              <div className="pt-1 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-1 text-[10px]">
                <span className="text-neutral-400 font-medium">Switch persona:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => switchPersona(currentUser.id === 'usr-001' ? 'usr-002' : 'usr-001')}
                    className="px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600 transition-colors"
                  >
                    {currentUser.id === 'usr-001' ? 'KilimaniTenant14' : 'RoysambuRenter82'}
                  </button>
                </div>
              </div>

              {/* Log Out Button */}
              <div className="pt-1 border-t border-neutral-200 dark:border-neutral-700/60">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    onCloseMobile();
                  }}
                  className="w-full py-1 px-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-rose-200/60 dark:border-rose-900/40"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-center py-1">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guest Session</span>
              </div>
              <p className="text-[11px] text-neutral-400">Log in to post verified reviews</p>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => switchPersona('usr-001')}
                  className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 shadow-xs"
                >
                  Demo User
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel('auth')}
                  className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {(!isCollapsedDesktop || isOpenMobile) && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.id === activePanel;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    title={isCollapsedDesktop && !isOpenMobile ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      />
                      {(!isCollapsedDesktop || isOpenMobile) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsedDesktop || isOpenMobile) && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Quick Action CTA */}
      {(!isCollapsedDesktop || isOpenMobile) && (
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>M-Pesa Tenancy Shield</span>
          </div>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Get your Gold Badge to protect your reviews from landlord takedown disputes.
          </p>
          <button
            type="button"
            onClick={() => {
              setActivePanel('pricing');
              onCloseMobile();
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>View M-Pesa Shield Plans</span>
          </button>
        </div>
      )}

      {/* Footer Controls: Theme & Preferences */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
        {(!isCollapsedDesktop || isOpenMobile) ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleDataSaverMode}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-[11px] font-medium ${
                  dataSaverMode
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
                title="Toggle Data Saver (Low-Bandwidth)"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{dataSaverMode ? 'Low Data' : 'Normal'}</span>
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">v0.1-ke</span>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 z-20 ${
          isCollapsedDesktop ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
