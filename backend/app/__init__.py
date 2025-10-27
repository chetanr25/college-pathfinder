"""
FastAPI application initialization and configuration
"""
from fastapi import FastAPI, HTTPException

from app.config import settings
from app.middleware import CORSMiddleware
from app.exceptions import http_exception_handler, general_exception_handler
from app.routes import colleges, branches


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION
    )
    
    # Add middleware
    app.add_middleware(CORSMiddleware)
    
    # Add exception handlers
    app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore
    app.add_exception_handler(Exception, general_exception_handler)  # type: ignore
    
    # Include routers
    app.include_router(colleges.router)
    app.include_router(branches.router)
    
    return app


# Create the app instance
app = create_app()
