"""Pydantic schemas"""
from app.schemas.company import (
    CompanyBase,
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListResponse,
)
from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
)
from app.schemas.employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeWithDetailsResponse,
    EmployeeScanResponse,
    EmployeeListResponse,
    EmployeeScanRequest,
)
from app.schemas.menu_item import (
    MenuItemBase,
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse,
    MenuItemListResponse,
)
from app.schemas.consumption import (
    ConsumptionItem,
    ConsumptionBase,
    ConsumptionCreate,
    ConsumptionResponse,
    ConsumptionWithEmployeeResponse,
    ConsumptionListResponse,
    ConsumptionFilterRequest,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
)
from app.schemas.auth import (
    LoginRequest,
    Token,
    TokenData,
    RefreshTokenRequest,
)
from app.schemas.report import (
    ReportByCompany,
    ReportByCompanyResponse,
    ReportByCategory,
    ReportByCategoryResponse,
    ConsumptionHistoryItem,
    ReportByEmployeeResponse,
    DailySummaryByMealType,
    DailySummaryResponse,
    DashboardStatsResponse,
)

__all__ = [
    # Company
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyResponse",
    "CompanyListResponse",
    # Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoryListResponse",
    # Employee
    "EmployeeBase",
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "EmployeeWithDetailsResponse",
    "EmployeeScanResponse",
    "EmployeeListResponse",
    "EmployeeScanRequest",
    # MenuItem
    "MenuItemBase",
    "MenuItemCreate",
    "MenuItemUpdate",
    "MenuItemResponse",
    "MenuItemListResponse",
    # Consumption
    "ConsumptionItem",
    "ConsumptionBase",
    "ConsumptionCreate",
    "ConsumptionResponse",
    "ConsumptionWithEmployeeResponse",
    "ConsumptionListResponse",
    "ConsumptionFilterRequest",
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    # Auth
    "LoginRequest",
    "Token",
    "TokenData",
    "RefreshTokenRequest",
    # Report
    "ReportByCompany",
    "ReportByCompanyResponse",
    "ReportByCategory",
    "ReportByCategoryResponse",
    "ConsumptionHistoryItem",
    "ReportByEmployeeResponse",
    "DailySummaryByMealType",
    "DailySummaryResponse",
    "DashboardStatsResponse",
]
