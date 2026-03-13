"""Menu items router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse, MenuItemListResponse
from app.schemas.pagination import PaginationParams, PaginatedResponse
from app.models.menu_item import MealType
from app.services import menu_item_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/menu-items", tags=["Menu"])


@router.get("", response_model=PaginatedResponse[MenuItemResponse])
def list_menu_items(
    pagination: PaginationParams = Depends(),
    is_active: Optional[bool] = None,
    meal_type: Optional[MealType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all menu items with optional filters and pagination"""
    items, total = menu_item_service.get_menu_items(
        db, skip=pagination.skip, limit=pagination.limit, is_active=is_active, meal_type=meal_type
    )
    return PaginatedResponse.create(items, total, pagination.page, pagination.page_size)


@router.get("/{menu_item_id}", response_model=MenuItemResponse)
def get_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a menu item by ID"""
    menu_item = menu_item_service.get_menu_item(db, menu_item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu_item


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    menu_item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new menu item"""
    menu_item = menu_item_service.create_menu_item(db, menu_item_data)
    return menu_item


@router.put("/{menu_item_id}", response_model=MenuItemResponse)
def update_menu_item(
    menu_item_id: int,
    menu_item_data: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a menu item"""
    menu_item = menu_item_service.update_menu_item(db, menu_item_id, menu_item_data)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu_item


@router.delete("/{menu_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete a menu item"""
    success = menu_item_service.delete_menu_item(db, menu_item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return None
