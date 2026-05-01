from fastapi import APIRouter
import uuid
from datetime import datetime, timezone
from app.db.database import udb

router = APIRouter()

@router.post("/seed")
async def seed_data():
    # 1. Clear existing data (optional, but good for consistent testing)
    # await udb.projects_delete_many({}) # If we had delete_many for projects
    # For now let's just add new ones
    
    projects = [
        {
            "id": "p1-mock",
            "name": "Proyecto Demo Iluminación Retail",
            "typology": "Retail",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "file_count": 3,
            "processed_count": 1,
        },
        {
            "id": "p2-mock",
            "name": "Auditoría Energética Hotel Central",
            "typology": "Hotel",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "file_count": 2,
            "processed_count": 2,
        },
        {
            "id": "p3-mock",
            "name": "Instalación Industrial Norte",
            "typology": "Industrial",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "file_count": 1,
            "processed_count": 0,
        }
    ]

    for p in projects:
        # Check if exists to avoid PK conflict
        existing = await udb.projects_find_one({"id": p["id"]})
        if not existing:
            await udb.projects_insert_one(p)

    files = [
        {
            "id": "f1-mock",
            "project_id": "p1-mock",
            "filename": "plano_iluminacion_v1.pdf",
            "file_size": 1024500,
            "status": "processed",
            "category_edge": "Lighting",
            "measure_edge": "LED Retrofit",
            "doc_type": "Blueprints",
            "confidence": 0.95,
            "watts": 45.0,
            "lumens": 5000.0,
            "tipo_equipo": "Panel LED",
            "marca": "Philips",
            "modelo": "CoreLine",
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "f2-mock",
            "project_id": "p1-mock",
            "filename": "inventario_existente.xlsx",
            "file_size": 45000,
            "status": "pending",
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "f3-mock",
            "project_id": "p2-mock",
            "filename": "factura_energia_marzo.pdf",
            "file_size": 250000,
            "status": "processed",
            "category_edge": "Utility Bill",
            "doc_type": "Invoice",
            "confidence": 0.88,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    for f in files:
        existing = await udb.files_find_one({"id": f["id"]})
        if not existing:
            await udb.files_insert_one(f)

    return {"message": "Mock data seeded successfully", "projects_added": len(projects), "files_added": len(files)}

@router.post("/clear")
async def clear_data():
    # This is risky, but useful for debug
    # We don't have delete_many implemented in udb for projects/files in a generic way for sqlite
    # But we can iterate or use a direct SQL if it's sqlite
    if udb.mode == "sqlite":
        await udb._ensure_sqlite()
        await udb.conn.execute("DELETE FROM projects")
        await udb.conn.execute("DELETE FROM files")
        await udb.conn.commit()
    else:
        from app.db.database import db
        await db.projects.delete_many({})
        await db.files.delete_many({})
    return {"message": "All data cleared"}
