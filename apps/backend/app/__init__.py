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
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        capture_output=True, text=True, cwd=str(backend_dir)
    )
    if result.returncode != 0:
        print(f"[ALEMBIC] Migration warning: {result.stderr}")
    else:
        print(f"[ALEMBIC] {result.stdout.strip() or 'Migrations up to date'}")

    await init_db()  # create_all for any tables not covered by migrations
    yield
    await close_db()


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
        allow_origins=["*"],
        allow_credentials=False,
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
