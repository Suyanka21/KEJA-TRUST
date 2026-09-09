"""
KeJaTrust (NyumbaYangu) - Standalone Validation Wrapper for Dispute & Mobile Schemas
File: src/schemas/dispute_mobile_pure.py
Governance: 'coderabbit-dna', 'security-and-hardening'
"""

import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from uuid import UUID


class PureDisputeFileRequest:
    def __init__(self, **data):
        self.review_id = str(data.get("review_id", ""))
        self.complainant_type = str(data.get("complainant_type", "landlord"))
        self.complainant_name = str(data.get("complainant_name", "")).strip()
        if len(self.complainant_name) < 2:
            raise ValueError("Complainant name must be at least 2 characters.")
            
        self.complainant_email = self._validate_email(data.get("complainant_email", ""))
        self.complainant_phone = self._validate_phone(data.get("complainant_phone"))
        self.police_ob_number = self._validate_police_ob(data.get("police_ob_number"))
        self.earb_license_number = self._validate_earb_license(data.get("earb_license_number"))
        
        claim = str(data.get("defamation_claim_details", "")).strip()
        if len(claim) < 20:
            raise ValueError("Defamation claim details must be at least 20 characters.")
        self.defamation_claim_details = claim

    def _validate_police_ob(self, v: Optional[str]) -> Optional[str]:
        if v:
            clean = re.sub(r"\s+", " ", str(v)).strip()
            if not re.match(r"^OB\s+\d{1,4}\/\d{1,2}\/\d{1,2}\/\d{4}$", clean):
                raise ValueError(
                    f"Invalid Kenya Police OB Number format: '{clean}'. "
                    f"Must match '^OB \\d{{1,4}}/\\d{{1,2}}/\\d{{1,2}}/\\d{{4}}$' (e.g. 'OB 42/12/08/2026')."
                )
            return clean
        return None

    def _validate_earb_license(self, v: Optional[str]) -> Optional[str]:
        if v:
            clean = str(v).strip().upper()
            if not re.match(r"^EARB\/[A-Z]{1,4}\/\d{3,6}$", clean):
                raise ValueError(
                    f"Invalid EARB License Number format: '{clean}'. "
                    f"Must match '^EARB/[A-Z]{{1,4}}/\\d{{3,6}}$' (e.g. 'EARB/A/1234')."
                )
            return clean
        return None

    def _validate_email(self, v: str) -> str:
        clean = str(v).strip()
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", clean):
            raise ValueError(f"Invalid email address: '{clean}'.")
        return clean

    def _validate_phone(self, v: Optional[str]) -> Optional[str]:
        if v:
            clean = re.sub(r"[\s\-]", "", str(v)).strip()
            if re.match(r"^(?:\+254|0)[17]\d{8}$", clean):
                return clean
            raise ValueError(f"Invalid Kenyan MSISDN for complainant: '{clean}'.")
        return None


class PureTenantRebuttalSubmitRequest:
    def __init__(self, **data):
        self.dispute_id = str(data.get("dispute_id", ""))
        token = str(data.get("rebuttal_token", "")).strip()
        if len(token) < 32:
            raise ValueError("Rebuttal token must be a secure token string.")
        self.rebuttal_token = token

        receipt = str(data.get("mpesa_receipt_code", "")).strip().upper()
        if not re.match(r"^[A-Z0-9]{10}$", receipt):
            raise ValueError("Receipt code must be a 10-character alphanumeric Safaricom TransID.")
        self.mpesa_receipt_code = receipt
        self.rebuttal_statement = data.get("rebuttal_statement")
