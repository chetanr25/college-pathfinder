"""
Business logic services for college and branch operations
"""
from typing import List, Optional, Dict
from builtins import round as builtin_round

from app.database import execute_query
from app.exceptions import NoDataFoundError, CollegeNotFoundError


class CollegeService:
    """Service class for college-related operations"""
    
    @staticmethod
    def get_colleges_by_rank(
        rank: int, 
        round: int = 1, 
        limit: Optional[int] = 10,
        sort_order: str = "asc"
    ) -> List[Dict]:
        """
        Get all colleges accessible for a given rank
        
        Args:
            rank: Student's KCET rank
            round: Counselling round number (1, 2, or 3)
            limit: Maximum number of colleges to return (default: 10, None for all)
            sort_order: Sort order - 'asc' for best colleges first, 'desc' for worst first
            
        Returns:
            List of dictionaries containing college information sorted by cutoff rank
            
        Raises:
            NoDataFoundError: If no colleges found for the given rank
        """
        # Determine sort direction (asc = lower rank numbers = better colleges)
        order = "ASC" if sort_order.lower() == "asc" else "DESC"
        
        query = f"""
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
        ORDER BY cutoff_rank {order}
        """
        
        if limit is not None:
            query += f" LIMIT {limit}"
        
        params = (round, round, round, round, rank, round, rank, round, rank)
        results = execute_query(query, params)
        if not results:
            raise NoDataFoundError("No colleges found for given rank")
        return results

    @staticmethod
    def get_colleges_by_branch(
        branch: str, 
        round: int = 1,
        limit: Optional[int] = None,
        sort_order: str = "asc"
    ) -> List[Dict]:
        """
        Get all colleges offering a specific branch
        
        Args:
            branch: Branch name
            round: Counselling round number (1, 2, or 3)
            limit: Maximum number of colleges to return (None for all)
            sort_order: Sort order - 'asc' for best colleges first, 'desc' for worst first
            
        Returns:
            List of dictionaries containing college information sorted by cutoff rank
            
        Raises:
            NoDataFoundError: If no colleges found for the given branch
        """
        # Determine sort direction (asc = lower rank numbers = better colleges)
        order = "ASC" if sort_order.lower() == "asc" else "DESC"
        
        query = f"""
        SELECT college_code, college_name, branch_name,
               CASE 
                   WHEN ? = 1 THEN GM_rank_r1
                   WHEN ? = 2 THEN GM_rank_r2
                   WHEN ? = 3 THEN GM_rank_r3
               END as cutoff_rank
        FROM kcet_2024
        WHERE LOWER(branch_name) = LOWER(?)
        ORDER BY cutoff_rank {order}
        """
        
        if limit is not None:
            query += f" LIMIT {limit}"
        
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
                "round1": result["GM_rank_r1"] if result["GM_rank_r1"] is not None else 0,
                "round2": result["GM_rank_r2"] if result["GM_rank_r2"] is not None else 0,
                "round3": result["GM_rank_r3"] if result["GM_rank_r3"] is not None else 0
            }
        }

    @staticmethod
    def search_colleges(
        min_rank: Optional[int] = None,
        max_rank: Optional[int] = None,
        branches: Optional[List[str]] = None,
        round: int = 1,
        limit: Optional[int] = None,
        sort_order: str = "asc"
    ) -> List[Dict]:
        """
        Search colleges with multiple filters
        
        Args:
            min_rank: Minimum rank filter (optional)
            max_rank: Maximum rank filter (optional)
            branches: List of branch names to filter (optional, shows all if None)
            round: Counselling round number (1, 2, or 3)
            limit: Maximum number of colleges to return (None for all)
            sort_order: Sort order - 'asc' for best colleges first, 'desc' for worst first
            
        Returns:
            List of dictionaries containing college information sorted by cutoff rank
        """
        # Determine sort direction
        order = "ASC" if sort_order.lower() == "asc" else "DESC"
        
        conditions = []
        params = []
        
        query = f"""
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

        if branches and len(branches) > 0:
            # Create placeholders for IN clause
            placeholders = ",".join(["?" for _ in branches])
            conditions.append(f"AND LOWER(branch_name) IN ({placeholders})")
            params.extend([branch.lower() for branch in branches])

        query += " " + " ".join(conditions) + f" ORDER BY cutoff_rank {order}"
        
        if limit is not None:
            query += f" LIMIT {limit}"
        
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
                    "round1": row["GM_rank_r1"] if row["GM_rank_r1"] is not None else 0,
                    "round2": row["GM_rank_r2"] if row["GM_rank_r2"] is not None else 0,
                    "round3": row["GM_rank_r3"] if row["GM_rank_r3"] is not None else 0
                }
            })
        
        return {
            "college_name": college_name,
            "branches": branches
        }
    
    @staticmethod
    def search_college_by_name(query: str, limit: int = 10) -> List[Dict]:
        """
        Search for colleges by name using fuzzy matching
        
        Args:
            query: Search query (partial college name)
            limit: Maximum number of results to return
            
        Returns:
            List of dictionaries with college_code, college_name, and match_score
        """
        from difflib import SequenceMatcher
        
        # Get all unique colleges
        sql_query = """
        SELECT DISTINCT college_code, college_name
        FROM kcet_2024
        ORDER BY college_code
        """
        all_colleges = execute_query(sql_query, ())
        
        # Fuzzy match against query
        query_lower = query.lower().strip()
        matches = []
        
        for college in all_colleges:
            college_name = college["college_name"]
            college_name_lower = college_name.lower()
            
            # Calculate match score using different methods
            # 1. Exact substring match (highest priority)
            if query_lower in college_name_lower:
                score = 0.9 + (len(query_lower) / len(college_name_lower)) * 0.1
            # 2. Sequence matching
            else:
                score = SequenceMatcher(None, query_lower, college_name_lower).ratio()
            
            # Also check for common abbreviations
            clean_name = college_name_lower.replace(".", "").replace(",", "")
            words = clean_name.split()
            
            # Check if query matches initials (e.g., "RV" for "R V College")
            if len(query_lower) <= 5:
                skip_words = ("of", "the", "and", "institute", "college", "university", "engineering", "bangalore", "mysore", "mangalore", "belgaum", "hubli", "dharwad")
                initials = "".join([w[0] for w in words if w and w not in skip_words])
                query_clean = query_lower.replace(" ", "")
                # Check if initials start with query or query matches initials exactly
                if initials.lower().startswith(query_clean) or query_clean == initials.lower():
                    score = max(score, 0.95)
            
            if score > 0.3:  # Minimum threshold
                matches.append({
                    "college_code": college["college_code"],
                    "college_name": college_name,
                    "match_score": round(score, 3)
                })
        
        # Sort by score (descending) and return top results
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:limit]
    
    @staticmethod
    def match_branch_names(query: str, limit: int = 10) -> List[Dict]:
        """
        Match user's branch query to actual branch names using fuzzy matching
        
        Args:
            query: User's branch query (e.g., "CS", "computer", "AI ML")
            limit: Maximum number of matches to return
            
        Returns:
            List of dictionaries with branch_name and match_score
        """
        from difflib import SequenceMatcher
        
        # Common abbreviations mapping
        abbreviations = {
            "cs": ["computer science", "computers"],
            "cse": ["computer science engineering"],
            "is": ["information science"],
            "ise": ["information science engineering"],
            "ece": ["electronics and communication", "electronics"],
            "ec": ["electronics", "electronics and communication"],
            "eee": ["electrical and electronics", "electrical"],
            "ee": ["electrical"],
            "me": ["mechanical"],
            "mech": ["mechanical"],
            "ce": ["civil"],
            "civil": ["civil"],
            "aiml": ["artificial intelligence", "machine learning", "ai", "ml"],
            "ai": ["artificial intelligence"],
            "ml": ["machine learning"],
            "ds": ["data science"],
            "biotech": ["bio technology", "biotechnology"],
            "chem": ["chemical"],
            "auto": ["automobile", "automotive"],
            "aero": ["aeronautical", "aerospace"]
        }
        
        # Get all unique branches
        sql_query = """
        SELECT DISTINCT branch_name
        FROM kcet_2024
        ORDER BY branch_name
        """
        all_branches = execute_query(sql_query, ())
        
        query_lower = query.lower().strip()
        matches = []
        
        # Check if query is an abbreviation
        expanded_queries = [query_lower]
        for abbr, expansions in abbreviations.items():
            if abbr in query_lower or query_lower in abbr:
                expanded_queries.extend(expansions)
        
        for branch in all_branches:
            branch_name = branch["branch_name"]
            branch_lower = branch_name.lower()
            
            max_score = 0
            
            # Check against all query variations
            for q in expanded_queries:
                # Exact substring match
                if q in branch_lower:
                    score = 0.8 + (len(q) / len(branch_lower)) * 0.2
                    max_score = max(max_score, score)
                
                # Sequence matching
                score = SequenceMatcher(None, q, branch_lower).ratio()
                max_score = max(max_score, score)
                
                # Word-level matching
                q_words = set(q.split())
                branch_words = set(branch_lower.split())
                if q_words and branch_words:
                    word_overlap = len(q_words & branch_words) / len(q_words)
                    max_score = max(max_score, word_overlap * 0.9)
            
            if max_score > 0.4:  # Minimum threshold
                matches.append({
                    "branch_name": branch_name,
                    "match_score": round(max_score, 3)
                })
        
        # Sort by score and return top results
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:limit]
    
    @staticmethod
    def analyze_rank_prospects(rank: int, round: int = 1) -> Dict:
        """
        Analyze a student's rank and provide statistics about their prospects
        
        Args:
            rank: Student's KCET rank
            round: Counselling round number
            
        Returns:
            Dictionary with statistics and categorized colleges
        """
        # Get all accessible colleges for this rank
        query = f"""
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
        ORDER BY cutoff_rank ASC
        """
        results = execute_query(query, (round, round, round, round, rank, round, rank, round, rank))
        
        if not results:
            return {
                "rank": rank,
                "total_options": 0,
                "message": "No colleges found for this rank. The rank may be too low for available options."
            }
        
        total_options = len(results)
        
        # Calculate percentile (rough estimate - assumes max rank of 200000)
        max_rank = 200000
        percentile = builtin_round(((max_rank - rank) / max_rank) * 100, 1)
        
        # Categorize colleges
        # Best: cutoff <= rank + 2000 (very safe)
        # Good: cutoff <= rank + 5000 (safe)
        # Moderate: cutoff <= rank + 10000 (decent chance)
        # Reach: everything else
        
        best_colleges = []
        good_colleges = []
        moderate_colleges = []
        reach_colleges = []
        
        for college in results:
            cutoff = college["cutoff_rank"]
            margin = cutoff - rank
            
            entry = {
                "college_code": college["college_code"],
                "college_name": college["college_name"],
                "branch": college["branch_name"],
                "cutoff_rank": cutoff,
                "margin": margin
            }
            
            if margin <= 2000:
                best_colleges.append(entry)
            elif margin <= 5000:
                good_colleges.append(entry)
            elif margin <= 10000:
                moderate_colleges.append(entry)
            else:
                reach_colleges.append(entry)
        
        return {
            "rank": rank,
            "round": round,
            "percentile": f"Top {percentile}%",
            "total_options": total_options,
            "summary": {
                "best_options": len(best_colleges),
                "good_options": len(good_colleges),
                "moderate_options": len(moderate_colleges),
                "reach_options": len(reach_colleges)
            },
            "categories": {
                "best": best_colleges[:10],  # Top 10 from each category
                "good": good_colleges[:10],
                "moderate": moderate_colleges[:10],
                "reach": reach_colleges[:5]
            }
        }
    
    @staticmethod
    def compare_colleges(college_codes: List[str], round: int = 1) -> Dict:
        """
        Compare multiple colleges side-by-side
        
        Args:
            college_codes: List of college codes to compare (2-4 colleges)
            round: Counselling round number
            
        Returns:
            Dictionary with comparison data structured for frontend rendering
        """
        if len(college_codes) < 2:
            raise ValueError("At least 2 colleges required for comparison")
        
        if len(college_codes) > 4:
            college_codes = college_codes[:4]  # Limit to 4 colleges
        
        comparison_data = []
        
        for college_code in college_codes:
            # Get college info
            college_info = CollegeService.get_college_branches(college_code)
            
            # Extract key metrics
            branches = college_info["branches"]
            cutoffs = []
            
            for branch in branches:
                cutoff_key = f"round{round}"
                cutoff = branch["cutoff_ranks"].get(cutoff_key, 0)
                if cutoff > 0:
                    cutoffs.append(cutoff)
            
            comparison_data.append({
                "college_code": college_code,
                "college_name": college_info["college_name"],
                "total_branches": len(branches),
                "best_cutoff": min(cutoffs) if cutoffs else 0,
                "avg_cutoff": builtin_round(sum(cutoffs) / len(cutoffs)) if cutoffs else 0,
                "worst_cutoff": max(cutoffs) if cutoffs else 0,
                "branches": branches  # Full branch list
            })
        
        return {
            "round": round,
            "colleges_count": len(comparison_data),
            "comparison": comparison_data
        }
    
    @staticmethod
    def get_branch_popularity(branch_name: str = None, round: int = 1) -> Dict:
        """
        Analyze branch popularity and competitiveness
        
        Args:
            branch_name: Specific branch name (None for all branches summary)
            round: Counselling round number
            
        Returns:
            Dictionary with branch statistics
        """
        if branch_name:
            # Get stats for specific branch
            query = f"""
            SELECT college_code, college_name, branch_name,
                   CASE 
                       WHEN ? = 1 THEN GM_rank_r1
                       WHEN ? = 2 THEN GM_rank_r2
                       WHEN ? = 3 THEN GM_rank_r3
                   END as cutoff_rank
            FROM kcet_2024
            WHERE LOWER(branch_name) = LOWER(?)
            AND CASE 
                    WHEN ? = 1 THEN GM_rank_r1 IS NOT NULL
                    WHEN ? = 2 THEN GM_rank_r2 IS NOT NULL
                    WHEN ? = 3 THEN GM_rank_r3 IS NOT NULL
                END
            ORDER BY cutoff_rank ASC
            """
            results = execute_query(query, (round, round, round, branch_name, round, round, round))
            
            if not results:
                raise NoDataFoundError(f"No data found for branch: {branch_name}")
            
            cutoffs = [r["cutoff_rank"] for r in results]
            
            return {
                "branch_name": branch_name,
                "round": round,
                "total_colleges": len(results),
                "best_cutoff": min(cutoffs),
                "avg_cutoff": builtin_round(sum(cutoffs) / len(cutoffs)),
                "worst_cutoff": max(cutoffs),
                "competitiveness": "High" if min(cutoffs) < 5000 else "Medium" if min(cutoffs) < 20000 else "Low",
                "top_colleges": results[:10]  # Top 10 colleges offering this branch
            }
        else:
            # Get summary of all branches
            query = f"""
            SELECT branch_name, COUNT(*) as college_count,
                   MIN(CASE 
                       WHEN ? = 1 THEN GM_rank_r1
                       WHEN ? = 2 THEN GM_rank_r2
                       WHEN ? = 3 THEN GM_rank_r3
                   END) as best_cutoff,
                   AVG(CASE 
                       WHEN ? = 1 THEN GM_rank_r1
                       WHEN ? = 2 THEN GM_rank_r2
                       WHEN ? = 3 THEN GM_rank_r3
                   END) as avg_cutoff
            FROM kcet_2024
            WHERE CASE 
                    WHEN ? = 1 THEN GM_rank_r1 IS NOT NULL
                    WHEN ? = 2 THEN GM_rank_r2 IS NOT NULL
                    WHEN ? = 3 THEN GM_rank_r3 IS NOT NULL
                END
            GROUP BY branch_name
            ORDER BY best_cutoff ASC
            """
            results = execute_query(query, (round, round, round, round, round, round, round, round, round))
            
            branches_summary = []
            for row in results:
                branches_summary.append({
                    "branch_name": row["branch_name"],
                    "college_count": row["college_count"],
                    "best_cutoff": builtin_round(row["best_cutoff"]) if row["best_cutoff"] else 0,
                    "avg_cutoff": builtin_round(row["avg_cutoff"]) if row["avg_cutoff"] else 0,
                    "competitiveness": "High" if row["best_cutoff"] and row["best_cutoff"] < 5000 else "Medium" if row["best_cutoff"] and row["best_cutoff"] < 20000 else "Low"
                })
            
            return {
                "round": round,
                "total_branches": len(branches_summary),
                "branches": branches_summary
            }
