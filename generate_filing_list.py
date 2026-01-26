import sqlite3
import pandas as pd

DB_PATH = "FDSJ739_EVIDENCE.db"
OUTPUT_FILE = "COURT_FILING_EXHIBIT_LIST.md"

def generate_filing_list():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all exhibits ordered by Priority then Exhibit Number
    query = """
    SELECT 
        exhibit_number, 
        description, 
        date, 
        category, 
        legal_significance, 
        matched_file
    FROM exhibits 
    WHERE matched_file != 'MISSING' AND matched_file IS NOT NULL
    ORDER BY priority DESC, date ASC
    """
    
    df = pd.read_sql_query(query, conn)
    
    markdown_output = "# MASTER EXHIBIT LIST: RYAN v. SCHULZ (FDSJ-739-24)\n\n"
    markdown_output += "**Respondent:** Craig Schulz\n"
    markdown_output += "**Filing Date:** January 16, 2026\n\n"
    
    markdown_output += "| Ex. # | Date | Description | Relevance (Legal Significance) | File Ref |\n"
    markdown_output += "| :--- | :--- | :--- | :--- | :--- |\n"
    
    for index, row in df.iterrows():
        # Clean text
        desc = str(row['description']).replace('\n', ' ').strip()
        legal = str(row['legal_significance']).replace('\n', ' ').strip()
        if len(legal) > 100: legal = legal[:97] + "..."
        
        fileref = str(row['matched_file'])
        if len(fileref) > 20: fileref = fileref[:10] + "..." + fileref[-7:]
        
        markdown_output += f"| **{row['exhibit_number']}** | {row['date']} | {desc} | {legal} | `{fileref}` |\n"
        
    # Append the "To Be Located" list
    markdown_output += "\n## Exhibits Pending Physical Location\n\n"
    markdown_output += "| Ex. # | Description | Status |\n"
    markdown_output += "| :--- | :--- | :--- |\n"
    
    cursor.execute("SELECT exhibit_number, description FROM exhibits WHERE matched_file = 'MISSING'")
    missing = cursor.fetchall()
    for ex_num, desc in missing:
        markdown_output += f"| {ex_num} | {desc} | Missing from Evidence Vault |\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(markdown_output)
        
    print(f"Generated {OUTPUT_FILE} with {len(df)} exhibits.")
    conn.close()

if __name__ == "__main__":
    generate_filing_list()
