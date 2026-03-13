"""Consumptions router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db.base import get_db
from app.schemas.consumption import (
    ConsumptionCreate, 
    ConsumptionResponse, 
    ConsumptionListResponse
)
from app.schemas.pagination import PaginationParams, PaginatedResponse
from app.models.consumption import MealType
from app.services import consumption_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/consumptions", tags=["Consumptions"])


@router.get("", response_model=PaginatedResponse[ConsumptionResponse])
def list_consumptions(
    pagination: PaginationParams = Depends(),
    employee_id: Optional[int] = None,
    company_id: Optional[int] = None,
    category_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[str] = None,
    meal_type: Optional[MealType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all consumptions with optional filters and pagination"""
    # Parse date_to
    date_to_dt = None
    if date_to:
        try:
            date_to_dt = datetime.fromisoformat(date_to)
        except ValueError:
            pass
    
    items, total = consumption_service.get_consumptions(
        db, skip=pagination.skip, limit=pagination.limit,
        employee_id=employee_id,
        company_id=company_id,
        category_id=category_id,
        date_from=date_from,
        date_to=date_to_dt,
        meal_type=meal_type
    )
    return PaginatedResponse.create(items, total, pagination.page, pagination.page_size)


@router.get("/{consumption_id}", response_model=ConsumptionResponse)
def get_consumption(
    consumption_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a consumption by ID"""
    consumption = consumption_service.get_consumption(db, consumption_id)
    if not consumption:
        raise HTTPException(status_code=404, detail="Consumption not found")
    return consumption


@router.post("", response_model=ConsumptionResponse, status_code=status.HTTP_201_CREATED)
def create_consumption(
    consumption_data: ConsumptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new consumption after scanning QR code"""
    # Convert items to dict format for validation
    items_dict = [
        {
            "menu_item_id": item.menu_item_id,
            "price": float(item.price),
            "quantity": item.quantity
        }
        for item in consumption_data.items
    ]
    
    # Validate consumption
    is_valid, error_message = consumption_service.validate_consumption(
        db, 
        consumption_data.employee_id, 
        consumption_data.meal_type.value,
        items_dict
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)
    
    # Create consumption
    consumption = consumption_service.create_consumption(
        db, 
        consumption_data,
        registered_by=current_user.id
    )
    return consumption
