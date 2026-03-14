import asyncio
import os
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add current directory to path to find 'app'
sys.path.append(os.getcwd())

display_url = "UNKNOWN"

try:
    from app.config import settings
    url = settings.POSTGRES_URL
    # Mask password for display
    if "@" in url:
        display_url = url.split("@")[1]
        user_part = url.split("@")[0]
        if ":" in user_part:
            display_url = f"{user_part.split(':')[0]}:****@{display_url}"
        else:
            display_url = f"{user_part}@{display_url}"
    else:
        display_url = url

    print(f"Checking connection to: {display_url}")
except Exception as e:
    print(f"Could not load settings: {e}")
    url = os.environ.get("POSTGRES_URL")
    print(f"Using URL from env: {url}")

if not url:
    print("Error: POSTGRES_URL not set!")
    sys.exit(1)

async def check():
    print("-" * 50)
    print("Starting connection test...")
    try:
        # Create engine
        engine = create_async_engine(url, echo=False)

        # Try to connect
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            print(f"SUCCESS: Database returned {val}")

            # Check database name
            result_db = await conn.execute(text("SELECT current_database()"))
            db_name = result_db.scalar()
            print(f"Connected to database: {db_name}")

            # Check if users table exists and has correct columns
            print("Checking 'users' table...")
            try:
                # Try to select one row
                await conn.execute(text("SELECT id, email, name, google_id FROM users LIMIT 1"))
                print("SUCCESS: 'users' table exists and has expected columns.")
            except Exception as table_error:
                print(f"FAILED: 'users' table check failed: {table_error}")

                # Check what tables actually exist
                print("Listing all tables:")
                result_tables = await conn.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'"))
                tables = result_tables.fetchall()
                for t in tables:
                    print(f" - {t[0]}")

        await engine.dispose()
        print("-" * 50)
        print("✅ DATABASE CONNECTION HEALTHY")

    except Exception as e:
        print("-" * 50)
        print("❌ CONNECTION FAILED")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {e}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(check())
