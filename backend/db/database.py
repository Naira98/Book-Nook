import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine


SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

if SQLALCHEMY_DATABASE_URL is None:
    raise ValueError("SQLALCHEMY_DATABASE_URL is not set")

async_engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, echo=True, pool_size=10, max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

def get_db_sync():
    sync_engine = create_engine(
        SQLALCHEMY_DATABASE_URL.replace("asyncpg", "psycopg2"), echo=True
    )
    SyncSessionLocal = sessionmaker(bind=sync_engine, expire_on_commit=False)
    return SyncSessionLocal()