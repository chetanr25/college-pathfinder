"""
Custom exceptions and exception handlers for the KCET College Predictor API
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class DatabaseError(Exception):
    """Custom exception for database errors"""
    pass


class CollegeNotFoundError(HTTPException):
    """Exception raised when college is not found"""
    def __init__(self, detail: str = "College not found"):
        super().__init__(status_code=404, detail=detail)


class BranchNotFoundError(HTTPException):
    """Exception raised when branch is not found"""
    def __init__(self, detail: str = "Branch not found"):
        super().__init__(status_code=404, detail=detail)


class NoDataFoundError(HTTPException):
    """Exception raised when no data is found"""
    def __init__(self, detail: str = "No data found"):
        super().__init__(status_code=404, detail=detail)


async def http_exception_handler(request: Request, exc: HTTPException):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)}
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Global general exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
