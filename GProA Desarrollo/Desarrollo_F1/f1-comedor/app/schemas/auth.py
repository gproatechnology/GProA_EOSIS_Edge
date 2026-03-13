"""Auth schemas"""
from pydantic import BaseModel, EmailStr
from typing import Optional


# Login request
class LoginRequest(BaseModel):
    username: str
    password: str


# Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Token data (for refresh)
class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


# Refresh token request
class RefreshTokenRequest(BaseModel):
    refresh_token: str
