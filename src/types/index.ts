export type FrictionVectorKey =
  | 'depositRefund'
  | 'waterUtilities'
  | 'securityPrivacy'
  | 'evictionFairness'
  | 'managementResponsiveness';

export interface FrictionScores {
  depositRefund: number; // 1 to 5
  waterUtilities: number; // 1 to 5
  securityPrivacy: number; // 1 to 5
  evictionFairness: number; // 1 to 5
  managementResponsiveness: number; // 1 to 5
}

export type ReviewLifecycleStatus = 'active' | 'under_investigation' | 'archived_defamatory';

export interface DisputeNotice {
  filedAt: string;
  claimantType: 'Landlord' | 'Managing Agent';
  claimantName: string;
  policeObNumber?: string;
  earbLicenseNumber?: string;
  statutoryRef: string;
  countdownExpiresAt: string; // ISO string 7 days from filing
  groundsSummary: string;
}

export interface Review {
  id: string;
  propertyId: string;
  authorPseudonym: string;
  authorUserId?: string;
  isVerifiedTenant: boolean;
  lifecycleStatus: ReviewLifecycleStatus;
  ratings: FrictionScores;
  commentTitle: string;
  commentText: string;
  monthlyRentPaid?: number;
  houseType?: string;
  tenancyStartYear: number;
  tenancyEndYear?: number;
  mpesaTransId?: string;
  createdAt: string;
  disputeNotice?: DisputeNotice;
}

export interface Property {
  id: string;
  buildingName: string;
  estateName: string;
  countyCode: number;
  countyName: string;
  streetName: string;
  plotNumber?: string;
  landlordOrAgency?: string;
  scores: FrictionScores;
  overallScore: number;
  reviewCount: number;
  verifiedTenantCount: number;
  featuredHouseTypes?: string[];
  depositTerms?: string;
}

export interface KenyaCounty {
  code: number;
  name: string;
  capital: string;
}

export interface ReviewSubmissionPayload {
  propertyId: string;
  ratings: FrictionScores;
  commentTitle: string;
  commentText: string;
  monthlyRentPaid?: number;
  houseType?: string;
  tenancyStartYear: number;
  tenancyEndYear?: number;
  mpesaReceiptCode?: string;
}

export interface SimulatedUser {
  id: string;
  pseudonym: string;
  email: string;
  phone: string;
  identityFingerprint: string; // SHA-256
  encryptedPayload: string; // Simulated AES-256-GCM
  joinedAt: string;
  isMpesaVerified: boolean;
  reviewsCount: number;
}

export interface DisputeTicket {
  id: string;
  reviewId: string;
  propertyId: string;
  propertyName: string;
  claimantType: 'Landlord' | 'Managing Agent';
  claimantName: string;
  policeObNumber?: string;
  earbLicenseNumber?: string;
  grounds: string;
  filedAt: string;
  status: 'under_investigation' | 'rebutted_resolved' | 'archived_defamatory';
  countdownExpiresAt: string;
  rebuttalProof?: string;
  resolvedAt?: string;
}

export interface CryptographicPartitionLog {
  id: string;
  timestamp: string;
  action: 'REGISTRATION' | 'MPESA_VERIFY' | 'DISPUTE_SANDBOX' | 'REBUTTAL_RESOLVED' | 'ODPC_RIGHT_TO_BE_FORGOTTEN';
  pseudonym: string;
  identityFingerprint: string;
  encryptedSnippet: string;
  legalBasis: string;
  details: string;
}

export type ActivePanel =
  | 'splash'
  | 'showcase'
  | 'properties'
  | 'auth'
  | 'tenant-dashboard'
  | 'dispute-center'
  | 'settings'
  | 'terms';
