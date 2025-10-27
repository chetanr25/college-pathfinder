"""
College routes for the KCET College Predictor API
"""
from fastapi import APIRouter, Query, Path
from typing import Optional, List

from app.services import CollegeService
from app.schemas import (
    CollegeList, 
    CutoffTrend, 
    CollegeBranches
)
from app.config import settings

router = APIRouter(
    prefix="/colleges",
    tags=["colleges"]
)


@router.get("/by-rank/{rank}", response_model=CollegeList)
async def get_colleges_by_rank(
    rank: int = Path(..., description="Student's KCET rank", gt=0),
    round: int = Query(
        settings.DEFAULT_ROUND, 
        ge=settings.MIN_ROUND, 
        le=settings.MAX_ROUND, 
        description="Counselling round number"
    )
):
    """Get all colleges accessible for a given rank"""
    colleges = CollegeService.get_colleges_by_rank(rank, round)
    return {"colleges": colleges, "total_count": len(colleges)}


@router.get("/by-branch/{branch}", response_model=CollegeList)
async def get_colleges_by_branch(
    branch: str = Path(..., description="Branch name"),
    round: int = Query(
        settings.DEFAULT_ROUND, 
        ge=settings.MIN_ROUND, 
        le=settings.MAX_ROUND, 
        description="Counselling round number"
    )
):
    """Get all colleges offering a specific branch"""
    colleges = CollegeService.get_colleges_by_branch(branch, round)
    return {"colleges": colleges, "total_count": len(colleges)}


@router.get("/cutoff/{college_code}/{branch}", response_model=CutoffTrend)
async def get_college_cutoff(
    college_code: str = Path(..., description="College code"),
    branch: str = Path(..., description="Branch name")
):
    """Get cutoff ranks for all rounds for a specific college and branch"""
    return CollegeService.get_cutoff_trends(college_code, branch)


@router.get("/search", response_model=CollegeList)
async def search_colleges(
    min_rank: Optional[int] = Query(None, description="Minimum rank", gt=0),
    max_rank: Optional[int] = Query(None, description="Maximum rank", gt=0),
    branch: Optional[str] = Query(None, description="Branch name"),
    round: int = Query(
        settings.DEFAULT_ROUND, 
        ge=settings.MIN_ROUND, 
        le=settings.MAX_ROUND, 
        description="Counselling round number"
    )
):
    """Search colleges with multiple filters"""
    colleges = CollegeService.search_colleges(min_rank, max_rank, branch, round)
    return {"colleges": colleges, "total_count": len(colleges)}


@router.get("/{college_code}/branches", response_model=CollegeBranches)
async def get_college_branches(
    college_code: str = Path(..., description="College code")
):
    """Get all branches and their cutoff ranks for a specific college"""
    return CollegeService.get_college_branches(college_code)
