from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import io
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import openpyxl

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models ---

class ProjectCreate(BaseModel):
    name: str
    typology: str

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    typology: str
    created_at: str
    file_count: int = 0
    processed_count: int = 0

class FileResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    filename: str
    file_size: int
    status: str
    category_edge: Optional[str] = None
    measure_edge: Optional[str] = None
    doc_type: Optional[str] = None
    confidence: Optional[float] = None
    watts: Optional[float] = None
    lumens: Optional[float] = None
    tipo_equipo: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    areas: Optional[list] = None
    uploaded_at: str

class EdgeStatusResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    categories: dict
    measures: dict
    faltantes: list
    total_files: int
    processed_files: int

# --- AI Processing Functions ---

async def classify_file(content: str) -> dict:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"classify-{uuid.uuid4()}",
        system_message="Eres un consultor experto en certificacion EDGE. Responde SOLO en JSON valido. No expliques nada."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Clasifica este archivo tecnico de construccion.

Clasifica en:
1. Categoria EDGE (elige solo una): DESIGN, ENERGY, WATER, MATERIALS
2. Medida EDGE especifica (elige la mas probable):
   EEM01, EEM02, EEM03, EEM05, EEM06, EEM08, EEM09, EEM13, EEM16, EEM22, EEM23
   WEM01, WEM02, WEM04, WEM07, WEM08
   MEM01, MEM02, MEM03, MEM04, MEM05, MEM06, MEM07, MEM08, MEM09, MEM10
   DESIGN (si aplica general)
3. Tipo de documento: plano, ficha_tecnica, fotografia, memoria, factura, otro
4. Nivel de confianza (0 a 1)

Responde SOLO en JSON:
{{"category_edge": "...", "measure_edge": "...", "doc_type": "...", "confidence": 0.0}}

Contenido del archivo:
{content[:3000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse classification response: {response}")
        return {"category_edge": "DESIGN", "measure_edge": "DESIGN", "doc_type": "otro", "confidence": 0.1}


async def extract_data(content: str) -> dict:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"extract-{uuid.uuid4()}",
        system_message="Eres un ingeniero analizando fichas tecnicas de equipos. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Extrae la siguiente informacion si esta disponible:
- watts (numero)
- lumens (numero)
- tipo_equipo (ej: luminaria LED, aire acondicionado, bomba, etc.)
- marca
- modelo

Si no encuentras un dato, pon null. Convierte unidades a numeros (ej: "120 W" -> 120).

Responde SOLO en JSON:
{{"watts": null, "lumens": null, "tipo_equipo": null, "marca": null, "modelo": null}}

Contenido:
{content[:3000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse extraction response: {response}")
        return {"watts": None, "lumens": None, "tipo_equipo": None, "marca": None, "modelo": None}


async def calculate_areas(content: str) -> list:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"areas-{uuid.uuid4()}",
        system_message="Eres un arquitecto experto en interpretacion de planos. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""A partir del siguiente texto extraido de un plano (OCR), identifica espacios y sus dimensiones.
Calcula el area de cada espacio en m2.

Si hay largo y ancho, multiplica. Si no hay datos suficientes, ignora ese espacio.

Responde SOLO en JSON:
{{"espacios": [{{"nombre": "string", "area_m2": 0}}]}}

Texto del plano:
{content[:3000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = json.loads(cleaned)
        return data.get("espacios", [])
    except json.JSONDecodeError:
        logger.error(f"Failed to parse areas response: {response}")
        return []


async def validate_edge(project_id: str) -> list:
    files = await db.files.find(
        {"project_id": project_id, "status": "processed"},
        {"_id": 0}
    ).to_list(1000)

    if not files:
        return []

    measures_data = {}
    for f in files:
        measure = f.get("measure_edge", "UNKNOWN")
        if measure not in measures_data:
            measures_data[measure] = []
        measures_data[measure].append(f.get("doc_type", "otro"))

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"validate-{uuid.uuid4()}",
        system_message="Eres un consultor EDGE revisando documentacion. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Revisa esta documentacion de un proyecto EDGE.
Identifica que medidas EDGE estan incompletas y que tipo de documento falta.

Responde SOLO en JSON:
{{"faltantes": [{{"medida": "EEM22", "faltan": ["ficha_tecnica", "fotografia"]}}]}}

Datos del proyecto:
{json.dumps(measures_data)}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = json.loads(cleaned)
        return data.get("faltantes", [])
    except json.JSONDecodeError:
        return []


# --- API Routes ---

@api_router.get("/")
async def root():
    return {"message": "EDGE Document Processor API"}

# Projects
@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": project.name,
        "typology": project.typology,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "file_count": 0,
        "processed_count": 0,
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return ProjectResponse(**doc)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def list_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    for p in projects:
        p["file_count"] = await db.files.count_documents({"project_id": p["id"]})
        p["processed_count"] = await db.files.count_documents({"project_id": p["id"], "status": "processed"})
    return [ProjectResponse(**p) for p in projects]

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    project["file_count"] = await db.files.count_documents({"project_id": project_id})
    project["processed_count"] = await db.files.count_documents({"project_id": project_id, "status": "processed"})
    return ProjectResponse(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    await db.files.delete_many({"project_id": project_id})
    return {"message": "Proyecto eliminado"}

# Files
@api_router.post("/projects/{project_id}/files", response_model=FileResponse)
async def upload_file(project_id: str, file: UploadFile = File(...)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    content = await file.read()
    try:
        text_content = content.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content.decode("latin-1", errors="ignore")

    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "filename": file.filename,
        "file_size": len(content),
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
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("content_text", None)
    return FileResponse(**doc)

@api_router.get("/projects/{project_id}/files", response_model=List[FileResponse])
async def list_files(project_id: str):
    files = await db.files.find(
        {"project_id": project_id},
        {"_id": 0, "content_text": 0}
    ).to_list(500)
    return [FileResponse(**f) for f in files]

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    result = await db.files.delete_one({"id": file_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return {"message": "Archivo eliminado"}

# AI Processing
@api_router.post("/projects/{project_id}/process")
async def process_project_files(project_id: str):
    files = await db.files.find(
        {"project_id": project_id, "status": "pending"},
        {"_id": 0}
    ).to_list(500)

    if not files:
        raise HTTPException(status_code=400, detail="No hay archivos pendientes de procesar")

    results = []
    for f in files:
        try:
            content = f.get("content_text", "")

            # Step 1: Classify
            classification = await classify_file(content)
            update = {
                "status": "processed",
                "category_edge": classification.get("category_edge"),
                "measure_edge": classification.get("measure_edge"),
                "doc_type": classification.get("doc_type"),
                "confidence": classification.get("confidence"),
            }

            # Step 2: Extract data (for technical sheets)
            extraction = await extract_data(content)
            update["watts"] = extraction.get("watts")
            update["lumens"] = extraction.get("lumens")
            update["tipo_equipo"] = extraction.get("tipo_equipo")
            update["marca"] = extraction.get("marca")
            update["modelo"] = extraction.get("modelo")

            # Step 3: Calculate areas (for plans)
            if classification.get("doc_type") == "plano":
                areas = await calculate_areas(content)
                update["areas"] = areas

            await db.files.update_one({"id": f["id"]}, {"$set": update})
            results.append({"file_id": f["id"], "filename": f["filename"], "status": "processed"})
        except Exception as e:
            logger.error(f"Error processing file {f['filename']}: {e}")
            await db.files.update_one({"id": f["id"]}, {"$set": {"status": "error"}})
            results.append({"file_id": f["id"], "filename": f["filename"], "status": "error", "error": str(e)})

    return {"processed": len(results), "results": results}

@api_router.post("/files/{file_id}/process")
async def process_single_file(file_id: str):
    f = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not f:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    content = f.get("content_text", "")
    try:
        classification = await classify_file(content)
        update = {
            "status": "processed",
            "category_edge": classification.get("category_edge"),
            "measure_edge": classification.get("measure_edge"),
            "doc_type": classification.get("doc_type"),
            "confidence": classification.get("confidence"),
        }
        extraction = await extract_data(content)
        update["watts"] = extraction.get("watts")
        update["lumens"] = extraction.get("lumens")
        update["tipo_equipo"] = extraction.get("tipo_equipo")
        update["marca"] = extraction.get("marca")
        update["modelo"] = extraction.get("modelo")

        if classification.get("doc_type") == "plano":
            areas = await calculate_areas(content)
            update["areas"] = areas

        await db.files.update_one({"id": file_id}, {"$set": update})
        return {"file_id": file_id, "status": "processed", **update}
    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}")
        await db.files.update_one({"id": file_id}, {"$set": {"status": "error"}})
        raise HTTPException(status_code=500, detail=str(e))

# Extracted Data
@api_router.get("/projects/{project_id}/extracted-data")
async def get_extracted_data(project_id: str):
    files = await db.files.find(
        {"project_id": project_id, "status": "processed"},
        {"_id": 0, "content_text": 0}
    ).to_list(500)
    return files

# EDGE Status
@api_router.get("/projects/{project_id}/edge-status")
async def get_edge_status(project_id: str):
    files = await db.files.find(
        {"project_id": project_id, "status": "processed"},
        {"_id": 0, "content_text": 0}
    ).to_list(500)

    categories = {}
    measures = {}
    for f in files:
        cat = f.get("category_edge", "UNKNOWN")
        meas = f.get("measure_edge", "UNKNOWN")
        categories[cat] = categories.get(cat, 0) + 1
        measures[meas] = measures.get(meas, 0) + 1

    faltantes = await validate_edge(project_id)

    total = await db.files.count_documents({"project_id": project_id})
    processed = await db.files.count_documents({"project_id": project_id, "status": "processed"})

    return {
        "categories": categories,
        "measures": measures,
        "faltantes": faltantes,
        "total_files": total,
        "processed_files": processed,
    }

# Export
@api_router.get("/projects/{project_id}/export-excel")
async def export_excel(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    files = await db.files.find(
        {"project_id": project_id},
        {"_id": 0, "content_text": 0}
    ).to_list(500)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Datos EDGE"
    headers = ["Archivo", "Categoria EDGE", "Medida", "Tipo Doc", "Confianza", "Watts", "Lumens", "Equipo", "Marca", "Modelo", "Estado"]
    ws.append(headers)

    for f in files:
        ws.append([
            f.get("filename", ""),
            f.get("category_edge", ""),
            f.get("measure_edge", ""),
            f.get("doc_type", ""),
            f.get("confidence", ""),
            f.get("watts", ""),
            f.get("lumens", ""),
            f.get("tipo_equipo", ""),
            f.get("marca", ""),
            f.get("modelo", ""),
            f.get("status", ""),
        ])

    # Areas sheet
    files_with_areas = [f for f in files if f.get("areas")]
    if files_with_areas:
        ws2 = wb.create_sheet("Areas")
        ws2.append(["Archivo", "Espacio", "Area m2"])
        for f in files_with_areas:
            for area in f["areas"]:
                ws2.append([f["filename"], area.get("nombre", ""), area.get("area_m2", "")])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    filename = f"{project['name'].replace(' ', '_')}_EDGE.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
