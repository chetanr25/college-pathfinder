"""
Configuration settings for the KCET College Predictor API
"""
import os
from pathlib import Path
from typing import List

# Get the backend directory (parent of app/)
BACKEND_DIR = Path(__file__).parent.parent


class Settings:
    """Application settings"""
    
    # API Information
    APP_NAME: str = os.getenv("APP_NAME", "College Path Finder API")
    APP_DESCRIPTION: str = os.getenv(
        "APP_DESCRIPTION", 
        "API for predicting college admission chances based on KCET ranks"
    )
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    
    # Database - use absolute path
    DATABASE_URL: str = os.getenv("DATABASE_URL", str(BACKEND_DIR / "data" / "kcet_2024.db"))
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_HEADERS: List[str] = ["*"]
    
    # API Settings
    DEFAULT_ROUND: int = int(os.getenv("DEFAULT_ROUND", "1"))
    MIN_ROUND: int = int(os.getenv("MIN_ROUND", "1"))
    MAX_ROUND: int = int(os.getenv("MAX_ROUND", "3"))


# Create settings instance
settings = Settings()
