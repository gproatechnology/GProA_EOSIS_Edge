"""Category schemas"""
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import Optional


# Category schemas
class CategoryBase(BaseModel):
    name: str
    daily_limit: int = 1
    credit_limit: Optional[Decimal] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    daily_limit: Optional[int] = None
    credit_limit: Optional[Decimal] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# Category list response
class CategoryListResponse(BaseModel):
    total: int
    items: list[CategoryResponse]
