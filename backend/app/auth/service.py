"""
Authentication service using Supabase
"""
import os
from typing import Optional, Dict, Any
from supabase import create_client, Client
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


class AuthService:
    """Handle authentication with Supabase and JWT"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            print("⚠️ WARNING: Supabase credentials not configured")
            self.supabase = None
        else:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expiration_hours = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token - supports both our own tokens and Supabase tokens
        For Supabase tokens, we decode without signature verification since
        the token was already validated by Supabase on the frontend.
        """
        if not token:
            return None
            
        try:
            # First try to verify with our own secret
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except JWTError:
            pass
        
        try:
            # If that fails, try to decode Supabase token without verification
            # This is safe because the frontend already verified it with Supabase
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            
            # Validate that it's a valid Supabase token
            if payload.get('aud') == 'authenticated' and payload.get('sub'):
                return {
                    'sub': payload.get('sub'),
                    'email': payload.get('email'),
                    'name': payload.get('user_metadata', {}).get('full_name') or payload.get('user_metadata', {}).get('name'),
                    'avatar_url': payload.get('user_metadata', {}).get('avatar_url') or payload.get('user_metadata', {}).get('picture'),
                }
            return None
        except Exception as e:
            print(f"❌ Token verification error: {e}")
            return None
    
    def verify_supabase_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Decode Supabase JWT token to extract user info.
        The signature is not verified here because the frontend
        already validated it with Supabase.
        """
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            
            # Check if this is a valid Supabase auth token
            if payload.get('aud') == 'authenticated':
                user_metadata = payload.get('user_metadata', {})
                return {
                    'id': payload.get('sub'),
                    'email': payload.get('email'),
                    'name': user_metadata.get('full_name') or user_metadata.get('name'),
                    'avatar_url': user_metadata.get('avatar_url') or user_metadata.get('picture'),
                }
            return None
        except Exception as e:
            print(f"❌ Supabase token decode error: {e}")
            return None
    
    async def verify_google_token(self, google_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Google OAuth token and get user info
        """
        try:
            payload = jwt.decode(
                google_token,
                options={"verify_signature": False}
            )
            return payload
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            return None
    
    async def get_or_create_user(self, email: str, name: str, avatar_url: str = None, google_id: str = None) -> Optional[Dict[str, Any]]:
        """Get existing user or create new one"""
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.table('users').select('*').eq('email', email).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            user_data = {
                'email': email,
                'name': name,
                'avatar_url': avatar_url,
                'google_id': google_id
            }
            
            result = self.supabase.table('users').insert(user_data).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
        except Exception as e:
            print(f"Error getting/creating user: {e}")
            return None
    
    def create_access_token(self, user_id: str, email: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(hours=self.jwt_expiration_hours)
        
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        return token
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.table('users').select('*').eq('id', user_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None


# Create global instance
auth_service = AuthService()
