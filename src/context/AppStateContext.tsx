import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Property,
  Review,
  SimulatedUser,
  DisputeTicket,
  CryptographicPartitionLog,
  ActivePanel,
  ReviewSubmissionPayload,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_DISPUTES,
  INITIAL_CRYPTO_LOGS,
} from '../data/kenyaData';
import {
  generateSha256Fingerprint,
  generateAesPayload,
  generatePseudonym,
  validateKenyaPoliceOb,
  validateEarbLicense,
  validateMpesaCode,
} from '../utils/cryptoSim';
import { apiClient } from '../api/client';

interface AppStateContextType {
  // Collections
  properties: Property[];
  reviews: Review[];
  users: SimulatedUser[];
  disputes: DisputeTicket[];
  cryptoLogs: CryptographicPartitionLog[];

  // Backend Connectivity
  isBackendConnected: boolean;
  isLoadingBackend: boolean;
  
  // Active session
  currentUser: SimulatedUser | null;
  activePanel: ActivePanel;
  selectedPropertyId: string | null;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  openAuth: (mode?: 'login' | 'register') => void;
  
  // App preferences
  darkMode: boolean;
  dataSaverMode: boolean;
  
  // Notifications & Crypto Modal
  toastMessage: string | null;
  lastCryptoPartitionEvent: CryptographicPartitionLog | null;
  dismissCryptoPartitionModal: () => void;
  showToast: (msg: string) => void;
  
  // Navigation & Panel Setters
  setActivePanel: (panel: ActivePanel) => void;
  setSelectedPropertyId: (id: string | null) => void;
  toggleDarkMode: () => void;
  toggleDataSaverMode: () => void;
  
  // Auth & Onboarding Actions
  registerUser: (pseudonym: string, email: string, phone: string) => SimulatedUser;
  loginUser: (userIdOrPseudonym: string) => boolean;
  logoutUser: () => void;
  switchPersona: (userId: string) => void;
  
  // Tenant Dashboard Actions
  submitReview: (payload: ReviewSubmissionPayload) => Review;
  
  // Landlord Dispute Center Actions
  fileDispute: (
    reviewId: string,
    claimantType: 'Landlord' | 'Managing Agent',
    claimantName: string,
    identifier: string, // OB number or EARB license
    grounds: string
  ) => boolean;
  rebutDispute: (reviewId: string, proofType: string, proofDetails: string) => boolean;
  
  // ODPC Right to be Forgotten
  rightToBeForgotten: (userId: string) => void;
  
  // Demo data reset
  resetToDefaults: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Local state initialized with seeds
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('kejatrust_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kejatrust_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [users, setUsers] = useState<SimulatedUser[]>(() => {
    const saved = localStorage.getItem('kejatrust_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [disputes, setDisputes] = useState<DisputeTicket[]>(() => {
    const saved = localStorage.getItem('kejatrust_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [cryptoLogs, setCryptoLogs] = useState<CryptographicPartitionLog[]>(() => {
    const saved = localStorage.getItem('kejatrust_crypto_logs');
    return saved ? JSON.parse(saved) : INITIAL_CRYPTO_LOGS;
  });

  // Active user session (defaults to null for Guest View as requested)
  const [currentUser, setCurrentUser] = useState<SimulatedUser | null>(() => {
    const savedId = localStorage.getItem('kejatrust_current_user_id');
    if (savedId) {
      const match = INITIAL_USERS.find((u) => u.id === savedId);
      return match || null;
    }
    return null; // Defaults to null/guest
  });

  const [activePanel, setActivePanelState] = useState<ActivePanel>(() => {
    return currentUser ? 'showcase' : 'splash';
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setActivePanelState('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Settings
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kejatrust_theme') === 'dark';
  });

  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => {
    return localStorage.getItem('kejatrust_data_saver') === 'true';
  });

  // Notification Toast & Partition Modal
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCryptoPartitionEvent, setLastCryptoPartitionEvent] = useState<CryptographicPartitionLog | null>(null);

  // Backend Live Connectivity State
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true);

  // Initial Sync with FastAPI Backend
  useEffect(() => {
    let isMounted = true;
    async function syncBackendData() {
      try {
        setIsLoadingBackend(true);
        const health = await apiClient.checkHealth();
        if (health && health.status === 'operational') {
          if (!isMounted) return;
          setIsBackendConnected(true);

          const liveProps = await apiClient.getProperties();
          if (liveProps && liveProps.length > 0 && isMounted) {
            setProperties(liveProps);
          }

          const liveReviews = await apiClient.getReviews();
          if (liveReviews && liveReviews.length > 0 && isMounted) {
            setReviews(liveReviews);
          }
        }
      } catch {
        if (isMounted) setIsBackendConnected(false);
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    }
    syncBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kejatrust_properties', JSON.stringify(properties));
    } catch {}
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('kejatrust_reviews', JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('kejatrust_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('kejatrust_disputes', JSON.stringify(disputes));
    } catch {}
  }, [disputes]);

  useEffect(() => {
    try {
      localStorage.setItem('kejatrust_crypto_logs', JSON.stringify(cryptoLogs));
    } catch {}
  }, [cryptoLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kejatrust_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('kejatrust_current_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kejatrust_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('kejatrust_data_saver', dataSaverMode ? 'true' : 'false');
  }, [dataSaverMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const dismissCryptoPartitionModal = () => {
    setLastCryptoPartitionEvent(null);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleDataSaverMode = () => {
    setDataSaverMode((prev) => {
      const next = !prev;
      showToast(next ? 'Data Saver Enabled: Visual bars converted to raw metrics.' : 'Data Saver Disabled.');
      return next;
    });
  };

  const setActivePanel = (panel: ActivePanel) => {
    setActivePanelState(panel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth: Register tenant with cryptographic partitioning log (Panel 2)
  const registerUser = (pseudonym: string, email: string, phone: string): SimulatedUser => {
    const rawPii = `${email.trim().toLowerCase()}::${phone.trim()}`;
    const identityFingerprint = generateSha256Fingerprint(rawPii);
    const encryptedPayload = generateAesPayload(email, phone);
    const finalPseudonym = pseudonym.trim() || generatePseudonym();

    // Security & ODPC Kenya DPA 2019: Mask email and phone to prevent raw PII in plaintext localStorage
    const maskedEmail = `${email.slice(0, 2)}***@${email.split('@')[1] || '***'}`;
    const maskedPhone = `+254***${phone.slice(-3)}`;

    const newUser: SimulatedUser = {
      id: `usr-${Date.now()}`,
      pseudonym: finalPseudonym,
      email: maskedEmail,
      phone: maskedPhone,
      identityFingerprint,
      encryptedPayload,
      joinedAt: new Date().toISOString(),
      isMpesaVerified: false,
      reviewsCount: 0,
    };

    const newLog: CryptographicPartitionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REGISTRATION',
      pseudonym: finalPseudonym,
      identityFingerprint,
      encryptedSnippet: encryptedPayload.slice(0, 36) + '...',
      legalBasis: 'Privacy-First Cryptographic Partitioning & Anonymity Shield',
      details: `Raw PII (${maskedEmail}, ${maskedPhone}) transformed into irreversible SHA-256 fingerprint [${identityFingerprint.slice(0, 12)}...]. AES-256-GCM enclave generated. Zero cleartext PII stored.`,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCryptoLogs((prev) => [newLog, ...prev]);
    setLastCryptoPartitionEvent(newLog);
    setActivePanelState('showcase');

    showToast(`Welcome, ${finalPseudonym}! Identity cryptographically secured & 100% anonymous.`);
    return newUser;
  };

  const loginUser = (userIdOrPseudonym: string): boolean => {
    const match = users.find(
      (u) =>
        u.id === userIdOrPseudonym ||
        u.pseudonym.toLowerCase() === userIdOrPseudonym.trim().toLowerCase() ||
        u.email.toLowerCase() === userIdOrPseudonym.trim().toLowerCase()
    );
    if (match) {
      setCurrentUser(match);
      setActivePanelState('showcase');
      showToast(`Logged in as ${match.pseudonym}.`);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    const name = currentUser?.pseudonym || 'User';
    setCurrentUser(null);
    setActivePanelState('splash');
    showToast(`Logged out of ${name} session.`);
  };

  const switchPersona = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActivePanelState('showcase');
      showToast(`Switched active session to ${target.pseudonym}.`);
    }
  };

  // Submit Review (Panel 3)
  const submitReview = (payload: ReviewSubmissionPayload): Review => {
    // 1. Prevent duplicate reviews per user per property (Audit finding [13])
    if (currentUser) {
      const existing = reviews.find(
        (r) => r.propertyId === payload.propertyId && r.authorUserId === currentUser.id
      );
      if (existing) {
        const errMsg = 'Duplicate Review Blocked: You have already submitted a review for this property.';
        showToast(errMsg);
        throw new Error(errMsg);
      }
    }

    // 2. Validate rating bounds (1 to 5) (Audit finding [12] & Gate 1)
    const ratingKeys = [
      'depositRefund',
      'waterUtilities',
      'securityPrivacy',
      'evictionFairness',
      'managementResponsiveness',
    ] as const;
    for (const key of ratingKeys) {
      const val = payload.ratings[key];
      if (typeof val !== 'number' || val < 1 || val > 5) {
        const errMsg = `Rating for ${String(key)} must be an integer between 1 and 5.`;
        showToast(errMsg);
        throw new Error(errMsg);
      }
    }

    // 3. Validate comment length bounds (Gate 1)
    if (!payload.commentTitle || payload.commentTitle.trim().length < 4) {
      const errMsg = 'Review headline must be at least 4 characters.';
      showToast(errMsg);
      throw new Error(errMsg);
    }
    if (!payload.commentText || payload.commentText.trim().length < 20) {
      const errMsg = 'Review details must be at least 20 characters.';
      showToast(errMsg);
      throw new Error(errMsg);
    }

    const hasValidMpesa = Boolean(
      payload.mpesaReceiptCode && validateMpesaCode(payload.mpesaReceiptCode)
    );
    
    // Determine pseudonym
    let authorPseudonym = currentUser?.pseudonym;
    if (!authorPseudonym) {
      const targetProp = properties.find((p) => p.id === payload.propertyId);
      authorPseudonym = generatePseudonym(targetProp?.estateName || 'Kenya');
    }

    // Collision-proof UUID generation (Scenario 3)
    const reviewId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? `rev-${crypto.randomUUID()}`
      : `rev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newReview: Review = {
      id: reviewId,
      propertyId: payload.propertyId,
      authorPseudonym,
      authorUserId: currentUser?.id,
      isVerifiedTenant: hasValidMpesa,
      lifecycleStatus: 'active',
      ratings: payload.ratings,
      commentTitle: payload.commentTitle.trim(),
      commentText: payload.commentText.trim(),
      monthlyRentPaid: payload.monthlyRentPaid,
      houseType: payload.houseType,
      tenancyStartYear: payload.tenancyStartYear,
      tenancyEndYear: payload.tenancyEndYear,
      mpesaTransId: hasValidMpesa ? payload.mpesaReceiptCode?.trim().toUpperCase() : undefined,
      createdAt: new Date().toISOString(),
    };

    // Prepend to reviews
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate property averages
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== payload.propertyId) return prop;
        const currentPropReviews = [newReview, ...reviews.filter((r) => r.propertyId === prop.id)];
        const total = currentPropReviews.length;

        const sumDeposit = currentPropReviews.reduce((acc, r) => acc + r.ratings.depositRefund, 0);
        const sumWater = currentPropReviews.reduce((acc, r) => acc + r.ratings.waterUtilities, 0);
        const sumSecurity = currentPropReviews.reduce((acc, r) => acc + r.ratings.securityPrivacy, 0);
        const sumEviction = currentPropReviews.reduce((acc, r) => acc + r.ratings.evictionFairness, 0);
        const sumManagement = currentPropReviews.reduce((acc, r) => acc + r.ratings.managementResponsiveness, 0);

        const newScores = {
          depositRefund: parseFloat((sumDeposit / total).toFixed(1)),
          waterUtilities: parseFloat((sumWater / total).toFixed(1)),
          securityPrivacy: parseFloat((sumSecurity / total).toFixed(1)),
          evictionFairness: parseFloat((sumEviction / total).toFixed(1)),
          managementResponsiveness: parseFloat((sumManagement / total).toFixed(1)),
        };

        const overall = parseFloat(
          (
            (newScores.depositRefund +
              newScores.waterUtilities +
              newScores.securityPrivacy +
              newScores.evictionFairness +
              newScores.managementResponsiveness) /
            5
          ).toFixed(1)
        );

        return {
          ...prop,
          scores: newScores,
          overallScore: overall,
          reviewCount: total,
          verifiedTenantCount: hasValidMpesa ? prop.verifiedTenantCount + 1 : prop.verifiedTenantCount,
        };
      })
    );

    // Update user stats if logged in
    if (currentUser) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              reviewsCount: u.reviewsCount + 1,
              isMpesaVerified: hasValidMpesa || u.isMpesaVerified,
            };
          }
          return u;
        })
      );
    }

    // Log cryptographic event
    if (hasValidMpesa) {
      const cryptoLog: CryptographicPartitionLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'MPESA_VERIFY',
        pseudonym: authorPseudonym,
        identityFingerprint: currentUser?.identityFingerprint || generateSha256Fingerprint(authorPseudonym),
        encryptedSnippet: `Daraja:Receipt[${payload.mpesaReceiptCode?.trim().toUpperCase()}]`,
        legalBasis: 'Safaricom Daraja Verification & Tenant Authenticity Shield',
        details: `Daraja validation matched 10-char receipt ${payload.mpesaReceiptCode}. Promoted review to Gold Verified Renter Badge.`,
      };
      setCryptoLogs((prev) => [cryptoLog, ...prev]);
    }

    // Synchronize asynchronously with FastAPI Backend Ledger
    apiClient.submitReview(payload)
      .then((serverReview) => {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? serverReview : r)));
        showToast('Review confirmed and synchronized with KeJaTrust backend ledger.');
      })
      .catch((err) => {
        // Log gracefully; review is already active locally
        console.warn('Backend sync notice (offline mode fallback):', err.message);
      });

    showToast(
      hasValidMpesa
        ? `Review published with Gold Verified Renter Badge! M-Pesa receipt validated.`
        : `Review published anonymously as ${authorPseudonym}.`
    );

    return newReview;
  };

  // Landlord Dispute Filing (Panel 4)
  const fileDispute = (
    reviewId: string,
    claimantType: 'Landlord' | 'Managing Agent',
    claimantName: string,
    identifier: string,
    grounds: string
  ): boolean => {
    const isOb = validateKenyaPoliceOb(identifier);
    const isEarb = validateEarbLicense(identifier);

    if (!isOb && !isEarb) {
      showToast('Validation Error: Must provide either a valid Kenya Police OB number (e.g. OB 42/02/09/2026) or EARB license.');
      return false;
    }

    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) {
      showToast('Review not found.');
      return false;
    }

    const targetProp = properties.find((p) => p.id === targetReview.propertyId);
    const countdownExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const ticketId = `disp-${Date.now()}`;
    const newDispute: DisputeTicket = {
      id: ticketId,
      reviewId,
      propertyId: targetReview.propertyId,
      propertyName: targetProp?.buildingName || 'Kenyan Property',
      claimantType,
      claimantName: claimantName.trim(),
      policeObNumber: isOb ? identifier.trim() : undefined,
      earbLicenseNumber: isEarb ? identifier.trim() : undefined,
      grounds: grounds.trim(),
      filedAt: new Date().toISOString(),
      countdownExpiresAt,
      status: 'under_investigation',
    };

    // Transition review to 'under_investigation'
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          lifecycleStatus: 'under_investigation',
          disputeNotice: {
            filedAt: new Date().toISOString(),
            claimantType,
            claimantName: claimantName.trim(),
            policeObNumber: isOb ? identifier.trim() : undefined,
            earbLicenseNumber: isEarb ? identifier.trim() : undefined,
            statutoryRef: `Formal Dispute Filed with ${identifier.trim()} · 7-Day Fact-Check Window Open`,
            countdownExpiresAt,
            groundsSummary: grounds.trim(),
          },
        };
      })
    );

    setDisputes((prev) => [newDispute, ...prev]);

    // Asynchronously dispatch dispute to FastAPI backend
    apiClient.fileDispute({
      reviewId,
      claimantType,
      claimantName,
      identifier,
      defamationClaimDetails: grounds,
    }).catch((err) => console.warn('Backend dispute sync notice:', err.message));

    // Append cryptographic audit log
    const cryptoLog: CryptographicPartitionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DISPUTE_SANDBOX',
      pseudonym: targetReview.authorPseudonym,
      identityFingerprint: targetReview.authorUserId
        ? users.find((u) => u.id === targetReview.authorUserId)?.identityFingerprint || 'unknown'
        : generateSha256Fingerprint(targetReview.authorPseudonym),
      encryptedSnippet: `DisputeNotice:[${identifier.trim()}]`,
      legalBasis: 'Fair Review Dispute Protocol & Fact-Checking Process',
      details: `Formal dispute lodged by ${claimantName} (${claimantType}) with ref ${identifier}. Review ${reviewId} transitioned to 'under_investigation'. Fact-check initiated with 7-day tenant rebuttal window.`,
    };
    setCryptoLogs((prev) => [cryptoLog, ...prev]);

    showToast(`Dispute lodged! Review ${reviewId} moved to fact-check queue for 7 days.`);
    return true;
  };

  // Rebuttal Simulation: Tenant uploads proof/lease/M-Pesa to restore review with Gold Badge
  const rebutDispute = (reviewId: string, proofType: string, proofDetails: string): boolean => {
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return false;

    // Restore review to active + Gold verified
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          lifecycleStatus: 'active',
          isVerifiedTenant: true,
          mpesaTransId: r.mpesaTransId || `REB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          disputeNotice: undefined,
        };
      })
    );

    // Mark dispute resolved
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.reviewId !== reviewId) return d;
        return {
          ...d,
          status: 'rebutted_resolved',
          resolvedAt: new Date().toISOString(),
          rebuttalProof: `${proofType}: ${proofDetails}`,
        };
      })
    );

    // Cryptographic audit entry
    const cryptoLog: CryptographicPartitionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REBUTTAL_RESOLVED',
      pseudonym: targetReview.authorPseudonym,
      identityFingerprint: generateSha256Fingerprint(targetReview.authorPseudonym),
      encryptedSnippet: `RebuttalDocHash:${Math.random().toString(16).substring(2, 14)}`,
      legalBasis: 'Verified Tenant Truth Defence (M-Pesa Verified)',
      details: `Tenant submitted valid tenancy proof (${proofType}). Truth and public benefit established. Temporary flag lifted; review restored with permanent Gold Verified Badge.`,
    };
    setCryptoLogs((prev) => [cryptoLog, ...prev]);

    showToast('Rebuttal Accepted! Tenant verified. Review restored with Gold Badge.');
    return true;
  };

  // Right to be Forgotten / Data Erasure
  const rightToBeForgotten = (userId: string) => {
    const userToPurge = users.find((u) => u.id === userId);
    if (!userToPurge) return;

    const pseudonym = userToPurge.pseudonym;
    const fingerprint = userToPurge.identityFingerprint;

    // Purge user from users collection
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // Remove all reviews authored by this user locally from fresh state
    const updatedReviews = reviews.filter(
      (r) => r.authorUserId !== userId && r.authorPseudonym !== pseudonym
    );
    setReviews(updatedReviews);

    // Asynchronously dispatch statutory erasure to FastAPI backend (HIGH-14)
    apiClient.forgetTenant(pseudonym, userId)
      .then((res) => {
        showToast(`Privacy Erasure: ${res.count} reviews permanently removed from server ledger.`);
      })
      .catch((err) => {
        console.warn('Backend erasure sync notice:', err.message);
      });

    // Recalculate all property counts and scores from freshly computed reviews (Fix finding [14])
    setProperties((prev) =>
      prev.map((prop) => {
        const propActiveReviews = updatedReviews.filter(
          (r) => r.propertyId === prop.id && r.lifecycleStatus === 'active'
        );
        const total = propActiveReviews.length;
        if (total === 0) {
          return {
            ...prop,
            reviewCount: 0,
            overallScore: 0,
            verifiedTenantCount: 0,
            scores: {
              depositRefund: 0,
              waterUtilities: 0,
              securityPrivacy: 0,
              evictionFairness: 0,
              managementResponsiveness: 0,
            },
          };
        }
        const sumDeposit = propActiveReviews.reduce((acc, r) => acc + r.ratings.depositRefund, 0);
        const sumWater = propActiveReviews.reduce((acc, r) => acc + r.ratings.waterUtilities, 0);
        const sumSecurity = propActiveReviews.reduce((acc, r) => acc + r.ratings.securityPrivacy, 0);
        const sumEviction = propActiveReviews.reduce((acc, r) => acc + r.ratings.evictionFairness, 0);
        const sumManagement = propActiveReviews.reduce((acc, r) => acc + r.ratings.managementResponsiveness, 0);

        const newScores = {
          depositRefund: parseFloat((sumDeposit / total).toFixed(1)),
          waterUtilities: parseFloat((sumWater / total).toFixed(1)),
          securityPrivacy: parseFloat((sumSecurity / total).toFixed(1)),
          evictionFairness: parseFloat((sumEviction / total).toFixed(1)),
          managementResponsiveness: parseFloat((sumManagement / total).toFixed(1)),
        };

        const overall = parseFloat(
          (
            (newScores.depositRefund +
              newScores.waterUtilities +
              newScores.securityPrivacy +
              newScores.evictionFairness +
              newScores.managementResponsiveness) /
            5
          ).toFixed(1)
        );

        return {
          ...prop,
          scores: newScores,
          overallScore: overall,
          reviewCount: total,
          verifiedTenantCount: propActiveReviews.filter((r) => r.isVerifiedTenant).length,
        };
      })
    );

    // Disconnect active user session
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }

    // Append immutable erasure audit record
    const auditRecord: CryptographicPartitionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DATA_ERASURE',
      pseudonym,
      identityFingerprint: fingerprint,
      encryptedSnippet: 'PURGED_ZERO_FILL',
      legalBasis: 'Privacy Protection & Data Erasure Protocol',
      details: `User [${pseudonym}] requested complete data erasure. All personal contact info, encrypted vectors, and ${userToPurge.reviewsCount} authored reviews permanently purged from local state.`,
    };
    setCryptoLogs((prev) => [auditRecord, ...prev]);

    showToast(`Data Erasure Complete: All account data and reviews for ${pseudonym} permanently purged.`);
    setActivePanelState('splash');
  };

  // Reset demo data
  const resetToDefaults = () => {
    localStorage.removeItem('kejatrust_properties');
    localStorage.removeItem('kejatrust_reviews');
    localStorage.removeItem('kejatrust_users');
    localStorage.removeItem('kejatrust_disputes');
    localStorage.removeItem('kejatrust_crypto_logs');
    localStorage.removeItem('kejatrust_current_user_id');

    setProperties(INITIAL_PROPERTIES);
    setReviews(INITIAL_REVIEWS);
    setUsers(INITIAL_USERS);
    setDisputes(INITIAL_DISPUTES);
    setCryptoLogs(INITIAL_CRYPTO_LOGS);
    setCurrentUser(null);
    setSelectedPropertyId(null);
    setActivePanelState('splash');
    showToast('Mock workspace reset to initial Kenya seeds.');
  };

  const value = useMemo(
    () => ({
      properties,
      reviews,
      users,
      disputes,
      cryptoLogs,
      currentUser,
      activePanel,
      selectedPropertyId,
      authMode,
      setAuthMode,
      openAuth,
      darkMode,
      dataSaverMode,
      toastMessage,
      lastCryptoPartitionEvent,
      dismissCryptoPartitionModal,
      showToast,
      setActivePanel,
      setSelectedPropertyId,
      toggleDarkMode,
      toggleDataSaverMode,
      registerUser,
      loginUser,
      logoutUser,
      switchPersona,
      submitReview,
      fileDispute,
      rebutDispute,
      rightToBeForgotten,
      resetToDefaults,
      isBackendConnected,
      isLoadingBackend,
    }),
    [
      properties,
      reviews,
      users,
      disputes,
      cryptoLogs,
      currentUser,
      activePanel,
      selectedPropertyId,
      authMode,
      darkMode,
      dataSaverMode,
      toastMessage,
      lastCryptoPartitionEvent,
      isBackendConnected,
      isLoadingBackend,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
