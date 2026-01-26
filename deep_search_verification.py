import sqlite3

DB_PATH = "FDSJ739_EVIDENCE.db"

queries = {
    "Exhibit A (Victim Services)": ["Victim Services", "Recording", "Transcript", "Audio"],
    "Exhibit C (Denial Log)": ["Calendar", "Denial", "Log", "Sunday", "129"],
    "Exhibit E (Paraphernalia)": ["Pipe", "Bong", "Paraphernalia", "Meth"],
    "Exhibit G (Diaper Rash)": ["Diaper", "Rash", "Bleeding", "Sore", "Red"],
    "Exhibit D (Bank Records)": ["Bank", "Transfer", "E-Transfer", "Money", "Withdrawal"]
}

def deep_search():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open("DEEP_SEARCH_RESULTS.md", "w", encoding="utf-8") as f:
        f.write("# Deep Search Results\n\n")
        
        for name, keywords in queries.items():
            f.write(f"## Searching for: {name}\n")
            
            # Construct FTS query
            fts_query = " OR ".join([f'"{k}"' for k in keywords])
            f.write(f"Query: `{fts_query}`\n")
            
            # Search Metadata
            f.write("\n### Metadata Matches:\n")
            cursor.execute("""
                SELECT e.exhibit_number, e.description, e.matched_file 
                FROM exhibits_fts 
                JOIN exhibits e ON e.id = exhibits_fts.rowid
                WHERE exhibits_fts MATCH ? 
                LIMIT 5
            """, (fts_query,))
            rows = cursor.fetchall()
            if rows:
                for r in rows:
                    f.write(f"- **{r[0]}**: {r[1]} (`{r[2]}`)\n")
            else:
                f.write("- No metadata matches.\n")
                
            # Search OCR
            f.write("\n### OCR Content Matches:\n")
            try:
                cursor.execute("""
                    SELECT filename, SUBSTR(raw_text, 1, 100) 
                    FROM ocr_content_fts 
                    WHERE ocr_content_fts MATCH ? 
                    LIMIT 5
                """, (fts_query,))
                rows = cursor.fetchall()
                if rows:
                    for r in rows:
                        f.write(f"- `{r[0]}`: \"{r[1]}...\"\n")
                else:
                    f.write("- No OCR matches.\n")
            except Exception as e:
                f.write(f"- OCR Search Error: {e}\n")
                
            f.write("\n" + "-"*40 + "\n\n")

    conn.close()
    print("Results written to DEEP_SEARCH_RESULTS.md")

if __name__ == "__main__":
    deep_search()
