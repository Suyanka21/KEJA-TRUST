"""
KeJaTrust (NyumbaYangu) - FastAPI Main Application Entry Point
File: src/main.py
Governance: 'coderabbit-dna', 'security-and-hardening'
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from src.api.v1.geo_property import router as geo_property_router
from src.api.v1.mpesa_review import router as mpesa_review_router
from src.api.v1.dispute_mobile import router as dispute_mobile_router
from src.db.models import Base, County, Estate
from src.db.session import engine, AsyncSessionLocal
from src.security.crypto_vault import LoggerSanitizationFilter

# Set up logging with ODPC PII redaction filter
logging.basicConfig(level=logging.INFO)
root_logger = logging.getLogger()
root_logger.addFilter(LoggerSanitizationFilter())


async def seed_initial_kenyan_geography():
    """Seeds initial counties and representative estates if the database is fresh."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(County).limit(1))
        existing = result.scalar_one_or_none()
        if not existing:
            # Seed major counties
            counties_data = [
                (47, "Nairobi", 47),
                (1, "Mombasa", 1),
                (32, "Nakuru", 32),
                (22, "Kiambu", 22),
                (12, "Meru", 12),
                (42, "Kisumu", 42),
                (16, "Machakos", 16),
                (27, "Uasin Gishu", 27),
            ]
            for cid, cname, ccode in counties_data:
                session.add(County(id=cid, name=cname, code=ccode))

            await session.flush()

            # Seed sample Nairobi estates
            nairobi_estates = [
                (47, "Kilimani", "Dagoretti North"),
                (47, "Kileleshwa", "Dagoretti North"),
                (47, "Westlands", "Westlands"),
                (47, "South B", "Starehe"),
                (47, "South C", "Lang'ata"),
                (47, "Roysambu", "Roysambu"),
                (47, "Kasarani", "Kasarani"),
                (47, "Parklands", "Westlands"),
            ]
            for cid, ename, subc in nairobi_estates:
                session.add(Estate(county_id=cid, name=ename, sub_county=subc))

            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed baseline geographic data
    await seed_initial_kenyan_geography()
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="KeJaTrust (NyumbaYangu) Landlord & Property Rating Engine",
    description="Zero-Knowledge tenant review, verified lease, and Cap 36 defamation-safe platform API.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration - Strict whitelist to prevent credential leakage
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
)
allowed_origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]
allow_creds = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_creds,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(geo_property_router, prefix="/api/v1")
app.include_router(mpesa_review_router, prefix="/api/v1")
app.include_router(dispute_mobile_router, prefix="/api/v1")


@app.get("/api/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "operational",
        "service": "kejatrust-backend",
        "version": "1.0.0",
        "jurisdiction": "Kenya (ODPC DPA 2019 / Cap 36)",
    }
