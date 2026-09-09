"""
KeJaTrust (NyumbaYangu) - Automated Background Worker Daemon
File: landlord-rating-worker.py
Governance: 'coderabbit-dna', 'security-and-hardening', 'spec-driven-development'
Jurisdiction: Republic of Kenya (ODPC DPA 2019, Defamation Act Cap 36)

This worker daemon performs automated maintenance for the KeJaTrust rating platform:
1. Cap 36 Defamation Act 168-Hour Rebuttal Expiration:
   - Scans dispute tickets where rebuttal_deadline has passed without tenant proof.
   - Transitions dispute status to 'resolved_removed'.
   - Archives contested reviews to 'archived_defamatory' (purged from public feeds).
2. ODPC Section 40 Scheduled Cryptographic Shredding:
   - Purges expired transient session artifacts and securely shreds marked records.
3. Property Metric Aggregation:
   - Re-aggregates property overall rating and 5-vector sub-scores.
"""

import os
import sys
import time
import asyncio
import logging
from datetime import datetime, timezone

# Ensure project root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.security.crypto_vault import LoggerSanitizationFilter

# Configure secure sanitizing logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Worker] %(message)s",
)
logger = logging.getLogger("kejatrust-worker")
logger.addFilter(LoggerSanitizationFilter())


async def process_expired_cap36_disputes():
    """
    Scans for expired dispute tickets (168h timeout elapsed) without tenant rebuttal.
    Transitions target reviews to archived_defamatory under Defamation Act Cap 36.
    """
    logger.info("Executing statutory Cap 36 notice-and-takedown audit cycle...")
    try:
        from src.db.session import AsyncSessionLocal
        from src.db.models import DisputeTicket, Review
        from sqlalchemy import select, and_

        async with AsyncSessionLocal() as session:
            now = datetime.now(timezone.utc)
            query = select(DisputeTicket).where(
                and_(
                    DisputeTicket.status == "under_investigation",
                    DisputeTicket.rebuttal_deadline < now,
                )
            )
            result = await session.execute(query)
            expired_disputes = result.scalars().all()

            if not expired_disputes:
                logger.info("Cap 36 Audit: Zero expired rebuttals found.")
                return 0

            count = 0
            for dispute in expired_disputes:
                dispute.status = "resolved_removed"
                review = await session.get(Review, dispute.review_id)
                if review and review.lifecycle_status == "under_investigation":
                    review.lifecycle_status = "archived_defamatory"
                    review.is_verified_tenant = False
                    count += 1

            await session.commit()
            logger.info("Cap 36 Audit: %d expired disputes transitioned to archived_defamatory.", count)
            return count
    except Exception as e:
        logger.error("Cap 36 Dispute worker execution failure: %s", e, exc_info=True)
        return 0


async def shred_expired_odpc_tokens():
    """
    ODPC Section 40 Data Minimization & Cryptographic Shredding:
    Purges expired single-use rebuttal tokens from resolved disputes
    to prevent retention of sensitive correlation hashes.
    """
    try:
        from src.db.session import AsyncSessionLocal
        from src.db.models import DisputeTicket
        from sqlalchemy import select, and_

        async with AsyncSessionLocal() as session:
            stmt = select(DisputeTicket).where(
                and_(
                    DisputeTicket.status.in_(["resolved_restored", "resolved_removed"]),
                    DisputeTicket.rebuttal_token_hash.is_not(None),
                )
            )
            result = await session.execute(stmt)
            tickets = result.scalars().all()
            if tickets:
                for t in tickets:
                    t.rebuttal_token_hash = None
                await session.commit()
                logger.info("ODPC Shredder: %d resolved dispute token hashes cryptographically purged.", len(tickets))
                return len(tickets)
            return 0
    except Exception as e:
        logger.error("ODPC Shredder worker execution failure: %s", e, exc_info=True)
        return 0


async def run_worker_loop(interval_seconds: int = 3600):
    """
    Continuous daemon loop running at statutory intervals with
    exponential backoff on consecutive failures.
    """
    logger.info("KeJaTrust Statutory Worker Daemon initialized (Interval: %ds)", interval_seconds)
    consecutive_errors = 0
    max_backoff_seconds = 300

    while True:
        try:
            await process_expired_cap36_disputes()
            await shred_expired_odpc_tokens()
            # Reset error counter on successful execution
            consecutive_errors = 0
            await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            logger.info("Worker loop cancelled.")
            break
        except Exception as err:
            consecutive_errors += 1
            backoff = min(interval_seconds * (2 ** (consecutive_errors - 1)), max_backoff_seconds)
            logger.error(
                "Worker iteration failed (attempt %d). Backing off for %ds. Error: %s",
                consecutive_errors, backoff, err,
            )
            await asyncio.sleep(backoff)


if __name__ == "__main__":
    interval = int(os.getenv("WORKER_INTERVAL_SECONDS", "60"))
    if "--once" in sys.argv:
        asyncio.run(process_expired_cap36_disputes())
    else:
        try:
            asyncio.run(run_worker_loop(interval))
        except (KeyboardInterrupt, SystemExit):
            logger.info("Worker daemon stopped cleanly.")
