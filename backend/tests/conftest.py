"""
tests/conftest.py
─────────────────
Pytest fixtures for async database testing and FastAPI HTTP integration.
Uses an isolated in-memory SQLite database via aiosqlite with StaticPool.
"""

from typing import AsyncGenerator
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.data.store import store
from app.db.base import Base
from app.db.session import get_db, seed_db
from app.main import app

# ---------------------------------------------------------------------------
# Test engine: in-memory SQLite with StaticPool
# NOTE: We intentionally do NOT enable PRAGMA foreign_keys=ON globally here
# because the seed data has a circular FK dependency between failure_incidents
# (recovery_id -> recovery_attempts) and recovery_attempts (failure_id ->
# failure_incidents). SQLAlchemy's ORM cascade="all, delete-orphan" handles
# cascade deletes in Python without requiring DB-level FK enforcement.
# ---------------------------------------------------------------------------
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency override injecting the isolated test database session."""
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_isolated_test_db() -> AsyncGenerator[None, None]:
    """Recreate tables and seed data before each test for complete state isolation."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        await seed_db(session, force_reset=True)

    store.reset()
    yield


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Direct database session fixture for ORM-level tests."""
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client bound to the FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
