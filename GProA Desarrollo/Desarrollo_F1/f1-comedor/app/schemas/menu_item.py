"""MenuItem schemas"""
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional


# MealType enum for schemas
from app.models.menu_item import MealType as MenuMealType


# MenuItem schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    meal_type: MenuMealType


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    meal_type: Optional[MenuMealType] = None
    is_active: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# MenuItem list response
class MenuItemListResponse(BaseModel):
    total: int
    items: list[MenuItemResponse]
