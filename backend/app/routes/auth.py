"""
Authentication routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.auth.service import auth_service
from app.auth.middleware import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)


class GoogleAuthRequest(BaseModel):
    """Google authentication request"""
    token: str  # Google ID token
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate with Google OAuth token
    """
    # Get or create user
    user = await auth_service.get_or_create_user(
        email=request.email,
        name=request.name,
        avatar_url=request.avatar_url,
        google_id=request.token  # Store Google ID for reference
    )
    
    if not user:
        raise HTTPException(status_code=500, detail="Failed to authenticate user")
    
    # Create JWT token
    access_token = auth_service.create_access_token(
        user_id=str(user['id']),
        email=user['email']
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "avatar_url": user.get('avatar_url')
        }
    }


@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user info
    """
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "avatar_url": user.get('avatar_url')
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client should discard token)
    """
    return {"message": "Logged out successfully"}

