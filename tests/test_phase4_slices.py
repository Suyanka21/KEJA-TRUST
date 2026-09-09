"""
KeJaTrust (NyumbaYangu) - Phase 4 Slice 1 & 2 Automated Verification Suite (Pure Python Runner)
File: tests/test_phase4_slices.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'test-driven-development'

Verifies:
1. Slice 1: CryptographicVault, HMAC-SHA256 fingerprinting, AES authenticated encryption, key rotation, and LoggerSanitizationFilter.
2. Slice 2: GeoPropertyService, county listing, estate retrieval, property registration, and duplicate rejection.
"""

import sys
import os
import unittest
import base64
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.security.crypto_vault import CryptographicVault, LoggerSanitizationFilter
from src.db.pure_engine import PureGeoPropertyEngine


class TestSlice1CryptographicVault(unittest.TestCase):
    """Verifies AES-256-GCM / Authenticated Envelope encryption, HMAC fingerprints, key rotation, and logger filters."""

    def setUp(self):
        self.vault_v1 = CryptographicVault(
            master_key_b64=CryptographicVault.generate_random_master_key(),
            phone_salt="TestPhoneSalt2026_x1!",
            receipt_salt="TestReceiptSalt2026_q2#",
        )
        self.vault_v2 = CryptographicVault(
            master_key_b64=CryptographicVault.generate_random_master_key(),
            phone_salt="TestPhoneSalt2026_x1!",  # Identical salt for stable deduplication
            receipt_salt="TestReceiptSalt2026_q2#",
        )

    def test_hmac_fingerprint_deterministic_and_collision_resistant(self):
        raw_phone = "+254712345678"
        fp1 = self.vault_v1.hmac_fingerprint(raw_phone, salt_type="phone")
        fp2 = self.vault_v1.hmac_fingerprint("  +254712345678  ", salt_type="phone")
        fp_diff = self.vault_v1.hmac_fingerprint("+254712345679", salt_type="phone")

        self.assertEqual(fp1, fp2, "HMAC fingerprint must be whitespace/case insensitive")
        self.assertNotEqual(fp1, fp_diff, "Different inputs must produce unique fingerprints")
        self.assertEqual(len(fp1), 64, "SHA-256 hex digest must be 64 characters long")

    def test_aes_256_gcm_encrypt_decrypt_integrity(self):
        raw_pii = "tenant.nairobi@example.co.ke"
        ciphertext = self.vault_v1.encrypt_pii(raw_pii)

        self.assertIsInstance(ciphertext, bytes)
        self.assertNotIn(raw_pii.encode("utf-8"), ciphertext, "Raw PII must not appear in ciphertext")
        self.assertEqual(ciphertext[0:1], b"\x01", "Ciphertext must start with envelope version byte 0x01")

        decrypted = self.vault_v1.decrypt_pii(ciphertext)
        self.assertEqual(decrypted, raw_pii, "Decrypted text must match original plaintext")

    def test_tampered_ciphertext_fails_decryption(self):
        raw_pii = "ConfidentialTenantData"
        ciphertext = bytearray(self.vault_v1.encrypt_pii(raw_pii))
        # Tamper with the last byte (authentication tag)
        ciphertext[-1] ^= 0xFF

        with self.assertRaises(ValueError):
            self.vault_v1.decrypt_pii(bytes(ciphertext))

    def test_key_rotation_preserves_fingerprint_invariance(self):
        raw_phone = "+254722998877"
        ciphertext_v1 = self.vault_v1.encrypt_pii(raw_phone)
        fp_v1 = self.vault_v1.hmac_fingerprint(raw_phone, salt_type="phone")

        # Execute rotation from Vault 1 to Vault 2
        ciphertext_v2, fingerprint_stable = self.vault_v1.rotate_master_key(
            current_ciphertext=ciphertext_v1,
            new_vault=self.vault_v2,
        )

        self.assertTrue(fingerprint_stable, "HMAC fingerprint invariant failed during key rotation")
        self.assertNotEqual(ciphertext_v1, ciphertext_v2, "Ciphertext was not re-encrypted under K_master_v2")

        # Verify Vault 2 can decrypt ciphertext_v2
        decrypted_by_v2 = self.vault_v2.decrypt_pii(ciphertext_v2)
        self.assertEqual(decrypted_by_v2, raw_phone)

        # Verify Vault 1 cannot decrypt ciphertext_v2
        with self.assertRaises(ValueError):
            self.vault_v1.decrypt_pii(ciphertext_v2)

    def test_logger_sanitization_filter_redacts_msisdn_and_email(self):
        filter_inst = LoggerSanitizationFilter()
        raw_message = (
            "Tenant registered with mobile +254712345678 and local 0722123456, "
            "contact: tenant.dagoretti@domain.co.ke"
        )
        sanitized = filter_inst.sanitize_text(raw_message)

        self.assertNotIn("+254712345678", sanitized)
        self.assertNotIn("0722123456", sanitized)
        self.assertNotIn("tenant.dagoretti@domain.co.ke", sanitized)
        self.assertIn("[REDACTED_KENYAN_MSISDN]", sanitized)
        self.assertIn("[REDACTED_ODPC_EMAIL]", sanitized)


class TestSlice2GeoPropertyEngine(unittest.TestCase):
    """Verifies county listing, estate scoping, property registration, and duplicate rejection."""

    def setUp(self):
        self.db = PureGeoPropertyEngine(":memory:")
        self.db.add_county(47, "Nairobi", 47)
        self.estate_id = self.db.add_estate(47, "Kilimani", "Dagoretti North")

    def test_get_all_counties(self):
        counties = self.db.get_all_counties()
        self.assertEqual(len(counties), 1)
        self.assertEqual(counties[0]["name"], "Nairobi")
        self.assertEqual(counties[0]["code"], 47)

    def test_get_estates_by_county(self):
        estates = self.db.get_estates_by_county(47)
        self.assertEqual(len(estates), 1)
        self.assertEqual(estates[0]["name"], "Kilimani")
        self.assertEqual(estates[0]["sub_county"], "Dagoretti North")

    def test_register_property_success(self):
        prop = self.db.register_property(
            estate_id=self.estate_id,
            building_name="Elgon Court Apartments",
            street_name="Argwings Kodhek Road",
            plot_number="LR 209/4500",
            landlord_or_agency="Apex Property Managers Ltd",
        )
        self.assertIsNotNone(prop["id"])
        self.assertEqual(prop["building_name"], "Elgon Court Apartments")
        self.assertEqual(prop["estate_id"], self.estate_id)

    def test_register_duplicate_property_raises_conflict_error(self):
        self.db.register_property(
            estate_id=self.estate_id,
            building_name="Silverstone Residency",
            street_name="Chania Avenue",
        )

        with self.assertRaises(ValueError) as ctx:
            self.db.register_property(
                estate_id=self.estate_id,
                building_name="  Silverstone Residency  ",
                street_name="Chania Avenue",
            )

        self.assertIn("Property conflict", str(ctx.exception))


if __name__ == "__main__":
    unittest.main(verbosity=2)
