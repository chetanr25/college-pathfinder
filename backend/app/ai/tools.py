"""
Tools registry for AI agent

Defines all available tools (API functions) that the AI can call
"""
from typing import Dict, List, Any, Callable, Optional
from app.services import CollegeService


# Tool execution functions - these are the actual callable functions
def get_colleges_by_rank(rank: int, round: int = 1, limit: int = 10):
    """
    Find colleges where a student with given KCET rank can get admission.
    Returns colleges sorted by cutoff rank (best colleges first).
    
    Args:
        rank: Student's KCET rank (must be positive integer)
        round: Counselling round number (1, 2, or 3). Default is 1.
        limit: Maximum number of colleges to return (1-500). Default is 10.
    """
    colleges = CollegeService.get_colleges_by_rank(
        rank=rank,
        round=round,
        limit=limit,
        sort_order="asc"
    )
    return colleges


def get_all_branches():
    """
    Get complete list of all available engineering branches in KCET 2024 data.
    Use this to discover what branches are available.
    """
    branches = CollegeService.get_all_branches()
    return branches


def search_colleges(
    min_rank: Optional[int] = None,
    max_rank: Optional[int] = None,
    branches: Optional[List[str]] = None,
    round: int = 1,
    limit: Optional[int] = None
):
    """
    Advanced search for colleges with multiple filters.
    Use when user specifies branch preferences or wants to filter by rank range.
    
    Args:
        min_rank: Minimum rank - colleges with cutoff >= this rank will be included
        max_rank: Maximum rank - colleges with cutoff <= this rank will be included
        branches: List of specific branch names to filter
        round: Counselling round (1, 2, or 3). Default is 1.
        limit: Maximum number of results (1-500)
    """
    colleges = CollegeService.search_colleges(
        min_rank=min_rank,
        max_rank=max_rank,
        branches=branches,
        round=round,
        limit=limit,
        sort_order="asc"
    )
    return colleges


def get_colleges_by_branch(branch: str, round: int = 1, limit: Optional[int] = None):
    """
    Get all colleges offering a specific branch, sorted by cutoff rank.
    
    Args:
        branch: Exact branch name (e.g., 'Computer Science Engineering')
        round: Counselling round (1, 2, or 3). Default is 1.
        limit: Maximum number of colleges to return (1-500)
    """
    colleges = CollegeService.get_colleges_by_branch(
        branch=branch,
        round=round,
        limit=limit,
        sort_order="asc"
    )
    return colleges


def get_cutoff_trends(college_code: str, branch: str):
    """
    Get cutoff rank trends across all 3 counselling rounds for a specific college and branch.
    
    Args:
        college_code: College code (e.g., 'E001', 'E002')
        branch: Branch name (e.g., 'Computer Science Engineering')
    """
    trends = CollegeService.get_cutoff_trends(college_code, branch)
    return trends


def get_college_branches(college_code: str):
    """
    Get all branches offered by a specific college with their cutoff ranks for all rounds.
    
    Args:
        college_code: College code (e.g., 'E001', 'E002')
    """
    result = CollegeService.get_college_branches(college_code)
    return result


# List of tool functions for Gemini
TOOL_FUNCTIONS = [
    get_colleges_by_rank,
    get_all_branches,
    search_colleges,
    get_colleges_by_branch,
    get_cutoff_trends,
    get_college_branches
]


# Mapping for execution by name
TOOL_EXECUTORS: Dict[str, Callable] = {
    "get_colleges_by_rank": get_colleges_by_rank,
    "get_all_branches": get_all_branches,
    "search_colleges": search_colleges,
    "get_colleges_by_branch": get_colleges_by_branch,
    "get_cutoff_trends": get_cutoff_trends,
    "get_college_branches": get_college_branches,
}


def execute_tool(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a tool by name with given parameters
    
    Args:
        tool_name: Name of the tool to execute
        parameters: Parameters to pass to the tool
        
    Returns:
        Dictionary with success status, data/error, and summary
    """
    executor = TOOL_EXECUTORS.get(tool_name)
    if not executor:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}",
            "summary": f"Tool '{tool_name}' not found"
        }
    
    try:
        result = executor(**parameters)
        return {
            "success": True,
            "data": result,
            "summary": f"Successfully fetched data using {tool_name}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error executing {tool_name}: {str(e)}"
        }
