import sqlite3
import hashlib
import os

DB_PATH = "FDSJ739_EVIDENCE.db"

def calculate_file_hash(filepath):
    """Calculate SHA-256 hash of a file"""
    if not os.path.exists(filepath):
        return None
        
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def add_integrity_hashes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Add hash columns if they don't exist
    try:
        cursor.execute("ALTER TABLE exhibits ADD COLUMN file_hash TEXT")
        cursor.execute("ALTER TABLE exhibits ADD COLUMN hash_date TEXT")
        print("Added hash columns to database.")
    except sqlite3.OperationalError:
        print("Hash columns already exist.")

    # Get all exhibits with files
    cursor.execute("SELECT id, matched_file FROM exhibits WHERE matched_file IS NOT NULL AND Matched_File != 'MISSING'")
    rows = cursor.fetchall()
    
    print(f"Calculating hashes for {len(rows)} files...")
    
    base_path = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CORE_CUSTODY_EVIDENCE"
    
    # 1. Build a map of filename -> full_path
    print("Building file map from disk (recursive scan)...")
    file_map = {}
    for root, dirs, files in os.walk(base_path):
        for file in files:
            # Case insensitive matching might be safer on Windows
            file_map[file.lower()] = os.path.join(root, file)
            
    print(f"  Found {len(file_map)} files in vault.")

    updated_count = 0
    missing_count = 0
    
    for row_id, db_filename in rows:
        if not db_filename or db_filename == 'MISSING':
            continue
            
        # Try exact match first, then lower case
        full_path = file_map.get(db_filename.lower())
        
        if not full_path:
             print(f"⚠ File not found on disk: {db_filename}")
             missing_count += 1
             continue

        file_hash = calculate_file_hash(full_path)
        
        if file_hash:
            cursor.execute("UPDATE exhibits SET file_hash = ?, hash_date = datetime('now') WHERE id = ?", (file_hash, row_id))
            updated_count += 1

    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Integrity Check Complete")
    print(f"  - Hashes Calculated: {updated_count}")
    print(f"  - Missing Files: {missing_count}")

if __name__ == "__main__":
    add_integrity_hashes()
