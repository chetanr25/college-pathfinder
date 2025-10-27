"""
Middleware for the KCET College Predictor API
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


class CORSMiddleware(BaseHTTPMiddleware):
    """Custom CORS middleware"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = ", ".join(settings.CORS_ORIGINS)
        response.headers["Access-Control-Allow-Methods"] = ", ".join(settings.CORS_METHODS)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(settings.CORS_HEADERS)
        return response
