"""
KeJaTrust (NyumbaYangu) - Defamation Act (Cap 36) & Mobile Optimization API Router
File: src/api/v1/dispute_mobile.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'
Jurisdiction: Republic of Kenya (Defamation Act Cap 36)

Endpoints:
  * POST /api/v1/disputes/file (File Cap 36 dispute with Police OB or EARB number)
  * POST /api/v1/disputes/rebut (Tenant rebuttal submission via 256-bit token + M-Pesa proof)
  * GET  /api/v1/mobile/properties/{property_id}/summary (Compressed 5-vector rating averages)
  * GET  /api/v1/mobile/properties/{property_id}/feed (Compact review snippet cards)
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.security.crypto_vault import CryptographicVault
from src.schemas.dispute_mobile import (
    DisputeFileRequest,
    DisputeFileResponse,
    TenantRebuttalSubmitRequest,
    TenantRebuttalResponse,
    MobileRatingSummary,
    MobileReviewCard,
)
from src.services.dispute_service import DefamationDisputeService
from src.services.mobile_service import MobileOptimizationService

router = APIRouter(tags=["Defamation Disputes (Cap 36) & Mobile Feed"])

_vault_instance = CryptographicVault()

def get_crypto_vault() -> CryptographicVault:
    return _vault_instance


@router.post(
    "/disputes/file",
    response_model=DisputeFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="File Notice-and-Takedown Dispute (Defamation Act Cap 36)",
    description=(
        "Enforces statutory standing: Complainant must provide either a valid Kenya Police OB Number "
        "or licensed EARB Registration Number. Atomically sandboxes the review and enqueues tenant rebuttal dispatch."
    ),
)
async def file_dispute(
    payload: DisputeFileRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    vault: CryptographicVault = Depends(get_crypto_vault),
) -> DisputeFileResponse:
    try:
        dispute_ticket, raw_rebuttal_token = await DefamationDisputeService.file_dispute(
            session=db,
            payload=payload,
            vault=vault,
        )

        # Enqueue background rebuttal dispatch task
        background_tasks.add_task(
            DefamationDisputeService.dispatch_tenant_rebuttal,
            session=db,
            dispute_id=dispute_ticket.id,
            raw_rebuttal_token=raw_rebuttal_token,
            vault=vault,
        )

        return DisputeFileResponse(
            dispute_id=dispute_ticket.id,
            review_id=dispute_ticket.review_id,
            lifecycle_status="under_investigation",
            is_sandboxed=True,
            statutory_warning=(
                "NOTICE UNDER CAP 36: Review is temporarily sandboxed. "
                "Author has been dispatched a 7-day (168-hour) rebuttal notice."
            ),
            rebuttal_deadline=dispute_ticket.rebuttal_deadline,
            message="Dispute filed successfully with verified statutory standing. Review atomically sandboxed.",
        )
    except ValueError as val_err:
        err_msg = str(val_err)
        if "Statutory Standing Error" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=err_msg,
            )
        elif "Conflict 409" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=err_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg,
            )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to file dispute due to an internal system error.",
        )


@router.post(
    "/disputes/rebut",
    response_model=TenantRebuttalResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Tenant Rebuttal (Section 14 Justification Defense)",
    description=(
        "Tenant validates their 256-bit single-use token and submits M-Pesa rent receipt proof. "
        "Upon verification, review is restored with elevated Gold Badge verification status."
    ),
)
async def rebut_dispute(
    payload: TenantRebuttalSubmitRequest,
    db: AsyncSession = Depends(get_db_session),
    vault: CryptographicVault = Depends(get_crypto_vault),
) -> TenantRebuttalResponse:
    try:
        restored_review = await DefamationDisputeService.rebut_dispute(
            session=db,
            payload=payload,
            vault=vault,
        )
        return TenantRebuttalResponse(
            dispute_id=payload.dispute_id,
            review_id=restored_review.id,
            status="resolved_restored",
            is_verified_tenant=True,
            lifecycle_status="active",
            statutory_defense="Section 14 Justification (Defamation Act Cap 36) substantiated via M-Pesa tenancy verification.",
            message="Rebuttal verified. Review restored to active feed with Gold Badge status.",
        )
    except ValueError as val_err:
        err_msg = str(val_err)
        if "expired" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=err_msg,
            )
        elif "Invalid or expired rebuttal token" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=err_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg,
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process rebuttal due to an unexpected error.",
        )


@router.get(
    "/mobile/properties/{property_id}/summary",
    response_model=MobileRatingSummary,
    status_code=status.HTTP_200_OK,
    summary="Low-Bandwidth Mobile Rating Summary",
    description="Returns pre-aggregated 5-vector rating metrics with zero redundant payload weight.",
)
async def get_mobile_summary(
    property_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> MobileRatingSummary:
    summary = await MobileOptimizationService.get_property_rating_summary(db, property_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )
    return MobileRatingSummary(**summary)


@router.get(
    "/mobile/properties/{property_id}/feed",
    response_model=List[MobileReviewCard],
    status_code=status.HTTP_200_OK,
    summary="Low-Bandwidth Mobile Reviews Feed",
    description="Returns lightweight review cards with truncated snippets and statutory Cap 36 notices.",
)
async def get_mobile_feed(
    property_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> List[MobileReviewCard]:
    feed = await MobileOptimizationService.get_mobile_reviews_feed(
        session=db,
        property_id=property_id,
        limit=limit,
        offset=offset,
    )
    return [MobileReviewCard(**item) for item in feed]
