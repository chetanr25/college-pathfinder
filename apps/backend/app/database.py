"""
Database connection and query utilities
"""

import sqlite3
from contextlib import contextmanager
from typing import Dict, Generator, List, Optional, Tuple

from fastapi import HTTPException

from app.config import settings
from app.exceptions import DatabaseError


@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections

    Yields:
        sqlite3.Connection: Database connection with row factory enabled

    Raises:
        DatabaseError: If database connection or operation fails
    """
    import os
    from pathlib import Path

    # Get absolute path to database
    db_path = settings.DATABASE_URL

    # If the path doesn't exist, try to find it relative to this file
    if not os.path.exists(db_path):
        backend_dir = Path(__file__).parent.parent
        db_path = str(backend_dir / "data" / "kcet_2024.db")

    conn = None
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        yield conn
    except sqlite3.Error as e:
        raise DatabaseError(f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


def execute_query(query: str, params: Optional[Tuple] = None) -> List[Dict]:
    """
    Execute a SQL query and return results as a list of dictionaries

    Args:
        query: SQL query string
        params: Optional tuple of query parameters

    Returns:
        List of dictionaries representing query results

    Raises:
        HTTPException: If database error occurs (500 status)
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return [dict(row) for row in cursor.fetchall()]
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
