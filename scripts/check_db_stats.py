import sqlite3
import os

def check_db(db_name):
    if not os.path.exists(db_name):
        print(f"[{db_name}] DOES NOT EXIST")
        return

    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"[{db_name}] Tables: {[t[0] for t in tables]}")
        
        # Check exhibits count
        if ('exhibits',) in tables:
            cursor.execute("SELECT COUNT(*) FROM exhibits")
            count = cursor.fetchone()[0]
            print(f"[{db_name}] Exhibits Count: {count}")
        else:
            print(f"[{db_name}] No 'exhibits' table found.")
            
        conn.close()
    except Exception as e:
        print(f"[{db_name}] Error: {e}")

print("Checking Databases...")
check_db("evidence.db")
check_db("FDSJ739_EVIDENCE.db")
