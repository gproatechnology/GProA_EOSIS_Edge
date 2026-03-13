"""Employee schemas"""
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional


# Employee schemas
class EmployeeBase(BaseModel):
    employee_number: str
    first_name: str
    last_name: str
    company_id: int
    category_id: int
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    employee_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_id: Optional[int] = None
    category_id: Optional[int] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeResponse(EmployeeBase):
    id: int
    qr_code: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Employee with relations
class EmployeeWithDetailsResponse(EmployeeResponse):
    company_name: Optional[str] = None
    category_name: Optional[str] = None
    daily_limit: Optional[int] = None
    credit_limit: Optional[float] = None


# Employee scan response
class EmployeeScanResponse(BaseModel):
    id: int
    employee_number: str
    first_name: str
    last_name: str
    company_id: int
    company_name: str
    category_id: int
    category_name: str
    daily_limit: int
    credit_limit: Optional[float]
    is_active: bool
    consumptions_today: int
    total_spent_today: float
    can_consume: bool
    message: Optional[str] = None


# Employee list response
class EmployeeListResponse(BaseModel):
    total: int
    items: list[EmployeeResponse]


# Employee scan request
class EmployeeScanRequest(BaseModel):
    qr_code: str
