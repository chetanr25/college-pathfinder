import sqlite3
from contextlib import contextmanager
from typing import Generator
from fastapi import HTTPException

DATABASE_URL = "data/kcet_2024.db"

class DatabaseError(Exception):
    """Custom exception for database errors"""
    pass

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for database connections"""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_URL)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        yield conn
    except sqlite3.Error as e:
        raise DatabaseError(f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()

def execute_query(query: str, params: tuple = None) -> list:
    """Execute a SQL query and return results"""
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")