"""
KeJaTrust (NyumbaYangu) - Geographic & Property API Router
File: src/api/v1/geo_property.py
Governance: 'coderabbit-dna', 'security-and-hardening'

FastAPI router exposing:
  * GET  /api/v1/geo/counties
  * GET  /api/v1/geo/estates?county_id={id}
  * POST /api/v1/properties/register
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.schemas.geo_property import (
    CountyResponse,
    EstateResponse,
    PropertyCreate,
    PropertyResponse,
    PropertyDetailResponse,
    ForgetTenantRequest,
    ForgetTenantResponse,
)
from src.services.geo_property_service import GeoPropertyService

router = APIRouter(tags=["Geographic & Properties Directory"])


@router.get(
    "/geo/counties",
    response_model=List[CountyResponse],
    summary="List all 47 Kenyan Counties",
    description="Retrieves the normalized directory of Kenyan counties (codes 1 through 47).",
)
async def list_counties(
    db: AsyncSession = Depends(get_db_session),
) -> List[CountyResponse]:
    counties = await GeoPropertyService.get_all_counties(db)
    return [CountyResponse.model_validate(c) for c in counties]


@router.get(
    "/geo/estates",
    response_model=List[EstateResponse],
    summary="List Estates by County",
    description="Retrieves all registered estates or sub-counties belonging to a specific county ID.",
)
async def list_estates(
    county_id: int = Query(..., ge=1, le=47, description="Kenyan county ID (1-47)"),
    db: AsyncSession = Depends(get_db_session),
) -> List[EstateResponse]:
    # Check that the county exists
    county = await GeoPropertyService.get_county_by_id(db, county_id)
    if not county:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"County with ID {county_id} not found in Republic of Kenya directory.",
        )
    estates = await GeoPropertyService.get_estates_by_county(db, county_id)
    return [EstateResponse.model_validate(e) for e in estates]


@router.post(
    "/properties/register",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a Physical Property / Apartment Building",
    description=(
        "Registers a residential or commercial building. Prevents duplicate registrations "
        "using composite validation on (building_name, estate_id, street_name)."
    ),
)
async def register_property(
    payload: PropertyCreate,
    db: AsyncSession = Depends(get_db_session),
) -> PropertyResponse:
    try:
        new_property = await GeoPropertyService.register_property(db, payload)
        return PropertyResponse.model_validate(new_property)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register property due to an unexpected system error.",
        )


@router.get(
    "/properties",
    response_model=List[PropertyDetailResponse],
    summary="List Registered Properties with Metrics",
    description="Retrieves registered properties with location metadata, 5-vector average ratings, and Gold Badge counts.",
)
async def list_properties(
    q: Optional[str] = Query(None, description="Search query across building name, street, or landlord"),
    county_id: Optional[int] = Query(None, ge=1, le=47, description="Filter by Kenyan county code"),
    estate_id: Optional[int] = Query(None, gt=0, description="Filter by estate ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> List[PropertyDetailResponse]:
    return await GeoPropertyService.list_properties(
        session=db,
        query=q,
        county_id=county_id,
        estate_id=estate_id,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/properties/{property_id}",
    response_model=PropertyDetailResponse,
    summary="Get Property Rating Details",
    description="Retrieves a single property profile with aggregated 5-vector ratings and reviews count.",
)
async def get_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> PropertyDetailResponse:
    prop = await GeoPropertyService.get_property_detail(db, property_id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{property_id}' not found.",
        )
    return prop


@router.post(
    "/compliance/forget-tenant",
    response_model=ForgetTenantResponse,
    status_code=status.HTTP_200_OK,
    summary="ODPC Section 40 Right to be Forgotten",
    description="Statutory erasure under Kenya Data Protection Act 2019 Section 40. Atomically shreds all tenant references.",
)
async def forget_tenant(
    payload: ForgetTenantRequest,
    db: AsyncSession = Depends(get_db_session),
) -> ForgetTenantResponse:
    try:
        res = await GeoPropertyService.forget_tenant(
            session=db,
            pseudonym=payload.pseudonym,
            author_user_id=payload.author_user_id,
        )
        await db.commit()
        return res
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute statutory erasure request.",
        )
