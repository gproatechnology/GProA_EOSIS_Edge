"""Tests for reports API"""
import pytest
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.models.consumption import Consumption, MealType
from app.models.employee import Employee
from app.models.category import Category
from app.models.company import Company
from app.services.report_service import (
    get_report_by_company,
    get_report_by_category,
    get_dashboard_stats,
    get_daily_summary,
)


class TestReportByCompany:
    """Tests for get_report_by_company function"""
    
    def test_report_by_company_empty(self, db_session):
        """Test report by company with no data"""
        result = get_report_by_company(db_session, date.today(), date.today())
        
        assert result.total_companies == 0
        assert len(result.companies) == 0
    
    def test_report_by_company_with_data(self, db_session):
        """Test report by company with data"""
        # Create test data
        company = Company(id=1, name="Test Company", code="TC001")
        db_session.add(company)
        
        category = Category(id=1, name="Cat", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        consumption = Consumption(
            employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("25.00"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        result = get_report_by_company(db_session, date.today(), date.today())
        
        assert result.total_companies == 1
        assert result.companies[0].company_name == "Test Company"


class TestReportByCategory:
    """Tests for get_report_by_category function"""
    
    def test_report_by_category_empty(self, db_session):
        """Test report by category with no data"""
        result = get_report_by_category(db_session, date.today(), date.today())
        
        assert result.total_categories == 0
    
    def test_report_by_category_with_data(self, db_session):
        """Test report by category with data"""
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(id=1, name="Premium", daily_limit=5, credit_limit=Decimal("200.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        consumption = Consumption(
            employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("30.00"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        result = get_report_by_category(db_session, date.today(), date.today())
        
        assert result.total_categories == 1
        assert result.categories[0].category_name == "Premium"


class TestDashboardStats:
    """Tests for get_dashboard_stats function"""
    
    def test_dashboard_stats_empty(self, db_session):
        """Test dashboard stats with no data"""
        result = get_dashboard_stats(db_session)
        
        assert result.total_consumptions_today == 0
        assert result.total_amount_today == Decimal("0")
        assert result.active_employees == 0
    
    def test_dashboard_stats_with_data(self, db_session):
        """Test dashboard stats with data"""
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(id=1, name="Cat", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        consumption = Consumption(
            employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("25.50"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        result = get_dashboard_stats(db_session)
        
        assert result.total_consumptions_today == 1
        assert result.total_amount_today == Decimal("25.50")
        assert result.active_employees == 1


class TestDailySummary:
    """Tests for get_daily_summary function"""
    
    def test_daily_summary_empty(self, db_session):
        """Test daily summary with no data"""
        result = get_daily_summary(db_session, date.today())
        
        assert result.total_consumers == 0
        assert result.total_amount == Decimal("0")
    
    def test_daily_summary_with_data(self, db_session):
        """Test daily summary with data"""
        company = Company(id=1, name="Company", code="C001")
        db_session.add(company)
        
        category = Category(id=1, name="Cat", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        
        employee = Employee(
            id=1, employee_number="EMP001", first_name="John", last_name="Doe",
            qr_code="QR001", company_id=1, category_id=1, is_active=True
        )
        db_session.add(employee)
        
        consumption = Consumption(
            employee_id=1, meal_type=MealType.LUNCH,
            total_amount=Decimal("20.00"), consumed_at=datetime.now(), registered_by=1
        )
        db_session.add(consumption)
        db_session.commit()
        
        result = get_daily_summary(db_session, date.today())
        
        assert result.total_consumers == 1
        assert result.total_amount == Decimal("20.00")
        assert len(result.by_meal_type) > 0
