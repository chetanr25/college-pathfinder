"""
Business logic services for college and branch operations
"""
from typing import List, Optional, Dict

from app.database import execute_query
from app.exceptions import NoDataFoundError, CollegeNotFoundError


class CollegeService:
    """Service class for college-related operations"""
    
    @staticmethod
    def get_colleges_by_rank(rank: int, round: int = 1) -> List[Dict]:
        """
        Get all colleges accessible for a given rank
        
        Args:
            rank: Student's KCET rank
            round: Counselling round number (1, 2, or 3)
            
        Returns:
            List of dictionaries containing college information
            
        Raises:
            NoDataFoundError: If no colleges found for the given rank
        """
        query = """
        SELECT college_code, college_name, branch_name, 
               CASE 
                   WHEN ? = 1 THEN GM_rank_r1
                   WHEN ? = 2 THEN GM_rank_r2
                   WHEN ? = 3 THEN GM_rank_r3
               END as cutoff_rank
        FROM kcet_2024
        WHERE CASE 
                WHEN ? = 1 THEN GM_rank_r1 >= ?
                WHEN ? = 2 THEN GM_rank_r2 >= ?
                WHEN ? = 3 THEN GM_rank_r3 >= ?
              END
        ORDER BY cutoff_rank DESC
        """
        params = (round, round, round, round, rank, round, rank, round, rank)
        results = execute_query(query, params)
        if not results:
            raise NoDataFoundError("No colleges found for given rank")
        return results

    @staticmethod
    def get_colleges_by_branch(branch: str, round: int = 1) -> List[Dict]:
        """
        Get all colleges offering a specific branch
        
        Args:
            branch: Branch name
            round: Counselling round number (1, 2, or 3)
            
        Returns:
            List of dictionaries containing college information
            
        Raises:
            NoDataFoundError: If no colleges found for the given branch
        """
        query = """
        SELECT college_code, college_name,
               CASE 
                   WHEN ? = 1 THEN GM_rank_r1
                   WHEN ? = 2 THEN GM_rank_r2
                   WHEN ? = 3 THEN GM_rank_r3
               END as cutoff_rank
        FROM kcet_2024
        WHERE LOWER(branch_name) = LOWER(?)
        ORDER BY cutoff_rank DESC
        """
        params = (round, round, round, branch)
        results = execute_query(query, params)
        if not results:
            raise NoDataFoundError("No colleges found for given branch")
        return results

    @staticmethod
    def get_cutoff_trends(college_code: str, branch: str) -> Dict:
        """
        Get cutoff trends for all rounds for a specific college and branch
        
        Args:
            college_code: College code
            branch: Branch name
            
        Returns:
            Dictionary containing college name, branch name, and cutoff trends
            
        Raises:
            NoDataFoundError: If no data found for the given college and branch
        """
        query = """
        SELECT college_name, branch_name, GM_rank_r1, GM_rank_r2, GM_rank_r3
        FROM kcet_2024
        WHERE college_code = ? AND LOWER(branch_name) = LOWER(?)
        """
        results = execute_query(query, (college_code, branch))
        if not results:
            raise NoDataFoundError("No data found for given college and branch")
        
        result = results[0]
        return {
            "college_name": result["college_name"],
            "branch_name": result["branch_name"],
            "cutoff_trends": {
                "round1": result["GM_rank_r1"],
                "round2": result["GM_rank_r2"],
                "round3": result["GM_rank_r3"]
            }
        }

    @staticmethod
    def search_colleges(
        min_rank: Optional[int] = None,
        max_rank: Optional[int] = None,
        branch: Optional[str] = None,
        round: int = 1
    ) -> List[Dict]:
        """
        Search colleges with multiple filters
        
        Args:
            min_rank: Minimum rank filter (optional)
            max_rank: Maximum rank filter (optional)
            branch: Branch name filter (optional)
            round: Counselling round number (1, 2, or 3)
            
        Returns:
            List of dictionaries containing college information
        """
        conditions = []
        params = []
        
        query = """
        SELECT college_code, college_name, branch_name,
               CASE 
                   WHEN ? = 1 THEN GM_rank_r1
                   WHEN ? = 2 THEN GM_rank_r2
                   WHEN ? = 3 THEN GM_rank_r3
               END as cutoff_rank
        FROM kcet_2024
        WHERE 1=1
        """
        params.extend([round, round, round])

        if min_rank is not None:
            conditions.append(
                f"""AND CASE 
                    WHEN ? = 1 THEN GM_rank_r1 >= ?
                    WHEN ? = 2 THEN GM_rank_r2 >= ?
                    WHEN ? = 3 THEN GM_rank_r3 >= ?
                END"""
            )
            params.extend([round, min_rank, round, min_rank, round, min_rank])

        if max_rank is not None:
            conditions.append(
                f"""AND CASE 
                    WHEN ? = 1 THEN GM_rank_r1 <= ?
                    WHEN ? = 2 THEN GM_rank_r2 <= ?
                    WHEN ? = 3 THEN GM_rank_r3 <= ?
                END"""
            )
            params.extend([round, max_rank, round, max_rank, round, max_rank])

        if branch:
            conditions.append("AND LOWER(branch_name) = LOWER(?)")
            params.append(branch)

        query += " " + " ".join(conditions) + " ORDER BY cutoff_rank DESC"
        
        results = execute_query(query, tuple(params))
        return results  # Return empty list if no results found

    @staticmethod
    def get_all_branches() -> List[str]:
        """
        Get list of all available branches
        
        Returns:
            List of branch names
        """
        query = "SELECT DISTINCT branch_name FROM kcet_2024 ORDER BY branch_name"
        results = execute_query(query)
        return [result["branch_name"] for result in results] if results else []

    @staticmethod
    def get_college_branches(college_code: str) -> Dict:
        """
        Get all branches and their cutoff ranks for a specific college
        
        Args:
            college_code: College code
            
        Returns:
            Dictionary containing college name and list of branches with cutoff ranks
            
        Raises:
            CollegeNotFoundError: If college not found
        """
        query = """
        SELECT college_name, branch_name, GM_rank_r1, GM_rank_r2, GM_rank_r3
        FROM kcet_2024
        WHERE college_code = ?
        """
        results = execute_query(query, (college_code,))
        if not results:
            raise CollegeNotFoundError("College not found")
        
        college_name = results[0]["college_name"]
        branches = []
        for row in results:
            branches.append({
                "branch_name": row["branch_name"],
                "cutoff_ranks": {
                    "round1": row["GM_rank_r1"],
                    "round2": row["GM_rank_r2"],
                    "round3": row["GM_rank_r3"]
                }
            })
        
        return {
            "college_name": college_name,
            "branches": branches
        }