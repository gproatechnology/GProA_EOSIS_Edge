from fastapi import APIRouter
from app.api.endpoints import projects, files, processing, rules, analysis, exports

api_router = APIRouter()

api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(files.router, tags=["files"])
api_router.include_router(processing.router, tags=["processing"])
api_router.include_router(rules.router, tags=["rules"])
api_router.include_router(analysis.router, tags=["analysis"])
api_router.include_router(exports.router, tags=["exports"])
