"""Reports router"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.db.base import get_db
from app.schemas.report import (
    ReportByCompanyResponse,
    ReportByCategoryResponse,
    ReportByEmployeeResponse,
    DailySummaryResponse,
    DashboardStatsResponse,
)
from app.services import report_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/by-company", response_model=ReportByCompanyResponse)
def report_by_company(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption report by company"""
    return report_service.get_report_by_company(db, date_from, date_to)


@router.get("/by-category", response_model=ReportByCategoryResponse)
def report_by_category(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption report by category"""
    return report_service.get_report_by_category(db, date_from, date_to)


@router.get("/by-employee", response_model=ReportByEmployeeResponse)
def report_by_employee(
    employee_id: int = Query(...),
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed consumption history for an employee"""
    report = report_service.get_report_by_employee(db, employee_id, date_from, date_to)
    if not report:
        raise HTTPException(status_code=404, detail="Employee not found")
    return report


@router.get("/daily-summary", response_model=DailySummaryResponse)
def daily_summary(
    date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily summary report"""
    return report_service.get_daily_summary(db, date)


@router.get("/export/excel")
def export_excel(
    date_from: date = Query(...),
    date_to: date = Query(...),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export consumptions to Excel file"""
    excel_data = report_service.export_consumptions_to_excel(
        db, date_from, date_to, company_id
    )
    
    filename = f"consumos_{date_from}_{date_to}.xlsx"
    if company_id:
        filename = f"consumos_empresa_{company_id}_{date_from}_{date_to}.xlsx"
    
    return StreamingResponse(
        iter([excel_data]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    return report_service.get_dashboard_stats(db)
