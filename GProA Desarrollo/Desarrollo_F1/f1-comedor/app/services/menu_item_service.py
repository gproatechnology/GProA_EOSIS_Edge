"""Menu item service"""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.menu_item import MenuItem, MealType
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate


def get_menu_item(db: Session, menu_item_id: int) -> Optional[MenuItem]:
    """Get menu item by ID"""
    return db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()


def get_menu_items(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    is_active: Optional[bool] = None,
    meal_type: Optional[MealType] = None
) -> tuple[List[MenuItem], int]:
    """Get menu items with optional filters"""
    query = db.query(MenuItem)
    
    if is_active is not None:
        query = query.filter(MenuItem.is_active == is_active)
    
    if meal_type is not None:
        query = query.filter(MenuItem.meal_type == meal_type)
    
    total = query.count()
    items = query.order_by(MenuItem.meal_type, MenuItem.name).offset(skip).limit(limit).all()
    
    return items, total


def create_menu_item(db: Session, menu_item_data: MenuItemCreate) -> MenuItem:
    """Create a new menu item"""
    db_menu_item = MenuItem(**menu_item_data.model_dump())
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item


def update_menu_item(
    db: Session, 
    menu_item_id: int, 
    menu_item_data: MenuItemUpdate
) -> Optional[MenuItem]:
    """Update a menu item"""
    menu_item = get_menu_item(db, menu_item_id)
    if not menu_item:
        return None
    
    update_data = menu_item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(menu_item, key, value)
    
    db.commit()
    db.refresh(menu_item)
    return menu_item


def delete_menu_item(db: Session, menu_item_id: int) -> bool:
    """Soft delete a menu item (set is_active to False)"""
    menu_item = get_menu_item(db, menu_item_id)
    if not menu_item:
        return False
    
    menu_item.is_active = False
    db.commit()
    return True
