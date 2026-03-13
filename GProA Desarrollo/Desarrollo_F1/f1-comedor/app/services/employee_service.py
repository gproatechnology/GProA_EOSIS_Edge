"""Employee service"""
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

from app.models.employee import Employee
from app.models.consumption import Consumption
from app.models.category import Category
from app.models.company import Company
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeScanResponse
from app.core.qr_service import qr_service


def get_employee(db: Session, employee_id: int) -> Optional[Employee]:
    """Get employee by ID"""
    return db.query(Employee).filter(Employee.id == employee_id).first()


def get_employee_by_qr_code(db: Session, qr_code: str) -> Optional[Employee]:
    """Get employee by QR code"""
    return db.query(Employee).filter(Employee.qr_code == qr_code).first()


def get_employee_by_employee_number(db: Session, employee_number: str) -> Optional[Employee]:
    """Get employee by employee number"""
    return db.query(Employee).filter(Employee.employee_number == employee_number).first()


def get_employees(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    company_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
) -> tuple[List[Employee], int]:
    """Get employees with optional filters"""
    query = db.query(Employee)
    
    if company_id is not None:
        query = query.filter(Employee.company_id == company_id)
    
    if category_id is not None:
        query = query.filter(Employee.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Employee.first_name.ilike(search_term)) | 
            (Employee.last_name.ilike(search_term)) |
            (Employee.employee_number.ilike(search_term))
        )
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return items, total


def get_employee_qr_image(db: Session, employee_id: int) -> Optional[str]:
    """Get employee's QR code as base64 image"""
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    
    return qr_service.generate_qr_code(employee.qr_code)


def create_employee(db: Session, employee_data: EmployeeCreate) -> Employee:
    """Create a new employee with auto-generated QR code"""
    # Generate unique QR code
    qr_code = qr_service.generate_unique_qr_data()
    
    # Ensure unique QR code
    existing = get_employee_by_qr_code(db, qr_code)
    while existing:
        qr_code = qr_service.generate_unique_qr_data()
        existing = get_employee_by_qr_code(db, qr_code)
    
    db_employee = Employee(
        **employee_data.model_dump(),
        qr_code=qr_code
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def update_employee(
    db: Session, 
    employee_id: int, 
    employee_data: EmployeeUpdate
) -> Optional[Employee]:
    """Update an employee"""
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    
    update_data = employee_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
    
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> bool:
    """Soft delete an employee (set is_active to False)"""
    employee = get_employee(db, employee_id)
    if not employee:
        return False
    
    employee.is_active = False
    db.commit()
    return True


def get_employee_today_consumptions(db: Session, employee_id: int) -> tuple[int, Decimal]:
    """Get today's consumption count and total amount for an employee"""
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    consumptions = db.query(Consumption).filter(
        Consumption.employee_id == employee_id,
        Consumption.consumed_at >= start_of_day,
        Consumption.consumed_at <= end_of_day
    ).all()
    
    total_count = len(consumptions)
    total_amount = sum(c.total_amount for c in consumptions)
    
    return total_count, Decimal(str(total_amount))


def scan_employee(db: Session, qr_code: str) -> Optional[EmployeeScanResponse]:
    """Scan employee QR code and validate"""
    employee = get_employee_by_qr_code(db, qr_code)
    if not employee:
        return None
    
    # Get category and company info
    category = db.query(Category).filter(Category.id == employee.category_id).first()
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    
    if not category or not company:
        return None
    
    # Get today's consumption stats
    consumptions_today, total_spent_today = get_employee_today_consumptions(db, employee.id)
    
    # Check if employee can consume
    can_consume = (
        employee.is_active and 
        category.is_active and
        company.is_active and
        consumptions_today < category.daily_limit
    )
    
    message = None
    if not employee.is_active:
        message = "Empleado inactivo"
    elif not category.is_active:
        message = "Categoría inactiva"
    elif not company.is_active:
        message = "Empresa inactiva"
    elif consumptions_today >= category.daily_limit:
        message = f"Límite diario alcanzado ({category.daily_limit} consumos)"
    
    # Check credit limit if applicable
    if category.credit_limit and total_spent_today >= category.credit_limit:
        can_consume = False
        message = f"Límite de crédito alcanzado (${category.credit_limit})"
    
    return EmployeeScanResponse(
        id=employee.id,
        employee_number=employee.employee_number,
        first_name=employee.first_name,
        last_name=employee.last_name,
        company_id=employee.company_id,
        company_name=company.name,
        category_id=employee.category_id,
        category_name=category.name,
        daily_limit=category.daily_limit,
        credit_limit=float(category.credit_limit) if category.credit_limit else None,
        is_active=employee.is_active,
        consumptions_today=consumptions_today,
        total_spent_today=float(total_spent_today),
        can_consume=can_consume,
        message=message
    )
