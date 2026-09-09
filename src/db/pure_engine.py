"""
KeJaTrust (NyumbaYangu) - Standalone Mock Engine for Pure Python Execution
File: src/db/pure_engine.py
Governance: 'coderabbit-dna', 'security-and-hardening'

Provides a pure standard-library (sqlite3 / async) compatible engine and session
for environments where external ORMs are not pre-installed in the container.
"""

import sqlite3
import re
from uuid import uuid4
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any


class PureGeoPropertyEngine:
    """Standard-library backed database engine for geography and properties."""

    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self):
        cur = self.conn.cursor()
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS counties (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                code INTEGER NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS estates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                county_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                sub_county TEXT,
                FOREIGN KEY (county_id) REFERENCES counties (id) ON DELETE CASCADE,
                UNIQUE (county_id, name)
            );

            CREATE TABLE IF NOT EXISTS properties (
                id TEXT PRIMARY KEY,
                estate_id INTEGER NOT NULL,
                building_name TEXT NOT NULL,
                street_name TEXT NOT NULL,
                plot_number TEXT,
                landlord_or_agency TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (estate_id) REFERENCES estates (id) ON DELETE RESTRICT,
                UNIQUE (building_name, estate_id, street_name)
            );

            CREATE TABLE IF NOT EXISTS verified_leases (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                property_id TEXT NOT NULL,
                method TEXT NOT NULL,
                verification_token_hash TEXT NOT NULL UNIQUE,
                rent_paid_recorded REAL NOT NULL,
                status TEXT NOT NULL,
                raw_payload_encrypted BLOB,
                verified_at TEXT NOT NULL,
                FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                property_id TEXT NOT NULL,
                user_id TEXT,
                lease_verification_id TEXT,
                author_pseudonym TEXT NOT NULL,
                is_verified_tenant INTEGER NOT NULL DEFAULT 0,
                lifecycle_status TEXT NOT NULL DEFAULT 'active',
                rating_deposit_refund INTEGER NOT NULL,
                rating_water_utilities INTEGER NOT NULL,
                rating_security_privacy INTEGER NOT NULL,
                rating_eviction_fairness INTEGER NOT NULL,
                rating_management_responsiveness INTEGER NOT NULL,
                comment_title TEXT NOT NULL,
                comment_text TEXT NOT NULL,
                monthly_rent_paid REAL,
                house_type TEXT,
                tenancy_start_year INTEGER NOT NULL,
                tenancy_end_year INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT,
                FOREIGN KEY (lease_verification_id) REFERENCES verified_leases (id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS dispute_tickets (
                id TEXT PRIMARY KEY,
                review_id TEXT NOT NULL,
                complainant_type TEXT NOT NULL,
                complainant_name_encrypted BLOB NOT NULL,
                complainant_email_encrypted BLOB NOT NULL,
                complainant_phone_encrypted BLOB,
                police_ob_number TEXT,
                earb_license_number TEXT,
                defamation_claim_details TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'under_investigation',
                rebuttal_token_hash TEXT,
                rebuttal_deadline TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
            );
        """)
        self.conn.commit()

    def get_all_counties(self) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute("SELECT id, name, code FROM counties ORDER BY code ASC")
        return [dict(row) for row in cur.fetchall()]

    def get_county_by_id(self, county_id: int) -> Optional[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute("SELECT id, name, code FROM counties WHERE id = ?", (county_id,))
        row = cur.fetchone()
        return dict(row) if row else None

    def get_estates_by_county(self, county_id: int) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute("SELECT id, county_id, name, sub_county FROM estates WHERE county_id = ? ORDER BY name ASC", (county_id,))
        return [dict(row) for row in cur.fetchall()]

    def add_county(self, county_id: int, name: str, code: int):
        cur = self.conn.cursor()
        cur.execute("INSERT OR IGNORE INTO counties (id, name, code) VALUES (?, ?, ?)", (county_id, name, code))
        self.conn.commit()

    def add_estate(self, county_id: int, name: str, sub_county: Optional[str] = None) -> int:
        cur = self.conn.cursor()
        cur.execute("INSERT INTO estates (county_id, name, sub_county) VALUES (?, ?, ?)", (county_id, name.strip(), sub_county.strip() if sub_county else None))
        self.conn.commit()
        return cur.lastrowid

    def register_property(
        self,
        estate_id: int,
        building_name: str,
        street_name: str,
        plot_number: Optional[str] = None,
        landlord_or_agency: Optional[str] = None,
    ) -> Dict[str, Any]:
        cur = self.conn.cursor()

        # Check estate existence
        cur.execute("SELECT id, name FROM estates WHERE id = ?", (estate_id,))
        estate = cur.fetchone()
        if not estate:
            raise ValueError(f"Estate with ID {estate_id} does not exist.")

        # Check duplicate
        clean_building = re.sub(r"\s+", " ", building_name).strip()
        clean_street = re.sub(r"\s+", " ", street_name).strip()

        cur.execute(
            "SELECT id FROM properties WHERE estate_id = ? AND LOWER(building_name) = LOWER(?) AND LOWER(street_name) = LOWER(?)",
            (estate_id, clean_building, clean_street),
        )
        existing = cur.fetchone()
        if existing:
            raise ValueError(
                f"Property conflict: Building '{clean_building}' on '{clean_street}' "
                f"is already registered in estate {estate['name']}."
            )

        prop_id = str(uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        cur.execute(
            """INSERT INTO properties (id, estate_id, building_name, street_name, plot_number, landlord_or_agency, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                prop_id,
                estate_id,
                clean_building,
                clean_street,
                plot_number.strip() if plot_number else None,
                landlord_or_agency.strip() if landlord_or_agency else None,
                now_iso,
            ),
        )
        self.conn.commit()

        return {
            "id": prop_id,
            "estate_id": estate_id,
            "building_name": clean_building,
            "street_name": clean_street,
            "plot_number": plot_number,
            "landlord_or_agency": landlord_or_agency,
            "created_at": now_iso,
        }

    def file_dispute(
        self,
        review_id: str,
        complainant_type: str,
        complainant_name_enc: bytes,
        complainant_email_enc: bytes,
        complainant_phone_enc: Optional[bytes],
        police_ob_number: Optional[str],
        earb_license_number: Optional[str],
        defamation_claim_details: str,
        rebuttal_token_hash: str,
        rebuttal_deadline_iso: str,
    ) -> Dict[str, Any]:
        """Atomically inserts dispute ticket and sandboxes the target review."""
        cur = self.conn.cursor()
        cur.execute("SELECT id, lifecycle_status FROM reviews WHERE id = ?", (review_id,))
        rev = cur.fetchone()
        if not rev:
            raise ValueError(f"Target review '{review_id}' does not exist.")
        if rev["lifecycle_status"] == "under_investigation":
            raise ValueError("Conflict 409: Review is already under formal investigation.")

        dispute_id = str(uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        cur.execute(
            """INSERT INTO dispute_tickets (
                id, review_id, complainant_type, complainant_name_encrypted, complainant_email_encrypted,
                complainant_phone_encrypted, police_ob_number, earb_license_number, defamation_claim_details,
                status, rebuttal_token_hash, rebuttal_deadline, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_investigation', ?, ?, ?)""",
            (
                dispute_id, review_id, complainant_type, complainant_name_enc, complainant_email_enc,
                complainant_phone_enc, police_ob_number, earb_license_number, defamation_claim_details,
                rebuttal_token_hash, rebuttal_deadline_iso, now_iso
            ),
        )

        # Atomic Sandboxing: lifecycle_status='under_investigation' and is_verified_tenant=0
        cur.execute(
            "UPDATE reviews SET lifecycle_status = 'under_investigation', is_verified_tenant = 0 WHERE id = ?",
            (review_id,),
        )
        self.conn.commit()

        return {
            "dispute_id": dispute_id,
            "review_id": review_id,
            "status": "under_investigation",
            "rebuttal_deadline": rebuttal_deadline_iso,
        }

    def get_property_rating_summary(self, property_id: str) -> Optional[Dict[str, Any]]:
        """Pre-aggregated low-bandwidth rating summary projection."""
        cur = self.conn.cursor()
        cur.execute(
            """SELECT p.id, p.building_name, e.name as estate_name, c.name as county_name
               FROM properties p
               JOIN estates e ON p.estate_id = e.id
               JOIN counties c ON e.county_id = c.id
               WHERE p.id = ?""",
            (property_id,),
        )
        prop = cur.fetchone()
        if not prop:
            return None

        cur.execute(
            """SELECT 
                COUNT(id) as review_count,
                SUM(CASE WHEN is_verified_tenant = 1 THEN 1 ELSE 0 END) as verified_count,
                AVG(rating_deposit_refund) as avg_deposit,
                AVG(rating_water_utilities) as avg_water,
                AVG(rating_security_privacy) as avg_security,
                AVG(rating_eviction_fairness) as avg_eviction,
                AVG(rating_management_responsiveness) as avg_mgmt
               FROM reviews
               WHERE property_id = ? AND lifecycle_status = 'active'""",
            (property_id,),
        )
        agg = cur.fetchone()

        review_count = agg["review_count"] if agg and agg["review_count"] else 0
        verified_count = agg["verified_count"] if agg and agg["verified_count"] else 0
        avg_dep = round(agg["avg_deposit"] or 0.0, 2)
        avg_wat = round(agg["avg_water"] or 0.0, 2)
        avg_sec = round(agg["avg_security"] or 0.0, 2)
        avg_evi = round(agg["avg_eviction"] or 0.0, 2)
        avg_mgm = round(agg["avg_mgmt"] or 0.0, 2)
        overall = round((avg_dep + avg_wat + avg_sec + avg_evi + avg_mgm) / 5.0, 2) if review_count > 0 else 0.0

        return {
            "property_id": prop["id"],
            "building_name": prop["building_name"],
            "estate_name": prop["estate_name"],
            "county_name": prop["county_name"],
            "review_count": review_count,
            "verified_tenant_count": verified_count,
            "overall_score": overall,
            "avg_deposit_refund": avg_dep,
            "avg_water_utilities": avg_wat,
            "avg_security_privacy": avg_sec,
            "avg_eviction_fairness": avg_evi,
            "avg_management_responsiveness": avg_mgm,
        }

    def get_mobile_reviews_feed(self, property_id: str, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """Compact low-bandwidth reviews feed with text truncation and Cap 36 statutory banners."""
        cur = self.conn.cursor()
        cur.execute(
            """SELECT id, author_pseudonym, is_verified_tenant, lifecycle_status,
                      rating_deposit_refund, rating_water_utilities, rating_security_privacy,
                      rating_eviction_fairness, rating_management_responsiveness,
                      comment_title, comment_text, tenancy_start_year, tenancy_end_year, created_at
               FROM reviews
               WHERE property_id = ?
               ORDER BY created_at DESC
               LIMIT ? OFFSET ?""",
            (property_id, limit, offset),
        )
        rows = cur.fetchall()

        cards = []
        for r in rows:
            if r["lifecycle_status"] == "under_investigation":
                title = "NOTICE UNDER CAP 36: Review Sandboxed"
                snippet = "Withheld under statutory notice-and-takedown protocol."
            elif r["lifecycle_status"] == "archived_defamatory":
                title = "[REDACTED DEFAMATORY]"
                snippet = "[Removed following statutory expiration]"
            else:
                title = r["comment_title"]
                text = r["comment_text"]
                snippet = text[:80] + ("..." if len(text) > 80 else "")

            period = f"{r['tenancy_start_year']} - {r['tenancy_end_year'] if r['tenancy_end_year'] else 'Present'}"
            cards.append({
                "review_id": r["id"],
                "author_pseudonym": r["author_pseudonym"],
                "is_verified_tenant": bool(r["is_verified_tenant"]),
                "rating_deposit_refund": r["rating_deposit_refund"],
                "rating_water_utilities": r["rating_water_utilities"],
                "rating_security_privacy": r["rating_security_privacy"],
                "rating_eviction_fairness": r["rating_eviction_fairness"],
                "rating_management_responsiveness": r["rating_management_responsiveness"],
                "comment_title": title,
                "comment_snippet": snippet,
                "tenancy_period": period,
                "created_at_compact": r["created_at"][:10] if r["created_at"] else "",
                "lifecycle_status": r["lifecycle_status"],
            })
        return cards

