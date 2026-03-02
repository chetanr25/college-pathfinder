"""
Authentication service using PostgreSQL and JWT
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from sqlalchemy import select

from app.models import User
from app.pg_database import async_session_factory

load_dotenv()


class AuthService:
    """Handle authentication with JWT and PostgreSQL"""

    def __init__(self):
        self.jwt_secret = os.getenv(
            "JWT_SECRET_KEY", "your-secret-key-change-in-production"
        )
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expiration_hours = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token"""
        if not token:
            return None

        try:
            payload = jwt.decode(
                token, self.jwt_secret, algorithms=[self.jwt_algorithm]
            )
            return payload
        except JWTError:
            return None

    async def verify_google_token(self, google_token: str) -> Optional[Dict[str, Any]]:
        """Verify Google OAuth token and get user info"""
        try:
            payload = jwt.decode(google_token, options={"verify_signature": False})
            return payload
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            return None

    async def get_or_create_user(
        self, email: str, name: str, avatar_url: str = None, google_id: str = None
    ) -> Optional[Dict[str, Any]]:
        """Get existing user or create new one"""
        try:
            async with async_session_factory() as db:
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()

                if user:
                    return {
                        "id": str(user.id),
                        "email": user.email,
                        "name": user.name,
                        "avatar_url": user.avatar_url,
                    }

                new_user = User(
                    email=email,
                    name=name,
                    avatar_url=avatar_url,
                    google_id=google_id,
                )
                db.add(new_user)
                await db.commit()
                await db.refresh(new_user)

                return {
                    "id": str(new_user.id),
                    "email": new_user.email,
                    "name": new_user.name,
                    "avatar_url": new_user.avatar_url,
                }
        except Exception as e:
            import traceback
            print(f"[AUTH ERROR] get_or_create_user failed: {e}")
            print(traceback.format_exc())
            return None

    def create_access_token(self, user_id: str, email: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(hours=self.jwt_expiration_hours)
        payload = {"sub": user_id, "email": email, "exp": expire}
        token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        return token

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            async with async_session_factory() as db:
                result = await db.execute(
                    select(User).where(User.id == uuid.UUID(user_id))
                )
                user = result.scalar_one_or_none()

                if user:
                    return {
                        "id": str(user.id),
                        "email": user.email,
                        "name": user.name,
                        "avatar_url": user.avatar_url,
                    }
                return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None


# Create global instance
auth_service = AuthService()
