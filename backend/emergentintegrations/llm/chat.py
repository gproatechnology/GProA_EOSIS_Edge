import uuid
import json
import asyncio

class UserMessage:
    def __init__(self, text: str):
        self.text = text

class LlmChat:
    def __init__(self, api_key: str, session_id: str = None, system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id or str(uuid.uuid4())
        self.system_message = system_message
        self.model_provider = None
        self.model_name = None

    def with_model(self, provider: str, name: str):
        self.model_provider = provider
        self.model_name = name
        return self

    async def send_message(self, message: UserMessage) -> str:
        """Mock LLM responses for EDGE classification, extraction, and area calculation."""
        text = message.text.lower()
        
        # Classification prompt
        if "clasifica este archivo" in text or "category_edge" in text:
            return json.dumps({
                "category_edge": "ENERGY",
                "measure_edge": "EEM22",
                "doc_type": "ficha_tecnica",
                "confidence": 0.95
            })
        
        # Data extraction prompt
        if "extrae la siguiente informacion" in text or "watts" in text:
            return json.dumps({
                "watts": 120,
                "lumens": 10800,
                "tipo_equipo": "luminaria LED",
                "marca": "Philips",
                "modelo": "CorePro LEDtube"
            })
        
        # Area calculation prompt
        if "calcula el area" in text or "espacios" in text:
            return json.dumps({
                "espacios": [
                    {"nombre": "Oficina Principal", "area_m2": 45.5},
                    {"nombre": "Sala de Reuniones", "area_m2": 28.0}
                ]
            })
        
        # Default response
        return json.dumps({"response": "mock"})

