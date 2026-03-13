"""Company schemas"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


# Company schemas
class CompanyBase(BaseModel):
    name: str
    code: str


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Company list response
class CompanyListResponse(BaseModel):
    total: int
    items: list[CompanyResponse]
