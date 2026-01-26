import sqlite3

DB_PATH = "FDSJ739_EVIDENCE.db"

def search_name(cursor, name):
    print(f"\nEvaluating hits for: **{name}**")
    print("-" * 40)
    
    # Metadata Search
    cursor.execute("""
        SELECT COUNT(*) FROM exhibits_fts WHERE exhibits_fts MATCH ?
    """, (f'"{name}"',))
    meta_count = cursor.fetchone()[0]
    
    # OCR Search
    cursor.execute("""
        SELECT COUNT(*) FROM ocr_content_fts WHERE ocr_content_fts MATCH ?
    """, (f'"{name}"',))
    ocr_count = cursor.fetchone()[0]
    
    total = meta_count + ocr_count
    print(f"Total Hits: {total}")
    print(f"  - Metadata Matches: {meta_count}")
    print(f"  - OCR Content Matches: {ocr_count}")
    
    if total > 0:
        print("\n  Sample Context:")
        # Get context from OCR
        cursor.execute(f"""
            SELECT filename, snippet(ocr_content_fts, 3, '<b>', '</b>', '...', 15) 
            FROM ocr_content_fts 
            WHERE ocr_content_fts MATCH ? 
            LIMIT 3
        """, (f'"{name}"',))
        
        for row in cursor.fetchall():
            print(f"    * {row[0]}: \"{row[1]}\"")
            
        # Get context from Metadata if needed
        if meta_count > 0:
            cursor.execute(f"""
                SELECT exhibit_number, description 
                FROM exhibits_fts 
                WHERE exhibits_fts MATCH ? 
                LIMIT 3
            """, (f'"{name}"',))
            for row in cursor.fetchall():
                print(f"    * Exhibit {row[0]}: {row[1]}")

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    search_name(cursor, "Tony Baker")
    search_name(cursor, "Paul Carey")
    
    conn.close()

if __name__ == "__main__":
    main()
