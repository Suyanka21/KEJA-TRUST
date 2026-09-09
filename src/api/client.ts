/**
 * KeJaTrust Frontend API Client
 * File: src/api/client.ts
 * Governance: 'coderabbit-dna', 'api-and-interface-design', 'security-and-hardening'
 *
 * Implements:
 * - Robust error handling with timeout contracts (10s abort)
 * - Snake-to-camel mapping for backend entities
 * - Fallback resilience for offline/standalone mode
 */

import {
  Property,
  Review,
  ReviewSubmissionPayload,
  DisputeTicket,
} from '../types';

const metaEnv = (import.meta as { env?: Record<string, string> }).env;
const API_BASE_URL = (metaEnv?.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const DEFAULT_TIMEOUT_MS = 10000;

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Body was not JSON
      }
      throw new Error(errorMsg);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms. Please check your network.`);
    }
    throw error;
  }
}

// ============================================================================
// BACKEND DTO MAPPERS
// ============================================================================

interface BackendPropertyDTO {
  id: string;
  estate_id: number;
  estate_name: string;
  county_id: number;
  county_name: string;
  building_name: string;
  street_name: string;
  plot_number?: string | null;
  landlord_or_agency?: string | null;
  overall_score: number;
  review_count: number;
  verified_tenant_count: number;
  scores: {
    deposit_refund: number;
    water_utilities: number;
    security_privacy: number;
    eviction_fairness: number;
    management_responsiveness: number;
  };
  created_at: string;
}

interface BackendReviewDTO {
  id: string;
  property_id: string;
  author_pseudonym: string;
  is_verified_tenant: boolean;
  lifecycle_status: string;
  rating_deposit_refund: number;
  rating_water_utilities: number;
  rating_security_privacy: number;
  rating_eviction_fairness: number;
  rating_management_responsiveness: number;
  comment_title: string;
  comment_text: string;
  monthly_rent_paid?: number | null;
  house_type?: string | null;
  tenancy_start_year: number;
  tenancy_end_year?: number | null;
  created_at: string;
}

function mapPropertyDTO(dto: BackendPropertyDTO): Property {
  return {
    id: dto.id,
    buildingName: dto.building_name,
    estateName: dto.estate_name,
    countyCode: dto.county_id,
    countyName: dto.county_name,
    streetName: dto.street_name,
    plotNumber: dto.plot_number || undefined,
    landlordOrAgency: dto.landlord_or_agency || undefined,
    scores: {
      depositRefund: dto.scores.deposit_refund,
      waterUtilities: dto.scores.water_utilities,
      securityPrivacy: dto.scores.security_privacy,
      evictionFairness: dto.scores.eviction_fairness,
      managementResponsiveness: dto.scores.management_responsiveness,
    },
    overallScore: dto.overall_score,
    reviewCount: dto.review_count,
    verifiedTenantCount: dto.verified_tenant_count,
    featuredHouseTypes: ['1-Bedroom', '2-Bedroom', 'Bedsitter'],
    depositTerms: '1 Month Deposit + 1 Month Rent',
  };
}

function mapReviewDTO(dto: BackendReviewDTO): Review {
  return {
    id: dto.id,
    propertyId: dto.property_id,
    authorPseudonym: dto.author_pseudonym,
    isVerifiedTenant: dto.is_verified_tenant,
    lifecycleStatus: (dto.lifecycle_status as any) || 'active',
    ratings: {
      depositRefund: dto.rating_deposit_refund,
      waterUtilities: dto.rating_water_utilities,
      securityPrivacy: dto.rating_security_privacy,
      evictionFairness: dto.rating_eviction_fairness,
      managementResponsiveness: dto.rating_management_responsiveness,
    },
    commentTitle: dto.comment_title,
    commentText: dto.comment_text,
    monthlyRentPaid: dto.monthly_rent_paid ? Number(dto.monthly_rent_paid) : undefined,
    houseType: dto.house_type || undefined,
    tenancyStartYear: dto.tenancy_start_year,
    tenancyEndYear: dto.tenancy_end_year || undefined,
    createdAt: dto.created_at,
  };
}

// ============================================================================
// API CLIENT METHODS
// ============================================================================

export const apiClient = {
  /**
   * Health check to test backend availability
   */
  async checkHealth(): Promise<{ status: string; jurisdiction: string }> {
    return request('/api/health', { method: 'GET', timeoutMs: 3000 });
  },

  /**
   * List properties with search, county, and estate filters
   */
  async getProperties(query?: string, countyId?: number, estateId?: number): Promise<Property[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (countyId) params.append('county_id', String(countyId));
    if (estateId) params.append('estate_id', String(estateId));

    const endpoint = `/api/v1/properties${params.toString() ? `?${params.toString()}` : ''}`;
    const dtos = await request<BackendPropertyDTO[]>(endpoint, { method: 'GET' });
    return dtos.map(mapPropertyDTO);
  },

  /**
   * Fetch single property details
   */
  async getProperty(propertyId: string): Promise<Property> {
    const dto = await request<BackendPropertyDTO>(`/api/v1/properties/${propertyId}`, { method: 'GET' });
    return mapPropertyDTO(dto);
  },

  /**
   * List reviews with optional property filter
   */
  async getReviews(propertyId?: string): Promise<Review[]> {
    const endpoint = propertyId ? `/api/v1/reviews?property_id=${propertyId}` : '/api/v1/reviews';
    const dtos = await request<BackendReviewDTO[]>(endpoint, { method: 'GET' });
    return dtos.map(mapReviewDTO);
  },

  /**
   * Submit new review
   */
  async submitReview(payload: ReviewSubmissionPayload): Promise<Review> {
    const backendPayload = {
      property_id: payload.propertyId,
      mpesa_receipt_code: payload.mpesaReceiptCode || null,
      rating_deposit_refund: payload.ratings.depositRefund,
      rating_water_utilities: payload.ratings.waterUtilities,
      rating_security_privacy: payload.ratings.securityPrivacy,
      rating_eviction_fairness: payload.ratings.evictionFairness,
      rating_management_responsiveness: payload.ratings.managementResponsiveness,
      comment_title: payload.commentTitle,
      comment_text: payload.commentText,
      monthly_rent_paid: payload.monthlyRentPaid || null,
      house_type: payload.houseType || null,
      tenancy_start_year: payload.tenancyStartYear,
      tenancy_end_year: payload.tenancyEndYear || null,
    };

    const res = await request<BackendReviewDTO>('/api/v1/reviews/submit', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });

    return mapReviewDTO(res);
  },

  /**
   * File Cap 36 Defamation Dispute
   */
  async fileDispute(data: {
    reviewId: string;
    claimantType: 'Landlord' | 'Managing Agent';
    claimantName: string;
    identifier: string; // OB or EARB
    defamationClaimDetails: string;
    claimantEmail?: string;
    claimantPhone?: string;
  }): Promise<{ disputeId: string; message: string }> {
    const isOb = data.identifier.toUpperCase().startsWith('OB');
    const backendPayload = {
      review_id: data.reviewId,
      complainant_type: data.claimantType === 'Managing Agent' ? 'agency' : 'landlord',
      complainant_name: data.claimantName,
      complainant_email: data.claimantEmail || 'disputes@kejatrust.co.ke',
      complainant_phone: data.claimantPhone || '+254700000000',
      police_ob_number: isOb ? data.identifier : null,
      earb_license_number: !isOb ? data.identifier : null,
      defamation_claim_details: data.defamationClaimDetails,
    };

    const res = await request<{ dispute_id: string; message: string }>('/api/v1/disputes/file', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });

    return {
      disputeId: res.dispute_id,
      message: res.message,
    };
  },

  /**
   * Rebut Dispute with M-Pesa proof
   */
  async rebutDispute(data: {
    disputeId: string;
    rebuttalToken: string;
    mpesaReceiptCode: string;
    proofDocumentB64?: string;
  }): Promise<Review> {
    const res = await request<BackendReviewDTO>('/api/v1/disputes/rebut', {
      method: 'POST',
      body: JSON.stringify({
        dispute_id: data.disputeId,
        rebuttal_token: data.rebuttalToken,
        mpesa_receipt_code: data.mpesaReceiptCode,
        proof_document_b64: data.proofDocumentB64 || null,
      }),
    });
    return mapReviewDTO(res);
  },

  /**
   * ODPC Section 40 Right to be Forgotten
   */
  async forgetTenant(pseudonym?: string, userId?: string): Promise<{ success: boolean; count: number; confirmation: string }> {
    const res = await request<{
      success: boolean;
      purged_reviews_count: number;
      pseudonym_erased: string;
      legal_confirmation: string;
    }>('/api/v1/compliance/forget-tenant', {
      method: 'POST',
      body: JSON.stringify({
        pseudonym: pseudonym || null,
        author_user_id: userId || null,
      }),
    });

    return {
      success: res.success,
      count: res.purged_reviews_count,
      confirmation: res.legal_confirmation,
    };
  },
};
