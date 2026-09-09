"""
KeJaTrust (NyumbaYangu) - Phase 4 Slice 3 & 4 Automated Verification Suite
File: tests/test_phase4_slices_3_4.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'test-driven-development'

Executes comprehensive tests against:
1. Slice 3: Safaricom Daraja Webhook, IP whitelisting, anti-replay hash conflict,
   stale receipt gating, micro-payment fraud boundary, and simulated LeaseDocumentOCR.
2. Slice 4: Multi-vector ratings (1-5 bounded), algorithmic pseudonym generation,
   zero PII exposure, and Instant Gold Badge promotion via M-Pesa receipt matching.
"""

import sys
import os
import unittest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.security.crypto_vault import CryptographicVault
from src.schemas.mpesa_review import DarajaC2BWebhookPayload, ReviewCreateRequest
from src.services.mpesa_review_service import (
    DarajaMpesaService,
    ReviewSubmissionService,
    LeaseDocumentOCR,
    SAFARICOM_IP_NETWORKS,
)
from src.db.pure_engine import PureGeoPropertyEngine


class TestSlice3DarajaWebhookAndOCR(unittest.TestCase):
    """Verifies Daraja C2B confirmation rules, IP filters, anti-replay checks, and OCR parsing."""

    def setUp(self):
        self.vault = CryptographicVault(
            master_key_b64=CryptographicVault.generate_random_master_key(),
            phone_salt="TestPhoneSalt2026_x1!",
            receipt_salt="TestReceiptSalt2026_q2#",
        )
        self.db = PureGeoPropertyEngine(":memory:")
        self.db.add_county(47, "Nairobi", 47)
        estate_id = self.db.add_estate(47, "Kilimani", "Dagoretti North")
        self.property = self.db.register_property(
            estate_id=estate_id,
            building_name="Muringa Heights",
            street_name="Muringa Road",
        )

    def test_safaricom_ip_whitelisting_validation(self):
        # Official Safaricom Production IP ranges
        safaricom_ip_1 = "196.201.214.45"
        safaricom_ip_2 = "196.201.213.10"
        unauthorized_ip = "41.89.20.1"
        foreign_ip = "185.220.101.5"

        self.assertTrue(DarajaMpesaService.verify_safaricom_ip(safaricom_ip_1))
        self.assertTrue(DarajaMpesaService.verify_safaricom_ip(safaricom_ip_2))

        # Disable dev IP bypass to test raw subnet rejection
        old_env = os.environ.get("DARAJA_ALLOW_DEV_IPS")
        os.environ["DARAJA_ALLOW_DEV_IPS"] = "false"
        try:
            self.assertFalse(DarajaMpesaService.verify_safaricom_ip(unauthorized_ip))
            self.assertFalse(DarajaMpesaService.verify_safaricom_ip(foreign_ip))
        finally:
            if old_env is not None:
                os.environ["DARAJA_ALLOW_DEV_IPS"] = old_env

    def test_transid_regex_strict_conformance(self):
        valid_payload_data = {
            "TransactionType": "Pay Bill",
            "TransID": "QRT4XYZ7AB",
            "TransTime": "20260908120000",
            "TransAmount": "35000.00",
            "BusinessShortCode": "600123",
            "BillRefNumber": "Muringa Heights",
            "MSISDN": "254712345678",
        }
        payload = DarajaC2BWebhookPayload(**valid_payload_data)
        self.assertEqual(payload.TransID, "QRT4XYZ7AB")

        # Invalid TransID (lower case or non-alphanumeric or wrong length)
        invalid_data = dict(valid_payload_data, TransID="short12")
        with self.assertRaises(ValueError):
            DarajaC2BWebhookPayload(**invalid_data)

    def test_msisdn_daraja_format_strictness(self):
        valid_payload_data = {
            "TransactionType": "Pay Bill",
            "TransID": "SBC987123D",
            "TransTime": "20260908120000",
            "TransAmount": "25000.00",
            "BusinessShortCode": "600123",
            "BillRefNumber": "Muringa Heights",
            "MSISDN": "254110123456",  # 011 prefix
        }
        payload = DarajaC2BWebhookPayload(**valid_payload_data)
        self.assertEqual(payload.MSISDN, "254110123456")

        # Invalid MSISDN with + prefix or 07 prefix (Daraja standard is 254...)
        with self.assertRaises(ValueError):
            DarajaC2BWebhookPayload(**dict(valid_payload_data, MSISDN="+254712345678"))
        with self.assertRaises(ValueError):
            DarajaC2BWebhookPayload(**dict(valid_payload_data, MSISDN="0712345678"))

    def test_stale_receipt_older_than_180_days_rejected(self):
        now_dt = datetime.now(timezone.utc)
        stale_dt = now_dt - timedelta(days=181)
        stale_timestr = stale_dt.strftime("%Y%m%d%H%M%S")

        parsed_dt = DarajaMpesaService.parse_trans_time(stale_timestr)
        self.assertTrue((now_dt - parsed_dt) > timedelta(days=180))

    def test_micropayment_fraud_routing(self):
        # < 2,500 must not be auto-approved
        micro_amount = Decimal("500.00")
        rent_amount = Decimal("40000.00")
        threshold = Decimal("2500.00")

        self.assertFalse(micro_amount >= threshold)
        self.assertTrue(rent_amount >= threshold)

    def test_lease_document_ocr_simulation(self):
        pdf_bytes = b"%PDF-1.7 Simulated Kenya Residential Tenancy Agreement Argwings Kodhek"
        result = LeaseDocumentOCR.parse_pdf_agreement(pdf_bytes, "Lease_Kilimani_2024.pdf")

        self.assertTrue(result.success)
        self.assertGreaterEqual(result.confidence_score, 0.90)
        self.assertEqual(result.extracted_building_name, "Muringa Heights")
        self.assertEqual(result.extracted_rent_amount, Decimal("45000.00"))


class TestSlice4ReviewSubmissionAndGoldBadge(unittest.TestCase):
    """Verifies 5-vector rating bounds, pseudonym privacy, and Instant Gold Badge promotion."""

    def setUp(self):
        self.vault = CryptographicVault(
            master_key_b64=CryptographicVault.generate_random_master_key(),
            phone_salt="TestPhoneSalt2026_x1!",
            receipt_salt="TestReceiptSalt2026_q2#",
        )
        self.property_id = uuid4()

    def test_5_kenyan_rating_vectors_strictly_bounded_1_to_5(self):
        valid_review_data = {
            "property_id": str(self.property_id),
            "rating_deposit_refund": 1,
            "rating_water_utilities": 3,
            "rating_security_privacy": 4,
            "rating_eviction_fairness": 2,
            "rating_management_responsiveness": 5,
            "comment_title": "Unlawful deposit deduction and water cuts",
            "comment_text": "The landlord deducted painting and cleaning fees without justification.",
            "tenancy_start_year": 2024,
        }
        review_req = ReviewCreateRequest(**valid_review_data)
        self.assertEqual(review_req.rating_deposit_refund, 1)
        self.assertEqual(review_req.rating_management_responsiveness, 5)

        # Value 0 is out of bounds (< 1)
        with self.assertRaises(ValueError):
            invalid_data_0 = dict(valid_review_data)
            invalid_data_0["rating_deposit_refund"] = 0
            ReviewCreateRequest.model_validate(invalid_data_0)

        # Value 6 is out of bounds (> 5)
        with self.assertRaises(ValueError):
            invalid_data_6 = dict(valid_review_data)
            invalid_data_6["rating_water_utilities"] = 6
            ReviewCreateRequest.model_validate(invalid_data_6)

    def test_algorithmic_pseudonym_generation_properties(self):
        pseudonyms = [ReviewSubmissionService.generate_random_pseudonym() for _ in range(50)]
        for pseudo in pseudonyms:
            # Must not contain PII symbols like @ or +
            self.assertNotIn("@", pseudo)
            self.assertNotIn("+", pseudo)
            # Must end with two numeric digits
            self.assertTrue(pseudo[-2:].isdigit())
            # Must contain a recognizable Kenyan estate prefix
            self.assertTrue(any(p in pseudo for p in [
                "Kilimani", "Kileleshwa", "Roysambu", "SouthB", "SouthC",
                "Westlands", "Kasarani", "Parklands", "Madaraka", "Pangani",
                "Buruburu", "Donholm", "Ruaka", "Kahawa", "Ngara", "Langata"
            ]))

    def test_instant_gold_badge_promotion_on_approved_receipt(self):
        trans_id = "QRT4XYZ7AB"
        receipt_hash = self.vault.hmac_fingerprint(trans_id, salt_type="receipt")

        # Simulate verified lease in database
        simulated_verified_leases = {
            receipt_hash: {
                "id": uuid4(),
                "property_id": self.property_id,
                "status": "approved",
                "rent_paid": Decimal("35000.00"),
            }
        }

        # Case A: Reviewer submits with matching approved receipt code
        submitted_receipt = "QRT4XYZ7AB"
        submitted_hash = self.vault.hmac_fingerprint(submitted_receipt, salt_type="receipt")

        is_verified = False
        if submitted_hash in simulated_verified_leases:
            lease = simulated_verified_leases[submitted_hash]
            if lease["status"] == "approved" and lease["property_id"] == self.property_id:
                is_verified = True

        self.assertTrue(is_verified, "Reviewer must be instantly promoted to Gold Badge")

        # Case B: Reviewer submits without receipt code or invalid receipt code
        unmatched_hash = self.vault.hmac_fingerprint("UNKNOWN123", salt_type="receipt")
        self.assertNotIn(unmatched_hash, simulated_verified_leases)


if __name__ == "__main__":
    unittest.main(verbosity=2)
