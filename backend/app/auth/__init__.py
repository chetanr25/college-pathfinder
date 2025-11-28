"""
Authentication module
"""
from .service import auth_service
from .middleware import get_current_user, require_auth

__all__ = ['auth_service', 'get_current_user', 'require_auth']

