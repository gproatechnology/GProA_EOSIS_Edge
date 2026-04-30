from fastapi import APIRouter, HTTPException
from app.services.edge_rules import get_all_rules, get_rule

router = APIRouter()

@router.get("/edge-rules")
async def get_edge_rules():
    return get_all_rules()

@router.get("/edge-rules/{measure}")
async def get_edge_rule(measure: str):
    rule = get_rule(measure.upper())
    if not rule:
        raise HTTPException(status_code=404, detail=f"Medida {measure} no encontrada")
    return {measure.upper(): rule}
