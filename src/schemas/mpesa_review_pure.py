"""
KeJaTrust (NyumbaYangu) - Standalone Validation Wrapper for Pure Python Environments
File: src/schemas/mpesa_review_pure.py
Governance: 'coderabbit-dna', 'security-and-hardening'
"""

import re
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID


class PureDarajaC2BWebhookPayload:
    def __init__(self, **data):
        self.TransactionType = str(data.get("TransactionType", ""))
        self.TransID = self._validate_trans_id(data.get("TransID", ""))
        self.TransTime = self._validate_trans_time(data.get("TransTime", ""))
        self.TransAmount = self._validate_trans_amount(data.get("TransAmount", ""))
        self.BusinessShortCode = str(data.get("BusinessShortCode", ""))
        self.BillRefNumber = str(data.get("BillRefNumber", ""))
        self.MSISDN = self._validate_msisdn(data.get("MSISDN", ""))
        self.FirstName = data.get("FirstName")
        self.MiddleName = data.get("MiddleName")
        self.LastName = data.get("LastName")

    def _validate_trans_id(self, v: str) -> str:
        clean = str(v).strip().upper()
        if not re.match(r"^[A-Z0-9]{10}$", clean):
            raise ValueError(f"Invalid Daraja TransID format: '{clean}'. Must be exactly 10 alphanumeric characters.")
        return clean

    def _validate_msisdn(self, v: str) -> str:
        clean = str(v).strip()
        if not re.match(r"^254(?:7|1)\d{8}$", clean):
            raise ValueError(f"Invalid Kenyan MSISDN format: '{clean}'. Must match ^254[17]\\d{{8}}$.")
        return clean

    def _validate_trans_amount(self, v: str) -> str:
        try:
            amt = Decimal(str(v).strip())
            if amt <= 0:
                raise ValueError("Transaction amount must be strictly greater than 0.")
        except Exception:
            raise ValueError(f"Invalid numeric TransAmount: '{v}'.")
        return str(v).strip()

    def _validate_trans_time(self, v: str) -> str:
        clean = str(v).strip()
        if not re.match(r"^\d{14}$", clean):
            raise ValueError(f"TransTime '{clean}' must be 14 numeric digits (YYYYMMDDHHMMSS).")
        return clean

    def model_dump_json(self) -> str:
        import json
        return json.dumps({
            "TransactionType": self.TransactionType,
            "TransID": self.TransID,
            "TransTime": self.TransTime,
            "TransAmount": self.TransAmount,
            "BusinessShortCode": self.BusinessShortCode,
            "BillRefNumber": self.BillRefNumber,
            "MSISDN": self.MSISDN,
        })


class PureReviewCreateRequest:
    def __init__(self, **data):
        self.property_id = str(data.get("property_id", ""))
        self.mpesa_receipt_code = self._clean_receipt(data.get("mpesa_receipt_code"))

        # 5 Kenyan Rental Friction Rating Vectors (1-5 strictly bounded)
        self.rating_deposit_refund = self._validate_rating("rating_deposit_refund", data.get("rating_deposit_refund"))
        self.rating_water_utilities = self._validate_rating("rating_water_utilities", data.get("rating_water_utilities"))
        self.rating_security_privacy = self._validate_rating("rating_security_privacy", data.get("rating_security_privacy"))
        self.rating_eviction_fairness = self._validate_rating("rating_eviction_fairness", data.get("rating_eviction_fairness"))
        self.rating_management_responsiveness = self._validate_rating("rating_management_responsiveness", data.get("rating_management_responsiveness"))

        title = str(data.get("comment_title", "")).strip()
        if len(title) < 4:
            raise ValueError("Comment title must be at least 4 characters.")
        self.comment_title = title

        text = str(data.get("comment_text", "")).strip()
        if len(text) < 20:
            raise ValueError("Comment text must be at least 20 characters.")
        self.comment_text = text

        self.monthly_rent_paid = Decimal(str(data["monthly_rent_paid"])) if data.get("monthly_rent_paid") else None
        self.house_type = data.get("house_type")
        self.tenancy_start_year = int(data.get("tenancy_start_year", 2024))
        self.tenancy_end_year = int(data["tenancy_end_year"]) if data.get("tenancy_end_year") else None

    def _validate_rating(self, name: str, val: Any) -> int:
        try:
            ival = int(val)
            if ival < 1 or ival > 5:
                raise ValueError(f"Rating {name} must be between 1 and 5. Received: {val}")
            return ival
        except Exception:
            raise ValueError(f"Invalid integer rating for {name}: {val}")

    def _clean_receipt(self, v: Optional[str]) -> Optional[str]:
        if v:
            clean = str(v).strip().upper()
            if not re.match(r"^[A-Z0-9]{10}$", clean):
                raise ValueError("Receipt code must be a 10-character alphanumeric Safaricom TransID.")
            return clean
        return None
