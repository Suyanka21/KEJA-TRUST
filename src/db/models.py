"""
KeJaTrust (NyumbaYangu) - Database Models & Schema Declarations
File: src/db/models.py
Governance: 'coderabbit-dna', 'security-and-hardening'
Jurisdiction: Republic of Kenya (ODPC DPA 2019, Defamation Act Cap 36)

SQLAlchemy 2.0 declarative models with composite unique constraints,
foreign key relationships, and encrypted BYTEA columns for PII isolation.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import BYTEA, UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base model providing shared timestamp fields and type mappings."""
    pass


class County(Base):
    """Normalized Kenyan County (Codes 1 through 47)."""
    __tablename__ = "counties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    code: Mapped[int] = mapped_column(SmallInteger, unique=True, nullable=False)

    estates: Mapped[List["Estate"]] = relationship("Estate", back_populates="county", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "code": self.code}


class Estate(Base):
    """Kenyan Sub-County / Estate / Neighborhood."""
    __tablename__ = "estates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    county_id: Mapped[int] = mapped_column(Integer, ForeignKey("counties.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    sub_county: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    __table_args__ = (
        UniqueConstraint("county_id", "name", name="uq_estate_county_name"),
    )

    county: Mapped["County"] = relationship("County", back_populates="estates")
    properties: Mapped[List["Property"]] = relationship("Property", back_populates="estate")

    def to_dict(self):
        return {
            "id": self.id,
            "county_id": self.county_id,
            "name": self.name,
            "sub_county": self.sub_county,
        }


class Property(Base):
    """
    Physical Residential / Commercial Property with strict composite unique constraint
    preventing duplicate building registration.
    """
    __tablename__ = "properties"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    estate_id: Mapped[int] = mapped_column(Integer, ForeignKey("estates.id", ondelete="RESTRICT"), nullable=False, index=True)
    building_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    street_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plot_number: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    landlord_or_agency: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("building_name", "estate_id", "street_name", name="uq_property_identity"),
        Index("ix_prop_estate_building", "estate_id", "building_name"),
    )

    estate: Mapped["Estate"] = relationship("Estate", back_populates="properties")
    verified_leases: Mapped[List["VerifiedLease"]] = relationship("VerifiedLease", back_populates="property")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="property")

    def to_dict(self):
        return {
            "id": str(self.id),
            "estate_id": self.estate_id,
            "building_name": self.building_name,
            "street_name": self.street_name,
            "plot_number": self.plot_number,
            "landlord_or_agency": self.landlord_or_agency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class VerifiedLease(Base):
    """
    Verified Lease / Rent Payment Record proving genuine tenancy.
    Stored with deterministic HMAC token hashes for anti-replay double spend protection.
    """
    __tablename__ = "verified_leases"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[Optional[UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True, index=True)
    property_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("properties.id", ondelete="RESTRICT"), nullable=False, index=True)
    method: Mapped[str] = mapped_column(String(32), default="mpesa_transaction", nullable=False)
    verification_token_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    rent_paid_recorded: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="approved", nullable=False)  # approved, manual_review, rejected
    raw_payload_encrypted: Mapped[Optional[bytes]] = mapped_column(BYTEA, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("verification_token_hash", name="uq_verified_leases_token_hash"),
        Index("ix_verified_leases_hash", "verification_token_hash"),
    )

    property: Mapped["Property"] = relationship("Property", back_populates="verified_leases")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="lease_verification")


class Review(Base):
    """
    Tenant Review Entity with 5 Kenyan friction vectors, pseudonymous author display,
    and automatic Gold Badge status.
    """
    __tablename__ = "reviews"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    property_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("properties.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id: Mapped[Optional[UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True, index=True)
    lease_verification_id: Mapped[Optional[UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("verified_leases.id", ondelete="SET NULL"), nullable=True)

    author_pseudonym: Mapped[str] = mapped_column(String(64), nullable=False)
    is_verified_tenant: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    lifecycle_status: Mapped[str] = mapped_column(String(32), default="active", nullable=False, index=True)

    # 5 Kenyan Rental Friction Rating Vectors (1-5 strictly bounded)
    rating_deposit_refund: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    rating_water_utilities: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    rating_security_privacy: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    rating_eviction_fairness: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    rating_management_responsiveness: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    comment_title: Mapped[str] = mapped_column(String(255), nullable=False)
    comment_text: Mapped[str] = mapped_column(Text, nullable=False)
    monthly_rent_paid: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    house_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    tenancy_start_year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    tenancy_end_year: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="reviews")
    lease_verification: Mapped[Optional["VerifiedLease"]] = relationship("VerifiedLease", back_populates="reviews")
    dispute_tickets: Mapped[List["DisputeTicket"]] = relationship("DisputeTicket", back_populates="review")


class DisputeTicket(Base):
    """
    Defamation Act (Cap 36) Dispute Ticket.
    Requires statutory standing (Police OB number OR licensed EARB number).
    Triggers atomic sandboxing of associated review.
    """
    __tablename__ = "dispute_tickets"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    review_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    complainant_type: Mapped[str] = mapped_column(String(32), default="landlord", nullable=False)
    complainant_name_encrypted: Mapped[bytes] = mapped_column(BYTEA, nullable=False)
    complainant_email_encrypted: Mapped[bytes] = mapped_column(BYTEA, nullable=False)
    complainant_phone_encrypted: Mapped[Optional[bytes]] = mapped_column(BYTEA, nullable=True)
    police_ob_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    earb_license_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    defamation_claim_details: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="under_investigation", nullable=False, index=True)  # under_investigation, resolved_restored, resolved_removed
    rebuttal_token_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    rebuttal_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    review: Mapped["Review"] = relationship("Review", back_populates="dispute_tickets")

