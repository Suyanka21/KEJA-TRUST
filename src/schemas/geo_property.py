"""
KeJaTrust (NyumbaYangu) - Geographic & Property Pydantic v2 Schemas
File: src/schemas/geo_property.py
Governance: 'coderabbit-dna', 'security-and-hardening'
"""

import re
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CountyResponse(BaseModel):
    """Schema for returning Kenyan county entities."""
    id: int = Field(..., ge=1, le=47, description="Official county code (1-47)")
    name: str = Field(..., max_length=64, description="County name (e.g., Nairobi, Mombasa)")
    code: int = Field(..., ge=1, le=47)

    model_config = ConfigDict(from_attributes=True)


class EstateCreate(BaseModel):
    """Schema for registering a new estate/neighborhood."""
    county_id: int = Field(..., ge=1, le=47)
    name: str = Field(..., min_length=2, max_length=128)
    sub_county: Optional[str] = Field(None, max_length=128)


class EstateResponse(BaseModel):
    """Schema for returning estate listings."""
    id: int
    county_id: int
    name: str
    sub_county: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PropertyCreate(BaseModel):
    """
    Schema for registering a residential or commercial property.
    Validates building name, estate affiliation, and street location.
    """
    estate_id: int = Field(..., gt=0, description="Foreign key ID of the validated estate")
    building_name: str = Field(..., min_length=2, max_length=255, description="Full name of apartment or building")
    street_name: str = Field(..., min_length=2, max_length=255, description="Street or road name")
    plot_number: Optional[str] = Field(None, max_length=128, description="Cadastral plot number e.g. LR 209/12345")
    landlord_or_agency: Optional[str] = Field(None, max_length=255, description="Managing agent, agency, or landlord identifier")

    @field_validator("building_name", "street_name")
    @classmethod
    def clean_whitespace(cls, v: str) -> str:
        cleaned = re.sub(r"\s+", " ", v).strip()
        if len(cleaned) < 2:
            raise ValueError("String value must contain at least 2 non-whitespace characters.")
        return cleaned

    @field_validator("plot_number")
    @classmethod
    def validate_plot_number(cls, v: Optional[str]) -> Optional[str]:
        if v:
            cleaned = re.sub(r"\s+", " ", v).strip()
            return cleaned
        return v


class PropertyResponse(BaseModel):
    """Schema for returning registered property entities."""
    id: UUID
    estate_id: int
    building_name: str
    street_name: str
    plot_number: Optional[str] = None
    landlord_or_agency: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VectorScores(BaseModel):
    deposit_refund: float = 0.0
    water_utilities: float = 0.0
    security_privacy: float = 0.0
    eviction_fairness: float = 0.0
    management_responsiveness: float = 0.0


class PropertyDetailResponse(BaseModel):
    """Rich schema for property listing and dashboard cards."""
    id: UUID
    estate_id: int
    estate_name: str
    county_id: int
    county_name: str
    building_name: str
    street_name: str
    plot_number: Optional[str] = None
    landlord_or_agency: Optional[str] = None
    overall_score: float = 0.0
    review_count: int = 0
    verified_tenant_count: int = 0
    scores: VectorScores
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ForgetTenantRequest(BaseModel):
    """ODPC Section 40 Right to be Forgotten Request."""
    pseudonym: Optional[str] = None
    author_user_id: Optional[str] = None


class ForgetTenantResponse(BaseModel):
    """ODPC Section 40 Right to be Forgotten Confirmation."""
    success: bool
    purged_reviews_count: int
    pseudonym_erased: str
    legal_confirmation: str
