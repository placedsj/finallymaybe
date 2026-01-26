import sqlite3
import csv
import os
import glob

DB_PATH = "FDSJ739_EVIDENCE.db"
OCR_DIR = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CSV N SUCH FROM SMALL SD"
OCR_TABLE = "ocr_content"

def main():
    print("="*60)
    print("FINAL ROBUST OCR INTEGRATION")
    print("="*60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Clear Table
    try:
        cursor.execute(f"DELETE FROM {OCR_TABLE}")
        print("✓ Cleared existing OCR data")
    except Exception as e:
        print(f"⚠ Could not clear table: {e}")
        
    # 2. Ingest
    ocr_files = glob.glob(os.path.join(OCR_DIR, "*ocr*.csv"))
    print(f"\nFound {len(ocr_files)} OCR CSV files...")
    
    total_records = 0
    
    for ocr_file in ocr_files:
        print(f"Processing: {os.path.basename(ocr_file)}")
        try:
            with open(ocr_file, 'r', encoding='utf-8-sig', errors='replace') as f:
                reader = csv.DictReader(f)
                # Normalize headers
                reader.fieldnames = [k.strip() for k in reader.fieldnames] if reader.fieldnames else []
                
                for row in reader:
                    # Robust key fetch
                    filename = row.get('filename', '').strip()
                    raw_text = row.get('raw_text', '')
                    
                    if not filename: continue
                    
                    cursor.execute(f"""
                    INSERT INTO {OCR_TABLE} (
                        filename, filepath, sender, recipient, raw_text, 
                        formatted_text, confidence, char_count, has_sender, 
                        has_recipient, processed_date, batch_num
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        filename,
                        row.get('filepath', ''),
                        row.get('sender', ''),
                        row.get('recipient', ''),
                        raw_text,
                        row.get('formatted_text', ''),
                        float(row.get('confidence', 0) or 0),
                        int(row.get('char_count', 0) or 0),
                        1 if str(row.get('has_sender', '')).lower() == 'true' else 0,
                        1 if str(row.get('has_recipient', '')).lower() == 'true' else 0,
                        row.get('processed_date', ''),
                        int(row.get('batch_num', 0) or 0)
                    ))
                    total_records += 1
        except Exception as e:
            print(f"  ⚠ Skipped file due to error: {e}")

    conn.commit()
    print(f"\n✅ Successfully ingested {total_records} records.")
    
    # 3. Verify
    print("\nVERIFICATION:")
    cursor.execute(f"SELECT COUNT(*), SUM(char_count) FROM {OCR_TABLE}")
    count, chars = cursor.fetchone()
    print(f"Total Records: {count}")
    print(f"Total Characters: {chars}")
    
    # 4. Search Test
    print("\nSEARCH TEST ('Emma'):")
    try:
        cursor.execute(f"SELECT filename, SUBSTR(raw_text, 1, 60) FROM {OCR_TABLE}_fts WHERE {OCR_TABLE}_fts MATCH 'Emma' LIMIT 3")
        rows = cursor.fetchall()
        if rows:
            for r in rows:
                print(f"  Found: {r[0]} -> {r[1]}...")
        else:
            print("  No matches found for 'Emma'")
    except Exception as e:
        print(f"  Search failed: {e}")

    conn.close()

if __name__ == "__main__":
    main()
