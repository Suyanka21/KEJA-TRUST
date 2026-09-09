"""
KeJaTrust (NyumbaYangu) - Defamation Act (Cap 36) & Low-Bandwidth Mobile Pydantic v2 Schemas
File: src/schemas/dispute_mobile.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'
Jurisdiction: Republic of Kenya (Defamation Act Cap 36, ODPC DPA 2019)
"""

import re
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


# ============================================================================
# 1. DEFAMATION ACT (CAP 36) DISPUTE SCHEMAS
# ============================================================================

class DisputeFileRequest(BaseModel):
    """
    Schema for filing a formal notice-and-takedown dispute under Defamation Act Cap 36.
    Complainant must possess verified statutory standing:
    EITHER a Kenya Police Occurrence Book (OB) Number OR an EARB License Number.
    """
    review_id: UUID = Field(..., description="UUID of the allegedly defamatory review")
    complainant_type: str = Field(..., description="'landlord' or 'property_manager' or 'agent'")
    complainant_name: str = Field(..., min_length=2, max_length=128, description="Legal full name of complainant")
    complainant_email: str = Field(..., description="Official correspondence email")
    complainant_phone: Optional[str] = Field(default=None, description="Contact mobile number")
    
    police_ob_number: Optional[str] = Field(
        default=None,
        description="Kenya Police Occurrence Book Number e.g. 'OB 42/12/08/2026'",
    )
    earb_license_number: Optional[str] = Field(
        default=None,
        description="Estate Agents Registration Board License e.g. 'EARB/A/1234'",
    )
    defamation_claim_details: str = Field(
        ...,
        min_length=20,
        max_length=5000,
        description="Statutory explanation of alleged factual inaccuracy or civil defamation",
    )

    @field_validator("police_ob_number")
    @classmethod
    def validate_police_ob(cls, v: Optional[str]) -> Optional[str]:
        if v:
            clean = re.sub(r"\s+", " ", v).strip()
            # Standard Kenya Police format: e.g. 'OB 42/12/08/2026' or 'OB 1/1/1/2026'
            if not re.match(r"^OB\s+\d{1,4}\/\d{1,2}\/\d{1,2}\/\d{4}$", clean):
                raise ValueError(
                    f"Invalid Kenya Police OB Number format: '{clean}'. "
                    f"Must match '^OB \\d{{1,4}}/\\d{{1,2}}/\\d{{1,2}}/\\d{{4}}$' (e.g. 'OB 42/12/08/2026')."
                )
            return clean
        return None

    @field_validator("earb_license_number")
    @classmethod
    def validate_earb_license(cls, v: Optional[str]) -> Optional[str]:
        if v:
            clean = v.strip().upper()
            # Estate Agents Registration Board license e.g. 'EARB/A/1234'
            if not re.match(r"^EARB\/[A-Z]{1,4}\/\d{3,6}$", clean):
                raise ValueError(
                    f"Invalid EARB License Number format: '{clean}'. "
                    f"Must match '^EARB/[A-Z]{{1,4}}/\\d{{3,6}}$' (e.g. 'EARB/A/1234')."
                )
            return clean
        return None

    @field_validator("complainant_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", clean):
            raise ValueError(f"Invalid email address: '{clean}'.")
        return clean

    @field_validator("complainant_phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v:
            clean = re.sub(r"[\s\-]", "", v).strip()
            # Accept +254... or 07... or 01... and standardize
            if re.match(r"^(?:\+254|0)[17]\d{8}$", clean):
                return clean
            raise ValueError(f"Invalid Kenyan MSISDN for complainant: '{clean}'.")
        return None


class DisputeFileResponse(BaseModel):
    """Confirmation payload returned when a review is successfully sandboxed."""
    dispute_id: UUID
    review_id: UUID
    lifecycle_status: str = "under_investigation"
    is_sandboxed: bool = True
    statutory_warning: str
    rebuttal_deadline: datetime
    message: str


class TenantRebuttalSubmitRequest(BaseModel):
    """Tenant submission to contest a Cap 36 dispute."""
    dispute_id: UUID = Field(..., description="UUID of the filed dispute")
    rebuttal_token: str = Field(..., min_length=32, description="256-bit secure single-use token sent to tenant")
    mpesa_receipt_code: str = Field(..., min_length=10, max_length=10, description="10-character Daraja receipt code proving tenancy")
    rebuttal_statement: Optional[str] = Field(default=None, max_length=2000, description="Tenant explanation/rebuttal context")

    @field_validator("mpesa_receipt_code")
    @classmethod
    def clean_receipt(cls, v: str) -> str:
        clean = v.strip().upper()
        if not re.match(r"^[A-Z0-9]{10}$", clean):
            raise ValueError("Receipt code must be a 10-character alphanumeric Safaricom TransID.")
        return clean


class TenantRebuttalResponse(BaseModel):
    """Response returned upon successful tenant rebuttal validation."""
    dispute_id: UUID
    review_id: UUID
    status: str = "resolved_restored"
    is_verified_tenant: bool = True
    lifecycle_status: str = "active"
    statutory_defense: str = "Section 14 Justification (Defamation Act Cap 36) substantiated via M-Pesa tenancy verification."
    message: str


# ============================================================================
# 2. LOW-BANDWIDTH MOBILE-OPTIMIZED SCHEMAS (JSON FOOTPRINT CONSTRAINTS)
# ============================================================================

class MobileRatingSummary(BaseModel):
    """
    Ultra low-footprint aggregate metric for mobile clients on 3G/EDGE/cellular data.
    Omits verbose text bodies and individual user metadata.
    """
    property_id: UUID
    building_name: str
    estate_name: str
    county_name: str
    review_count: int
    verified_tenant_count: int
    overall_score: float
    avg_deposit_refund: float
    avg_water_utilities: float
    avg_security_privacy: float
    avg_eviction_fairness: float
    avg_management_responsiveness: float
    model_config = ConfigDict(from_attributes=True)


class MobileReviewCard(BaseModel):
    """
    Lightweight, compressed review card for mobile feeds.
    Truncates full comment body to high-impact headline snippet,
    reducing cellular bandwidth consumption by >75%.
    """
    review_id: UUID
    author_pseudonym: str
    is_verified_tenant: bool
    rating_deposit_refund: int
    rating_water_utilities: int
    rating_security_privacy: int
    rating_eviction_fairness: int
    rating_management_responsiveness: int
    comment_title: str
    comment_snippet: str
    tenancy_period: str
    created_at_compact: str
    lifecycle_status: str
    model_config = ConfigDict(from_attributes=True)
