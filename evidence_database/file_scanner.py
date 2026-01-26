#!/usr/bin/env python3
"""
File Scanner - Catalogs all files and generates hashes
"""

import os
import sqlite3
import hashlib
from pathlib import Path
from datetime import datetime
import json

class FileScanner:
    def __init__(self, db_path="evidence_database/database/evidence.db"):
        self.db_path = Path(db_path)
        self.conn = sqlite3.connect(self.db_path)
        self.scanned_count = 0
        self.added_count = 0
        self.skipped_count = 0
        
    def calculate_hash(self, file_path):
        """Calculate SHA-256 hash of file"""
        sha256 = hashlib.sha256()
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except Exception as e:
            print(f"⚠️  Error hashing {file_path}: {e}")
            return None
    
    def get_file_type(self, file_path):
        """Determine file type category"""
        ext = file_path.suffix.lower()
        
        # Email formats
        if ext in ['.eml', '.msg', '.mbox']:
            return 'email'
        
        # Image formats
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']:
            return 'image'
        
        # PDF
        if ext == '.pdf':
            return 'pdf'
        
        # Documents
        if ext in ['.doc', '.docx', '.txt', '.rtf', '.odt']:
            return 'document'
        
        # Spreadsheets
        if ext in ['.xls', '.xlsx', '.csv', '.ods']:
            return 'spreadsheet'
        
        # Videos
        if ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm']:
            return 'video'
        
        # Audio
        if ext in ['.mp3', '.wav', '.ogg', '.m4a', '.flac']:
            return 'audio'
        
        # Archives
        if ext in ['.zip', '.rar', '.7z', '.tar', '.gz']:
            return 'archive'
        
        return 'other'
    
    def scan_directory(self, directory, recursive=True):
        """Scan directory and add files to database"""
        directory = Path(directory)
        
        print(f"\n🔍 Scanning: {directory}")
        print("="*60)
        
        if recursive:
            files = directory.rglob('*')
        else:
            files = directory.glob('*')
        
        cursor = self.conn.cursor()
        
        for file_path in files:
            if not file_path.is_file():
                continue
            
            # Skip system files
            if file_path.name.startswith('.') or file_path.name.startswith('~'):
                continue
            
            # Skip the database itself
            if file_path == self.db_path:
                continue
            
            self.scanned_count += 1
            
            # Check if already in database
            cursor.execute("SELECT id FROM evidence_items WHERE file_path = ?", (str(file_path),))
            if cursor.fetchone():
                self.skipped_count += 1
                if self.scanned_count % 100 == 0:
                    print(f"⏭️  Scanned {self.scanned_count} files ({self.added_count} new, {self.skipped_count} skipped)...")
                continue
            
            try:
                # Get file stats
                stat = file_path.stat()
                file_hash = self.calculate_hash(file_path)
                file_type = self.get_file_type(file_path)
                
                # Insert into database
                cursor.execute("""
                    INSERT INTO evidence_items (
                        file_path, file_name, file_type, file_hash, file_size,
                        created_date, modified_date, source_type, indexed_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(file_path),
                    file_path.name,
                    file_path.suffix.lower(),
                    file_hash,
                    stat.st_size,
                    datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    file_type,
                    datetime.now().isoformat()
                ))
                
                self.added_count += 1
                
                if self.added_count % 50 == 0:
                    print(f"✅ Added {self.added_count} files...")
                    self.conn.commit()
                
            except Exception as e:
                print(f"❌ Error processing {file_path.name}: {e}")
        
        self.conn.commit()
        
        print("\n" + "="*60)
        print("📊 SCAN COMPLETE")
        print("="*60)
        print(f"📁 Scanned: {self.scanned_count:,} files")
        print(f"✅ Added: {self.added_count:,} new files")
        print(f"⏭️  Skipped: {self.skipped_count:,} existing files")
        
    def get_summary(self):
        """Get summary of cataloged files"""
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print("📊 DATABASE SUMMARY")
        print("="*60)
        
        # Total files
        cursor.execute("SELECT COUNT(*) FROM evidence_items")
        total = cursor.fetchone()[0]
        print(f"\n📁 Total files: {total:,}")
        
        # By source type
        print("\n📋 By Type:")
        cursor.execute("""
            SELECT source_type, COUNT(*) as count 
            FROM evidence_items 
            GROUP BY source_type 
            ORDER BY count DESC
        """)
        for row in cursor.fetchall():
            print(f"   {row[0]:15s}: {row[1]:,}")
        
        # By file extension
        print("\n📄 Top File Extensions:")
        cursor.execute("""
            SELECT file_type, COUNT(*) as count 
            FROM evidence_items 
            GROUP BY file_type 
            ORDER BY count DESC 
            LIMIT 10
        """)
        for row in cursor.fetchall():
            print(f"   {row[0]:15s}: {row[1]:,}")
        
        # Total size
        cursor.execute("SELECT SUM(file_size) FROM evidence_items")
        total_size = cursor.fetchone()[0] or 0
        print(f"\n💾 Total size: {total_size / 1024 / 1024 / 1024:.2f} GB")
        
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python file_scanner.py <directory> [--no-recursive]")
        print("\nExample:")
        print("  python file_scanner.py C:\\Users\\dalec\\OneDrive\\Desktop")
        print("  python file_scanner.py C:\\Users\\dalec\\Documents --no-recursive")
        sys.exit(1)
    
    directory = sys.argv[1]
    recursive = '--no-recursive' not in sys.argv
    
    scanner = FileScanner()
    scanner.scan_directory(directory, recursive=recursive)
    scanner.get_summary()
    scanner.close()

if __name__ == "__main__":
    main()
