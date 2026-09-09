"""
KeJaTrust (NyumbaYangu) - Geographic & Property Business Services
File: src/services/geo_property_service.py
Governance: 'coderabbit-dna', 'security-and-hardening'

Executes transactional queries for counties, estates, and properties,
enforcing duplicate detection and composite unique constraints.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from src.db.models import County, Estate, Property
from src.schemas.geo_property import PropertyCreate, EstateCreate


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
