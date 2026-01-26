import sqlite3

DB_PATH = "FDSJ739_EVIDENCE.db"
OCR_TABLE = "ocr_content"

def fix_fts():
    print(f"Repairing FTS index for {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop existing FTS
    print("Dropping broken FTS table...")
    cursor.execute(f"DROP TABLE IF EXISTS {OCR_TABLE}_fts")
    
    # Re-create
    print("Re-creating FTS table...")
    cursor.execute(f"""
    CREATE VIRTUAL TABLE {OCR_TABLE}_fts USING fts5(
        filename,
        sender,
        recipient,
        raw_text,
        content='{OCR_TABLE}',
        content_rowid='id'
    )
    """)
    
    # Populate
    print("Populating FTS index...")
    cursor.execute(f"""
    INSERT INTO {OCR_TABLE}_fts(rowid, filename, sender, recipient, raw_text)
    SELECT id, filename, sender, recipient, raw_text FROM {OCR_TABLE}
    """)
    
    conn.commit()
    print("Rebuild complete.")
    
    # Test
    print("\nTesting Search:")
    cursor.execute(f"SELECT filename FROM {OCR_TABLE}_fts WHERE {OCR_TABLE}_fts MATCH 'Emma' LIMIT 1")
    res = cursor.fetchone()
    if res:
        print(f"✓ Found match: {res[0]}")
    else:
        print("✗ No match found (unexpected)")
        
    conn.close()

if __name__ == "__main__":
    fix_fts()
