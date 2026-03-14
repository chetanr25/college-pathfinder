"""
Main entry point for the KCET College Predictor API
"""

from dotenv import find_dotenv, load_dotenv
from app import app

load_dotenv(find_dotenv())
__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8005, reload=True)
