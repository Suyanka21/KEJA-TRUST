"""
KeJaTrust (NyumbaYangu) - Asynchronous Database Session Engine
File: src/db/session.py
Governance: 'coderabbit-dna', 'security-and-hardening'

Provides SQLAlchemy 2.0 async engine, connection pool pooling,
and scoped transactional session management with automatic rollback.
"""

import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool

logger = logging.getLogger("kejatrust.db")

# Read database URL from environment or fall back to an async SQLite memory database for tests
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///:memory:",
)

# Detect if running in test / SQLite mode
is_sqlite = DATABASE_URL.startswith("sqlite")

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    poolclass=NullPool if is_sqlite else AsyncAdaptedQueuePool,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency generator for FastAPI endpoints.
    Provides an async transactional database session with automated rollback on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Database transaction rolled back due to error: %s", str(e))
            raise
        finally:
            await session.close()
