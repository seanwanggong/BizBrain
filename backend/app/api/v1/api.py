from fastapi import APIRouter
from .endpoints import workflows

api_router = APIRouter()

api_router.include_router(
    workflows.router,
    prefix="/workflows",
    tags=["workflows"]
) 