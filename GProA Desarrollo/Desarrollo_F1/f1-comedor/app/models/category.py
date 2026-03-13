"""Category model (Employee category)"""
from sqlalchemy import Column, Integer, String, Boolean, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    daily_limit = Column(Integer, default=1, nullable=False)  # Maximum consumptions per day
    credit_limit = Column(Numeric(10, 2), nullable=True)  # Optional max amount per day
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    employees = relationship("Employee", back_populates="category")
