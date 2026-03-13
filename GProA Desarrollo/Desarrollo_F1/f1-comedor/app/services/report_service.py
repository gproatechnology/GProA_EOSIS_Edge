"""Report service"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

from app.models.consumption import Consumption
from app.models.employee import Employee
from app.models.category import Category
from app.models.company import Company
from app.schemas.report import (
    ReportByCompanyResponse,
    ReportByCompany,
    ReportByCategoryResponse,
    ReportByCategory,
    ReportByEmployeeResponse,
    ConsumptionHistoryItem,
    DailySummaryResponse,
    DailySummaryByMealType,
    DashboardStatsResponse,
)
from app.core.cache import cached, invalidate_cache


# Cache dashboard stats for 30 seconds
DASHBOARD_CACHE_TTL = 30


def get_report_by_company(
    db: Session,
    date_from: date,
    date_to: date
) -> ReportByCompanyResponse:
    """Get consumption report grouped by company"""
    start_datetime = datetime.combine(date_from, datetime.min.time())
    end_datetime = datetime.combine(date_to, datetime.max.time())
    
    # Query with join
    results = db.query(
        Company.id,
        Company.name,
        func.count(Consumption.id).label("total_consumptions"),
        func.sum(Consumption.total_amount).label("total_amount")
    ).join(
        Employee, Employee.company_id == Company.id
    ).join(
        Consumption, Consumption.employee_id == Employee.id
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).group_by(
        Company.id, Company.name
    ).all()
    
    companies = [
        ReportByCompany(
            company_id=r.id,
            company_name=r.name,
            total_consumptions=r.total_consumptions,
            total_amount=r.total_amount or Decimal("0")
        )
        for r in results
    ]
    
    grand_total_consumptions = sum(c.total_consumptions for c in companies)
    grand_total_amount = sum(c.total_amount for c in companies)
    
    return ReportByCompanyResponse(
        date_from=date_from,
        date_to=date_to,
        companies=companies,
        grand_total_consumptions=grand_total_consumptions,
        grand_total_amount=grand_total_amount
    )


def get_report_by_category(
    db: Session,
    date_from: date,
    date_to: date
) -> ReportByCategoryResponse:
    """Get consumption report grouped by category"""
    start_datetime = datetime.combine(date_from, datetime.min.time())
    end_datetime = datetime.combine(date_to, datetime.max.time())
    
    # Query with join
    results = db.query(
        Category.id,
        Category.name,
        func.count(Consumption.id).label("total_consumptions"),
        func.sum(Consumption.total_amount).label("total_amount")
    ).join(
        Employee, Employee.category_id == Category.id
    ).join(
        Consumption, Consumption.employee_id == Employee.id
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).group_by(
        Category.id, Category.name
    ).all()
    
    categories = [
        ReportByCategory(
            category_id=r.id,
            category_name=r.name,
            total_consumptions=r.total_consumptions,
            total_amount=r.total_amount or Decimal("0")
        )
        for r in results
    ]
    
    grand_total_consumptions = sum(c.total_consumptions for c in categories)
    grand_total_amount = sum(c.total_amount for c in categories)
    
    return ReportByCategoryResponse(
        date_from=date_from,
        date_to=date_to,
        categories=categories,
        grand_total_consumptions=grand_total_consumptions,
        grand_total_amount=grand_total_amount
    )


def get_report_by_employee(
    db: Session,
    employee_id: int,
    date_from: date,
    date_to: date
) -> Optional[ReportByEmployeeResponse]:
    """Get detailed consumption history for an employee"""
    start_datetime = datetime.combine(date_from, datetime.min.time())
    end_datetime = datetime.combine(date_to, datetime.max.time())
    
    # Get employee
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        return None
    
    # Get company and category
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    category = db.query(Category).filter(Category.id == employee.category_id).first()
    
    # Get consumptions
    consumptions = db.query(Consumption).filter(
        Consumption.employee_id == employee_id,
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).order_by(Consumption.consumed_at.desc()).all()
    
    history_items = [
        ConsumptionHistoryItem(
            consumed_at=c.consumed_at.isoformat(),
            meal_type=c.meal_type.value,
            items=c.items,
            total_amount=c.total_amount
        )
        for c in consumptions
    ]
    
    total_consumptions = len(consumptions)
    total_amount = sum(c.total_amount for c in consumptions)
    
    return ReportByEmployeeResponse(
        employee_id=employee.id,
        employee_number=employee.employee_number,
        employee_name=f"{employee.first_name} {employee.last_name}",
        company_name=company.name if company else "N/A",
        category_name=category.name if category else "N/A",
        date_from=date_from,
        date_to=date_to,
        consumptions=history_items,
        total_consumptions=total_consumptions,
        total_amount=total_amount
    )


def get_daily_summary(
    db: Session,
    target_date: date
) -> DailySummaryResponse:
    """Get daily summary report"""
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())
    
    # Get total consumers (unique employees who consumed)
    total_consumers = db.query(
        func.count(func.distinct(Consumption.employee_id))
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).scalar() or 0
    
    # Get total amount
    total_amount = db.query(
        func.sum(Consumption.total_amount)
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).scalar() or Decimal("0")
    
    # Get by meal type
    meal_type_results = db.query(
        Consumption.meal_type,
        func.count(func.distinct(Consumption.employee_id)).label("total_consumers"),
        func.sum(Consumption.total_amount).label("total_amount")
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    ).group_by(Consumption.meal_type).all()
    
    by_meal_type = [
        DailySummaryByMealType(
            meal_type=r.meal_type.value,
            total_consumers=r.total_consumers,
            total_amount=r.total_amount or Decimal("0")
        )
        for r in meal_type_results
    ]
    
    return DailySummaryResponse(
        date=target_date,
        total_consumers=total_consumers,
        total_amount=total_amount,
        by_meal_type=by_meal_type
    )


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Get dashboard statistics - cached version"""
    from app.core.cache import cache
    
    # Check cache first
    cache_key = "dashboard_stats"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Combined query for all basic stats in a single database call
    stats_query = db.query(
        func.count(Consumption.id).label('total_consumptions'),
        func.sum(Consumption.total_amount).label('total_amount')
    ).filter(
        Consumption.consumed_at >= start_of_day,
        Consumption.consumed_at <= end_of_day
    ).first()
    
    total_consumptions_today = stats_query.total_consumptions or 0
    total_amount_today = stats_query.total_amount or Decimal("0")
    
    # Active employees count
    active_employees = db.query(func.count(Employee.id)).filter(
        Employee.is_active == True
    ).scalar() or 0
    
    # Optimized: Get employees at limit using a single aggregated query
    # First get all employees with their category info and consumption counts
    employee_consumption_data = db.query(
        Employee.id,
        Employee.category_id,
        Category.daily_limit,
        Category.credit_limit,
        func.count(Consumption.id).label('consumption_count'),
        func.sum(Consumption.total_amount).label('total_spent')
    ).join(
        Category, Category.id == Employee.category_id, isouter=True
    ).outerjoin(
        Consumption, 
        (Consumption.employee_id == Employee.id) & 
        (Consumption.consumed_at >= start_of_day) &
        (Consumption.consumed_at <= end_of_day)
    ).filter(
        Employee.is_active == True
    ).group_by(
        Employee.id,
        Employee.category_id,
        Category.daily_limit,
        Category.credit_limit
    ).all()
    
    # Count employees at limits from aggregated data
    employees_at_limit = 0
    employees_at_credit_limit = 0
    
    for emp in employee_consumption_data:
        daily_limit = emp.daily_limit or 0
        credit_limit = emp.credit_limit or 0
        consumption_count = emp.consumption_count or 0
        total_spent = emp.total_spent or Decimal("0")
        
        if daily_limit > 0 and consumption_count >= daily_limit:
            employees_at_limit += 1
        
        if credit_limit > 0 and total_spent >= credit_limit:
            employees_at_credit_limit += 1
    
    result = DashboardStatsResponse(
        total_consumptions_today=total_consumptions_today,
        total_amount_today=total_amount_today,
        active_employees=active_employees,
        employees_at_limit=employees_at_limit,
        employees_at_credit_limit=employees_at_credit_limit
    )
    
    # Cache the result
    cache.set(cache_key, result, DASHBOARD_CACHE_TTL)
    
    return result


def export_consumptions_to_excel(
    db: Session,
    date_from: date,
    date_to: date,
    company_id: Optional[int] = None
):
    """Export consumptions to Excel file - optimized version"""
    from openpyxl import Workbook
    from io import BytesIO
    from datetime import datetime
    
    start_datetime = datetime.combine(date_from, datetime.min.time())
    end_datetime = datetime.combine(date_to, datetime.max.time())
    
    # Query consumptions with joins to avoid N+1
    query = db.query(
        Consumption,
        Employee.employee_number,
        Employee.first_name,
        Employee.last_name,
        Company.name.label('company_name'),
        Category.name.label('category_name')
    ).join(
        Employee, Consumption.employee_id == Employee.id
    ).join(
        Company, Employee.company_id == Company.id
    ).join(
        Category, Employee.category_id == Category.id
    ).filter(
        Consumption.consumed_at >= start_datetime,
        Consumption.consumed_at <= end_datetime
    )
    
    if company_id:
        query = query.filter(Employee.company_id == company_id)
    
    results = query.order_by(Consumption.consumed_at.desc()).all()
    
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Consumos"
    
    # Headers
    headers = [
        "ID",
        "Fecha/Hora",
        "Número de Empleado",
        "Nombre Empleado",
        "Empresa",
        "Categoría",
        "Tipo Comida",
        "Monto Total",
        "Notas"
    ]
    ws.append(headers)
    
    # Add data - already have all info from joined query
    for row in results:
        ws.append([
            row.Consumption.id,
            row.Consumption.consumed_at.strftime("%Y-%m-%d %H:%M:%S"),
            row.employee_number,
            f"{row.first_name} {row.last_name}",
            row.company_name,
            row.category_name,
            row.Consumption.meal_type.value,
            float(row.Consumption.total_amount),
            row.Consumption.notes or ""
        ])
    
    # Save to bytes
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return buffer.getvalue()
