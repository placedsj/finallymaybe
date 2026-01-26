import sqlite3
import pandas as pd

DB_PATH = "FDSJ739_EVIDENCE.db"
OUTPUT_FILE = "EXHIBIT_COVERSHEETS.md"

def generate_coversheets():
    conn = sqlite3.connect(DB_PATH)
    
    # Get verified exhibits
    query = """
    SELECT exhibit_number, description, date, category 
    FROM exhibits 
    WHERE matched_file != 'MISSING' AND matched_file IS NOT NULL
    ORDER BY priority DESC, date ASC
    """
    df = pd.read_sql_query(query, conn)
    
    content = ""
    
    for index, row in df.iterrows():
        # CSS for page break (works when converting MD to PDF via some tools, 
        # but mostly just visual separation here)
        if index > 0:
            content += "\n\n---\n<div style='page-break-before: always;'></div>\n\n"
            
        content += f"# EXHIBIT {row['exhibit_number']}\n\n"
        content += "**RYAN v. SCHULZ**\n"
        content += "**Court File No.:** FDSJ-739-24\n\n"
        content += f"**Description:** {row['description']}\n\n"
        content += f"**Date:** {row['date']}\n"
        content += f"**Category:** {row['category']}\n"
        content += "\n" * 5 
        content += "*(Attach Evidence Document Here)*\n"
        
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Generated {OUTPUT_FILE} with {len(df)} coversheets.")
    conn.close()

if __name__ == "__main__":
    generate_coversheets()
