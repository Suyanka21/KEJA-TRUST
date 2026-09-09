import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Navbar } from './components/Navbar';
import { ShowcasePanel } from './components/ShowcasePanel';
import { SplashScreen } from './components/SplashScreen';
import { MockAuthGatePanel } from './components/MockAuthGatePanel';
import { TenantDashboardPanel } from './components/TenantDashboardPanel';
import { DisputeCenterPanel } from './components/DisputeCenterPanel';
import { SettingsPrivacyPanel } from './components/SettingsPrivacyPanel';
import { CompliantTermsPanel } from './components/CompliantTermsPanel';
import { ReviewFeed } from './components/ReviewFeed';
import { ReviewModal } from './components/ReviewModal';
import { DisputeSimulationModal } from './components/DisputeSimulationModal';
import { TenantRebuttalModal } from './components/TenantRebuttalModal';
import { AuditLogModal } from './components/AuditLogModal';
import { CryptographicLogModal } from './components/CryptographicLogModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  CheckCircle,
  FileCheck,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activePanel,
    setActivePanel,
    properties,
    reviews,
    selectedPropertyId,
    setSelectedPropertyId,
    toastMessage,
    lastCryptoPartitionEvent,
    dismissCryptoPartitionModal,
    submitReview,
    fileDispute,
    rebutDispute,
  } = useAppState();

  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [quickRatePropertyId, setQuickRatePropertyId] = useState<string | null>(null);

  // Modals for interactive actions within ReviewFeed
  const [reviewForDisputeId, setReviewForDisputeId] = useState<string | null>(null);
  const [reviewForRebuttalId, setReviewForRebuttalId] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || null;
  const selectedPropertyReviews = reviews.filter((r) => r.propertyId === selectedPropertyId);

  const reviewForDispute = reviews.find((r) => r.id === reviewForDisputeId) || null;
  const reviewForRebuttal = reviews.find((r) => r.id === reviewForRebuttalId) || null;
  const targetQuickRateProperty = properties.find((p) => p.id === quickRatePropertyId) || null;

  return (
    <div
      id="kejatrust-app-root"
      className="min-h-screen bg-neutral-100/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-20 right-4 z-50 max-w-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 border border-neutral-800 dark:border-neutral-200 animate-in fade-in slide-in-from-top-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Panel Routing */}
        {activePanel === 'splash' && <SplashScreen />}

        {activePanel === 'showcase' && <ShowcasePanel />}

        {activePanel === 'auth' && <MockAuthGatePanel />}

        {activePanel === 'tenant-dashboard' && <TenantDashboardPanel />}

        {activePanel === 'dispute-center' && <DisputeCenterPanel />}

        {activePanel === 'settings' && <SettingsPrivacyPanel />}

        {activePanel === 'terms' && <CompliantTermsPanel />}

        {activePanel === 'properties' && selectedProperty && (
          <ReviewFeed
            property={selectedProperty}
            reviews={selectedPropertyReviews}
            onBackToProperties={() => {
              setSelectedPropertyId(null);
              setActivePanel('showcase');
            }}
            onOpenSubmitModal={() => {
              setQuickRatePropertyId(selectedProperty.id);
            }}
            onSimulateDisputeSandbox={(reviewId) => {
              setReviewForDisputeId(reviewId);
            }}
            onSimulateTenantRebuttal={(reviewId) => {
              setReviewForRebuttalId(reviewId);
            }}
          />
        )}
      </main>

      {/* Platform Footer */}
      <footer className="mt-16 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-8 text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-neutral-900 dark:text-white">KeJaTrust (NyumbaYangu)</span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span>Republic of Kenya</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                ODPC Registered
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-lg">
              Statutory tenancy protection under Kenya Data Protection Act 2019, Defamation Act (Cap 36 Section 14
              Justification), and Distress for Rent Act (Cap 293 anti-lockout rules).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActivePanel('terms')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Statutory Terms
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statutory Audit Log</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <button
              type="button"
              onClick={() => setActivePanel('settings')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Controls
            </button>
          </div>
        </div>
      </footer>

      {/* Cryptographic Partitioning Log Modal */}
      {lastCryptoPartitionEvent && (
        <CryptographicLogModal
          log={lastCryptoPartitionEvent}
          onClose={dismissCryptoPartitionModal}
        />
      )}

      {/* Statutory Audit Log Modal */}
      {isAuditModalOpen && <AuditLogModal onClose={() => setIsAuditModalOpen(false)} />}

      {/* Review Submission Modal (Quick Rate from Feed) */}
      {quickRatePropertyId && targetQuickRateProperty && (
        <ReviewModal
          property={targetQuickRateProperty}
          onClose={() => setQuickRatePropertyId(null)}
          onSubmit={(payload) => {
            submitReview(payload);
            setQuickRatePropertyId(null);
          }}
        />
      )}

      {/* Landlord Dispute Simulation Modal from Feed */}
      {reviewForDispute && (
        <DisputeSimulationModal
          review={reviewForDispute}
          onClose={() => setReviewForDisputeId(null)}
          onConfirmDispute={(reviewId, obNumber, claimDetails) => {
            fileDispute(reviewId, 'Landlord', 'Managing Landlord', obNumber, claimDetails);
            setReviewForDisputeId(null);
          }}
        />
      )}

      {/* Tenant Rebuttal Modal from Feed */}
      {reviewForRebuttal && (
        <TenantRebuttalModal
          review={reviewForRebuttal}
          onClose={() => setReviewForRebuttalId(null)}
          onConfirmRebuttal={(reviewId, mpesaTransId) => {
            rebutDispute(reviewId, 'M-Pesa Rent & Deposit Receipt', `Safaricom Trans ID: ${mpesaTransId}`);
            setReviewForRebuttalId(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </ErrorBoundary>
  );
}
