"""
Configuration settings for the KCET College Predictor API
"""
import os
from typing import List


class Settings:
    """Application settings"""
    
    # API Information
    APP_NAME: str = os.getenv("APP_NAME", "KCET College Predictor API")
    APP_DESCRIPTION: str = os.getenv(
        "APP_DESCRIPTION", 
        "API for predicting college admission chances based on KCET ranks"
    )
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "data/kcet_2024.db")
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_HEADERS: List[str] = ["Content-Type"]
    
    # API Settings
    DEFAULT_ROUND: int = int(os.getenv("DEFAULT_ROUND", "1"))
    MIN_ROUND: int = int(os.getenv("MIN_ROUND", "1"))
    MAX_ROUND: int = int(os.getenv("MAX_ROUND", "3"))


# Create settings instance
settings = Settings()
