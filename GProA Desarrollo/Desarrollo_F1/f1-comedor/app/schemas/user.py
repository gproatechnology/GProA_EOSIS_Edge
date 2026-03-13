"""User schemas"""
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional

from app.models.user import UserRole


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.CASHIER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# User list response
class UserListResponse(BaseModel):
    total: int
    items: list[UserResponse]
