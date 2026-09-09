"""
KeJaTrust (NyumbaYangu) - Mobile Optimization & Low-Bandwidth Data Services
File: src/services/mobile_service.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'

Encapsulates:
  * High-latency, low-bandwidth optimized aggregations for Kenyan cellular networks (Safaricom / Airtel)
  * Heavy text blob exclusion and compact pre-aggregated score computations
  * Dynamic snippet truncation and bandwidth-efficient payload serialization
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

try:
    from sqlalchemy import select, func, and_
    from sqlalchemy.ext.asyncio import AsyncSession
    from src.db.models import Property, Estate, County, Review
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False
    AsyncSession = Any

try:
    from src.schemas.dispute_mobile import MobileRatingSummary, MobileReviewCard
except ImportError:
    class MobileRatingSummary:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__

    class MobileReviewCard:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__


class MobileOptimizationService:
    """Provides low-bandwidth query projections and compressed response payloads for mobile devices."""

    @staticmethod
    async def get_property_rating_summary(
        session: AsyncSession,
        property_id: UUID,
    ) -> Optional[Dict[str, Any]]:
        """
        Executes a targeted aggregate projection without loading full review bodies or comments.
        Calculates 5-vector averages directly in SQL to minimize cellular transfer footprints.
        """
        # Load property and location metadata
        stmt_prop = (
            select(Property, Estate, County)
            .join(Estate, Property.estate_id == Estate.id)
            .join(County, Estate.county_id == County.id)
            .where(Property.id == property_id)
        )
        prop_res = (await session.execute(stmt_prop)).first()
        if not prop_res:
            return None

        prop, estate, county = prop_res

        # Calculate averages for active reviews only (excluding sandboxed under_investigation or archived)
        stmt_agg = (
            select(
                func.count(Review.id).label("review_count"),
                func.coalesce(func.sum(func.case((Review.is_verified_tenant == True, 1), else_=0)), 0).label("verified_count"),
                func.coalesce(func.avg(Review.rating_deposit_refund), 0.0).label("avg_deposit"),
                func.coalesce(func.avg(Review.rating_water_utilities), 0.0).label("avg_water"),
                func.coalesce(func.avg(Review.rating_security_privacy), 0.0).label("avg_security"),
                func.coalesce(func.avg(Review.rating_eviction_fairness), 0.0).label("avg_eviction"),
                func.coalesce(func.avg(Review.rating_management_responsiveness), 0.0).label("avg_mgmt"),
            )
            .where(
                and_(
                    Review.property_id == property_id,
                    Review.lifecycle_status == "active",
                )
            )
        )
        agg_res = (await session.execute(stmt_agg)).first()

        review_count = int(agg_res.review_count) if agg_res else 0
        verified_count = int(agg_res.verified_count) if agg_res else 0
        avg_dep = round(float(agg_res.avg_deposit), 2) if agg_res else 0.0
        avg_wat = round(float(agg_res.avg_water), 2) if agg_res else 0.0
        avg_sec = round(float(agg_res.avg_security), 2) if agg_res else 0.0
        avg_evi = round(float(agg_res.avg_eviction), 2) if agg_res else 0.0
        avg_mgm = round(float(agg_res.avg_mgmt), 2) if agg_res else 0.0

        overall = round((avg_dep + avg_wat + avg_sec + avg_evi + avg_mgm) / 5.0, 2) if review_count > 0 else 0.0

        return {
            "property_id": str(prop.id),
            "building_name": prop.building_name,
            "estate_name": estate.name,
            "county_name": county.name,
            "review_count": review_count,
            "verified_tenant_count": verified_count,
            "overall_score": overall,
            "avg_deposit_refund": avg_dep,
            "avg_water_utilities": avg_wat,
            "avg_security_privacy": avg_sec,
            "avg_eviction_fairness": avg_evi,
            "avg_management_responsiveness": avg_mgm,
        }

    @staticmethod
    async def get_mobile_reviews_feed(
        session: AsyncSession,
        property_id: UUID,
        limit: int = 10,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves compact review summaries:
        * Truncates comment text to 80 characters.
        * Displays Cap 36 statutory warning notices for sandboxed reviews.
        * Omits heavy PII fields and raw transaction blobs.
        """
        stmt = (
            select(Review)
            .where(Review.property_id == property_id)
            .order_by(Review.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        reviews = (await session.execute(stmt)).scalars().all()

        feed_items = []
        for r in reviews:
            if r.lifecycle_status == "under_investigation":
                title = "NOTICE UNDER CAP 36: Review Sandboxed"
                snippet = "Withheld under statutory notice-and-takedown protocol."
            elif r.lifecycle_status == "archived_defamatory":
                title = "[REDACTED DEFAMATORY]"
                snippet = "[Removed following statutory expiration]"
            else:
                title = r.comment_title
                # Compact snippet truncated to 80 chars
                snippet = r.comment_text[:80] + ("..." if len(r.comment_text) > 80 else "")

            period = f"{r.tenancy_start_year} - {r.tenancy_end_year if r.tenancy_end_year else 'Present'}"
            compact_date = r.created_at.strftime("%Y-%m-%d") if r.created_at else ""

            feed_items.append({
                "review_id": str(r.id),
                "author_pseudonym": r.author_pseudonym,
                "is_verified_tenant": r.is_verified_tenant,
                "rating_deposit_refund": r.rating_deposit_refund,
                "rating_water_utilities": r.rating_water_utilities,
                "rating_security_privacy": r.rating_security_privacy,
                "rating_eviction_fairness": r.rating_eviction_fairness,
                "rating_management_responsiveness": r.rating_management_responsiveness,
                "comment_title": title,
                "comment_snippet": snippet,
                "tenancy_period": period,
                "created_at_compact": compact_date,
                "lifecycle_status": r.lifecycle_status,
            })

        return feed_items
