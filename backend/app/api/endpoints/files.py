from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from datetime import datetime, timezone
from app.db.database import udb
from app.schemas.schemas import FileResponse, FileUpdate

router = APIRouter()

@router.post("/projects/{project_id}/files", response_model=FileResponse)
async def upload_file(project_id: str, file: UploadFile = File(...)):
    project = await udb.projects_find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    content_bytes = await file.read()
    try:
        text_content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content_bytes.decode("latin-1", errors="ignore")

    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "filename": file.filename,
        "file_size": len(content_bytes),
        "content_text": text_content,
        "status": "pending",
        "category_edge": None,
        "measure_edge": None,
        "doc_type": None,
        "confidence": None,
        "watts": None,
        "lumens": None,
        "tipo_equipo": None,
        "marca": None,
        "modelo": None,
        "areas": None,
        "specialized_data": None,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await udb.files_insert_one(doc)
    doc.pop("content_text", None)
    return FileResponse(**doc)

@router.get("/projects/{project_id}/files", response_model=List[FileResponse])
async def list_files(project_id: str):
    files = await udb.files_find({"project_id": project_id}, {"content_text": 0})
    return [FileResponse(**f) for f in files]

@router.put("/files/{file_id}", response_model=FileResponse)
async def update_file(file_id: str, update_data: FileUpdate):
    file = await udb.files_find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Preparamos los datos para actualizar, forzando confianza a 1.0 si es edicion manual
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["confidence"] = 1.0
    
    await udb.files_update_one({"id": file_id}, {"$set": update_dict})
    
    updated_file = await udb.files_find_one({"id": file_id})
    return FileResponse(**updated_file)

@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    result = await udb.files_delete_one({"id": file_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return {"message": "Archivo eliminado"}
