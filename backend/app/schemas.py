from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class College(BaseModel):
    college_code: str
    college_name: str
    branch_name: Optional[str] = None
    cutoff_rank: Optional[int] = None
    round: Optional[int] = None

class CollegeList(BaseModel):
    colleges: List[College]
    total_count: Optional[int] = None

class CutoffTrend(BaseModel):
    college_name: str
    branch_name: str
    cutoff_trends: Dict[str, int]

class Branch(BaseModel):
    branch_name: str
    cutoff_ranks: Optional[Dict[str, int]] = None

class CollegeBranches(BaseModel):
    college_name: str
    branches: List[Branch]

class ErrorResponse(BaseModel):
    detail: str