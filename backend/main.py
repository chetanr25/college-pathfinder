"""
Main entry point for the KCET College Predictor API
"""
import os
from dotenv import find_dotenv, load_dotenv
from app import app

if __name__ == "__main__":
    import uvicorn
    load_dotenv(find_dotenv())
    print( os.getenv("GEMINI_API_KEY"))
    uvicorn.run("main:app", port=8000, reload=True)
