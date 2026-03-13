"""API routers"""
from fastapi import APIRouter
from app.api import auth, companies, categories, employees, menu_items, consumptions, reports

api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(categories.router)
api_router.include_router(employees.router)
api_router.include_router(menu_items.router)
api_router.include_router(consumptions.router)
api_router.include_router(reports.router)
