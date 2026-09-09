"""
KeJaTrust (NyumbaYangu) - Daraja M-Pesa & Review Pydantic v2 Schemas
File: src/schemas/mpesa_review.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'
"""

import re
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


# ============================================================================
# 1. SAFARICOM DARAJA C2B WEBHOOK SCHEMAS
# ============================================================================

class DarajaC2BWebhookPayload(BaseModel):
    """
    Safaricom Daraja C2B Confirmation Webhook Payload.
    Validates regex specifications for TransID, MSISDN, and temporal gating.
    """
    TransactionType: str = Field(..., description="Pay Bill or Customer Pay Bill")
    TransID: str = Field(..., description="10 alphanumeric characters receipt code")
    TransTime: str = Field(..., description="Timestamp format YYYYMMDDHHMMSS e.g. 20260908123000")
    TransAmount: str = Field(..., description="Numeric decimal string amount paid e.g. '35000.00'")
    BusinessShortCode: str = Field(..., description="Paybill / Till shortcode e.g. '600123'")
    BillRefNumber: str = Field(..., description="Account number / Property identifier")
    InvoiceNumber: Optional[str] = None
    OrgAccountBalance: Optional[str] = None
    ThirdPartyTransID: Optional[str] = None
    MSISDN: str = Field(..., description="Kenyan mobile number e.g. 254712345678 or 254110123456")
    FirstName: Optional[str] = None
    MiddleName: Optional[str] = None
    LastName: Optional[str] = None

    @field_validator("TransID")
    @classmethod
    def validate_trans_id(cls, v: str) -> str:
        clean = v.strip().upper()
        if not re.match(r"^[A-Z0-9]{10}$", clean):
            raise ValueError(f"Invalid Daraja TransID format: '{clean}'. Must be exactly 10 alphanumeric characters.")
        return clean

    @field_validator("MSISDN")
    @classmethod
    def validate_msisdn(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^254(?:7|1)\d{8}$", clean):
            raise ValueError(f"Invalid Kenyan MSISDN format: '{clean}'. Must match ^254[17]\\d{{8}}$.")
        return clean

    @field_validator("TransAmount")
    @classmethod
    def validate_trans_amount(cls, v: str) -> str:
        try:
            amt = Decimal(v.strip())
            if amt <= 0:
                raise ValueError("Transaction amount must be strictly greater than 0.")
        except Exception:
            raise ValueError(f"Invalid numeric TransAmount: '{v}'.")
        return v.strip()

    @field_validator("TransTime")
    @classmethod
    def validate_trans_time(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^\d{14}$", clean):
            raise ValueError(f"TransTime '{clean}' must be 14 numeric digits (YYYYMMDDHHMMSS).")
        return clean


class DarajaWebhookResponse(BaseModel):
    """Standard response contract expected by Safaricom Daraja API."""
    ResultCode: int = 0
    ResultDesc: str = "Confirmation received successfully"


class MpesaVerificationRecord(BaseModel):
    """Internal representation of a verified lease record."""
    id: UUID
    property_id: UUID
    method: str
    verification_token_hash: str
    rent_paid_recorded: Decimal
    status: str
    verified_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 2. REVIEW INGESTION & ANONYMITY SCHEMAS
# ============================================================================

class ReviewCreateRequest(BaseModel):
    """
    Schema for submitting a tenant property review.
    Enforces 5 Kenyan rental friction vectors strictly bounded between 1 and 5.
    Contains zero cleartext PII.
    """
    property_id: UUID = Field(..., description="UUID of target property being rated")
    mpesa_receipt_code: Optional[str] = Field(None, description="Optional Daraja TransID for instant Gold Badge verification")

    # 5 Kenyan Rental Friction Rating Vectors (1-5 strictly bounded)
    rating_deposit_refund: int = Field(..., ge=1, le=5, description="1=Unlawful retention/denied, 5=Full refund prompt")
    rating_water_utilities: int = Field(..., ge=1, le=5, description="1=Dry taps/cartels, 5=Continuous, clean supply")
    rating_security_privacy: int = Field(..., ge=1, le=5, description="1=Frequent break-ins/caretaker intrusion, 5=Secure, respectful")
    rating_eviction_fairness: int = Field(..., ge=1, le=5, description="1=Arbitrary lockout/gate locking, 5=Legal notices, fair")
    rating_management_responsiveness: int = Field(..., ge=1, le=5, description="1=Hostile caretaker/silent landlord, 5=Proactive repairs")

    comment_title: str = Field(..., min_length=4, max_length=255, description="Review headline summarizing tenancy experience")
    comment_text: str = Field(..., min_length=20, max_length=5000, description="Detailed qualitative feedback")

    monthly_rent_paid: Optional[Decimal] = Field(None, gt=0, description="Monthly rent in KES")
    house_type: Optional[str] = Field(None, max_length=64, description="e.g. Bedsitter, 1-bedroom, 2-bedroom")
    tenancy_start_year: int = Field(..., ge=2000, le=2030)
    tenancy_end_year: Optional[int] = Field(None, ge=2000, le=2030)

    @field_validator("mpesa_receipt_code")
    @classmethod
    def clean_receipt(cls, v: Optional[str]) -> Optional[str]:
        if v:
            clean = v.strip().upper()
            if not re.match(r"^[A-Z0-9]{10}$", clean):
                raise ValueError("Receipt code must be a 10-character alphanumeric Safaricom TransID.")
            return clean
        return None

    @field_validator("comment_title", "comment_text")
    @classmethod
    def strip_and_clean(cls, v: str) -> str:
        return re.sub(r"\s+", " ", v).strip()


class ReviewPublicResponse(BaseModel):
    """
    Strictly sanitized public projection of a review.
    Zero-knowledge guarantee: Real identities, emails, and phone numbers are absent.
    """
    id: UUID
    property_id: UUID
    author_pseudonym: str
    is_verified_tenant: bool
    lifecycle_status: str

    rating_deposit_refund: int
    rating_water_utilities: int
    rating_security_privacy: int
    rating_eviction_fairness: int
    rating_management_responsiveness: int

    comment_title: str
    comment_text: str
    monthly_rent_paid: Optional[Decimal] = None
    house_type: Optional[str] = None
    tenancy_start_year: int
    tenancy_end_year: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 3. LEASE DOCUMENT OCR SCHEMAS (SIMULATED PIPELINE)
# ============================================================================

class LeaseDocumentParseResult(BaseModel):
    """Result returned by the simulated LeaseDocumentOCR engine."""
    success: bool
    confidence_score: float
    extracted_landlord_name: Optional[str] = None
    extracted_tenant_pseudonym_hint: Optional[str] = None
    extracted_building_name: Optional[str] = None
    extracted_street_name: Optional[str] = None
    extracted_rent_amount: Optional[Decimal] = None
    tenancy_start_date: Optional[str] = None
    tenancy_end_date: Optional[str] = None
    extraction_notes: str
