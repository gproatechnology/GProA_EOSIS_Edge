"""Seed script to populate database with test data"""
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import SessionLocal, engine, Base
from app.models.company import Company
from app.models.category import Category
from app.models.employee import Employee
from app.models.menu_item import MenuItem, MealType
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def seed_database():
    """Seed the database with test data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("Seeding data...")
        
        # Create admin user
        admin = User(
            username="admin",
            email="admin@f1comedor.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        
        # Create supervisor user
        supervisor = User(
            username="supervisor",
            email="supervisor@f1comedor.com",
            hashed_password=get_password_hash("supervisor123"),
            role=UserRole.SUPERVISOR,
            is_active=True
        )
        db.add(supervisor)
        
        # Create cashier user
        cashier = User(
            username="cajero",
            email="cajero@f1comedor.com",
            hashed_password=get_password_hash("cajero123"),
            role=UserRole.CASHIER,
            is_active=True
        )
        db.add(cashier)
        
        # Create 5 companies
        companies = [
            Company(name="TechCorp Solutions", code="TECHCORP", is_active=True),
            Company(name="Industrial Manufacturing", code="INDMAN", is_active=True),
            Company(name="Global Services Ltd", code="GLOBSERV", is_active=True),
            Company(name="Construction Builders", code="CONSTB", is_active=True),
            Company(name="Logistics Transport", code="LOGTRANS", is_active=True),
        ]
        for company in companies:
            db.add(company)
        
        db.flush()
        print(f"Created {len(companies)} companies")
        
        # Create 3 categories
        categories = [
            Category(name="Ejecutivo", daily_limit=3, credit_limit=500.00, is_active=True),
            Category(name="Operativo", daily_limit=2, credit_limit=300.00, is_active=True),
            Category(name="Contratista", daily_limit=1, credit_limit=150.00, is_active=True),
            Category(name="Visitante", daily_limit=1, credit_limit=None, is_active=True),
        ]
        for category in categories:
            db.add(category)
        
        db.flush()
        print(f"Created {len(categories)} categories")
        
        # Create 20 employees
        first_names = [
            "Juan", "María", "Pedro", "Ana", "Luis", "Carmen", "José", "Laura",
            "Miguel", "Sofia", "Antonio", "Isabel", "Francisco", "Elena", "David",
            "Patricia", "Carlos", "Monica", "Alejandro", "Rosa"
        ]
        last_names = [
            "García", "Martínez", "López", "González", "Rodríguez", "Hernández",
            "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
            "Díaz", "Reyes", "Cruz", "Morales", "Ortiz", "Gutiérrez", "Chávez"
        ]
        
        employees = []
        for i in range(20):
            employee = Employee(
                employee_number=f"EMP{1000 + i}",
                first_name=first_names[i],
                last_name=last_names[i],
                company_id=companies[i % len(companies)].id,
                category_id=categories[i % len(categories)].id,
                email=f"{first_names[i].lower()}.{last_names[i].lower()}@empresa.com",
                phone=f"+52 55 {1000 + i:04d} {1000 + i:04d}",
                is_active=True
            )
            # Generate unique QR code
            employee.qr_code = f"EMP-{100000 + i:06d}"
            employees.append(employee)
            db.add(employee)
        
        db.flush()
        print(f"Created {len(employees)} employees")
        
        # Create menu items
        menu_items = [
            # Breakfast
            MenuItem(name="Huevos Rancheros", description="Huevos con frijoles y tortillas", price=45.00, meal_type=MealType.BREAKFAST, is_active=True),
            MenuItem(name="Hot Cakes", description="3 hot cakes con syrup", price=40.00, meal_type=MealType.BREAKFAST, is_active=True),
            MenuItem(name="Chilaquiles", description="Chilaquiles verdes con pollo", price=55.00, meal_type=MealType.BREAKFAST, is_active=True),
            MenuItem(name="Café y Pan", description="Café americano con pan dulce", price=25.00, meal_type=MealType.BREAKFAST, is_active=True),
            
            # Lunch
            MenuItem(name="Combo Ejecutivo", description="Sopa, plato fuerte y bebida", price=85.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Tacos al Pastor", description="6 tacos con todo", price=60.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Enchiladas Verdes", description="3 enchiladas con pollo", price=70.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Parrillada", description="Carne asada con accesorios", price=120.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Filete de Pescado", description="Filete empanizado con arroz", price=95.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Milanesa", description="Milanesa de res con papas", price=75.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Sopa del Día", description="Sopa de tortilla o pozole", price=35.00, meal_type=MealType.LUNCH, is_active=True),
            MenuItem(name="Ensalada Mixta", description="Lechuga, tomate, aderezo", price=40.00, meal_type=MealType.LUNCH, is_active=True),
            
            # Dinner
            MenuItem(name="Cena Ligera", description="Sándwich y té", price=50.00, meal_type=MealType.DINNER, is_active=True),
            MenuItem(name="Hamburguesa", description="Hamburguesa con fries", price=65.00, meal_type=MealType.DINNER, is_active=True),
            MenuItem(name="Pasta Bolognesa", description="Pasta con carne molida", price=60.00, meal_type=MealType.DINNER, is_active=True),
            MenuItem(name="Crepas", description="4 crepas con dulce", price=45.00, meal_type=MealType.DINNER, is_active=True),
            MenuItem(name="Nachos", description="Nachos con queso y jalapeños", price=55.00, meal_type=MealType.DINNER, is_active=True),
        ]
        
        for item in menu_items:
            db.add(item)
        
        db.flush()
        print(f"Created {len(menu_items)} menu items")
        
        # Commit all
        db.commit()
        
        print("\n✅ Database seeded successfully!")
        print("\n📋 Login credentials:")
        print("   Admin: username=admin, password=admin123")
        print("   Supervisor: username=supervisor, password=supervisor123")
        print("   Cajero: username=cajero, password=cajero123")
        print("\n📱 Employee QR codes: EMP-100000 to EMP-100019")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
