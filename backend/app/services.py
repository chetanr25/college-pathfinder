from typing import List, Optional, Dict
from app.database import execute_query
from fastapi import HTTPException

class CollegeService:
    @staticmethod
    def get_colleges_by_rank(rank: int, round: int = 1) -> List[Dict]:
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
            raise HTTPException(status_code=404, detail="No colleges found for given rank")
        return results

    @staticmethod
    def get_colleges_by_branch(branch: str, round: int = 1) -> List[Dict]:
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
            raise HTTPException(status_code=404, detail="No colleges found for given branch")
        return results

    @staticmethod
    def get_cutoff_trends(college_code: str, branch: str) -> Dict:
        query = """
        SELECT college_name, branch_name, GM_rank_r1, GM_rank_r2, GM_rank_r3
        FROM kcet_2024
        WHERE college_code = ? AND LOWER(branch_name) = LOWER(?)
        """
        results = execute_query(query, (college_code, branch))
        if not results:
            raise HTTPException(
                status_code=404,
                detail="No data found for given college and branch"
            )
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
        if not results:
            raise HTTPException(status_code=404, detail="No colleges found matching criteria")
        return results

    @staticmethod
    def get_all_branches() -> List[str]:
        query = "SELECT DISTINCT branch_name FROM kcet_2024 ORDER BY branch_name"
        results = execute_query(query)
        if not results:
            raise HTTPException(status_code=404, detail="No branches found")
        return [result["branch_name"] for result in results]

    @staticmethod
    def get_college_branches(college_code: str) -> Dict:
        query = """
        SELECT college_name, branch_name, GM_rank_r1, GM_rank_r2, GM_rank_r3
        FROM kcet_2024
        WHERE college_code = ?
        """
        results = execute_query(query, (college_code,))
        if not results:
            raise HTTPException(status_code=404, detail="College not found")
        
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