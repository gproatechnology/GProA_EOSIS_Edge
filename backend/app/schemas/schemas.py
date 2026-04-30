from pydantic import BaseModel, ConfigDict
from typing import Optional

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
    specialized_data: Optional[dict] = None
    uploaded_at: str
