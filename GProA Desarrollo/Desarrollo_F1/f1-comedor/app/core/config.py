"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "F1 Comedor API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://f1comedor:f1comedor123@localhost:5432/f1comedor"
    
    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # QR Code settings
    QR_CODE_VERSION: int = 1
    QR_CODE_BOX_SIZE: int = 10
    QR_CODE_BORDER: int = 4
    
    # Consumption settings
    DUPLICATE_SCAN_MINUTES: int = 5
    
    # Meal type time ranges (24-hour format)
    BREAKFAST_START: int = 6
    BREAKFAST_END: int = 11
    LUNCH_START: int = 11
    LUNCH_END: int = 16
    DINNER_START: int = 16
    DINNER_END: int = 23
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
def get_settings() -> Settings:
    """Get settings with validation"""
    s = Settings()
    
    # Validate critical security settings in production
    if not s.DEBUG:
        if not s.SECRET_KEY or len(s.SECRET_KEY) < 32:
            import warnings
            warnings.warn(
                "SECRET_KEY is not secure! Please set a strong SECRET_KEY "
                "environment variable (min 32 characters) for production."
            )
            # Generate a temporary secure key
            s.SECRET_KEY = secrets.token_urlsafe(32)
    
    return s


settings = get_settings()
