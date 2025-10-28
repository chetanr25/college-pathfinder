"""
Tools registry for AI agent

Defines all available tools (API functions) that the AI can call
"""
from typing import Dict, List, Any, Callable, Optional
from app.services import CollegeService


# Tool execution functions
def get_colleges_by_rank(rank: int, round: int = 1, limit: int = 10) -> Dict[str, Any]:
    """Get colleges where a student with given KCET rank can get admission"""
    try:
        colleges = CollegeService.get_colleges_by_rank(
            rank=rank,
            round=round,
            limit=limit,
            sort_order="asc"
        )
        return {
            "success": True,
            "data": colleges,
            "summary": f"Found {len(colleges)} colleges for rank {rank} in round {round}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error fetching colleges: {str(e)}"
        }


def get_all_branches() -> Dict[str, Any]:
    """Get complete list of all available engineering branches"""
    try:
        branches = CollegeService.get_all_branches()
        return {
            "success": True,
            "data": branches,
            "summary": f"Found {len(branches)} engineering branches"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error fetching branches: {str(e)}"
        }


def search_colleges(
    min_rank: Optional[int] = None,
    max_rank: Optional[int] = None,
    branches: Optional[List[str]] = None,
    round: int = 1,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """Advanced search for colleges with multiple filters"""
    try:
        colleges = CollegeService.search_colleges(
            min_rank=min_rank,
            max_rank=max_rank,
            branches=branches,
            round=round,
            limit=limit,
            sort_order="asc"
        )
        
        # Build summary
        summary_parts = [f"Found {len(colleges)} colleges"]
        if min_rank:
            summary_parts.append(f"for rank {min_rank}+")
        if branches:
            summary_parts.append(f"in {len(branches)} branch(es)")
        summary_parts.append(f"(round {round})")
        
        return {
            "success": True,
            "data": colleges,
            "summary": " ".join(summary_parts)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error searching colleges: {str(e)}"
        }


def get_colleges_by_branch(branch: str, round: int = 1, limit: Optional[int] = None) -> Dict[str, Any]:
    """Get all colleges offering a specific branch"""
    try:
        colleges = CollegeService.get_colleges_by_branch(
            branch=branch,
            round=round,
            limit=limit,
            sort_order="asc"
        )
        return {
            "success": True,
            "data": colleges,
            "summary": f"Found {len(colleges)} colleges offering {branch} in round {round}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error fetching colleges for branch: {str(e)}"
        }


def get_cutoff_trends(college_code: str, branch: str) -> Dict[str, Any]:
    """Get cutoff rank trends across all 3 counselling rounds"""
    try:
        trends = CollegeService.get_cutoff_trends(college_code, branch)
        return {
            "success": True,
            "data": trends,
            "summary": f"Retrieved cutoff trends for {college_code} - {branch}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error fetching cutoff trends: {str(e)}"
        }


def get_college_branches(college_code: str) -> Dict[str, Any]:
    """Get all branches offered by a specific college"""
    try:
        result = CollegeService.get_college_branches(college_code)
        return {
            "success": True,
            "data": result,
            "summary": f"Retrieved {len(result.get('branches', []))} branches for {college_code}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error fetching college branches: {str(e)}"
        }


# List of tool functions for Gemini - using actual Python functions
TOOL_FUNCTIONS = [
    get_colleges_by_rank,
    get_all_branches,
    search_colleges,
    get_colleges_by_branch,
    get_cutoff_trends,
    get_college_branches
]


# Tool definitions for Gemini function calling - Simple dictionary format
TOOL_DEFINITIONS = [
    {
        "name": "get_colleges_by_rank",
        "description": "Find colleges where a student with given KCET rank can get admission. Returns colleges sorted by cutoff rank (best colleges first). IMPORTANT: Always use this function when user provides their rank. This fetches REAL data from the KCET 2024 database with actual college names, branches, and cutoff ranks.",
        "parameters": {
            "type": "object",
            "properties": {
                "rank": {
                    "type": "integer",
                    "description": "Student's KCET rank (must be positive integer)"
                },
                "round": {
                    "type": "integer",
                    "description": "Counselling round number (1, 2, or 3). Default is 1.",
                    "default": 1
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of colleges to return (1-500). Default is 10.",
                    "default": 10
                }
            },
            "required": ["rank"]
        }
    },
    {
        "name": "get_all_branches",
        "description": "Get complete list of all available engineering branches in KCET 2024 data. Use this to discover what branches are available, or show all branch options to the user.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "search_colleges",
        "description": "Advanced search for colleges with multiple filters. Use when user specifies branch preferences or wants to filter by rank range. This queries the REAL KCET database.",
        "parameters": {
            "type": "object",
            "properties": {
                "min_rank": {
                    "type": "integer",
                    "description": "Minimum rank - colleges with cutoff >= this rank will be included"
                },
                "max_rank": {
                    "type": "integer",
                    "description": "Maximum rank - colleges with cutoff <= this rank will be included"
                },
                "branches": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "List of specific branch names to filter"
                },
                "round": {
                    "type": "integer",
                    "description": "Counselling round (1, 2, or 3). Default is 1.",
                    "default": 1
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results (1-500)"
                }
            }
        }
    },
    {
        "name": "get_colleges_by_branch",
        "description": "Get all colleges offering a specific branch, sorted by cutoff rank. Use when user asks about a single specific branch.",
        "parameters": {
            "type": "object",
            "properties": {
                "branch": {
                    "type": "string",
                    "description": "Exact branch name (e.g., 'Computer Science Engineering', 'Mechanical Engineering')"
                },
                "round": {
                    "type": "integer",
                    "description": "Counselling round (1, 2, or 3). Default is 1.",
                    "default": 1
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of colleges to return (1-500)"
                }
            },
            "required": ["branch"]
        }
    },
    {
        "name": "get_cutoff_trends",
        "description": "Get cutoff rank trends across all 3 counselling rounds for a specific college and branch. Use for comparing how cutoffs changed across rounds.",
        "parameters": {
            "type": "object",
            "properties": {
                "college_code": {
                    "type": "string",
                    "description": "College code (e.g., 'E001', 'E002'). This is shown in college data."
                },
                "branch": {
                    "type": "string",
                    "description": "Branch name (e.g., 'Computer Science Engineering')"
                }
            },
            "required": ["college_code", "branch"]
        }
    },
    {
        "name": "get_college_branches",
        "description": "Get all branches offered by a specific college with their cutoff ranks for all rounds. Use when user asks what branches a specific college offers.",
        "parameters": {
            "type": "object",
            "properties": {
                "college_code": {
                    "type": "string",
                    "description": "College code (e.g., 'E001', 'E002'). This is shown in college data."
                }
            },
            "required": ["college_code"]
        }
    }


# Mapping of tool names to functions
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
        # If function returns a dict with 'data' key, it's already formatted
        if isinstance(result, dict) and 'success' in result:
            return result
        # Otherwise wrap it
        return {
            "success": True,
            "data": result,
            "summary": f"Executed {tool_name} successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error executing {tool_name}: {str(e)}"
        }

