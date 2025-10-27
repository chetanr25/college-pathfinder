"""
Branch routes for the KCET College Predictor API
"""
from fastapi import APIRouter
from typing import List

from app.services import CollegeService

router = APIRouter(
    prefix="/branches",
    tags=["branches"]
)


@router.get("/list", response_model=List[str])
async def get_branches():
    """Get list of all available branches"""
    return CollegeService.get_all_branches()
