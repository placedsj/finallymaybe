#!/usr/bin/env python3
"""
Google Takeout Extractor - Process all Takeout data into evidence database
Handles: Gmail, Google Photos, Drive, Messages, Activity, etc.
"""

import os
import json
import sqlite3
import email
import mailbox
from pathlib import Path
from datetime import datetime
import hashlib
import csv

class TakeoutExtractor:
    def __init__(self, db_path="evidence_database/database/evidence.db"):
        self.db_path = Path(db_path)
        self.conn = sqlite3.connect(self.db_path)
        self.processed_count = 0
        self.email_count = 0
        self.photo_count = 0
        self.message_count = 0
        
    def process_takeout_folder(self, takeout_path):
        """Process entire Takeout folder"""
        takeout_path = Path(takeout_path)
        
        print("="*60)
        print("📦 GOOGLE TAKEOUT EXTRACTOR")
        print("="*60)
        print(f"📁 Processing: {takeout_path}")
        print()
        
        # Find Takeout subdirectory
        if (takeout_path / "Takeout").exists():
            takeout_path = takeout_path / "Takeout"
        
        # Process each service
        self._process_mail(takeout_path / "Mail")
        self._process_photos(takeout_path / "Google Photos")
        self._process_drive(takeout_path / "Drive")
        self._process_activity(takeout_path / "My Activity")
        self._process_messages(takeout_path / "Messages")
        self._process_location(takeout_path / "Location History")
        
        self.conn.commit()
        
        print("\n" + "="*60)
        print("📊 TAKEOUT EXTRACTION COMPLETE")
        print("="*60)
        print(f"📧 Emails: {self.email_count:,}")
        print(f"🖼️  Photos: {self.photo_count:,}")
        print(f"💬 Messages: {self.message_count:,}")
        print(f"📁 Total items: {self.processed_count:,}")
    
    def _process_mail(self, mail_path):
        """Process Gmail MBOX files"""
        if not mail_path.exists():
            print("⏭️  No Mail folder found")
            return
        
        print("\n📧 Processing Gmail...")
        
        # Find all .mbox files
        mbox_files = list(mail_path.rglob("*.mbox"))
        
        for mbox_file in mbox_files:
            print(f"   Processing: {mbox_file.name}")
            try:
                mbox = mailbox.mbox(mbox_file)
                for message in mbox:
                    self._save_email(message, str(mbox_file))
                    self.email_count += 1
                    if self.email_count % 100 == 0:
                        print(f"   ✅ {self.email_count} emails processed...")
                        self.conn.commit()
            except Exception as e:
                print(f"   ⚠️  Error: {e}")
    
    def _save_email(self, msg, source_file):
        """Save email to database"""
        cursor = self.conn.cursor()
        
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
                    try:
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        break
                    except:
                        pass
        else:
            try:
                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
            except:
                body = str(msg.get_payload())
        
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
                extracted_text, indexed_date, created_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_file,
            f"Email_{from_addr[:30]}_{date_sent[:10] if date_sent else 'unknown'}.eml",
            '.eml',
            email_hash,
            'email',
            f"{subject}\n\n{body}",
            datetime.now().isoformat(),
            date_sent
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
        
        self.processed_count += 1
    
    def _process_photos(self, photos_path):
        """Process Google Photos"""
        if not photos_path.exists():
            print("⏭️  No Google Photos folder found")
            return
        
        print("\n🖼️  Processing Google Photos...")
        
        cursor = self.conn.cursor()
        
        # Find all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.webp']
        
        for ext in image_extensions:
            for img_file in photos_path.rglob(f"*{ext}"):
                try:
                    # Check if already in database
                    cursor.execute("SELECT id FROM evidence_items WHERE file_path = ?", (str(img_file),))
                    if cursor.fetchone():
                        continue
                    
                    # Get file stats
                    stat = img_file.stat()
                    file_hash = self._calculate_hash(img_file)
                    
                    # Look for JSON metadata
                    json_file = img_file.with_suffix(img_file.suffix + '.json')
                    metadata = {}
                    if json_file.exists():
                        with open(json_file, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                    
                    # Insert into evidence_items
                    cursor.execute("""
                        INSERT INTO evidence_items (
                            file_path, file_name, file_type, file_hash, file_size,
                            created_date, modified_date, source_type, indexed_date,
                            metadata_json
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(img_file),
                        img_file.name,
                        img_file.suffix.lower(),
                        file_hash,
                        stat.st_size,
                        metadata.get('photoTakenTime', {}).get('formatted', datetime.fromtimestamp(stat.st_ctime).isoformat()),
                        datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        'image',
                        datetime.now().isoformat(),
                        json.dumps(metadata)
                    ))
                    
                    evidence_id = cursor.lastrowid
                    
                    # Insert into images table
                    cursor.execute("""
                        INSERT INTO images (evidence_id, ocr_text, exif_data_json)
                        VALUES (?, ?, ?)
                    """, (evidence_id, '', json.dumps(metadata)))
                    
                    self.photo_count += 1
                    self.processed_count += 1
                    
                    if self.photo_count % 100 == 0:
                        print(f"   ✅ {self.photo_count} photos processed...")
                        self.conn.commit()
                        
                except Exception as e:
                    print(f"   ⚠️  Error processing {img_file.name}: {e}")
    
    def _process_drive(self, drive_path):
        """Process Google Drive files"""
        if not drive_path.exists():
            print("⏭️  No Drive folder found")
            return
        
        print("\n📁 Processing Google Drive files...")
        
        cursor = self.conn.cursor()
        doc_count = 0
        
        # Process PDFs and documents
        for file_path in drive_path.rglob("*"):
            if not file_path.is_file():
                continue
            
            if file_path.suffix.lower() in ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']:
                try:
                    # Check if already in database
                    cursor.execute("SELECT id FROM evidence_items WHERE file_path = ?", (str(file_path),))
                    if cursor.fetchone():
                        continue
                    
                    stat = file_path.stat()
                    file_hash = self._calculate_hash(file_path)
                    
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
                        'pdf' if file_path.suffix.lower() == '.pdf' else 'document',
                        datetime.now().isoformat()
                    ))
                    
                    doc_count += 1
                    self.processed_count += 1
                    
                    if doc_count % 50 == 0:
                        print(f"   ✅ {doc_count} documents processed...")
                        self.conn.commit()
                        
                except Exception as e:
                    print(f"   ⚠️  Error: {e}")
        
        print(f"   ✅ Total: {doc_count} documents")
    
    def _process_activity(self, activity_path):
        """Process My Activity data"""
        if not activity_path.exists():
            print("⏭️  No My Activity folder found")
            return
        
        print("\n📊 Processing My Activity...")
        # Activity data is usually in JSON format
        # Can be processed for timeline reconstruction
        print("   ℹ️  Activity processing available - implement as needed")
    
    def _process_messages(self, messages_path):
        """Process Messages/SMS data"""
        if not messages_path.exists():
            print("⏭️  No Messages folder found")
            return
        
        print("\n💬 Processing Messages...")
        
        cursor = self.conn.cursor()
        
        # Look for messages JSON
        for json_file in messages_path.rglob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Process messages
                if isinstance(data, list):
                    for msg in data:
                        self._save_message(msg, str(json_file))
                        self.message_count += 1
                        
                if self.message_count % 100 == 0:
                    print(f"   ✅ {self.message_count} messages processed...")
                    self.conn.commit()
                    
            except Exception as e:
                print(f"   ⚠️  Error: {e}")
        
        print(f"   ✅ Total: {self.message_count} messages")
    
    def _save_message(self, msg_data, source_file):
        """Save message to database"""
        cursor = self.conn.cursor()
        
        # Extract message fields (format varies by service)
        sender = msg_data.get('sender', msg_data.get('from', ''))
        recipient = msg_data.get('recipient', msg_data.get('to', ''))
        text = msg_data.get('text', msg_data.get('message', msg_data.get('content', '')))
        timestamp = msg_data.get('timestamp', msg_data.get('date', ''))
        
        # Create hash
        msg_hash = hashlib.sha256(
            f"{sender}{recipient}{text}{timestamp}".encode()
        ).hexdigest()
        
        # Check if exists
        cursor.execute("SELECT id FROM evidence_items WHERE file_hash = ?", (msg_hash,))
        if cursor.fetchone():
            return
        
        # Insert into evidence_items
        cursor.execute("""
            INSERT INTO evidence_items (
                file_path, file_name, file_type, file_hash, source_type,
                extracted_text, indexed_date, created_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_file,
            f"Message_{sender}_{timestamp[:10] if timestamp else 'unknown'}.txt",
            '.txt',
            msg_hash,
            'conversation',
            text,
            datetime.now().isoformat(),
            timestamp
        ))
        
        evidence_id = cursor.lastrowid
        
        # Insert into conversations table
        cursor.execute("""
            INSERT INTO conversations (
                evidence_id, sender, recipient, message_text, timestamp, platform
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (evidence_id, sender, recipient, text, timestamp, 'Google Messages'))
        
        # Insert into search index
        cursor.execute("""
            INSERT INTO search_index (content, source_type, category, exhibit_number, file_name, date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            text,
            'conversation',
            'COMMUNICATION',
            '',
            f"Message from {sender}",
            timestamp
        ))
        
        self.processed_count += 1
    
    def _process_location(self, location_path):
        """Process Location History"""
        if not location_path.exists():
            print("⏭️  No Location History folder found")
            return
        
        print("\n📍 Location History found")
        print("   ℹ️  Location processing available - implement as needed")
    
    def _calculate_hash(self, file_path):
        """Calculate SHA-256 hash"""
        sha256 = hashlib.sha256()
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except:
            return ''
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python takeout_extractor.py <takeout_folder>")
        print("\nExample:")
        print("  python takeout_extractor.py C:\\Users\\dalec\\Downloads\\takeout-20251231")
        print("\nThis will process:")
        print("  • Gmail (MBOX files)")
        print("  • Google Photos (with metadata)")
        print("  • Google Drive files")
        print("  • Messages/SMS")
        print("  • Activity data")
        sys.exit(1)
    
    takeout_folder = sys.argv[1]
    
    if not Path(takeout_folder).exists():
        print(f"❌ Folder not found: {takeout_folder}")
        sys.exit(1)
    
    extractor = TakeoutExtractor()
    extractor.process_takeout_folder(takeout_folder)
    extractor.close()
    
    print("\n✅ Takeout extraction complete!")
    print("Run search.py to find evidence in the database.")

if __name__ == "__main__":
    main()
