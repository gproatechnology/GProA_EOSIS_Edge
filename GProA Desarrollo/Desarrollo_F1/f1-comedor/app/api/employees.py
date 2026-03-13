"""Employees router"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.schemas.employee import (
    EmployeeCreate, 
    EmployeeUpdate, 
    EmployeeResponse, 
    EmployeeListResponse,
    EmployeeScanRequest,
    EmployeeScanResponse
)
from app.schemas.pagination import PaginationParams, PaginatedResponse
from app.services import employee_service
from app.core.security import get_current_user
from app.models.user import User

# Logger de diagnóstico
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
def list_employees(
    pagination: PaginationParams = Depends(),
    company_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all employees with optional filters and pagination"""
    items, total = employee_service.get_employees(
        db, skip=pagination.skip, limit=pagination.limit, 
        company_id=company_id, 
        category_id=category_id,
        is_active=is_active, 
        search=search
    )
    return PaginatedResponse.create(items, total, pagination.page, pagination.page_size)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an employee by ID"""
    employee = employee_service.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new employee - QR code is generated automatically"""
    # Check if employee number already exists
    existing = employee_service.get_employee_by_employee_number(db, employee_data.employee_number)
    if existing:
        raise HTTPException(status_code=400, detail="Employee number already exists")
    
    employee = employee_service.create_employee(db, employee_data)
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an employee"""
    employee = employee_service.update_employee(db, employee_id, employee_data)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete an employee"""
    success = employee_service.delete_employee(db, employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None


@router.get("/{employee_id}/qr")
def get_employee_qr(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee's QR code as PNG image"""
    qr_image = employee_service.get_employee_qr_image(db, employee_id)
    if not qr_image:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"qr_code": qr_image}


@router.post("/scan", response_model=EmployeeScanResponse)
def scan_employee_qr(
    request: EmployeeScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Scan employee QR code and validate - returns employee data and limits"""
    scan_result = employee_service.scan_employee(db, request.qr_code)
    if not scan_result:
        raise HTTPException(status_code=404, detail="QR code not recognized")
    return scan_result
