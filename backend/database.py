import os
import time
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "fluxo_db")

DEFAULT_POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
POSTGRES_URL = os.getenv("DATABASE_URL", DEFAULT_POSTGRES_URL)
FALLBACK_SQLITE_URL = "sqlite:///./fluxo.db"
ENV = os.getenv("ENV", "development")

Base = declarative_base()

def init_engine():
    """
    Attempt PostgreSQL connection with retry logic (3 attempts, 5s timeout).
    Fall back gracefully to SQLite if PostgreSQL is unreachable.
    """
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[DB] Attempting PostgreSQL connection (Attempt {attempt}/{max_retries})...")
            pg_engine = create_engine(
                POSTGRES_URL,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 5},
                echo=(ENV == "development_debug"),
            )
            # Connectivity check
            with pg_engine.connect() as conn:
                pass
            print(f"[DB] Successfully connected to PostgreSQL: {POSTGRES_URL}")
            return pg_engine
        except Exception as err:
            print(f"[DB] PostgreSQL attempt {attempt} failed: {err}")
            time.sleep(1)

    print(f"[DB] Fallback: Using SQLite local database -> {FALLBACK_SQLITE_URL}")
    sqlite_engine = create_engine(
        FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False},
        echo=(ENV == "development_debug"),
    )
    return sqlite_engine

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables defined in SQLAlchemy Base."""
    import models  # Ensure models are loaded
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for API endpoints to retrieve a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    """Context manager for standalone script session usage."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
