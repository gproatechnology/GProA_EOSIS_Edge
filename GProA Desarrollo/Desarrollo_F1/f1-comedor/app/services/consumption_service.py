"""Consumption service"""
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.models.consumption import Consumption
from app.models.employee import Employee
from app.models.category import Category
from app.models.company import Company
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.consumption import ConsumptionCreate, ConsumptionResponse
from app.core.config import settings


def get_consumption(db: Session, consumption_id: int) -> Optional[Consumption]:
    """Get consumption by ID"""
    return db.query(Consumption).filter(Consumption.id == consumption_id).first()


def get_consumptions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    employee_id: Optional[int] = None,
    company_id: Optional[int] = None,
    category_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    meal_type: Optional[str] = None
) -> tuple[List[Consumption], int]:
    """Get consumptions with optional filters"""
    query = db.query(Consumption)
    
    if employee_id is not None:
        query = query.filter(Consumption.employee_id == employee_id)
    
    if company_id is not None:
        # Join with employee and filter by company
        query = query.join(Employee).filter(Employee.company_id == company_id)
    
    if category_id is not None:
        # Join with employee and filter by category
        query = query.join(Employee).filter(Employee.category_id == category_id)
    
    if date_from is not None:
        query = query.filter(Consumption.consumed_at >= date_from)
    
    if date_to is not None:
        query = query.filter(Consumption.consumed_at <= date_to)
    
    if meal_type is not None:
        query = query.filter(Consumption.meal_type == meal_type)
    
    total = query.count()
    items = query.order_by(Consumption.consumed_at.desc()).offset(skip).limit(limit).all()
    
    return items, total


def check_duplicate_scan(
    db: Session, 
    employee_id: int, 
    meal_type: str,
    minutes: int = None
) -> Optional[Consumption]:
    """Check if there's a recent consumption (duplicate scan detection)"""
    if minutes is None:
        minutes = settings.DUPLICATE_SCAN_MINUTES
    
    time_threshold = datetime.utcnow() - timedelta(minutes=minutes)
    
    consumption = db.query(Consumption).filter(
        Consumption.employee_id == employee_id,
        Consumption.meal_type == meal_type,
        Consumption.consumed_at >= time_threshold
    ).first()
    
    return consumption


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


def validate_consumption(
    db: Session, 
    employee_id: int, 
    meal_type: str,
    items: List[dict]
) -> tuple[bool, Optional[str]]:
    """
    Validate if an employee can make a consumption
    
    Returns:
        (is_valid, error_message)
    """
    # Get employee with category
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        return False, "Empleado no encontrado"
    
    if not employee.is_active:
        return False, "Empleado inactivo"
    
    # Get category
    category = db.query(Category).filter(Category.id == employee.category_id).first()
    if not category:
        return False, "Categoría no encontrada"
    
    if not category.is_active:
        return False, "Categoría inactiva"
    
    # Get company
    company = db.query(Company).filter(Company.id == employee.company_id).first()
    if not company:
        return False, "Empresa no encontrada"
    
    if not company.is_active:
        return False, "Empresa inactiva"
    
    # Check daily limit
    consumptions_today, total_spent_today = get_employee_today_consumptions(db, employee_id)
    
    if consumptions_today >= category.daily_limit:
        return False, f"Límite diario alcanzado ({category.daily_limit} consumos)"
    
    # Check credit limit
    if category.credit_limit:
        # Calculate total amount of new items
        new_amount = sum(Decimal(str(item.get("price", 0))) * item.get("quantity", 1) for item in items)
        total_with_new = total_spent_today + new_amount
        
        if total_with_new > category.credit_limit:
            return False, f"Excedería el límite de crédito (${category.credit_limit})"
    
    # Check duplicate scan
    duplicate = check_duplicate_scan(db, employee_id, meal_type)
    if duplicate:
        return False, f"Escaneo duplicado detectado (hace menos de {settings.DUPLICATE_SCAN_MINUTES} minutos)"
    
    return True, None


def create_consumption(
    db: Session, 
    consumption_data: ConsumptionCreate,
    registered_by: int = None
) -> Consumption:
    """Create a new consumption after validation"""
    # Calculate total amount
    total_amount = sum(
        Decimal(str(item.price)) * item.quantity 
        for item in consumption_data.items
    )
    
    # Convert items to JSON-serializable format
    items_json = [
        {
            "menu_item_id": item.menu_item_id,
            "name": item.name,
            "price": float(item.price),
            "quantity": item.quantity
        }
        for item in consumption_data.items
    ]
    
    db_consumption = Consumption(
        employee_id=consumption_data.employee_id,
        meal_type=consumption_data.meal_type,
        items=items_json,
        total_amount=total_amount,
        registered_by=registered_by,
        notes=consumption_data.notes
    )
    
    db.add(db_consumption)
    db.commit()
    db.refresh(db_consumption)
    return db_consumption
