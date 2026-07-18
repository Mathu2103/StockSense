import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# In modern SQLAlchemy, we configure the database connection URL.
# Pydantic Settings will have parsed it.
DATABASE_URL = settings.DATABASE_URL

# For PostgreSQL, ensure we are using the correct driver if not specified
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Strip schema parameter if present to prevent psycopg2 errors
if "?schema=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?schema=")[0]
elif "&schema=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("&schema=")[0]


# Configure the engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
