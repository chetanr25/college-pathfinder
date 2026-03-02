"""
Main entry point for the KCET College Predictor API
"""

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

# Import the FastAPI app for uvicorn to find
from app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8005, reload=True)
