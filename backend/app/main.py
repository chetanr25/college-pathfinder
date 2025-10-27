from fastapi import FastAPI, Query, Path, HTTPException
from typing import Optional, List, Dict
from app.services import CollegeService
from app.schemas import (
    College, CollegeList, CutoffTrend, 
    CollegeBranches, ErrorResponse
)

app = FastAPI(
    title="KCET College Predictor API",
    description="API for predicting college admission chances based on KCET ranks",
    version="1.0.0"
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"detail": str(exc.detail)}, exc.status_code

@app.get("/colleges/by-rank/{rank}", response_model=CollegeList)
async def get_colleges_by_rank(
    rank: int = Path(..., description="Student's KCET rank"),
    round: int = Query(1, ge=1, le=3, description="Counselling round number")
):
    """Get all colleges accessible for a given rank"""
    colleges = CollegeService.get_colleges_by_rank(rank, round)
    return {"colleges": colleges, "total_count": len(colleges)}

@app.get("/colleges/by-branch/{branch}", response_model=CollegeList)
async def get_colleges_by_branch(
    branch: str = Path(..., description="Branch name"),
    round: int = Query(1, ge=1, le=3, description="Counselling round number")
):
    """Get all colleges offering a specific branch"""
    colleges = CollegeService.get_colleges_by_branch(branch, round)
    return {"colleges": colleges, "total_count": len(colleges)}

@app.get("/colleges/cutoff/{college_code}/{branch}", response_model=CutoffTrend)
async def get_college_cutoff(
    college_code: str = Path(..., description="College code"),
    branch: str = Path(..., description="Branch name")
):
    """Get cutoff ranks for all rounds for a specific college and branch"""
    return CollegeService.get_cutoff_trends(college_code, branch)

@app.get("/colleges/search", response_model=CollegeList)
async def search_colleges(
    min_rank: Optional[int] = Query(None, description="Minimum rank"),
    max_rank: Optional[int] = Query(None, description="Maximum rank"),
    branch: Optional[str] = Query(None, description="Branch name"),
    round: int = Query(1, ge=1, le=3, description="Counselling round number")
):
    """Search colleges with multiple filters"""
    colleges = CollegeService.search_colleges(min_rank, max_rank, branch, round)
    return {"colleges": colleges, "total_count": len(colleges)}

@app.get("/branches/list", response_model=List[str])
async def get_branches():
    """Get list of all available branches"""
    return CollegeService.get_all_branches()

@app.get("/colleges/{college_code}/branches", response_model=CollegeBranches)
async def get_college_branches(
    college_code: str = Path(..., description="College code")
):
    """Get all branches and their cutoff ranks for a specific college"""
    return CollegeService.get_college_branches(college_code)