"""
Main entry point for the KCET College Predictor API
"""

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", port=8005, reload=True)
