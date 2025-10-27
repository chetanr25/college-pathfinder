"""
Main entry point for the KCET College Predictor API
"""
from app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)
