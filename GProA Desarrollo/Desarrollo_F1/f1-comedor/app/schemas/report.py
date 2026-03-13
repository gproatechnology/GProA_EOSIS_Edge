"""Report schemas"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import date
from typing import Optional


# Report by company
class ReportByCompany(BaseModel):
    company_id: int
    company_name: str
    total_consumptions: int
    total_amount: Decimal


class ReportByCompanyResponse(BaseModel):
    date_from: date
    date_to: date
    companies: list[ReportByCompany]
    grand_total_consumptions: int
    grand_total_amount: Decimal


# Report by category
class ReportByCategory(BaseModel):
    category_id: int
    category_name: str
    total_consumptions: int
    total_amount: Decimal


class ReportByCategoryResponse(BaseModel):
    date_from: date
    date_to: date
    categories: list[ReportByCategory]
    grand_total_consumptions: int
    grand_total_amount: Decimal


# Report by employee
class ConsumptionHistoryItem(BaseModel):
    consumed_at: str
    meal_type: str
    items: list[dict]
    total_amount: Decimal
    registered_by: Optional[str] = None


class ReportByEmployeeResponse(BaseModel):
    employee_id: int
    employee_number: str
    employee_name: str
    company_name: str
    category_name: str
    date_from: date
    date_to: date
    consumptions: list[ConsumptionHistoryItem]
    total_consumptions: int
    total_amount: Decimal


# Daily summary
class DailySummaryByMealType(BaseModel):
    meal_type: str
    total_consumers: int
    total_amount: Decimal


class DailySummaryResponse(BaseModel):
    date: date
    total_consumers: int
    total_amount: Decimal
    by_meal_type: list[DailySummaryByMealType]


# Dashboard stats
class DashboardStatsResponse(BaseModel):
    total_consumptions_today: int
    total_amount_today: Decimal
    active_employees: int
    employees_at_limit: int
    employees_at_credit_limit: int
