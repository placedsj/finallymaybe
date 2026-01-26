#!/usr/bin/env python3
"""
Database Optimization Script for FDSJ-739 Evidence Platform
Optimizes SQLite database with indexing, analysis, and defragmentation
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime

DB_PATH = "FDSJ739_EVIDENCE.db"

def get_db_connection():
    """Create database connection"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return None
    return sqlite3.connect(DB_PATH)

def get_db_size():
    """Get database file size in MB"""
    size_bytes = os.path.getsize(DB_PATH)
    return size_bytes / (1024 * 1024)

def create_indexes(conn):
    """Create strategic indexes for performance"""
    cursor = conn.cursor()
    
    indexes = [
        ("exhibits", ["category", "priority", "date"]),
        ("exhibits", ["date"]),
        ("ocr_content", ["exhibit_id"]),
        ("ocr_content", ["filename"]),
        ("ocr_content", ["sender"]),
        ("ocr_content", ["recipient"]),
        ("ocr_content", ["processed_date"]),
    ]
    
    created = 0
    for table, columns in indexes:
        col_str = ", ".join(columns)
        index_name = f"idx_{table}_{'_'.join(columns)}"
        
        try:
            cursor.execute(f"""
            CREATE INDEX IF NOT EXISTS {index_name} 
            ON {table}({col_str})
            """)
            created += 1
            print(f"✓ Index: {index_name}")
        except sqlite3.Error as e:
            print(f"⚠️  Could not create index {index_name}: {e}")
    
    conn.commit()
    return created

def analyze_database(conn):
    """Run ANALYZE to update query planner statistics"""
    cursor = conn.cursor()
    cursor.execute("ANALYZE")
    conn.commit()
    print("✓ Database analyzed (statistics updated)")

def vacuum_database(conn):
    """Defragment database"""
    cursor = conn.cursor()
    cursor.execute("VACUUM")
    conn.commit()
    print("✓ Database vacuumed (defragmented)")

def check_fts_status(conn):
    """Verify FTS5 table status"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT count(*) FROM ocr_content_fts")
        fts_count = cursor.fetchone()[0]
        print(f"✓ FTS5 Index: {fts_count} documents indexed")
        return True
    except sqlite3.OperationalError:
        print("⚠️  FTS5 table not found or corrupted")
        return False

def get_table_stats(conn):
    """Get statistics about database contents"""
    cursor = conn.cursor()
    stats = {}
    
    # Check tables
    cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    """)
    
    for table_name, in cursor.fetchall():
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        stats[table_name] = count
    
    return stats

def main():
    """Main optimization routine"""
    print("=" * 50)
    print("FDSJ-739 Database Optimization")
    print("=" * 50)
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        return 1
    
    try:
        # Initial stats
        print("\n📊 Database Status:")
        print(f"  Size: {get_db_size():.2f} MB")
        
        table_stats = get_table_stats(conn)
        for table, count in table_stats.items():
            print(f"  {table}: {count:,} rows")
        
        # Optimization steps
        print("\n⚙️  Optimizing...")
        
        idx_count = create_indexes(conn)
        print(f"  Created/verified {idx_count} indexes")
        
        analyze_database(conn)
        check_fts_status(conn)
        vacuum_database(conn)
        
        # Final stats
        print("\n📊 Optimized Database:")
        print(f"  Size: {get_db_size():.2f} MB")
        print(f"  Last optimized: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n✅ Optimization complete!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    finally:
        conn.close()

if __name__ == "__main__":
    exit(main())
