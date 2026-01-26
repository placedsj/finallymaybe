import sqlite3
import pandas as pd

DB_PATH = "FDSJ739_EVIDENCE.db"

# Define the Affidavit Exhibits and their search terms
affidavit_exhibits = [
    {"ID": "A", "Description": "Audio Recording and Transcript of Victim Services Call", "Keywords": ["Victim Services", "Transcript", "Recording"], "OCR_Keywords": ["Victim Services"]},
    {"ID": "B", "Description": "Text Message from Jane Ryan (Oct 21, 2025) enforcing NCO", "Keywords": ["Jane Ryan", "Oct 21", "Text", "NCO", "No Contact"], "OCR_Keywords": ["Jane", "No Contact"]},
    {"ID": "C", "Description": "The Denial Log (Calendar of 18 Missed Sundays)", "Keywords": ["Denial Log", "Calendar", "Sunday", "Missed"], "OCR_Keywords": ["Sunday", "Denial"]},
    {"ID": "D", "Description": "Bank Records showing transfer and subsequent withdrawal", "Keywords": ["Bank", "Transfer", "Withdrawal", "Dec 8"], "OCR_Keywords": ["Transfer", "Withdrawal"]},
    {"ID": "E", "Description": "Photos of Paraphernalia in the Home", "Keywords": ["Paraphernalia", "Pipe", "Meth", "Drug"], "OCR_Keywords": []},
    {"ID": "F", "Description": "Screenshots of Text Messages regarding breast milk exposure", "Keywords": ["Breast milk", "exposure", "meth", "text"], "OCR_Keywords": ["breast", "milk", "meth"]},
    {"ID": "G", "Description": "Photos of severe diaper rash", "Keywords": ["Diaper rash", "Severe", "Photo"], "OCR_Keywords": ["Diaper"]},
    {"ID": "H", "Description": "Respondent's Drug Test Results (Negative)", "Keywords": ["Drug Test", "Craig", "Negative", "Respondent"], "OCR_Keywords": ["Negative", "Craig"]},
    {"ID": "I", "Description": "Applicant's Toxicology Report (Negative-Dilute)", "Keywords": ["Toxicology", "Dilute", "Applicant", "Emma"], "OCR_Keywords": ["Dilute", "Negative"]}
]

def search_exhibit(cursor, exhibit_def):
    """Search for an exhibit using multiple strategies"""
    matches = []
    
    # 1. Keyword Search in metadata
    quoted_keywords = [f'"{k}"' for k in exhibit_def["Keywords"]]
    search_query = " OR ".join(quoted_keywords)
    
    try:
        cursor.execute(f"""
            SELECT exhibit_number, description, matched_file, ocr_text, rank 
            FROM exhibits_fts 
            WHERE exhibits_fts MATCH ? 
            ORDER BY rank 
            LIMIT 3
        """, (search_query,))
        
        for row in cursor.fetchall():
            matches.append({
                "Source": "Metadata Search",
                "DB_ID": row[0],
                "Description": row[1],
                "Filename": row[2]
            })
    except Exception as e:
        print(f"Metadata search error for {exhibit_def['ID']}: {e}")

    # 2. OCR Content Search (if OCR keywords exist)
    if exhibit_def["OCR_Keywords"]:
        ocr_query = " OR ".join([f'"{k}"' for k in exhibit_def["OCR_Keywords"]])
        try:
            cursor.execute(f"""
                SELECT filename, raw_text 
                FROM ocr_content_fts 
                WHERE ocr_content_fts MATCH ? 
                LIMIT 3
            """, (ocr_query,))
            
            for row in cursor.fetchall():
                 # Find which exhibit this file belongs to
                cursor.execute("SELECT exhibit_number, description FROM exhibits WHERE matched_file = ?", (row[0],))
                ex_info = cursor.fetchone()
                db_id = ex_info[0] if ex_info else "Unknown"
                desc = ex_info[1] if ex_info else "Unknown"
                
                matches.append({
                    "Source": "OCR Content Search",
                    "DB_ID": db_id,
                    "Description": desc,
                    "Filename": row[0]
                })
        except Exception as e:
            print(f"OCR search error for {exhibit_def['ID']}: {e}")

    return matches

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    report_lines = []
    report_lines.append("# Affidavit Verification Report")
    report_lines.append(f"**Generated:** {pd.Timestamp.now()}\n")
    report_lines.append("| Affidavit Exhibit | Claims | Found in Evidence DB? | Best Match File | Confidence |")
    report_lines.append("| :--- | :--- | :--- | :--- | :--- |")
    
    print("Verifying exhibits...")
    
    for ex in affidavit_exhibits:
        print(f"  Searching for Exhibit {ex['ID']}...")
        results = search_exhibit(cursor, ex)
        
        best_match = "-"
        status = "❌ MISSING"
        confidence = "Low"
        
        if results:
            # Simple heuristic: strictly pick the first unique match
            unique_matches = {r['Filename']: r for r in results}.values()
            top_match = list(unique_matches)[0]
            
            best_match = f"`{top_match['Filename']}`<br>(DB ID: {top_match['DB_ID']})"
            status = "✅ FOUND"
            confidence = "High" if len(results) > 0 else "Medium"
            
        report_lines.append(f"| **{ex['ID']}** | {ex['Description']} | {status} | {best_match} | {confidence} |")

    conn.close()
    
    # Write Report
    with open("AFFIDAVIT_VERIFICATION_REPORT.md", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    
    print("\nReport generated: AFFIDAVIT_VERIFICATION_REPORT.md")

if __name__ == "__main__":
    main()
