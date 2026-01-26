#!/usr/bin/env python3
"""
Email Extractor - Extract emails from CSV, EML, and MBOX files
"""

import sqlite3
import csv
import email
import mailbox
from pathlib import Path
from datetime import datetime
import json
import hashlib

class EmailExtractor:
    def __init__(self, db_path="evidence_database/database/evidence.db"):
        self.db_path = Path(db_path)
        self.conn = sqlite3.connect(self.db_path)
        self.extracted_count = 0
        
    def extract_from_csv(self, csv_path):
        """Extract emails from Gmail/Outlook CSV export"""
        print(f"\n📧 Processing CSV: {csv_path}")
        print("="*60)
        
        with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
            # Try to detect CSV format
            sample = f.read(1024)
            f.seek(0)
            
            reader = csv.DictReader(f)
            
            for row in reader:
                try:
                    self._process_csv_row(row, csv_path)
                except Exception as e:
                    print(f"⚠️  Error processing row: {e}")
        
        self.conn.commit()
        print(f"\n✅ Extracted {self.extracted_count} emails from CSV")
    
    def _process_csv_row(self, row, source_file):
        """Process a single CSV row"""
        cursor = self.conn.cursor()
        
        # Try to extract email fields (Gmail format)
        from_addr = row.get('From', row.get('from', ''))
        to_addr = row.get('To', row.get('to', ''))
        subject = row.get('Subject', row.get('subject', ''))
        body = row.get('Body', row.get('body', row.get('Content', '')))
        date_sent = row.get('Date', row.get('date', row.get('Timestamp', '')))
        
        # Create unique hash for this email
        email_hash = hashlib.sha256(
            f"{from_addr}{to_addr}{subject}{date_sent}".encode()
        ).hexdigest()
        
        # Check if email already exists
        cursor.execute("SELECT id FROM evidence_items WHERE file_hash = ?", (email_hash,))
        if cursor.fetchone():
            return
        
        # Insert into evidence_items
        cursor.execute("""
            INSERT INTO evidence_items (
                file_path, file_name, file_type, file_hash, source_type,
                extracted_text, indexed_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            str(source_file),
            f"Email_{from_addr}_{date_sent[:10] if date_sent else 'unknown'}.eml",
            '.eml',
            email_hash,
            'email',
            f"{subject}\n\n{body}",
            datetime.now().isoformat()
        ))
        
        evidence_id = cursor.lastrowid
        
        # Insert into emails table
        cursor.execute("""
            INSERT INTO emails (
                evidence_id, from_address, to_address, subject, body, date_sent
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (evidence_id, from_addr, to_addr, subject, body, date_sent))
        
        # Insert into search index
        cursor.execute("""
            INSERT INTO search_index (content, source_type, category, exhibit_number, file_name, date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{subject} {body}",
            'email',
            'COMMUNICATION',
            '',
            f"Email from {from_addr}",
            date_sent
        ))
        
        self.extracted_count += 1
        
        if self.extracted_count % 100 == 0:
            print(f"✅ Extracted {self.extracted_count} emails...")
            self.conn.commit()
    
    def extract_from_eml(self, eml_path):
        """Extract from individual .eml file"""
        print(f"\n📧 Processing EML: {eml_path}")
        
        with open(eml_path, 'rb') as f:
            msg = email.message_from_binary_file(f)
        
        self._process_email_message(msg, eml_path)
        self.conn.commit()
        
        print(f"✅ Extracted email from {eml_path}")
    
    def extract_from_mbox(self, mbox_path):
        """Extract from MBOX archive"""
        print(f"\n📧 Processing MBOX: {mbox_path}")
        print("="*60)
        
        mbox = mailbox.mbox(mbox_path)
        
        for message in mbox:
            try:
                self._process_email_message(message, mbox_path)
            except Exception as e:
                print(f"⚠️  Error processing message: {e}")
        
        self.conn.commit()
        print(f"\n✅ Extracted {self.extracted_count} emails from MBOX")
    
    def _process_email_message(self, msg, source_file):
        """Process an email.message.Message object"""
        cursor = self.conn.cursor()
        
        # Extract fields
        from_addr = msg.get('From', '')
        to_addr = msg.get('To', '')
        cc_addr = msg.get('Cc', '')
        subject = msg.get('Subject', '')
        date_sent = msg.get('Date', '')
        
        # Extract body
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
        else:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        
        # Create hash
        email_hash = hashlib.sha256(
            f"{from_addr}{to_addr}{subject}{date_sent}".encode()
        ).hexdigest()
        
        # Check if exists
        cursor.execute("SELECT id FROM evidence_items WHERE file_hash = ?", (email_hash,))
        if cursor.fetchone():
            return
        
        # Insert into evidence_items
        cursor.execute("""
            INSERT INTO evidence_items (
                file_path, file_name, file_type, file_hash, source_type,
                extracted_text, indexed_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            str(source_file),
            f"Email_{from_addr}_{date_sent[:10] if date_sent else 'unknown'}.eml",
            '.eml',
            email_hash,
            'email',
            f"{subject}\n\n{body}",
            datetime.now().isoformat()
        ))
        
        evidence_id = cursor.lastrowid
        
        # Insert into emails table
        cursor.execute("""
            INSERT INTO emails (
                evidence_id, from_address, to_address, cc_address, subject, body, date_sent
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (evidence_id, from_addr, to_addr, cc_addr, subject, body, date_sent))
        
        # Insert into search index
        cursor.execute("""
            INSERT INTO search_index (content, source_type, category, exhibit_number, file_name, date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"{subject} {body}",
            'email',
            'COMMUNICATION',
            '',
            f"Email from {from_addr}",
            date_sent
        ))
        
        self.extracted_count += 1
        
        if self.extracted_count % 50 == 0:
            print(f"✅ Extracted {self.extracted_count} emails...")
    
    def get_stats(self):
        """Get email extraction statistics"""
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print("📊 EMAIL STATISTICS")
        print("="*60)
        
        cursor.execute("SELECT COUNT(*) FROM emails")
        total = cursor.fetchone()[0]
        print(f"\n📧 Total emails: {total:,}")
        
        # Top senders
        print("\n👤 Top Senders:")
        cursor.execute("""
            SELECT from_address, COUNT(*) as count
            FROM emails
            GROUP BY from_address
            ORDER BY count DESC
            LIMIT 10
        """)
        for row in cursor.fetchall():
            print(f"   {row[0]:40s}: {row[1]:,}")
        
        # Emails by date
        print("\n📅 Emails by Year:")
        cursor.execute("""
            SELECT substr(date_sent, 1, 4) as year, COUNT(*) as count
            FROM emails
            WHERE date_sent IS NOT NULL AND date_sent != ''
            GROUP BY year
            ORDER BY year DESC
        """)
        for row in cursor.fetchall():
            print(f"   {row[0]}: {row[1]:,}")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python email_extractor.py <file_path>")
        print("\nSupported formats:")
        print("  • CSV (Gmail/Outlook export)")
        print("  • EML (individual email files)")
        print("  • MBOX (email archives)")
        print("\nExample:")
        print("  python email_extractor.py emails.csv")
        print("  python email_extractor.py message.eml")
        print("  python email_extractor.py archive.mbox")
        sys.exit(1)
    
    file_path = Path(sys.argv[1])
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        sys.exit(1)
    
    extractor = EmailExtractor()
    
    if file_path.suffix.lower() == '.csv':
        extractor.extract_from_csv(file_path)
    elif file_path.suffix.lower() == '.eml':
        extractor.extract_from_eml(file_path)
    elif file_path.suffix.lower() == '.mbox':
        extractor.extract_from_mbox(file_path)
    else:
        print(f"❌ Unsupported file type: {file_path.suffix}")
        sys.exit(1)
    
    extractor.get_stats()
    extractor.close()

if __name__ == "__main__":
    main()
