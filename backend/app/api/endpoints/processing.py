from fastapi import APIRouter, HTTPException
import uuid
import asyncio
from datetime import datetime, timezone
import logging
from app.db.database import udb
from app.services.ai_service import processing_jobs, process_single_file_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)

async def _run_batch_processing(job_id: str, files: list):
    job = processing_jobs[job_id]
    try:
        for i, f in enumerate(files):
            job["current_file"] = f["filename"]
            job["current_step"] = f"Clasificando ({i+1}/{len(files)})"
            job["processed"] = i

            result = await process_single_file_pipeline(f, job_id)
            job["results"].append(result)

        job["status"] = "completed"
        job["processed"] = len(files)
        job["current_step"] = "Completado"
        job["current_file"] = ""
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
    except Exception as e:
        logger.error(f"Batch processing error: {e}")
        job["status"] = "error"
        job["current_step"] = f"Error: {str(e)}"


@router.post("/projects/{project_id}/process-edge")
async def process_edge_project(project_id: str):
    project = await udb.projects_find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    files = await udb.files_find({"project_id": project_id})

    if not files:
        raise HTTPException(status_code=400, detail="No hay archivos en el proyecto")

    job_id = str(uuid.uuid4())
    processing_jobs[job_id] = {
        "project_id": project_id,
        "status": "running",
        "total": len(files),
        "processed": 0,
        "current_file": "",
        "current_step": "Iniciando...",
        "results": [],
        "started_at": datetime.now(timezone.utc).isoformat(),
    }

    asyncio.create_task(_run_batch_processing(job_id, files))
    return {"job_id": job_id, "total_files": len(files), "status": "running"}


@router.get("/projects/{project_id}/process-status/{job_id}")
async def get_process_status(project_id: str, job_id: str):
    job = processing_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return {
        "job_id": job_id,
        "status": job["status"],
        "total": job["total"],
        "processed": job["processed"],
        "percent": round((job["processed"] / job["total"]) * 100) if job["total"] > 0 else 0,
        "current_file": job["current_file"],
        "current_step": job["current_step"],
        "results": job.get("results", []),
    }


@router.post("/projects/{project_id}/process")
async def process_project_files(project_id: str):
    files = await udb.files_find({"project_id": project_id, "status": "pending"})
    if not files:
        raise HTTPException(status_code=400, detail="No hay archivos pendientes de procesar")

    results = []
    for f in files:
        result = await process_single_file_pipeline(f)
        results.append(result)
    return {"processed": len(results), "results": results}


@router.post("/files/{file_id}/process")
async def process_single_file(file_id: str):
    f = await udb.files_find_one({"id": file_id})
    if not f:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    result = await process_single_file_pipeline(f)
    return result
