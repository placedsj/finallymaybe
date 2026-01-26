import sqlite3

try:
    conn = sqlite3.connect('FDSJ739_EVIDENCE_READ.db')
    c = conn.cursor()
    
    print("--- Database Stats ---")
    c.execute('SELECT COUNT(*), SUM(char_count) FROM ocr_content')
    row = c.fetchone()
    print(f"Total Records: {row[0]}")
    print(f"Total Characters: {row[1]}")
    
    print("\n--- Search Test (limit 1) ---")
    c.execute("SELECT filename FROM ocr_content_fts WHERE ocr_content_fts MATCH 'Emma' LIMIT 1")
    res = c.fetchone()
    if res:
        print(f"Found match in: {res[0]}")
    else:
        print("No matches found.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
