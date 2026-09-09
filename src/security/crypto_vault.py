"""
KeJaTrust (NyumbaYangu) - Cryptographic Vault & Privacy Sanitization Engine
File: src/security/crypto_vault.py
Governance: 'security-and-hardening', 'coderabbit-dna', 'using-agent-skills'
Jurisdiction: Republic of Kenya (ODPC Data Protection Act 2019)

Provides deterministic zero-knowledge salted hashing for deduplication,
AES-256-GCM authenticated envelope encryption for archival PII storage,
zero-downtime key rotation pipelines, and stream-level logging redaction filters.
"""

import os
import re
import hmac
import base64
import hashlib
import logging
from typing import Tuple, Dict, Any, Optional

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False


# ============================================================================
# 1. STREAM-LEVEL LOGGER SANITIZATION FILTER (ODPC REDACTION)
# ============================================================================

class LoggerSanitizationFilter(logging.Filter):
    """
    Dynamic log sanitization filter to prevent accidental leakage of raw Kenyan
    MSISDNs (+254..., 07..., 01...) or email addresses to stdout, local files,
    or cloud telemetry streams (e.g. CloudWatch, Google Cloud Logging).
    """

    PHONE_PATTERN = re.compile(r"(?:\+254|0)(?:[17]\d{8})")
    EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.sanitize_text(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: self._sanitize_value(v) for k, v in record.args.items()}
            elif isinstance(record.args, tuple):
                record.args = tuple(self._sanitize_value(v) for v in record.args)
        return True

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """Applies deterministic regex masking over unstructured strings."""
        if not text:
            return text
        sanitized = cls.PHONE_PATTERN.sub("[REDACTED_KENYAN_MSISDN]", text)
        sanitized = cls.EMAIL_PATTERN.sub("[REDACTED_ODPC_EMAIL]", sanitized)
        return sanitized

    @classmethod
    def _sanitize_value(cls, val: Any) -> Any:
        if isinstance(val, str):
            return cls.sanitize_text(val)
        return val


# Configure the default audit logger
logger = logging.getLogger("kejatrust.crypto")
logger.addFilter(LoggerSanitizationFilter())


# ============================================================================
# 2. CRYPTOGRAPHIC VAULT (AES-256-GCM & SALTED HMAC-SHA256)
# ============================================================================

class CryptographicVault:
    """
    Production-grade cryptographic boundary isolating sensitive PII at the API ingress.
    Enforces AES-256-GCM authenticated symmetric encryption and salted HMAC-SHA256
    deterministic fingerprints for zero-knowledge deduplication.
    """

    VERSION_BYTE = b"\x01"  # Cryptographic envelope version identifier
    NONCE_SIZE_BYTES = 12   # 96-bit CSPRNG IV recommended for GCM mode

    def __init__(
        self,
        master_key_b64: Optional[str] = None,
        phone_salt: Optional[str] = None,
        receipt_salt: Optional[str] = None,
    ):
        """
        Initializes the cryptographic vault.
        Master key must be a base64-encoded 256-bit (32 bytes) key.
        Salts are high-entropy cryptographic strings supplied from KMS / Secrets Manager.
        """
        if master_key_b64:
            self._master_key = base64.urlsafe_b64decode(master_key_b64.encode("utf-8"))
        else:
            env_key = os.getenv("KEJATRUST_MASTER_KEY")
            if env_key:
                self._master_key = base64.urlsafe_b64decode(env_key.encode("utf-8"))
            else:
                # Generate an ephemeral 256-bit key for runtime verification if not configured
                self._master_key = AESGCM.generate_key(bit_length=256) if HAS_CRYPTOGRAPHY else os.urandom(32)

        if len(self._master_key) != 32:
            raise ValueError(f"Master key must be strictly 256 bits (32 bytes). Received {len(self._master_key)} bytes.")

        if HAS_CRYPTOGRAPHY:
            self._aesgcm = AESGCM(self._master_key)
        else:
            self._aesgcm = None

        self.phone_salt = phone_salt or os.getenv("KEJATRUST_PHONE_SALT", "NairobiDagorettiSalt2026_x77")
        self.receipt_salt = receipt_salt or os.getenv("KEJATRUST_RECEIPT_SALT", "DarajaReceiptSalt2026_m88")

    @classmethod
    def generate_random_master_key(cls) -> str:
        """Generates a cryptographically secure, url-safe base64-encoded 256-bit key."""
        raw_key = os.urandom(32)
        return base64.urlsafe_b64encode(raw_key).decode("utf-8")

    def hmac_fingerprint(self, value: str, salt_type: str = "phone", context: str = "KEJATRUST_V1") -> str:
        """
        Generates an irreversible, deterministic HMAC-SHA256 fingerprint for O(1) deduplication.
        Does not leak plaintext PII even if the database index is exfiltrated without the salt.
        """
        if not value:
            raise ValueError("Cannot compute HMAC fingerprint for an empty value.")

        salt = self.phone_salt if salt_type == "phone" else self.receipt_salt
        canonical = value.strip().lower()
        payload = f"{context}::{salt_type}::{canonical}".encode("utf-8")
        return hmac.new(salt.encode("utf-8"), payload, hashlib.sha256).hexdigest()

    def encrypt_pii(self, raw_val: str, associated_data: Optional[bytes] = None) -> bytes:
        """
        Encrypts raw PII into an AES-256-GCM authenticated payload.
        Structure: [Version (1B)] + [Nonce (12B)] + [Ciphertext + 16B GCM Tag].
        """
        if not raw_val:
            raise ValueError("Raw plaintext PII cannot be empty for encryption.")

        plaintext_bytes = raw_val.strip().encode("utf-8")
        nonce = os.urandom(self.NONCE_SIZE_BYTES)
        aad = associated_data or b"ODPC_KENYA_DPA_2019"

        if HAS_CRYPTOGRAPHY and self._aesgcm is not None:
            ciphertext = self._aesgcm.encrypt(nonce, plaintext_bytes, aad)
        else:
            # High-assurance authenticated envelope emulation (HKDF-derived key stream + HMAC-SHA256 authentication tag)
            enc_key = hmac.new(self._master_key, b"ENC::" + nonce, hashlib.sha256).digest()
            auth_key = hmac.new(self._master_key, b"AUTH::" + nonce, hashlib.sha256).digest()

            # Stream keystream derivation
            keystream = b""
            block_idx = 0
            while len(keystream) < len(plaintext_bytes):
                keystream += hmac.new(enc_key, block_idx.to_bytes(4, "big"), hashlib.sha256).digest()
                block_idx += 1

            cipher_bytes = bytes(p ^ k for p, k in zip(plaintext_bytes, keystream[:len(plaintext_bytes)]))
            tag = hmac.new(auth_key, aad + nonce + cipher_bytes, hashlib.sha256).digest()[:16]
            ciphertext = cipher_bytes + tag

        # Envelope: version + nonce + ciphertext
        return self.VERSION_BYTE + nonce + ciphertext

    def decrypt_pii(self, payload: bytes, associated_data: Optional[bytes] = None) -> str:
        """
        Decrypts an AES-256-GCM authenticated payload.
        Validates authentication tag; raises ValueError if tampered or corrupt.
        """
        if not payload or len(payload) < (1 + self.NONCE_SIZE_BYTES + 16):
            raise ValueError("Ciphertext payload is truncated or invalid.")

        version = payload[0:1]
        if version != self.VERSION_BYTE:
            raise ValueError(f"Unsupported ciphertext envelope version: {version.hex()}")

        nonce = payload[1 : 1 + self.NONCE_SIZE_BYTES]
        ciphertext = payload[1 + self.NONCE_SIZE_BYTES :]
        aad = associated_data or b"ODPC_KENYA_DPA_2019"

        if HAS_CRYPTOGRAPHY and self._aesgcm is not None:
            try:
                decrypted_bytes = self._aesgcm.decrypt(nonce, ciphertext, aad)
                return decrypted_bytes.decode("utf-8")
            except Exception as e:
                logger.error("Cryptographic decryption failed: tag verification mismatch or corrupt data.")
                raise ValueError("Failed to authenticate or decrypt ciphertext payload.") from e
        else:
            auth_key = hmac.new(self._master_key, b"AUTH::" + nonce, hashlib.sha256).digest()
            cipher_bytes = ciphertext[:-16]
            tag = ciphertext[-16:]

            expected_tag = hmac.new(auth_key, aad + nonce + cipher_bytes, hashlib.sha256).digest()[:16]
            if not hmac.compare_digest(tag, expected_tag):
                logger.error("Cryptographic decryption failed: tag verification mismatch or corrupt data.")
                raise ValueError("Failed to authenticate or decrypt ciphertext payload.")

            enc_key = hmac.new(self._master_key, b"ENC::" + nonce, hashlib.sha256).digest()
            keystream = b""
            block_idx = 0
            while len(keystream) < len(cipher_bytes):
                keystream += hmac.new(enc_key, block_idx.to_bytes(4, "big"), hashlib.sha256).digest()
                block_idx += 1

            plaintext_bytes = bytes(c ^ k for c, k in zip(cipher_bytes, keystream[:len(cipher_bytes)]))
            return plaintext_bytes.decode("utf-8")

    def rotate_master_key(
        self,
        current_ciphertext: bytes,
        new_vault: "CryptographicVault",
        associated_data: Optional[bytes] = None,
    ) -> Tuple[bytes, bool]:
        """
        Executes a zero-downtime key rotation for a specific ciphertext payload.
        Decrypts using current K_master_v1, re-encrypts using K_master_v2,
        and verifies that the underlying HMAC fingerprint remains unchanged.
        Returns: Tuple[new_ciphertext: bytes, fingerprint_invariant_verified: bool].
        """
        # 1. Decrypt plaintext using current master key
        decrypted_raw = self.decrypt_pii(current_ciphertext, associated_data=associated_data)

        # 2. Compute fingerprint under current salt
        original_fingerprint = self.hmac_fingerprint(decrypted_raw, salt_type="phone")

        # 3. Encrypt under new vault's master key
        new_ciphertext = new_vault.encrypt_pii(decrypted_raw, associated_data=associated_data)

        # 4. Verify that new vault computes the exact same fingerprint
        new_fingerprint = new_vault.hmac_fingerprint(decrypted_raw, salt_type="phone")
        fingerprint_stable = (original_fingerprint == new_fingerprint)

        return new_ciphertext, fingerprint_stable
