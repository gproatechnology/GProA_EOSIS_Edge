"""Category service"""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """Get category by ID"""
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    """Get category by name"""
    return db.query(Category).filter(Category.name == name).first()


def get_categories(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    is_active: Optional[bool] = None
) -> tuple[List[Category], int]:
    """Get categories with optional filters"""
    query = db.query(Category)
    
    if is_active is not None:
        query = query.filter(Category.is_active == is_active)
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return items, total


def create_category(db: Session, category_data: CategoryCreate) -> Category:
    """Create a new category"""
    db_category = Category(**category_data.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session, 
    category_id: int, 
    category_data: CategoryUpdate
) -> Optional[Category]:
    """Update a category"""
    category = get_category(db, category_id)
    if not category:
        return None
    
    update_data = category_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    """Soft delete a category (set is_active to False)"""
    category = get_category(db, category_id)
    if not category:
        return False
    
    category.is_active = False
    db.commit()
    return True
