"""Tests for menu items API"""
import pytest
from decimal import Decimal
from app.models.menu_item import MenuItem, MealType
from app.services.menu_item_service import (
    get_menu_items,
    get_menu_item,
    create_menu_item,
    update_menu_item,
    delete_menu_item,
)


class TestGetMenuItems:
    """Tests for get_menu_items function"""
    
    def test_get_menu_items_empty(self, db_session):
        """Test getting menu items when none exist"""
        items, total = get_menu_items(db_session)
        assert total == 0
        assert len(items) == 0
    
    def test_get_menu_items_with_data(self, db_session):
        """Test getting menu items with data"""
        item = MenuItem(
            id=1, name="Pizza", price=Decimal("10.50"),
            meal_type=MealType.LUNCH, is_active=True
        )
        db_session.add(item)
        db_session.commit()
        
        items, total = get_menu_items(db_session)
        
        assert total == 1
        assert items[0].name == "Pizza"
    
    def test_get_menu_items_with_filters(self, db_session):
        """Test getting menu items with filters"""
        item1 = MenuItem(id=1, name="Pizza", price=Decimal("10.00"), meal_type=MealType.LUNCH)
        item2 = MenuItem(id=2, name="Burger", price=Decimal("8.00"), meal_type=MealType.DINNER, is_active=False)
        db_session.add(item1)
        db_session.add(item2)
        db_session.commit()
        
        # Filter by active
        items, total = get_menu_items(db_session, is_active=True)
        assert total == 1
        assert items[0].name == "Pizza"
        
        # Filter by meal type
        items, total = get_menu_items(db_session, meal_type=MealType.DINNER)
        assert total == 1


class TestGetMenuItem:
    """Tests for get_menu_item function"""
    
    def test_get_menu_item_exists(self, db_session):
        """Test getting existing menu item"""
        item = MenuItem(id=1, name="Pizza", price=Decimal("10.00"), meal_type=MealType.LUNCH)
        db_session.add(item)
        db_session.commit()
        
        result = get_menu_item(db_session, 1)
        
        assert result is not None
        assert result.name == "Pizza"
    
    def test_get_menu_item_not_exists(self, db_session):
        """Test getting non-existent menu item"""
        result = get_menu_item(db_session, 999)
        assert result is None


class TestCreateMenuItem:
    """Tests for create_menu_item function"""
    
    def test_create_menu_item_success(self, db_session):
        """Test successful menu item creation"""
        from app.schemas.menu_item import MenuItemCreate
        
        data = MenuItemCreate(
            name="New Item",
            price=Decimal("15.00"),
            meal_type=MealType.LUNCH,
            description="New description"
        )
        
        result = create_menu_item(db_session, data)
        
        assert result.name == "New Item"
        assert result.price == Decimal("15.00")
        assert result.is_active == True


class TestUpdateMenuItem:
    """Tests for update_menu_item function"""
    
    def test_update_menu_item_success(self, db_session):
        """Test successful menu item update"""
        item = MenuItem(id=1, name="Pizza", price=Decimal("10.00"), meal_type=MealType.LUNCH)
        db_session.add(item)
        db_session.commit()
        
        from app.schemas.menu_item import MenuItemUpdate
        
        data = MenuItemUpdate(name="Updated Pizza", price=Decimal("12.00"))
        
        result = update_menu_item(db_session, 1, data)
        
        assert result.name == "Updated Pizza"
        assert result.price == Decimal("12.00")


class TestDeleteMenuItem:
    """Tests for delete_menu_item function"""
    
    def test_delete_menu_item_success(self, db_session):
        """Test successful menu item deletion (soft delete)"""
        item = MenuItem(id=1, name="Pizza", price=Decimal("10.00"), meal_type=MealType.LUNCH)
        db_session.add(item)
        db_session.commit()
        
        result = delete_menu_item(db_session, 1)
        
        assert result.is_active == False
