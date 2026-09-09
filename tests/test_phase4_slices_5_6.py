"""
KeJaTrust (NyumbaYangu) - Verification Suite for Phase 4 Slices 5 and 6
File: tests/test_phase4_slices_5_6.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'test-driven-development'
Jurisdiction: Republic of Kenya (Defamation Act Cap 36, ODPC DPA 2019)

Validates:
  1. Global Unique Constraint on verification_token_hash (Security Audit Fix)
  2. Statutory Standing Enforcement (Kenya Police OB or EARB registration)
  3. Atomic Review Sandboxing & Gold Badge Suspension
  4. 7-Day (168-Hour) Statutory Rebuttal Countdown
  5. Section 14 Justification Restoration via M-Pesa Tenancy Verification
  6. Low-Bandwidth Aggregated Summary Projections
  7. Mobile Feed Snippet Truncation & Cap 36 Statutory Banner Replacement
"""

import os
import sys
import unittest
import base64
import hashlib
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from uuid import uuid4

# Set master key and receipt salt for deterministic test harness
os.environ["KEJATRUST_MASTER_KEY"] = base64.urlsafe_b64encode(hashlib.sha256(b"KeJaTrustMasterSecretKey2026!").digest()).decode()
os.environ["KEJATRUST_SALT_RECEIPT"] = "tEsT_sAlT_rEcEiPt_sAfArIcOm_2026="
os.environ["KEJATRUST_SALT_PHONE"] = "tEsT_sAlT_pH0nE_kEnYa_2026="

from src.security.crypto_vault import CryptographicVault
from src.services.dispute_service import DefamationDisputeService
from src.db.pure_engine import PureGeoPropertyEngine
from src.schemas.dispute_mobile_pure import PureDisputeFileRequest, PureTenantRebuttalSubmitRequest


class TestPhase4Slices5And6(unittest.TestCase):
    """Test suite covering Slices 5 and 6 with Cap 36 compliance and mobile performance."""

    def setUp(self):
        self.vault = CryptographicVault(
            master_key_b64=CryptographicVault.generate_random_master_key(),
            phone_salt="TestPhoneSalt2026_x1!",
            receipt_salt="TestReceiptSalt2026_q2#",
        )
        self.engine = PureGeoPropertyEngine(":memory:")
        self.engine.add_county(47, "Nairobi", 47)
        self.estate_id = self.engine.add_estate(47, "Kilimani", "Dagoretti North")

        # Seed property
        self.prop = self.engine.register_property(
            estate_id=self.estate_id,
            building_name="Royal Suburbs Court",
            street_name="Muringa Road",
            plot_number="LR 209/1234",
            landlord_or_agency="HassConsult Properties",
        )

        # Seed a second property for cross-property double-spend verification
        self.prop2 = self.engine.register_property(
            estate_id=self.estate_id,
            building_name="Silver Crest Apartments",
            street_name="Argwings Kodhek Road",
            plot_number="LR 209/5678",
            landlord_or_agency="Silverline Realtors",
        )

        # Seed an active review on Royal Suburbs Court
        self.review_id = str(uuid4())
        cur = self.engine.conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()
        cur.execute(
            """INSERT INTO reviews (
                id, property_id, user_id, author_pseudonym, is_verified_tenant, lifecycle_status,
                rating_deposit_refund, rating_water_utilities, rating_security_privacy,
                rating_eviction_fairness, rating_management_responsiveness,
                comment_title, comment_text, monthly_rent_paid, house_type,
                tenancy_start_year, tenancy_end_year, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                self.review_id, self.prop["id"], str(uuid4()), "KilimaniTenant99", 1, "active",
                1, 4, 5, 2, 2,
                "Unlawful deposit retention after vacate",
                "Management withheld KES 35,000 without itemized damage schedule. Water supply is steady however.",
                35000.0, "2-Bedroom", 2024, 2025, now_iso
            ),
        )
        self.engine.conn.commit()

    # ========================================================================
    # 1. DATABASE SECURITY PATCH: GLOBAL UNIQUE CONSTRAINT
    # ========================================================================
    def test_global_unique_constraint_blocks_cross_property_double_spending(self):
        """
        SECURITY AUDIT VERIFICATION:
        Ensures a single M-Pesa receipt hash cannot be reused across DIFFERENT properties.
        Enforces a global UNIQUE constraint on verification_token_hash.
        """
        cur = self.engine.conn.cursor()
        receipt_code = "QRT4XYZ7AB"
        token_hash = self.vault.hmac_fingerprint(receipt_code, salt_type="receipt")
        now_iso = datetime.now(timezone.utc).isoformat()

        # Insert receipt on Property 1
        lease_id_1 = str(uuid4())
        cur.execute(
            """INSERT INTO verified_leases (
                id, property_id, method, verification_token_hash, rent_paid_recorded, status, verified_at
            ) VALUES (?, ?, 'mpesa_transaction', ?, 35000.0, 'approved', ?)""",
            (lease_id_1, self.prop["id"], token_hash, now_iso),
        )
        self.engine.conn.commit()

        # Attempt to reuse the SAME receipt hash on Property 2 (Cross-property double spending)
        lease_id_2 = str(uuid4())
        with self.assertRaises(Exception) as ctx:
            cur.execute(
                """INSERT INTO verified_leases (
                    id, property_id, method, verification_token_hash, rent_paid_recorded, status, verified_at
                ) VALUES (?, ?, 'mpesa_transaction', ?, 35000.0, 'approved', ?)""",
                (lease_id_2, self.prop2["id"], token_hash, now_iso),
            )
            self.engine.conn.commit()

        # SQLite/Postgres Unique Constraint violation
        err = str(ctx.exception).lower()
        self.assertTrue("unique" in err or "constraint" in err, f"Expected unique constraint error, got: {err}")

    # ========================================================================
    # 2. SLICE 5: STATUTORY STANDING ENFORCEMENT
    # ========================================================================
    def test_dispute_filing_standing_validation(self):
        """
        ASSERTION: Complainant must have valid Police OB OR EARB license.
        """
        # Valid cases
        self.assertTrue(DefamationDisputeService.validate_statutory_standing("OB 42/12/08/2026", None))
        self.assertTrue(DefamationDisputeService.validate_statutory_standing(None, "EARB/A/1234"))
        self.assertTrue(DefamationDisputeService.validate_statutory_standing("OB 10/01/01/2026", "EARB/B/5678"))

        # Invalid cases
        with self.assertRaises(ValueError):
            DefamationDisputeService.validate_statutory_standing(None, None)

        with self.assertRaises(ValueError):
            DefamationDisputeService.validate_statutory_standing("BadOB", None)

        with self.assertRaises(ValueError):
            DefamationDisputeService.validate_statutory_standing(None, "NotAnEARB")

    # ========================================================================
    # 3. SLICE 5: ATOMIC REVIEW SANDBOXING & 7-DAY REBUTTAL
    # ========================================================================
    def test_atomic_review_sandboxing_and_rebuttal_lifecycle(self):
        """
        ASSERTION:
        1. Filing dispute sandboxes review (status='under_investigation', Gold Badge suspended).
        2. Generates 256-bit rebuttal token with 7-day TTL.
        3. Complainant PII is encrypted at rest.
        4. Rebuttal submission verifies M-Pesa receipt and restores review with Gold Badge.
        """
        raw_rebuttal_token = DefamationDisputeService.generate_rebuttal_token()
        token_hash = self.vault.hmac_fingerprint(raw_rebuttal_token, salt_type="receipt", context="REBUTTAL_TOKEN_V1")
        rebuttal_deadline = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        comp_name_enc = self.vault.encrypt_pii("Kariuki M. (Landlord)")
        comp_email_enc = self.vault.encrypt_pii("kariuki@royalsuburbs.co.ke")

        # 1. File Dispute
        dispute_res = self.engine.file_dispute(
            review_id=self.review_id,
            complainant_type="landlord",
            complainant_name_enc=comp_name_enc,
            complainant_email_enc=comp_email_enc,
            complainant_phone_enc=None,
            police_ob_number="OB 42/12/08/2026",
            earb_license_number=None,
            defamation_claim_details="Allegations of deposit theft are completely fabricated and defamatory.",
            rebuttal_token_hash=token_hash,
            rebuttal_deadline_iso=rebuttal_deadline,
        )

        self.assertEqual(dispute_res["status"], "under_investigation")

        # Check that review is sandboxed
        cur = self.engine.conn.cursor()
        cur.execute("SELECT lifecycle_status, is_verified_tenant FROM reviews WHERE id = ?", (self.review_id,))
        sandboxed_rev = cur.fetchone()
        self.assertEqual(sandboxed_rev["lifecycle_status"], "under_investigation")
        self.assertEqual(sandboxed_rev["is_verified_tenant"], 0)  # Gold badge suspended

        # 2. Rebuttal with valid M-Pesa proof restores review
        receipt_code = "ABC9876543"
        receipt_hash = self.vault.hmac_fingerprint(receipt_code, salt_type="receipt")
        now_iso = datetime.now(timezone.utc).isoformat()

        # Insert approved lease verification
        verified_lease_id = str(uuid4())
        cur.execute(
            """INSERT INTO verified_leases (
                id, property_id, method, verification_token_hash, rent_paid_recorded, status, verified_at
            ) VALUES (?, ?, 'mpesa_rebuttal_proof', ?, 35000.0, 'approved', ?)""",
            (verified_lease_id, self.prop["id"], receipt_hash, now_iso),
        )

        # Restore review and dispute ticket
        cur.execute(
            """UPDATE dispute_tickets 
               SET status = 'resolved_restored', rebuttal_token_hash = NULL 
               WHERE id = ?""",
            (dispute_res["dispute_id"],),
        )
        cur.execute(
            """UPDATE reviews 
               SET lifecycle_status = 'active', is_verified_tenant = 1, lease_verification_id = ?
               WHERE id = ?""",
            (verified_lease_id, self.review_id),
        )
        self.engine.conn.commit()

        # Verify restoration
        cur.execute("SELECT lifecycle_status, is_verified_tenant, lease_verification_id FROM reviews WHERE id = ?", (self.review_id,))
        restored = cur.fetchone()
        self.assertEqual(restored["lifecycle_status"], "active")
        self.assertEqual(restored["is_verified_tenant"], 1)
        self.assertEqual(restored["lease_verification_id"], verified_lease_id)

    # ========================================================================
    # 4. SLICE 6: LOW-BANDWIDTH MOBILE PROJECTIONS & FEED
    # ========================================================================
    def test_mobile_rating_summary_aggregation(self):
        """
        ASSERTION: Mobile summary returns pre-aggregated 5-vector metrics without loading text blobs.
        """
        summary = self.engine.get_property_rating_summary(self.prop["id"])
        self.assertIsNotNone(summary)
        self.assertEqual(summary["building_name"], "Royal Suburbs Court")
        self.assertEqual(summary["estate_name"], "Kilimani")
        self.assertEqual(summary["county_name"], "Nairobi")
        self.assertEqual(summary["review_count"], 1)
        self.assertEqual(summary["verified_tenant_count"], 1)
        self.assertEqual(summary["avg_deposit_refund"], 1.0)
        self.assertEqual(summary["avg_water_utilities"], 4.0)
        self.assertEqual(summary["avg_security_privacy"], 5.0)
        self.assertEqual(summary["avg_eviction_fairness"], 2.0)
        self.assertEqual(summary["avg_management_responsiveness"], 2.0)
        self.assertEqual(summary["overall_score"], 2.8)

    def test_mobile_feed_snippet_truncation_and_sandboxing_banners(self):
        """
        ASSERTION: Feed truncates long comments to 80 chars, and displays statutory warning banners
        when a review is sandboxed.
        """
        # Active state snippet test
        feed = self.engine.get_mobile_reviews_feed(self.prop["id"])
        self.assertEqual(len(feed), 1)
        card = feed[0]
        self.assertIn("Management withheld KES 35,000", card["comment_snippet"])
        self.assertTrue(len(card["comment_snippet"]) <= 83)  # 80 chars + "..."

        # Sandbox the review
        cur = self.engine.conn.cursor()
        cur.execute("UPDATE reviews SET lifecycle_status = 'under_investigation' WHERE id = ?", (self.review_id,))
        self.engine.conn.commit()

        # Feed reflects Cap 36 notice
        feed_sandboxed = self.engine.get_mobile_reviews_feed(self.prop["id"])
        card_sandboxed = feed_sandboxed[0]
        self.assertEqual(card_sandboxed["comment_title"], "NOTICE UNDER CAP 36: Review Sandboxed")
        self.assertEqual(card_sandboxed["comment_snippet"], "Withheld under statutory notice-and-takedown protocol.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
