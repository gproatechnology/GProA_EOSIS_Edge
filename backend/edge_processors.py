# EDGE Specialized Processors - Measure-specific analysis
# Each processor runs analysis tailored to the EDGE measure detected

import json
import uuid
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)


async def process_eem22_luminaires(content: str, api_key: str) -> dict:
    """EEM22 Specialized: Extract luminaire table and calculate global efficacy."""
    chat = LlmChat(
        api_key=api_key,
        session_id=f"eem22-{uuid.uuid4()}",
        system_message="Eres un ingeniero especialista en iluminacion analizando tablas de luminarias para certificacion EDGE EEM22. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Analiza este documento de iluminacion y extrae TODAS las luminarias encontradas.

Para CADA luminaria extrae:
- id: identificador o numero de la luminaria
- modelo: modelo/referencia
- cantidad: cuantas unidades
- lumens: lumenes por unidad
- watts: watts por unidad
- eficiencia: lumens/watts por unidad (calcula si no esta explicito)
- notas: cualquier nota importante (duplicadas, con ballast, dimerizables, etc.)

Tambien identifica si hay:
- luminarias duplicadas
- luminarias con ballast electronico/magnetico
- luminarias dimerizables
- luminarias de emergencia (excluirlas del calculo principal)

Responde SOLO en JSON:
{{
  "luminarias": [
    {{
      "id": "string",
      "modelo": "string",
      "cantidad": 0,
      "lumens": 0,
      "watts": 0,
      "eficiencia": 0.0,
      "notas": "string o null"
    }}
  ],
  "alertas": ["string"],
  "luminarias_emergencia": 0,
  "total_luminarias": 0
}}

Contenido del archivo:
{content[:4000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = json.loads(cleaned)

        # Calculate global efficacy
        luminarias = data.get("luminarias", [])
        total_lumens_weighted = 0
        total_watts_weighted = 0
        for lum in luminarias:
            qty = lum.get("cantidad", 1) or 1
            lumens = lum.get("lumens", 0) or 0
            watts = lum.get("watts", 0) or 0
            total_lumens_weighted += lumens * qty
            total_watts_weighted += watts * qty
            # Ensure individual efficiency is calculated
            if watts > 0:
                lum["eficiencia"] = round(lumens / watts, 2)

        eficacia_global = round(total_lumens_weighted / total_watts_weighted, 2) if total_watts_weighted > 0 else 0

        data["eficacia_global"] = eficacia_global
        data["total_lumens"] = total_lumens_weighted
        data["total_watts"] = total_watts_weighted
        data["cumple_edge"] = eficacia_global >= 90  # EDGE threshold typically 90 lm/W

        return data
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"EEM22 processor error: {e}")
        return {
            "luminarias": [],
            "alertas": [f"Error procesando: {str(e)}"],
            "eficacia_global": 0,
            "total_lumens": 0,
            "total_watts": 0,
            "cumple_edge": False,
        }


async def process_eem09_hvac(content: str, api_key: str) -> dict:
    """EEM09 Specialized: Extract HVAC equipment data."""
    chat = LlmChat(
        api_key=api_key,
        session_id=f"eem09-{uuid.uuid4()}",
        system_message="Eres un ingeniero mecanico analizando equipos HVAC para certificacion EDGE. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Analiza este documento de equipos HVAC y extrae la informacion de cada equipo.

Para CADA equipo extrae:
- id: identificador
- tipo: tipo de equipo (split, VRF, chiller, etc.)
- marca: fabricante
- modelo: referencia
- capacidad_btu: capacidad en BTU/h
- cop: coeficiente de rendimiento
- eer: ratio de eficiencia energetica
- seer: ratio estacional (si aplica)
- refrigerante: tipo de refrigerante

Responde SOLO en JSON:
{{
  "equipos": [
    {{
      "id": "string",
      "tipo": "string",
      "marca": "string",
      "modelo": "string",
      "capacidad_btu": 0,
      "cop": 0.0,
      "eer": 0.0,
      "seer": 0.0,
      "refrigerante": "string"
    }}
  ],
  "cop_promedio": 0.0,
  "alertas": []
}}

Contenido:
{content[:4000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"EEM09 processor error: {e}")
        return {"equipos": [], "cop_promedio": 0, "alertas": [str(e)]}


async def process_eem16_renewables(content: str, api_key: str) -> dict:
    """EEM16 Specialized: Extract renewable energy data."""
    chat = LlmChat(
        api_key=api_key,
        session_id=f"eem16-{uuid.uuid4()}",
        system_message="Eres un ingeniero de energias renovables analizando sistemas fotovoltaicos. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Analiza este documento de sistema de energia renovable y extrae:

- tipo_sistema: fotovoltaico, eolico, etc.
- capacidad_instalada_kw: capacidad total
- paneles: lista de paneles con marca, modelo, watts_pico, cantidad
- generacion_anual_estimada_kwh: si esta disponible
- area_total_paneles_m2: area total de paneles
- inversor: marca y modelo del inversor

Responde SOLO en JSON:
{{
  "tipo_sistema": "string",
  "capacidad_instalada_kw": 0,
  "paneles": [{{
    "marca": "string",
    "modelo": "string",
    "watts_pico": 0,
    "cantidad": 0,
    "eficiencia": 0.0
  }}],
  "generacion_anual_estimada_kwh": 0,
  "area_total_paneles_m2": 0,
  "inversor": "string",
  "alertas": []
}}

Contenido:
{content[:4000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"EEM16 processor error: {e}")
        return {"tipo_sistema": None, "capacidad_instalada_kw": 0, "paneles": [], "alertas": [str(e)]}


async def process_water_fixtures(content: str, measure: str, api_key: str) -> dict:
    """WEM01/WEM02 Specialized: Extract water fixture data."""
    chat = LlmChat(
        api_key=api_key,
        session_id=f"water-{uuid.uuid4()}",
        system_message="Eres un ingeniero hidraulico analizando griferias y sanitarios para EDGE. Responde SOLO en JSON valido."
    )
    chat.with_model("openai", "gpt-4o")

    prompt = f"""Analiza este documento de aparatos sanitarios/griferias para medida EDGE {measure}.

Extrae para cada aparato:
- tipo: grifo, ducha, inodoro, urinario, etc.
- marca
- modelo
- flujo_lpm: flujo en litros por minuto (griferias) o litros por descarga (sanitarios)
- cantidad

Responde SOLO en JSON:
{{
  "aparatos": [
    {{
      "tipo": "string",
      "marca": "string",
      "modelo": "string",
      "flujo_lpm": 0.0,
      "cantidad": 0
    }}
  ],
  "flujo_promedio": 0.0,
  "alertas": []
}}

Contenido:
{content[:4000]}"""

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    try:
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Water processor error: {e}")
        return {"aparatos": [], "flujo_promedio": 0, "alertas": [str(e)]}


# Dispatcher: routes to the correct processor based on measure
MEASURE_PROCESSORS = {
    "EEM22": process_eem22_luminaires,
    "EEM23": process_eem22_luminaires,  # Same lighting logic
    "EEM09": process_eem09_hvac,
    "EEM16": process_eem16_renewables,
    "WEM01": lambda c, k: process_water_fixtures(c, "WEM01", k),
    "WEM02": lambda c, k: process_water_fixtures(c, "WEM02", k),
}


async def run_specialized_processor(measure: str, content: str, api_key: str) -> dict:
    """Run the specialized processor for a given measure, if available."""
    processor = MEASURE_PROCESSORS.get(measure)
    if processor:
        return await processor(content, api_key)
    return None
