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


def search_college_by_name(query: str, limit: int = 10):
    """
    Search for colleges by name using fuzzy matching.
    CRITICAL: Use this when user mentions a college name (e.g., "RV", "PES", "BMS College").
    Returns a list of matching colleges with scores.
    
    If multiple matches found, present them to the user in a clean format and ask them to confirm.
    If only one match with score > 0.8, you can proceed automatically.
    
    Args:
        query: College name or partial name (e.g., "RV", "ramaiah", "BMS")
        limit: Maximum number of results (default: 10)
        
    Returns:
        List of dicts with college_code, college_name, match_score
    """
    results = CollegeService.search_college_by_name(query, limit)
    return results


def match_branch_names(query: str, limit: int = 10):
    """
    Match user's casual branch name to exact database branch names.
    CRITICAL: Use this when user mentions a branch casually (e.g., "CS", "computer", "AI ML").
    
    Handles abbreviations: CS→Computer Science, ECE→Electronics, AI ML→Artificial Intelligence, etc.
    
    Args:
        query: User's branch query (e.g., "CS", "computer science", "AI ML")
        limit: Maximum number of matches (default: 10)
        
    Returns:
        List of dicts with exact branch_name and match_score
    """
    results = CollegeService.match_branch_names(query, limit)
    return results


def analyze_rank_prospects(rank: int, round: int = 1):
    """
    Analyze a student's rank and provide detailed statistics.
    Shows percentile, total options, and categorizes colleges as Best/Good/Moderate/Reach.
    
    Use this to give students an overview of their prospects.
    
    Args:
        rank: Student's KCET rank
        round: Counselling round (default: 1)
        
    Returns:
        Dict with percentile, total_options, and categorized colleges
    """
    analysis = CollegeService.analyze_rank_prospects(rank, round)
    return analysis


def compare_colleges(college_codes: List[str], round: int = 1):
    """
    Compare 2-4 colleges side-by-side.
    Returns structured data optimized for frontend table rendering.
    
    Use when user asks to compare colleges (e.g., "Compare RV and PES").
    
    Args:
        college_codes: List of 2-4 college codes (e.g., ['E001', 'E005'])
        round: Counselling round (default: 1)
        
    Returns:
        Dict with comparison data for all colleges
    """
    comparison = CollegeService.compare_colleges(college_codes, round)
    return comparison


def get_branch_popularity(branch_name: Optional[str] = None, round: int = 1):
    """
    Analyze branch popularity and competitiveness.
    Shows cutoff ranges, number of colleges, and competitiveness rating.
    
    Use when user asks "Which branches are most competitive?" or about a specific branch's popularity.
    
    Args:
        branch_name: Specific branch (None for all branches summary)
        round: Counselling round (default: 1)
        
    Returns:
        Dict with branch statistics and competitiveness
    """
    stats = CollegeService.get_branch_popularity(branch_name, round)
    return stats


# List of tool functions for Gemini
TOOL_FUNCTIONS = [
    get_colleges_by_rank,
    get_all_branches,
    search_colleges,
    get_colleges_by_branch,
    get_cutoff_trends,
    get_college_branches,
    search_college_by_name,
    match_branch_names,
    analyze_rank_prospects,
    compare_colleges,
    get_branch_popularity
]


# Mapping for execution by name
TOOL_EXECUTORS: Dict[str, Callable] = {
    "get_colleges_by_rank": get_colleges_by_rank,
    "get_all_branches": get_all_branches,
    "search_colleges": search_colleges,
    "get_colleges_by_branch": get_colleges_by_branch,
    "get_cutoff_trends": get_cutoff_trends,
    "get_college_branches": get_college_branches,
    "search_college_by_name": search_college_by_name,
    "match_branch_names": match_branch_names,
    "analyze_rank_prospects": analyze_rank_prospects,
    "compare_colleges": compare_colleges,
    "get_branch_popularity": get_branch_popularity,
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
