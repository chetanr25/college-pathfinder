"""
Tools registry for AI agent

Defines all available tools (API functions) that the AI can call
"""
from typing import Dict, List, Any, Callable
from app.services import CollegeService


# Tool execution functions
def execute_get_colleges_by_rank(rank: int, round: int = 1, limit: int = 10) -> Dict[str, Any]:
    """Execute get_colleges_by_rank tool"""
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


def execute_get_all_branches() -> Dict[str, Any]:
    """Execute get_all_branches tool"""
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


def execute_search_colleges(
    min_rank: int = None,
    max_rank: int = None,
    branches: List[str] = None,
    round: int = 1,
    limit: int = None
) -> Dict[str, Any]:
    """Execute search_colleges tool"""
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


def execute_get_colleges_by_branch(branch: str, round: int = 1, limit: int = None) -> Dict[str, Any]:
    """Execute get_colleges_by_branch tool"""
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


def execute_get_cutoff_trends(college_code: str, branch: str) -> Dict[str, Any]:
    """Execute get_cutoff_trends tool"""
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


def execute_get_college_branches(college_code: str) -> Dict[str, Any]:
    """Execute get_college_branches tool"""
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


# Tool definitions for Gemini function calling
# Using genai.protos for proper schema definition
get_colleges_by_rank_func = genai.protos.FunctionDeclaration(
    name="get_colleges_by_rank",
    description="Find colleges where a student with given KCET rank can get admission. Returns colleges sorted by cutoff rank (best colleges first). Use this when user provides their rank and wants to know which colleges they can get into.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "rank": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Student's KCET rank (must be positive integer)"
            ),
            "round": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Counselling round number (1, 2, or 3). Default is 1."
            ),
            "limit": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Maximum number of colleges to return (1-500). Default is 10."
            )
        },
        required=["rank"]
    )
)

get_all_branches_func = genai.protos.FunctionDeclaration(
    name="get_all_branches",
    description="Get complete list of all available engineering branches in KCET 2024 data. Use this to discover what branches are available, filter branches based on user preferences (e.g., 'computer-related', 'core engineering'), or show all branch options to the user.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={}
    )
)

search_colleges_func = genai.protos.FunctionDeclaration(
    name="search_colleges",
    description="Advanced search for colleges with multiple filters. Use this when user specifies branch preferences (e.g., wants only Computer Science and AI branches), wants to filter by rank range, or wants specific branches from their rank. More flexible than get_colleges_by_rank as it supports multiple branch filtering.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "min_rank": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Minimum rank - colleges with cutoff >= this rank will be included"
            ),
            "max_rank": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Maximum rank - colleges with cutoff <= this rank will be included"
            ),
            "branches": genai.protos.Schema(
                type=genai.protos.Type.ARRAY,
                items=genai.protos.Schema(type=genai.protos.Type.STRING),
                description="List of specific branch names to filter (e.g., ['Computer Science Engineering', 'Artificial Intelligence'])"
            ),
            "round": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Counselling round (1, 2, or 3). Default is 1."
            ),
            "limit": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Maximum number of results (1-500)"
            )
        }
    )
)

get_colleges_by_branch_func = genai.protos.FunctionDeclaration(
    name="get_colleges_by_branch",
    description="Get all colleges offering a specific branch, sorted by cutoff rank. Use when user asks about a single specific branch (e.g., 'Which colleges offer Mechanical Engineering?')",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "branch": genai.protos.Schema(
                type=genai.protos.Type.STRING,
                description="Exact branch name (e.g., 'Computer Science Engineering', 'Mechanical Engineering')"
            ),
            "round": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Counselling round (1, 2, or 3). Default is 1."
            ),
            "limit": genai.protos.Schema(
                type=genai.protos.Type.INTEGER,
                description="Maximum number of colleges to return (1-500)"
            )
        },
        required=["branch"]
    )
)

get_cutoff_trends_func = genai.protos.FunctionDeclaration(
    name="get_cutoff_trends",
    description="Get cutoff rank trends across all 3 counselling rounds for a specific college and branch. Use for comparing how cutoffs changed across rounds, trend analysis, and understanding if cutoffs are increasing or decreasing.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "college_code": genai.protos.Schema(
                type=genai.protos.Type.STRING,
                description="College code (e.g., 'E001', 'E002'). This is shown in college data."
            ),
            "branch": genai.protos.Schema(
                type=genai.protos.Type.STRING,
                description="Branch name (e.g., 'Computer Science Engineering')"
            )
        },
        required=["college_code", "branch"]
    )
)

get_college_branches_func = genai.protos.FunctionDeclaration(
    name="get_college_branches",
    description="Get all branches offered by a specific college with their cutoff ranks for all rounds. Use when user asks what branches a specific college offers or wants to see all options in a particular college.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "college_code": genai.protos.Schema(
                type=genai.protos.Type.STRING,
                description="College code (e.g., 'E001', 'E002'). This is shown in college data."
            )
        },
        required=["college_code"]
    )
)

# Combine all functions into a tool
TOOL_DEFINITIONS = genai.protos.Tool(
    function_declarations=[
        get_colleges_by_rank_func,
        get_all_branches_func,
        search_colleges_func,
        get_colleges_by_branch_func,
        get_cutoff_trends_func,
        get_college_branches_func
    ]
)


# Mapping of tool names to execution functions
TOOL_EXECUTORS: Dict[str, Callable] = {
    "get_colleges_by_rank": execute_get_colleges_by_rank,
    "get_all_branches": execute_get_all_branches,
    "search_colleges": execute_search_colleges,
    "get_colleges_by_branch": execute_get_colleges_by_branch,
    "get_cutoff_trends": execute_get_cutoff_trends,
    "get_college_branches": execute_get_college_branches,
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
        return executor(**parameters)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": f"Error executing {tool_name}: {str(e)}"
        }
