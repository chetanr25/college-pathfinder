"""
Middleware for the KCET College Predictor API

Note: CORS is handled by FastAPI's built-in CORSMiddleware in app/__init__.py
This file is kept for potential future custom middleware needs.
"""
from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


# Custom middleware can be added here if needed in the future
# Example:
# class CustomMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request: Request, call_next):
#         response = await call_next(request)
#         return response
