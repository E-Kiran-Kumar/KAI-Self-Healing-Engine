"""
app/db/base.py
──────────────
SQLAlchemy 2.0 DeclarativeBase providing metadata and model registry.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.0 ORM models in the KAI platform."""
    pass
