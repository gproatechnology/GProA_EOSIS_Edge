"""Consumption model"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class MealType(str, enum.Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"


class Consumption(Base):
    __tablename__ = "consumptions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    consumed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    meal_type = Column(Enum(MealType), nullable=False)
    items = Column(JSON, nullable=False)  # List of consumed dishes
    total_amount = Column(Numeric(10, 2), nullable=False)
    registered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(String(500), nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="consumptions")
    user = relationship("User", back_populates="consumptions")
