"""
Main entry point for the KCET College Predictor API
"""

from dotenv import find_dotenv, load_dotenv

# Import the app instance so it can be found by uvicorn main:app
from app import app

load_dotenv(find_dotenv())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
