#!/usr/bin/env python3
"""
Evidence Database Builder
Creates the SQLite database with full schema for evidence management
"""

import sqlite3
from pathlib import Path
from datetime import datetime

class EvidenceDatabaseBuilder:
    def __init__(self, db_path="evidence_database/database/evidence.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = None
        
    def create_database(self):
        """Create database with full schema"""
        print("="*60)
        print("🗄️  EVIDENCE DATABASE BUILDER")
        print("="*60)
        print()
        
        self.conn = sqlite3.connect(self.db_path)
        cursor = self.conn.cursor()
        
        print("📋 Creating tables...")
        
        # Main evidence items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evidence_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                file_type TEXT,
                file_hash TEXT,
                file_size INTEGER,
                created_date TEXT,
                modified_date TEXT,
                exhibit_number TEXT,
                category TEXT,
                priority INTEGER DEFAULT 5,
                source_type TEXT,
                extracted_text TEXT,
                metadata_json TEXT,
                indexed_date TEXT,
                notes TEXT
            )
        """)
        print("✅ Created: evidence_items")
        
        # Emails table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER NOT NULL,
                from_address TEXT,
                to_address TEXT,
                cc_address TEXT,
                bcc_address TEXT,
                subject TEXT,
                body TEXT,
                date_sent TEXT,
                attachments_json TEXT,
                thread_id TEXT,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: emails")
        
        # Conversations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER NOT NULL,
                sender TEXT,
                recipient TEXT,
                message_text TEXT,
                timestamp TEXT,
                platform TEXT,
                thread_id TEXT,
                message_type TEXT,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: conversations")
        
        # Images table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER NOT NULL,
                ocr_text TEXT,
                width INTEGER,
                height INTEGER,
                exif_data_json TEXT,
                has_faces BOOLEAN,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: images")
        
        # PDFs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pdfs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER NOT NULL,
                page_count INTEGER,
                author TEXT,
                title TEXT,
                subject TEXT,
                creator TEXT,
                producer TEXT,
                creation_date TEXT,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: pdfs")
        
        # Documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER NOT NULL,
                doc_type TEXT,
                author TEXT,
                title TEXT,
                subject TEXT,
                keywords TEXT,
                created TEXT,
                modified TEXT,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: documents")
        
        # Processing log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS processing_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id INTEGER,
                action TEXT,
                status TEXT,
                error_message TEXT,
                timestamp TEXT,
                FOREIGN KEY (evidence_id) REFERENCES evidence_items(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created: processing_log")
        
        # Create indexes for faster searching
        print("\n📊 Creating indexes...")
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_file_hash ON evidence_items(file_hash)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_exhibit_number ON evidence_items(exhibit_number)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON evidence_items(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_source_type ON evidence_items(source_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_date ON evidence_items(created_date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_from ON emails(from_address)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_subject ON emails(subject)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_date ON emails(date_sent)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversation_sender ON conversations(sender)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversation_timestamp ON conversations(timestamp)")
        
        print("✅ Created indexes")
        
        # Create full-text search virtual table
        print("\n🔍 Creating full-text search...")
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
                content,
                source_type,
                category,
                exhibit_number,
                file_name,
                date
            )
        """)
        print("✅ Created: search_index (FTS5)")
        
        self.conn.commit()
        
        # Create metadata table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS database_metadata (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        
        cursor.execute("""
            INSERT OR REPLACE INTO database_metadata (key, value)
            VALUES ('created_date', ?), ('version', '1.0'), ('last_updated', ?)
        """, (datetime.now().isoformat(), datetime.now().isoformat()))
        
        self.conn.commit()
        
        print("\n" + "="*60)
        print("✅ DATABASE CREATED SUCCESSFULLY")
        print("="*60)
        print(f"📁 Location: {self.db_path.absolute()}")
        print(f"📊 Tables: 8 main tables + 1 FTS5 search table")
        print(f"🔍 Indexes: 10 indexes for fast queries")
        print()
        
        # Show table stats
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        print("📋 Tables created:")
        for table in tables:
            if not table[0].startswith('sqlite_'):
                print(f"   • {table[0]}")
        
        print("\n✅ Ready to process evidence!")
        
    def get_stats(self):
        """Get database statistics"""
        if not self.conn:
            self.conn = sqlite3.connect(self.db_path)
        
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print("📊 DATABASE STATISTICS")
        print("="*60)
        
        # Count records in each table
        tables = ['evidence_items', 'emails', 'conversations', 'images', 'pdfs', 'documents']
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table:20s}: {count:,} records")
        
        # Get database size
        db_size = self.db_path.stat().st_size
        print(f"\n💾 Database size: {db_size / 1024 / 1024:.2f} MB")
        
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def main():
    """Main execution"""
    builder = EvidenceDatabaseBuilder()
    builder.create_database()
    builder.get_stats()
    builder.close()

if __name__ == "__main__":
    main()
