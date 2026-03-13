"""Consumption schemas"""
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional, Any


# MealType enum for schemas
from app.models.consumption import MealType


# Consumption item schema (items in the JSON)
class ConsumptionItem(BaseModel):
    menu_item_id: int
    name: str
    price: Decimal
    quantity: int = 1


# Consumption schemas
class ConsumptionBase(BaseModel):
    employee_id: int
    meal_type: MealType
    items: list[ConsumptionItem]
    notes: Optional[str] = None


class ConsumptionCreate(ConsumptionBase):
    pass


class ConsumptionResponse(BaseModel):
    id: int
    employee_id: int
    consumed_at: datetime
    meal_type: MealType
    items: list[dict[str, Any]]
    total_amount: Decimal
    registered_by: Optional[int] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Consumption with employee details
class ConsumptionWithEmployeeResponse(ConsumptionResponse):
    employee_name: Optional[str] = None
    employee_number: Optional[str] = None
    company_name: Optional[str] = None


# Consumption list response
class ConsumptionListResponse(BaseModel):
    total: int
    items: list[ConsumptionResponse]


# Consumption list request with filters
class ConsumptionFilterRequest(BaseModel):
    employee_id: Optional[int] = None
    company_id: Optional[int] = None
    category_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    meal_type: Optional[MealType] = None
