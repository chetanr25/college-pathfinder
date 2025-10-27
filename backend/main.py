import sqlite3
import os


def show_top_5_entries():
    """
    Access the KCET 2024 database and display the top 5 entries.
    This function connects to the SQLite database, retrieves table names,
    and shows the first 5 rows from the first available table.
    """
    db_path = "data/kcet_2024.db"
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Error: Database file '{db_path}' not found!")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables in the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database.")
            conn.close()
            return
        
        # Use the first table found
        table_name = tables[0][0]
        print(f"Database: {db_path}")
        print(f"Table: {table_name}")
        print(f"\nTop 5 entries:\n")
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Print column headers
        print(" | ".join(columns))
        print("-" * (len(" | ".join(columns))))
        
        # Fetch top 5 entries
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
        rows = cursor.fetchall()
        
        # Display the rows
        for row in rows:
            print(" | ".join(str(cell) for cell in row))
        
        print(f"\nTotal rows in table: ", end="")
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        print(cursor.fetchone()[0])
        
        # Close connection
        conn.close()
        
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    show_top_5_entries()
