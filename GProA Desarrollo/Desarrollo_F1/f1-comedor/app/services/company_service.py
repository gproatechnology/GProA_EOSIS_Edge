"""Company service"""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


def get_company(db: Session, company_id: int) -> Optional[Company]:
    """Get company by ID"""
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_code(db: Session, code: str) -> Optional[Company]:
    """Get company by code"""
    return db.query(Company).filter(Company.code == code).first()


def get_companies(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
) -> tuple[List[Company], int]:
    """Get companies with optional filters"""
    query = db.query(Company)
    
    if is_active is not None:
        query = query.filter(Company.is_active == is_active)
    
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return items, total


def create_company(db: Session, company_data: CompanyCreate) -> Company:
    """Create a new company"""
    db_company = Company(**company_data.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def update_company(
    db: Session, 
    company_id: int, 
    company_data: CompanyUpdate
) -> Optional[Company]:
    """Update a company"""
    company = get_company(db, company_id)
    if not company:
        return None
    
    update_data = company_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
    
    db.commit()
    db.refresh(company)
    return company


def delete_company(db: Session, company_id: int) -> bool:
    """Soft delete a company (set is_active to False)"""
    company = get_company(db, company_id)
    if not company:
        return False
    
    company.is_active = False
    db.commit()
    return True
