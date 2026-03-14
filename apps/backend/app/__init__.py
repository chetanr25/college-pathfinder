"""
FastAPI application initialization and configuration
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import general_exception_handler, http_exception_handler
from app.pg_database import close_db, init_db
from app.routes import auth, branches, chat, colleges, email_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run Alembic migrations on startup, then close DB on shutdown."""
    import subprocess
    import sys
    from pathlib import Path

    backend_dir = Path(__file__).parent.parent  # /app in container

    # Try to run migrations, but don't fail if tables already exist
    try:
        print("[ALEMBIC] Running migrations...")
        # Run alembic with specific timeout to prevent hanging
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            capture_output=True, text=True, cwd=str(backend_dir),
            timeout=30  # Add timeout
        )
        if result.returncode != 0:
            # Check if it's just a "tables already exist" error
            if "already exists" in result.stderr:
                print("[ALEMBIC] Tables already exist, marking migrations as applied...")
                # Mark the current migration as applied without running it
                subprocess.run(
                    [sys.executable, "-m", "alembic", "stamp", "head"],
                    capture_output=True, text=True, cwd=str(backend_dir),
                    timeout=30
                )
                print("[ALEMBIC] Migrations marked as applied")
            else:
                print(f"[ALEMBIC] Migration warning: {result.stderr}")
        else:
            print(f"[ALEMBIC] {result.stdout.strip() or 'Migrations up to date'}")
    except subprocess.TimeoutExpired:
        print("[ALEMBIC] Migration timed out after 30s. Continuing startup...")
    except Exception as e:
        print(f"[ALEMBIC] Migration error (continuing anyway): {e}")

    try:
        await init_db()  # create_all for any tables not covered by migrations
    except Exception as e:
        print(f"[DB] Database initialization error: {e}")

    yield

    try:
        await close_db()
    except Exception as e:
        print(f"[DB] Database cleanup error: {e}")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application

    Returns:
        FastAPI: Configured FastAPI application instance
    """

    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    app.include_router(colleges.router)
    app.include_router(branches.router)
    app.include_router(chat.router)
    app.include_router(email_routes.router)
    app.include_router(auth.router)

    return app


app = create_app()
