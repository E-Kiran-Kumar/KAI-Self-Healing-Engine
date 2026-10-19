"""
app/core/config.py
──────────────────
Central configuration loaded from environment variables.

All settings have sensible defaults so the server runs without
a .env file during local development.  In production, override
via environment variables or a .env file.

Phase 3 note: Add DATABASE_URL here when PostgreSQL is introduced.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Application identity ───────────────────────────────────────────────
    app_name: str = "KAI Self-Healing AI Engine"
    app_version: str = "0.3.0"
    api_prefix: str = "/api/v1"
    debug: bool = False

    # ── CORS ───────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins.
    # Defaults cover the Next.js dev server on both common ports.
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # ── Phase 2: in-memory store ───────────────────────────────────────────
    # Set to True to reset the in-memory store to seed data on every startup.
    reset_store_on_startup: bool = True

    # ── Phase 3: Database & ORM Configuration ──────────────────────────────
    # Default to sqlite+aiosqlite for zero-setup local dev/test if Postgres is unavailable;
    # in production or with PostgreSQL, set DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/kai_db
    database_url: str = "sqlite+aiosqlite:///./kai.db"
    db_echo: bool = False
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_recycle: int = 3600
    db_pool_pre_ping: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a Python list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        """Check if active database URL is SQLite."""
        return self.database_url.startswith("sqlite")


# Module-level singleton — import this everywhere.
settings = Settings()
