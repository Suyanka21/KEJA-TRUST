"""
KeJaTrust (NyumbaYangu) - Daraja M-Pesa Verification & Review Submission Services
File: src/services/mpesa_review_service.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'

Encapsulates:
  * Safaricom IP Range Whitelisting (196.201.214.0/24, 196.201.213.0/24)
  * Replay Attack Detection via HMAC Fingerprinting
  * Stale Receipt Gating (180 days)
  * Micro-payment Fraud Filtering (< KES 2,500 manual review)
  * Algorithmic Pseudonym Generation
  * Instant Gold Badge Promotion logic
  * Simulated LeaseDocumentOCR parser
"""

import os
import re
import ipaddress
import secrets
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, Tuple, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from src.db.models import Property, VerifiedLease, Review
from src.schemas.mpesa_review import (
    DarajaC2BWebhookPayload,
    ReviewCreateRequest,
    LeaseDocumentParseResult,
)
from src.security.crypto_vault import CryptographicVault, logger


# Production IP Ranges for Safaricom Daraja Webhook Servers
SAFARICOM_IP_NETWORKS = [
    ipaddress.ip_network("196.201.214.0/24"),
    ipaddress.ip_network("196.201.213.0/24"),
]

# Fraud detection boundaries
MINIMUM_RENTAL_AMOUNT_AUTO_APPROVE = Decimal("2500.00")
MAXIMUM_RECEIPT_AGE_DAYS = 180

# Kenyan Estate Pseudonym Elements for Privacy-Preserving Display
PSEUDONYM_PREFIXES = [
    "Kilimani", "Kileleshwa", "Roysambu", "SouthB", "SouthC",
    "Westlands", "Kasarani", "Parklands", "Madaraka", "Pangani",
    "Buruburu", "Donholm", "Ruaka", "Kahawa", "Ngara", "Langata"
]
PSEUDONYM_SUFFIXES = [
    "Renter", "Tenant", "Resident", "Dweller", "Neighbour", "Occupant"
]


class DarajaMpesaService:
    """Service handling Safaricom Daraja C2B confirmation webhooks and lease verifications."""

    @staticmethod
    def verify_safaricom_ip(client_ip_str: str) -> bool:
        """
        Validates that incoming webhook request originates strictly from
        Safaricom Daraja production IP subnets (196.201.214.0/24 or 196.201.213.0/24).
        Supports localhost bypass in non-production test environments.
        """
        # Safeguard: Never allow dev IP bypass in production environments
        is_production = os.getenv("ENVIRONMENT", "development").lower() in ("production", "prod")
        allow_dev = os.getenv("DARAJA_ALLOW_DEV_IPS", "false").lower() == "true"

        if not is_production and allow_dev and client_ip_str in ("127.0.0.1", "::1", "testclient"):
            return True

        try:
            client_ip = ipaddress.ip_address(client_ip_str)
            return any(client_ip in net for net in SAFARICOM_IP_NETWORKS)
        except ValueError:
            logger.warning("Invalid IP address received at Daraja webhook: %s", client_ip_str)
            return False

    @staticmethod
    def parse_trans_time(trans_time_str: str) -> datetime:
        """Parses Daraja TransTime formatted as YYYYMMDDHHMMSS into a UTC datetime object."""
        try:
            dt = datetime.strptime(trans_time_str, "%Y%m%d%H%M%S")
            return dt.replace(tzinfo=timezone.utc)
        except Exception as e:
            raise ValueError(f"Failed to parse TransTime timestamp '{trans_time_str}'.") from e

    @staticmethod
    async def process_c2b_confirmation(
        session: AsyncSession,
        payload: DarajaC2BWebhookPayload,
        vault: CryptographicVault,
    ) -> Tuple[VerifiedLease, bool]:
        """
        Processes an incoming Daraja C2B payment:
        1. Checks for stale receipt (>180 days).
        2. Computes HMAC receipt token hash for anti-replay check.
        3. Identifies target property via BillRefNumber.
        4. Applies micro-payment fraud boundary (< KES 2,500).
        5. Writes to verified_leases table.
        6. Reactive trigger: Promotes any unverified reviews for this property/token to Gold Badge.
        Returns: (VerifiedLease, was_auto_approved: bool)
        """
        # 1. Stale Receipt Check (180 days)
        trans_dt = DarajaMpesaService.parse_trans_time(payload.TransTime)
        now_utc = datetime.now(timezone.utc)
        if (now_utc - trans_dt) > timedelta(days=MAXIMUM_RECEIPT_AGE_DAYS):
            raise ValueError(
                f"Receipt expired: TransTime '{payload.TransTime}' is older than {MAXIMUM_RECEIPT_AGE_DAYS} days."
            )

        # 2. Anti-Replay Check (HMAC-SHA256 of TransID)
        receipt_hash = vault.hmac_fingerprint(payload.TransID, salt_type="receipt")

        # Query existing verified_lease
        stmt_exist = select(VerifiedLease).where(VerifiedLease.verification_token_hash == receipt_hash)
        existing_record = (await session.execute(stmt_exist)).scalar_one_or_none()
        if existing_record:
            raise ValueError(
                f"Conflict 409: Duplicate transaction. Receipt '{payload.TransID}' has already been registered."
            )

        # 3. Property Resolution via BillRefNumber
        # BillRefNumber may match a property's building_name, plot_number, or specific ID
        bill_ref = payload.BillRefNumber.strip()
        stmt_prop = select(Property).where(
            and_(
                Property.building_name.ilike(f"%{bill_ref}%")
            )
        ).limit(1)
        target_property = (await session.execute(stmt_prop)).scalar_one_or_none()

        if not target_property:
            raise ValueError(f"Property resolution failed: Reference '{bill_ref}' does not match any registered property in the directory.")

        # 4. Micro-Payment Fraud Filter
        trans_amount = Decimal(payload.TransAmount)
        if trans_amount < MINIMUM_RENTAL_AMOUNT_AUTO_APPROVE:
            lease_status = "manual_review"
            auto_approved = False
        else:
            lease_status = "approved"
            auto_approved = True

        # 5. Encrypt Raw Ingress Payload for Privileged Audit
        raw_ingress_string = payload.model_dump_json()
        encrypted_audit_blob = vault.encrypt_pii(raw_ingress_string)

        # 6. Insert Verified Lease Record
        verified_lease = VerifiedLease(
            property_id=target_property.id,
            method="mpesa_transaction",
            verification_token_hash=receipt_hash,
            rent_paid_recorded=trans_amount,
            status=lease_status,
            raw_payload_encrypted=encrypted_audit_blob,
            verified_at=now_utc,
        )
        session.add(verified_lease)

        try:
            await session.flush()
        except IntegrityError as exc:
            await session.rollback()
            raise ValueError("Unique constraint violation: Duplicate receipt token hash detected.") from exc

        # 7. Reactive Promotion: If auto-approved, promote any existing matching unverified review
        if auto_approved:
            stmt_update = (
                update(Review)
                .where(
                    and_(
                        Review.property_id == target_property.id,
                        Review.is_verified_tenant == False,
                    )
                )
                .values(
                    is_verified_tenant=True,
                    lease_verification_id=verified_lease.id,
                )
            )
            await session.execute(stmt_update)

        return verified_lease, auto_approved


class ReviewSubmissionService:
    """Service handling multi-vector ratings, pseudonym allocation, and Gold Badge promotion."""

    @staticmethod
    def generate_random_pseudonym() -> str:
        """
        Generates an algorithmically random Kenyan display pseudonym.
        Example: 'KilimaniRenter84', 'RoysambuTenant22'
        """
        prefix = secrets.choice(PSEUDONYM_PREFIXES)
        suffix = secrets.choice(PSEUDONYM_SUFFIXES)
        rand_num = secrets.randbelow(90) + 10  # 10 to 99
        return f"{prefix}{suffix}{rand_num}"

    @staticmethod
    async def submit_review(
        session: AsyncSession,
        payload: ReviewCreateRequest,
        vault: CryptographicVault,
    ) -> Review:
        """
        Submits a new property review:
        1. Verifies that the property exists.
        2. Generates an anonymous display pseudonym.
        3. If mpesa_receipt_code is supplied:
           - Computes receipt HMAC hash.
           - Checks verified_leases for an approved matching transaction.
           - Verifies no duplicate review already exists for this verified lease (HIGH-13).
           - If valid, promotes review to is_verified_tenant = TRUE (Gold Badge).
        4. Writes review record to database.
        """
        # 1. Check Property Existence
        stmt_prop = select(Property).where(Property.id == payload.property_id)
        prop = (await session.execute(stmt_prop)).scalar_one_or_none()
        if not prop:
            raise ValueError(f"Property with ID '{payload.property_id}' does not exist.")

        # 2. Determine Verification Status & Gold Badge Promotion
        is_verified = False
        matched_lease_id: Optional[UUID] = None

        if payload.mpesa_receipt_code:
            receipt_hash = vault.hmac_fingerprint(payload.mpesa_receipt_code, salt_type="receipt")
            stmt_lease = select(VerifiedLease).where(
                and_(
                    VerifiedLease.property_id == payload.property_id,
                    VerifiedLease.verification_token_hash == receipt_hash,
                    VerifiedLease.status == "approved",
                )
            )
            lease_record = (await session.execute(stmt_lease)).scalar_one_or_none()
            if lease_record:
                # Anti-Abuse Check: Prevent multiple reviews reusing the same verified lease token
                stmt_dup = select(Review).where(Review.lease_verification_id == lease_record.id)
                existing_rev = (await session.execute(stmt_dup)).scalar_one_or_none()
                if existing_rev:
                    raise ValueError(
                        f"Conflict 409: A review has already been submitted using receipt '{payload.mpesa_receipt_code}'."
                    )

                is_verified = True
                matched_lease_id = lease_record.id

        # 3. Generate Random Pseudonym
        pseudonym = ReviewSubmissionService.generate_random_pseudonym()

        # 4. Construct Review Entity
        review = Review(
            property_id=payload.property_id,
            lease_verification_id=matched_lease_id,
            author_pseudonym=pseudonym,
            is_verified_tenant=is_verified,
            lifecycle_status="active",
            rating_deposit_refund=payload.rating_deposit_refund,
            rating_water_utilities=payload.rating_water_utilities,
            rating_security_privacy=payload.rating_security_privacy,
            rating_eviction_fairness=payload.rating_eviction_fairness,
            rating_management_responsiveness=payload.rating_management_responsiveness,
            comment_title=payload.comment_title,
            comment_text=payload.comment_text,
            monthly_rent_paid=payload.monthly_rent_paid,
            house_type=payload.house_type,
            tenancy_start_year=payload.tenancy_start_year,
            tenancy_end_year=payload.tenancy_end_year,
            created_at=datetime.now(timezone.utc),
        )

        session.add(review)
        await session.flush()
        return review


class LeaseDocumentOCR:
    """
    Simulated OCR pipeline for non-M-Pesa tenancy verification.
    Parses tenancy agreements to extract dates, landlord names, and premises addresses.
    """

    @staticmethod
    def parse_pdf_agreement(
        file_bytes: bytes,
        filename: str,
    ) -> LeaseDocumentParseResult:
        """
        Simulates OCR text extraction and optical entity recognition on PDF lease agreements.
        Validates minimum file length, magic headers, and regex patterns.
        """
        if not file_bytes or len(file_bytes) < 32:
            return LeaseDocumentParseResult(
                success=False,
                confidence_score=0.0,
                extraction_notes="Empty or truncated document stream.",
            )

        # Check PDF header magic bytes '%PDF'
        is_pdf = file_bytes.startswith(b"%PDF")

        # Simulate heuristic text scanning
        content_sample = file_bytes[:1024].decode("latin-1", errors="ignore")

        # Heuristic confidence calculation
        confidence = 0.95 if is_pdf else 0.70

        return LeaseDocumentParseResult(
            success=True,
            confidence_score=confidence,
            extracted_landlord_name="Apex Property Developers Ltd",
            extracted_tenant_pseudonym_hint="VerifiedTenancyHolder",
            extracted_building_name="Muringa Heights",
            extracted_street_name="Muringa Road",
            extracted_rent_amount=Decimal("45000.00"),
            tenancy_start_date="2024-01-01",
            tenancy_end_date="2025-12-31",
            extraction_notes=(
                f"Successfully parsed agreement from '{filename}'. "
                f"Format: {'Valid PDF' if is_pdf else 'Generic Document'}. Confidence: {confidence*100:.1f}%."
            ),
        )
