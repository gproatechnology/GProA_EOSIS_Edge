"""Tests for categories API"""
import pytest
from decimal import Decimal
from app.models.category import Category
from app.models.company import Company
from app.services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)


class TestGetCategories:
    """Tests for get_categories function"""
    
    def test_get_categories_empty(self, db_session):
        """Test getting categories when none exist"""
        items, total = get_categories(db_session)
        assert total == 0
        assert len(items) == 0
    
    def test_get_categories_with_data(self, db_session):
        """Test getting categories with data"""
        category = Category(id=1, name="Test Category", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        db_session.commit()
        
        items, total = get_categories(db_session)
        
        assert total == 1
        assert items[0].name == "Test Category"
    
    def test_get_categories_with_filters(self, db_session):
        """Test getting categories with is_active filter"""
        cat1 = Category(id=1, name="Active", daily_limit=3, credit_limit=Decimal("100.00"))
        cat2 = Category(id=2, name="Inactive", daily_limit=2, credit_limit=Decimal("50.00"), is_active=False)
        db_session.add(cat1)
        db_session.add(cat2)
        db_session.commit()
        
        # Get active only
        items, total = get_categories(db_session, is_active=True)
        assert total == 1
        assert items[0].name == "Active"


class TestGetCategory:
    """Tests for get_category function"""
    
    def test_get_category_exists(self, db_session):
        """Test getting existing category"""
        category = Category(id=1, name="Test", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        db_session.commit()
        
        result = get_category(db_session, 1)
        
        assert result is not None
        assert result.name == "Test"
    
    def test_get_category_not_exists(self, db_session):
        """Test getting non-existent category"""
        result = get_category(db_session, 999)
        assert result is None


class TestCreateCategory:
    """Tests for create_category function"""
    
    def test_create_category_success(self, db_session):
        """Test successful category creation"""
        from app.schemas.category import CategoryCreate
        
        data = CategoryCreate(
            name="New Category",
            daily_limit=5,
            credit_limit=Decimal("200.00")
        )
        
        result = create_category(db_session, data)
        
        assert result.name == "New Category"
        assert result.daily_limit == 5
        assert result.is_active == True


class TestUpdateCategory:
    """Tests for update_category function"""
    
    def test_update_category_success(self, db_session):
        """Test successful category update"""
        category = Category(id=1, name="Old Name", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        db_session.commit()
        
        from app.schemas.category import CategoryUpdate
        
        data = CategoryUpdate(name="New Name", daily_limit=10)
        
        result = update_category(db_session, 1, data)
        
        assert result.name == "New Name"
        assert result.daily_limit == 10


class TestDeleteCategory:
    """Tests for delete_category function"""
    
    def test_delete_category_success(self, db_session):
        """Test successful category deletion (soft delete)"""
        category = Category(id=1, name="To Delete", daily_limit=3, credit_limit=Decimal("100.00"))
        db_session.add(category)
        db_session.commit()
        
        result = delete_category(db_session, 1)
        
        assert result.is_active == False
        
        # Verify it's soft deleted
        cat = get_category(db_session, 1)
        assert cat.is_active == False
