import sqlite3
import csv
import os
import glob

DB_PATH = "FDSJ739_EVIDENCE.db"
OCR_DIR = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CSV N SUCH FROM SMALL SD"
OCR_TABLE = "ocr_content"

def ingest_ocr_files_robust(conn):
    """Ingest OCR files with robust encoding and key handling"""
    cursor = conn.cursor()
    
    # Clear existing data again to be safe
    cursor.execute(f"DELETE FROM {OCR_TABLE}")
    
    ocr_files = glob.glob(os.path.join(OCR_DIR, "*ocr*.csv"))
    print(f"\nFound {len(ocr_files)} OCR CSV files...")
    
    total_records = 0
    total_skipped = 0
    
    for ocr_file in ocr_files:
        print(f"Processing: {os.path.basename(ocr_file)}")
        
        try:
            # use utf-8-sig to handle BOM automatically
            with open(ocr_file, 'r', encoding='utf-8-sig', errors='replace') as f:
                reader = csv.DictReader(f)
                
                # Normalize keys (strip whitespace)
                normalized_fieldnames = [k.strip() for k in reader.fieldnames] if reader.fieldnames else []
                reader.fieldnames = normalized_fieldnames
                
                # Print keys for the first file to debug
                if total_records == 0:
                    print(f"  Fieldnames: {reader.fieldnames}")
                
                for row in reader:
                    # Flexible key getting
                    filename = row.get('filename', '').strip()
                    raw_text = row.get('raw_text', '')
                    
                    if not filename:
                        # Fallback try keys that might have garbage
                        for k in row.keys():
                            if 'filename' in k:
                                filename = row[k]
                                break
                    
                    # Store
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
            print(f"  ⚠ Error: {e}")
            continue
            
    conn.commit()
    print(f"\n✅ Ingested {total_records} OCR records")

def main():
    print("="*60)
    print("ROBUST OCR INTEGRATION")
    print("="*60)
    
    conn = sqlite3.connect(DB_PATH)
    ingest_ocr_files_robust(conn)
    
    # Check stats immediately
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*), SUM(char_count) FROM {OCR_TABLE}")
    count, chars = cursor.fetchone()
    print(f"\nStats: {count} records, {chars} total characters")
    
    # Run a test search
    cursor.execute(f"SELECT filename, raw_text FROM {OCR_TABLE}_fts WHERE {OCR_TABLE}_fts MATCH 'Craig' LIMIT 1")
    res = cursor.fetchone()
    if res:
        print(f"\nTest Search 'Craig': Found -> {res[0]}")
    else:
        print("\nTest Search 'Craig': NOT FOUND")

    conn.close()

if __name__ == "__main__":
    main()
