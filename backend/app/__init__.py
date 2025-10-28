"""
FastAPI application initialization and configuration
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import http_exception_handler, general_exception_handler
from app.routes import colleges, branches, chat
from dotenv import load_dotenv, find_dotenv


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    # Load environment variables from the nearest .env file
    
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION
    )
    
    # Add CORS middleware - must be before other middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=settings.CORS_METHODS,
        allow_headers=settings.CORS_HEADERS,
    )
    
    # Add exception handlers
    app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore
    app.add_exception_handler(Exception, general_exception_handler)  # type: ignore
    
    # Include routers
    app.include_router(colleges.router)
    app.include_router(branches.router)
    app.include_router(chat.router)
    
    return app


# Create the app instance
app = create_app()
