"""Tests for consumptions API"""
import pytest
from datetime import datetime, date
from decimal import Decimal

from app.models.consumption import Consumption, MealType
from app.models.employee import Employee
from app.models.category import Category
from app.models.company import Company
from app.services.consumption_service import (
    get_consumptions,
    create_consumption,
    check_duplicate_scan,
    validate_consumption,
)


class TestGetConsumptions:
    """Tests for get_consumptions function"""
    
    def test_get_consumptions_basic(self, db_session):
        """Test basic consumption listing"""
        # Create test company
        company = Company(id=1, name="Test Company", code="TC001")
        db_session.add(company)
        
        # Create test category
        category = Category(
            id=1, 
            name="Test Category", 
            daily_limit=3, 
            credit_limit=Decimal("100.00")
        )
        db_session.add(category)
        
        # Create test employee
        employee = Employee(
            id=1,
            employee_number="EMP001",
            first_name="John",
            last_name="Doe",
            qr_code="QR001",
            company_id=1,
            category_id=1,
            is_active=True
        )
        db_session.add(employee)
        
        # Create test consumption
        consumption = Consumption(
            id=1,
            employee_id=1,
            meal_type=MealType.LUNCH,
            total_amount=Decimal("25.50"),
            consumed_at=datetime.now(),
            registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        # Test the function
        items, total = get_consumptions(db_session, skip=0, limit=10)
        
        assert total == 1
        assert len(items) == 1
        assert items[0].id == 1
    
    def test_get_consumptions_with_filters(self, db_session):
        """Test consumption listing with filters"""
        # Create test data
        company = Company(id=1, name="Test Company", code="TC001")
        db_session.add(company)
        
        category = Category(id=1, name="Category", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        consumption = Consumption(
            id=1, employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("25.00"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        # Test with employee filter
        items, total = get_consumptions(db_session, skip=0, limit=10, employee_id=1)
        assert total == 1
        
        # Test with non-existent employee
        items, total = get_consumptions(db_session, skip=0, limit=10, employee_id=999)
        assert total == 0


class TestCreateConsumption:
    """Tests for create_consumption function"""
    
    def test_create_consumption_success(self, db_session):
        """Test successful consumption creation"""
        # Create test data
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(
            id=1, name="Category", daily_limit=3, 
            credit_limit=Decimal("100.00")
        )
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        db_session.commit()
        
        # Create consumption
        from app.schemas.consumption import ConsumptionCreate
        consumption_data = ConsumptionCreate(
            employee_id=1,
            meal_type=MealType.LUNCH,
            items=[{"name": "Pizza", "price": "10.00"}],
            total_amount=Decimal("10.00")
        )
        
        result = create_consumption(db_session, consumption_data, registered_by=1)
        
        assert result.employee_id == 1
        assert result.meal_type == MealType.LUNCH
        assert result.total_amount == Decimal("10.00")


class TestCheckDuplicateScan:
    """Tests for check_duplicate_scan function"""
    
    def test_no_duplicate(self, db_session):
        """Test no duplicate scan exists"""
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(id=1, name="Cat", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        db_session.commit()
        
        result = check_duplicate_scan(db_session, employee.id, MealType.LUNCH)
        
        assert result == False
    
    def test_duplicate_exists(self, db_session):
        """Test duplicate scan exists"""
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(id=1, name="Cat", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        # Create recent consumption
        consumption = Consumption(
            employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("10.00"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        result = check_duplicate_scan(db_session, employee.id, MealType.LUNCH)
        
        assert result == True
