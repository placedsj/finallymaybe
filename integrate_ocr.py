import sqlite3
import csv
import os
import glob
from pathlib import Path

DB_PATH = "FDSJ739_EVIDENCE.db"
OCR_DIR = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CSV N SUCH FROM SMALL SD"
OCR_TABLE = "ocr_content"

def create_ocr_table(conn):
    """Create a separate table for OCR content"""
    cursor = conn.cursor()
    
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {OCR_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT,
        sender TEXT,
        recipient TEXT,
        raw_text TEXT,
        formatted_text TEXT,
        confidence REAL,
        char_count INTEGER,
        has_sender INTEGER,
        has_recipient INTEGER,
        processed_date TEXT,
        batch_num INTEGER,
        exhibit_id INTEGER,
        FOREIGN KEY (exhibit_id) REFERENCES exhibits(id)
    )
    """)
    
    # Create FTS5 table for OCR text
    cursor.execute(f"""
    CREATE VIRTUAL TABLE IF NOT EXISTS {OCR_TABLE}_fts USING fts5(
        filename,
        sender,
        recipient,
        raw_text,
        content='{OCR_TABLE}',
        content_rowid='id'
    )
    """)
    
    # Create triggers
    cursor.execute(f"""
    CREATE TRIGGER IF NOT EXISTS {OCR_TABLE}_ai AFTER INSERT ON {OCR_TABLE} BEGIN
        INSERT INTO {OCR_TABLE}_fts(rowid, filename, sender, recipient, raw_text)
        VALUES (new.id, new.filename, new.sender, new.recipient, new.raw_text);
    END
    """)
    
    conn.commit()
    print("✓ Created OCR content table with FTS5 search")

def ingest_ocr_files(conn):
    """Ingest all OCR CSV files"""
    cursor = conn.cursor()
    
   # Clear existing OCR data
    cursor.execute(f"DELETE FROM {OCR_TABLE}")
    
    ocr_files = glob.glob(os.path.join(OCR_DIR, "*ocr*.csv"))
    print(f"\nFound {len(ocr_files)} OCR CSV files...")
    
    total_records = 0
    
    for ocr_file in ocr_files:
        print(f"Processing: {os.path.basename(ocr_file)}")
        
        try:
            with open(ocr_file, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    cursor.execute(f"""
                    INSERT INTO {OCR_TABLE} (
                        filename, filepath, sender, recipient, raw_text, 
                        formatted_text, confidence, char_count, has_sender, 
                        has_recipient, processed_date, batch_num
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row.get('filename', ''),
                        row.get('filepath', ''),
                        row.get('sender', ''),
                        row.get('recipient', ''),
                        row.get('raw_text', ''),
                        row.get('formatted_text', ''),
                        float(row.get('confidence', 0)),
                        int(row.get('char_count', 0)),
                        int(row.get('has_sender', 0)),
                        int(row.get('has_recipient', 0)),
                        row.get('processed_date', ''),
                        int(row.get('batch_num', 0))
                    ))
                    total_records += 1
        
        except Exception as e:
            print(f"  ⚠ Error: {e}")
            continue
    
    conn.commit()
    print(f"\n✅ Ingested {total_records} OCR records")
    return total_records

def test_ocr_search(conn):
    """Test OCR-specific searches"""
    cursor = conn.cursor()
    
    print(f"\n{'='*60}")
    print("OCR FULL-TEXT SEARCH RESULTS")
    print(f"{'='*60}")
    
    test_queries = [
        ("Jacqueline Gallant", "Social worker conflict of interest"),
        ("piss in a cup", "Drug testing demands"),
        ("Harper weight grams", "Baby health tracking"),
        ("meth pipe", "Drug paraphernalia evidence"),
        ("conflict of interest", "Professional misconduct")
    ]
    
    for query, context in test_queries:
        cursor.execute(f"""
        SELECT filename, sender, recipient, SUBSTR(raw_text, 1, 150)
        FROM {OCR_TABLE}
        WHERE id IN (
            SELECT rowid FROM {OCR_TABLE}_fts WHERE {OCR_TABLE}_fts MATCH ?
        )
        LIMIT 3
        """, (query,))
        
        results = cursor.fetchall()
        print(f"\n🔍 {context}")
        print(f"   Query: \"{query}\"")
        print(f"   Results: {len(results)}")
        
        for filename, sender, recip, text_preview in results:
            print(f"\n   📄 {filename}")
            if sender or recip:
                print(f"      {sender} → {recip}")
            print(f"      {text_preview}...")

def generate_searchable_report(conn):
    """Generate a summary report of searchable content"""
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT COUNT(*) FROM {OCR_TABLE}")
    total_ocr = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT COUNT(DISTINCT filename) FROM {OCR_TABLE}")
    unique_files = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT SUM(char_count) FROM {OCR_TABLE}")
    total_chars = cursor.fetchone()[0] or 0
    
    cursor.execute(f"SELECT COUNT(*) FROM {OCR_TABLE} WHERE has_sender = 1")
    with_sender = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT COUNT(*) FROM {OCR_TABLE} WHERE has_recipient = 1")
    with_recipient = cursor.fetchone()[0]
    
    print(f"\n{'='*60}")
    print("SEARCHABLE CONTENT SUMMARY")
    print(f"{'='*60}")
    print(f"Total OCR Records: {total_ocr}")
    print(f"Unique Files: {unique_files}")
    print(f"Total Characters Extracted: {total_chars:,}")
    print(f"Records with Sender: {with_sender}")
    print(f"Records with Recipient: {with_recipient}")
    
    # Sample of available senders/recipients
    cursor.execute(f"""
    SELECT sender, COUNT(*) as cnt 
    FROM {OCR_TABLE}
    WHERE sender != '' 
    GROUP BY sender 
    ORDER BY cnt DESC 
    LIMIT 5
    """)
    
    print(f"\nTop Senders:")
    for sender, count in cursor.fetchall():
        print(f"  - {sender}: {count} messages")

def main():
    print("="*60)
    print("OCR CONTENT INTEGRATION - FDSJ-739-24")
    print("="*60)
    
    conn = sqlite3.connect(DB_PATH)
    
    print("\n1. Creating OCR table schema...")
    create_ocr_table(conn)
    
    print("\n2. Ingesting OCR data...")
    total = ingest_ocr_files(conn)
    
    if total > 0:
        print("\n3. Testing search capabilities...")
        test_ocr_search(conn)
        
        print("\n4. Generating summary...")
        generate_searchable_report(conn)
    
    conn.close()
    print(f"\n💾 Database saved: {DB_PATH}")
    print("\n✅ All OCR text is now searchable via SQL queries!")

if __name__ == "__main__":
    main()
