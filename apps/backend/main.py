"""
Main entry point for the KCET College Predictor API
"""

import os

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

from app import app  # noqa: E402

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=8005, reload=True)
