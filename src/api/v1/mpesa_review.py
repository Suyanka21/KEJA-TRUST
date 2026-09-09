"""
KeJaTrust (NyumbaYangu) - Daraja M-Pesa Webhook & Review Submission API Router
File: src/api/v1/mpesa_review.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'api-and-interface-design'

Exposes endpoints:
  * POST /api/v1/verification/mpesa-webhook (Daraja C2B confirmation callback)
  * POST /api/v1/verification/upload-lease-ocr (Simulated lease OCR parsing)
  * POST /api/v1/reviews/submit (Multi-vector rating submission & Gold Badge promotion)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.security.crypto_vault import CryptographicVault
from src.schemas.mpesa_review import (
    DarajaC2BWebhookPayload,
    DarajaWebhookResponse,
    ReviewCreateRequest,
    ReviewPublicResponse,
    LeaseDocumentParseResult,
)
from src.services.mpesa_review_service import (
    DarajaMpesaService,
    ReviewSubmissionService,
    LeaseDocumentOCR,
)

router = APIRouter(tags=["M-Pesa Verification & Reviews"])

# Dependency to provide the shared Cryptographic Vault
_vault_instance = CryptographicVault()

def get_crypto_vault() -> CryptographicVault:
    return _vault_instance


@router.post(
    "/verification/mpesa-webhook",
    response_model=DarajaWebhookResponse,
    status_code=status.HTTP_200_OK,
    summary="Safaricom Daraja C2B Confirmation Webhook",
    description=(
        "Receives real-time payment notifications from Safaricom Daraja. "
        "Enforces IP whitelisting (196.201.214.0/24, 196.201.213.0/24), anti-replay checks, "
        "stale receipt gating (180 days), and micro-payment fraud filtering."
    ),
)
async def daraja_mpesa_webhook(
    request: Request,
    payload: DarajaC2BWebhookPayload,
    db: AsyncSession = Depends(get_db_session),
    vault: CryptographicVault = Depends(get_crypto_vault),
) -> DarajaWebhookResponse:
    # 1. IP Whitelisting Check (Anti-Spoofing: Only trust X-Forwarded-For if peer is a known trusted proxy)
    import os
    peer_ip = request.client.host if request.client else "127.0.0.1"
    trusted_proxies_env = os.getenv("TRUSTED_PROXIES", "127.0.0.1,::1")
    trusted_proxies = [p.strip() for p in trusted_proxies_env.split(",") if p.strip()]

    client_host = peer_ip
    if peer_ip in trusted_proxies:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_host = forwarded_for.split(",")[0].strip()

    if not DarajaMpesaService.verify_safaricom_ip(client_host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Ingress IP '{client_host}' is not a registered Safaricom Daraja gateway.",
        )

    # 2. Process C2B Confirmation
    try:
        verified_lease, auto_approved = await DarajaMpesaService.process_c2b_confirmation(
            session=db,
            payload=payload,
            vault=vault,
        )
        return DarajaWebhookResponse(
            ResultCode=0,
            ResultDesc="Confirmation received successfully",
        )
    except ValueError as val_err:
        err_msg = str(val_err)
        if "Conflict 409" in err_msg or "Duplicate transaction" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=err_msg,
            )
        elif "expired" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=err_msg,
            )


@router.post(
    "/reviews/submit",
    response_model=ReviewPublicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Multi-Vector Tenant Property Review",
    description=(
        "Submits an anonymous property review across the 5 Kenyan friction vectors. "
        "Generates an algorithmic display pseudonym and promotes to Gold Badge (is_verified_tenant=True) "
        "if an approved Daraja receipt token is matched."
    ),
)
async def submit_review(
    payload: ReviewCreateRequest,
    db: AsyncSession = Depends(get_db_session),
    vault: CryptographicVault = Depends(get_crypto_vault),
) -> ReviewPublicResponse:
    try:
        new_review = await ReviewSubmissionService.submit_review(
            session=db,
            payload=payload,
            vault=vault,
        )
        return ReviewPublicResponse.model_validate(new_review)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist review due to an unexpected system error.",
        )


@router.post(
    "/verification/upload-lease-ocr",
    response_model=LeaseDocumentParseResult,
    status_code=status.HTTP_200_OK,
    summary="Simulated Lease Agreement Document OCR",
    description="Parses uploaded lease agreement PDF to extract dates, rent, and premises details.",
)
async def upload_lease_ocr(
    file: UploadFile = File(..., description="PDF or image of lease agreement"),
) -> LeaseDocumentParseResult:
    content = await file.read()
    filename = file.filename or "lease_agreement.pdf"
    result = LeaseDocumentOCR.parse_pdf_agreement(content, filename)
    return result


@router.get(
    "/reviews",
    response_model=List[ReviewPublicResponse],
    summary="List Public Property Reviews",
    description="Lists published reviews (excluding sandboxed/archived) with optional property filter.",
)
async def list_reviews(
    property_id: Optional[UUID] = Query(None, description="Filter reviews by property UUID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> List[ReviewPublicResponse]:
    from sqlalchemy import select
    from src.db.models import Review
    stmt = select(Review).where(Review.lifecycle_status == "active")
    if property_id:
        stmt = stmt.where(Review.property_id == property_id)
    stmt = stmt.order_by(Review.created_at.desc()).offset(offset).limit(limit)
    reviews = (await db.execute(stmt)).scalars().all()
    return [ReviewPublicResponse.model_validate(r) for r in reviews]
