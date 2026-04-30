from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime, timezone
from app.db.database import udb
from app.schemas.schemas import ProjectCreate, ProjectResponse
from app.services.ai_service import processing_jobs

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": project.name,
        "typology": project.typology,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "file_count": 0,
        "processed_count": 0,
    }
    await udb.projects_insert_one(doc)
    return ProjectResponse(**doc)

@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    projects = await udb.projects_find()
    result = []
    for p in projects:
        file_count = await udb.files_count_documents({"project_id": p["id"]})
        processed_count = await udb.files_count_documents({"project_id": p["id"], "status": "processed"})
        p["file_count"] = file_count
        p["processed_count"] = processed_count
        result.append(ProjectResponse(**p))
    return result

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = await udb.projects_find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    file_count = await udb.files_count_documents({"project_id": project_id})
    processed_count = await udb.files_count_documents({"project_id": project_id, "status": "processed"})
    project["file_count"] = file_count
    project["processed_count"] = processed_count
    return ProjectResponse(**project)

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    result = await udb.projects_delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    await udb.files_delete_many({"project_id": project_id})
    # Cleanup jobs
    to_remove = [k for k, v in processing_jobs.items() if v.get("project_id") == project_id]
    for k in to_remove:
        del processing_jobs[k]
    return {"message": "Proyecto eliminado"}
