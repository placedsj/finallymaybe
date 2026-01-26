import sqlite3
import csv
import os
from pathlib import Path

DB_PATH = "FDSJ739_EVIDENCE.db"
CLEAN_CSV = "CLEAN_FDSJ739_DATA.csv"
EVIDENCE_DIR = r"C:\Users\dalec\OneDrive\Desktop\harperssafewayhome\MASTER_EVIDENCE_VAULT\CORE_CUSTODY_EVIDENCE"

def create_database():
    """Create SQLite database with proper schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Main exhibits table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exhibits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exhibit_number TEXT UNIQUE NOT NULL,
        description TEXT,
        date TEXT,
        category TEXT,
        priority INTEGER,
        file_type TEXT,
        keywords TEXT,
        legal_significance TEXT,
        status TEXT,
        source TEXT,
        matched_file TEXT,
        file_path TEXT,
        file_exists INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # FTS5 virtual table for full-text search
    cursor.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS exhibits_fts USING fts5(
        exhibit_number,
        description,
        keywords,
        legal_significance,
        content='exhibits',
        content_rowid='id'
    )
    """)
    
    # Triggers to keep FTS in sync
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS exhibits_ai AFTER INSERT ON exhibits BEGIN
        INSERT INTO exhibits_fts(rowid, exhibit_number, description, keywords, legal_significance)
        VALUES (new.id, new.exhibit_number, new.description, new.keywords, new.legal_significance);
    END
    """)
    
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS exhibits_ad AFTER DELETE ON exhibits BEGIN
        DELETE FROM exhibits_fts WHERE rowid = old.id;
    END
    """)
    
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS exhibits_au AFTER UPDATE ON exhibits BEGIN
        DELETE FROM exhibits_fts WHERE rowid = old.id;
        INSERT INTO exhibits_fts(rowid, exhibit_number, description, keywords, legal_significance)
        VALUES (new.id, new.exhibit_number, new.description, new.keywords, new.legal_significance);
    END
    """)
    
    conn.commit()
    return conn

def ingest_csv(conn):
    """Ingest the cleaned CSV data"""
    cursor = conn.cursor()
    
    print(f"Reading {CLEAN_CSV}...")
    with open(CLEAN_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        records = list(reader)
    
    print(f"Found {len(records)} records to process...")
    
    inserted = 0
    updated = 0
    
    for row in records:
        exhibit_num = row.get('Exhibit Number', '').strip()
        if not exhibit_num:
            continue
        
        matched_file = row.get('MATCHED_FILE', 'MISSING')
        
        # Check if file exists
        file_exists = 0
        file_path = None
        if matched_file != "MISSING":
            file_path = os.path.join(EVIDENCE_DIR, matched_file)
            file_exists = 1 if os.path.exists(file_path) else 0
        
        # Try to insert or update
        try:
            cursor.execute("""
            INSERT INTO exhibits (
                exhibit_number, description, date, category, priority, 
                file_type, keywords, legal_significance, status, source,
                matched_file, file_path, file_exists
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                exhibit_num,
                row.get('Description', ''),
                row.get('Date', ''),
                row.get('Category', ''),
                int(row.get('Priority', 5)),
                row.get('File Type', ''),
                row.get('Keywords', ''),
                row.get('Legal Significance', ''),
                row.get('Status', ''),
                row.get('Source', ''),
                matched_file,
                file_path,
                file_exists
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            # Update existing record
            cursor.execute("""
            UPDATE exhibits SET
                description = ?, date = ?, category = ?, priority = ?,
                file_type = ?, keywords = ?, legal_significance = ?,
                status = ?, source = ?, matched_file = ?, file_path = ?,
                file_exists = ?
            WHERE exhibit_number = ?
            """, (
                row.get('Description', ''),
                row.get('Date', ''),
                row.get('Category', ''),
                int(row.get('Priority', 5)),
                row.get('File Type', ''),
                row.get('Keywords', ''),
                row.get('Legal Significance', ''),
                row.get('Status', ''),
                row.get('Source', ''),
                matched_file,
                file_path,
                file_exists,
                exhibit_num
            ))
            updated += 1
    
    conn.commit()
    
    print(f"\n✅ Database ingestion complete!")
    print(f"   - Inserted: {inserted} new exhibits")
    print(f"   - Updated: {updated} existing exhibits")
    
    # Print summary stats
    cursor.execute("SELECT COUNT(*) FROM exhibits")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM exhibits WHERE file_exists = 1")
    found = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM exhibits WHERE matched_file = 'MISSING'")
    missing = cursor.fetchone()[0]
    
    print(f"\n📊 Database Statistics:")
    print(f"   - Total Exhibits: {total}")
    print(f"   - Files Found: {found}")
    print(f"   - Files Missing: {missing}")
    print(f"   - Match Rate: {(found/total*100):.1f}%")

def main():
    print("="*60)
    print("FDSJ-739-24 Evidence Database Ingestion")
    print("="*60)
    print()
    
    conn = create_database()
    print("✓ Database schema created")
    
    ingest_csv(conn)
    
    conn.close()
    print(f"\n💾 Database saved to: {DB_PATH}")
    print("\nYou can now query the database with SQL or FTS5 searches.")

if __name__ == "__main__":
    main()
