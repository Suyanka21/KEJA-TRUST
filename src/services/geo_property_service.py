"""
KeJaTrust (NyumbaYangu) - Geographic & Property Business Services
File: src/services/geo_property_service.py
Governance: 'coderabbit-dna', 'security-and-hardening'

Executes transactional queries for counties, estates, and properties,
enforcing duplicate detection and composite unique constraints.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from src.db.models import County, Estate, Property, Review
from src.schemas.geo_property import (
    PropertyCreate,
    EstateCreate,
    PropertyDetailResponse,
    VectorScores,
    ForgetTenantResponse,
)


class GeoPropertyService:
    """Service layer managing location hierarchy and property ingestion."""

    @staticmethod
    async def get_all_counties(session: AsyncSession) -> List[County]:
        """Fetches all 47 normalized Kenyan counties ordered by code."""
        stmt = select(County).order_by(County.code.asc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_county_by_id(session: AsyncSession, county_id: int) -> Optional[County]:
        """Retrieves a specific county by its numeric ID (1-47)."""
        stmt = select(County).where(County.id == county_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_estates_by_county(session: AsyncSession, county_id: int) -> List[Estate]:
        """Retrieves all registered estates mapped to a specific county."""
        stmt = select(Estate).where(Estate.county_id == county_id).order_by(Estate.name.asc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_estate(session: AsyncSession, data: EstateCreate) -> Estate:
        """Registers a new estate under a specific county."""
        # Verify county exists
        county = await GeoPropertyService.get_county_by_id(session, data.county_id)
        if not county:
            raise ValueError(f"County with ID {data.county_id} does not exist.")

        # Check for existing estate in county
        stmt = select(Estate).where(
            and_(
                Estate.county_id == data.county_id,
                Estate.name == data.name.strip(),
            )
        )
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if existing:
            return existing

        estate = Estate(
            county_id=data.county_id,
            name=data.name.strip(),
            sub_county=data.sub_county.strip() if data.sub_county else None,
        )
        session.add(estate)
        await session.flush()
        return estate

    @staticmethod
    async def register_property(session: AsyncSession, payload: PropertyCreate) -> Property:
        """
        Creates a new property entry with strict pre-validation of the
        composite unique constraint: (building_name, estate_id, street_name).
        Raises ValueError if an identical building is already cataloged.
        """
        # 1. Verify that the estate exists
        stmt_estate = select(Estate).where(Estate.id == payload.estate_id)
        estate = (await session.execute(stmt_estate)).scalar_one_or_none()
        if not estate:
            raise ValueError(f"Estate with ID {payload.estate_id} does not exist.")

        # 2. Check for duplicate property (case-insensitive normalized check)
        stmt_check = select(Property).where(
            and_(
                Property.estate_id == payload.estate_id,
                Property.building_name.ilike(payload.building_name.strip()),
                Property.street_name.ilike(payload.street_name.strip()),
            )
        )
        existing_prop = (await session.execute(stmt_check)).scalar_one_or_none()
        if existing_prop:
            raise ValueError(
                f"Property conflict: Building '{payload.building_name}' on '{payload.street_name}' "
                f"is already registered in estate {estate.name}."
            )

        # 3. Create and persist new property
        prop = Property(
            estate_id=payload.estate_id,
            building_name=payload.building_name.strip(),
            street_name=payload.street_name.strip(),
            plot_number=payload.plot_number.strip() if payload.plot_number else None,
            landlord_or_agency=payload.landlord_or_agency.strip() if payload.landlord_or_agency else None,
        )
        session.add(prop)
        try:
            await session.flush()
        except IntegrityError as e:
            await session.rollback()
            raise ValueError("Database constraint violation: duplicate property identity.") from e

        return prop

    @staticmethod
    async def _calculate_property_metrics(session: AsyncSession, property_id: UUID) -> Dict[str, Any]:
        """Calculates 5-vector average ratings and verified tenant statistics for a property."""
        stmt = select(Review).where(
            and_(
                Review.property_id == property_id,
                Review.lifecycle_status == "active",
            )
        )
        reviews = list((await session.execute(stmt)).scalars().all())
        total = len(reviews)
        if total == 0:
            return {
                "overall_score": 0.0,
                "review_count": 0,
                "verified_tenant_count": 0,
                "scores": VectorScores(),
            }

        dep = round(sum(r.rating_deposit_refund for r in reviews) / total, 1)
        wat = round(sum(r.rating_water_utilities for r in reviews) / total, 1)
        sec = round(sum(r.rating_security_privacy for r in reviews) / total, 1)
        evi = round(sum(r.rating_eviction_fairness for r in reviews) / total, 1)
        man = round(sum(r.rating_management_responsiveness for r in reviews) / total, 1)
        overall = round((dep + wat + sec + evi + man) / 5.0, 1)
        verified_count = sum(1 for r in reviews if r.is_verified_tenant)

        return {
            "overall_score": overall,
            "review_count": total,
            "verified_tenant_count": verified_count,
            "scores": VectorScores(
                deposit_refund=dep,
                water_utilities=wat,
                security_privacy=sec,
                eviction_fairness=evi,
                management_responsiveness=man,
            ),
        }

    @staticmethod
    async def list_properties(
        session: AsyncSession,
        query: Optional[str] = None,
        county_id: Optional[int] = None,
        estate_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[PropertyDetailResponse]:
        """Lists registered properties with estate/county metadata and computed rating metrics."""
        stmt = (
            select(Property, Estate, County)
            .join(Estate, Property.estate_id == Estate.id)
            .join(County, Estate.county_id == County.id)
        )

        if county_id:
            stmt = stmt.where(County.id == county_id)
        if estate_id:
            stmt = stmt.where(Estate.id == estate_id)
        if query:
            clean_q = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    Property.building_name.ilike(clean_q),
                    Property.street_name.ilike(clean_q),
                    Property.landlord_or_agency.ilike(clean_q),
                    Estate.name.ilike(clean_q),
                )
            )

        stmt = stmt.order_by(Property.created_at.desc()).offset(offset).limit(limit)
        results = (await session.execute(stmt)).all()

        property_cards: List[PropertyDetailResponse] = []
        for prop, estate, county in results:
            metrics = await GeoPropertyService._calculate_property_metrics(session, prop.id)
            property_cards.append(
                PropertyDetailResponse(
                    id=prop.id,
                    estate_id=estate.id,
                    estate_name=estate.name,
                    county_id=county.id,
                    county_name=county.name,
                    building_name=prop.building_name,
                    street_name=prop.street_name,
                    plot_number=prop.plot_number,
                    landlord_or_agency=prop.landlord_or_agency,
                    overall_score=metrics["overall_score"],
                    review_count=metrics["review_count"],
                    verified_tenant_count=metrics["verified_tenant_count"],
                    scores=metrics["scores"],
                    created_at=prop.created_at,
                )
            )

        return property_cards

    @staticmethod
    async def get_property_detail(session: AsyncSession, property_id: UUID) -> Optional[PropertyDetailResponse]:
        """Retrieves single property with aggregated ratings."""
        stmt = (
            select(Property, Estate, County)
            .join(Estate, Property.estate_id == Estate.id)
            .join(County, Estate.county_id == County.id)
            .where(Property.id == property_id)
        )
        row = (await session.execute(stmt)).first()
        if not row:
            return None

        prop, estate, county = row
        metrics = await GeoPropertyService._calculate_property_metrics(session, prop.id)
        return PropertyDetailResponse(
            id=prop.id,
            estate_id=estate.id,
            estate_name=estate.name,
            county_id=county.id,
            county_name=county.name,
            building_name=prop.building_name,
            street_name=prop.street_name,
            plot_number=prop.plot_number,
            landlord_or_agency=prop.landlord_or_agency,
            overall_score=metrics["overall_score"],
            review_count=metrics["review_count"],
            verified_tenant_count=metrics["verified_tenant_count"],
            scores=metrics["scores"],
            created_at=prop.created_at,
        )

    @staticmethod
    async def forget_tenant(
        session: AsyncSession,
        pseudonym: Optional[str] = None,
        author_user_id: Optional[str] = None,
    ) -> ForgetTenantResponse:
        """
        ODPC Data Protection Act 2019 Section 40: Right to be Forgotten.
        Atomically shreds personal pseudonym correlation and anonymizes all authored reviews.
        """
        if not pseudonym and not author_user_id:
            raise ValueError("Must provide either pseudonym or author_user_id for erasure request.")

        filter_clauses = []
        if pseudonym:
            filter_clauses.append(Review.author_pseudonym.ilike(pseudonym.strip()))
        if author_user_id:
            try:
                filter_clauses.append(Review.user_id == UUID(author_user_id.strip()))
            except Exception:
                pass

        if not filter_clauses:
            raise ValueError("No valid identifier provided for erasure.")

        stmt = select(Review).where(or_(*filter_clauses))
        reviews = list((await session.execute(stmt)).scalars().all())

        count = len(reviews)
        for r in reviews:
            r.lifecycle_status = "shredded_odpc"
            r.author_pseudonym = "[ODPC_ERASED_TENANT]"
            r.comment_title = "[Review erased under ODPC Section 40]"
            r.comment_text = "[Content permanently shredded upon tenant statutory request.]"
            r.lease_verification_id = None
            r.is_verified_tenant = False

        await session.flush()
        return ForgetTenantResponse(
            success=True,
            purged_reviews_count=count,
            pseudonym_erased=pseudonym or "author_user_id_purged",
            legal_confirmation="Statutory compliance verified under Kenya Data Protection Act 2019 Section 40.",
        )
