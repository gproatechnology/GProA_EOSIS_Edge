import json
import logging
from app.core.config import openai_client, OPENAI_API_KEY
from app.services.edge_rules import EDGE_WBS
from app.services.edge_processors import run_specialized_processor
from app.db.database import udb

logger = logging.getLogger(__name__)

# In-memory job tracker for batch progress
processing_jobs = {}

# ── MOCK AI FUNCTIONS (Demo Mode) ───────────────────────────────────────

def classify_file_mock(content: str) -> dict:
    """Return deterministic mock classification based on filename/content patterns."""
    content_lower = content.lower()
    if "lumin" in content_lower or "led" in content_lower or "lm" in content_lower:
        return {"category_edge": "ENERGY", "measure_edge": "EEM22", "doc_type": "ficha_tecnica", "confidence": 0.95}
    elif "hvac" in content_lower or "aire" in content_lower or " split " in content_lower or "vrf" in content_lower:
        return {"category_edge": "ENERGY", "measure_edge": "EEM09", "doc_type": "ficha_tecnica", "confidence": 0.92}
    elif "plano" in content_lower or "floor" in content_lower or "architectural" in content_lower:
        return {"category_edge": "DESIGN", "measure_edge": "DESIGN", "doc_type": "plano", "confidence": 0.88}
    elif "griferia" in content_lower or "ducha" in content_lower or "inodoro" in content_lower or "sanitario" in content_lower:
        return {"category_edge": "WATER", "measure_edge": "WEM01", "doc_type": "ficha_tecnica", "confidence": 0.90}
    else:
        return {"category_edge": "MATERIALS", "measure_edge": "MRU01", "doc_type": "otro", "confidence": 0.75}

def extract_data_mock(content: str) -> dict:
    """Extract mock technical data from content."""
    content_lower = content.lower()
    watts = None
    lumens = None
    tipo_equipo = None
    marca = None
    modelo = None

    import re
    watt_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:w|watts?|watt)', content_lower)
    if watt_match:
        watts = float(watt_match.group(1))

    lumen_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lm|lumens?|lumen)', content_lower)
    if lumen_match:
        lumens = float(lumen_match.group(1))

    if "luminaria" in content_lower or "lampara" in content_lower or "led" in content_lower:
        tipo_equipo = "luminaria LED"
    elif "aire" in content_lower or "acondicionado" in content_lower or "split" in content_lower:
        tipo_equipo = "aire acondicionado"
    elif "grifo" in content_lower or "ducha" in content_lower:
        tipo_equipo = "griferia/ducha"

    for brand in ["philips", "osram", "ge", "toshiba", "daikin", "carrier", "劲力"]:
        if brand in content_lower:
            marca = brand.capitalize()
            break

    return {
        "watts": watts,
        "lumens": lumens,
        "tipo_equipo": tipo_equipo,
        "marca": marca,
        "modelo": modelo
    }

def calculate_areas_mock(content: str) -> list:
    """Return mock area calculations for floor plans."""
    return [
        {"nombre": "Oficina A", "area_m2": 45.5},
        {"nombre": "Sala de Reuniones", "area_m2": 22.0},
        {"nombre": "Pasillo", "area_m2": 12.3},
        {"nombre": "Baño", "area_m2": 6.5},
        {"nombre": "Cocina", "area_m2": 10.0},
    ]

# ── AI Processing Functions ─────────────────────────────────────────────

async def classify_file(content: str) -> dict:
    """Classify file using OpenAI GPT-4o or mock."""
    if not openai_client:
        return classify_file_mock(content)

    measures_list = ", ".join(EDGE_WBS.keys())
    prompt = f"""Clasifica este archivo tecnico de construccion.

Clasifica en:
1. Categoria EDGE (elige solo una): DESIGN, ENERGY, WATER, MATERIALS
2. Medida EDGE especifica (elige la mas probable de esta lista):
   {measures_list}
3. Tipo de documento: plano, ficha_tecnica, fotografia, memoria, factura, otro
4. Nivel de confianza (0 a 1)

Responde SOLO en JSON:
{{"category_edge": "...", "measure_edge": "...", "doc_type": "...", "confidence": 0.0}}

Contenido del archivo:
{content[:3000]}"""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un consultor experto en certificacion EDGE. Responde SOLO en JSON valido. No expliques nada."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        result_text = response.choices[0].message.content.strip()

        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        return json.loads(result_text)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse classification response: {e}")
        return classify_file_mock(content)


async def extract_data(content: str) -> dict:
    """Extract technical data using OpenAI GPT-4o or mock."""
    if not openai_client:
        return extract_data_mock(content)

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

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un ingeniero analizando fichas tecnicas de equipos. Responde SOLO en JSON valido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        result_text = response.choices[0].message.content.strip()

        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        return json.loads(result_text)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse extraction response: {e}")
        return extract_data_mock(content)


async def calculate_areas(content: str) -> list:
    """Calculate areas from floor plan text using OpenAI GPT-4o or mock."""
    if not openai_client:
        return calculate_areas_mock(content)

    prompt = f"""A partir del siguiente texto extraido de un plano (OCR), identifica espacios y sus dimensiones.
Calcula el area de cada espacio en m2.

Si hay largo y ancho, multiplica. Si no hay datos suficientes, ignora ese espacio.

Responde SOLO en JSON:
{{"espacios": [{{"nombre": "string", "area_m2": 0}}]}}

Texto del plano:
{content[:3000]}"""

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un arquitecto experto en interpretacion de planos. Responde SOLO en JSON valido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        result_text = response.choices[0].message.content.strip()

        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        data = json.loads(result_text)
        return data.get("espacios", [])
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse areas response: {e}")
        return calculate_areas_mock(content)


async def process_single_file_pipeline(file_doc: dict, job_id: str = None) -> dict:
    """Full processing pipeline for a single file."""
    content = file_doc.get("content_text", "")
    file_id = file_doc["id"]
    update = {}

    try:
        classification = await classify_file(content)
        update = {
            "category_edge": classification.get("category_edge"),
            "measure_edge": classification.get("measure_edge"),
            "doc_type": classification.get("doc_type"),
            "confidence": classification.get("confidence"),
        }

        measure = classification.get("measure_edge", "")

        extraction = await extract_data(content)
        update["watts"] = extraction.get("watts")
        update["lumens"] = extraction.get("lumens")
        update["tipo_equipo"] = extraction.get("tipo_equipo")
        update["marca"] = extraction.get("marca")
        update["modelo"] = extraction.get("modelo")

        api_key = OPENAI_API_KEY if openai_client else None
        specialized = await run_specialized_processor(measure, content, api_key)
        if specialized:
            update["specialized_data"] = specialized

        if classification.get("doc_type") == "plano":
            areas = await calculate_areas(content)
            update["areas"] = areas

        update["status"] = "processed"
        await udb.files_update_one({"id": file_id}, {"$set": update})
        return {"file_id": file_id, "filename": file_doc["filename"], "status": "processed", "measure": measure}

    except Exception as e:
        logger.error(f"Error processing file {file_doc['filename']}: {e}")
        await udb.files_update_one({"id": file_id}, {"$set": {"status": "error"}})
        return {"file_id": file_id, "filename": file_doc["filename"], "status": "error", "error": str(e)}
