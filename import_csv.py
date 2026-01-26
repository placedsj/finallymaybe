"""
Robust CSV Import Script
- Deletes old database to ensure fresh sync
- Handles duplicate exhibit numbers (appends _2, _3 suffix)
- Loads ALL rows from CSV
"""

import csv
import sys
import os
import time
from evidence_database import EvidenceDatabase

def import_csv_robust(csv_path, db_path="evidence.db"):
    # 1. Clear old database
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"🗑️  Deleted old database: {db_path}")
        except Exception as e:
            print(f"⚠️  Could not delete old DB (might be in use): {e}")
            print("   Attempting to merge instead...")

    # 2. Initialize new DB
    db = EvidenceDatabase(db_path)
    print(f"📂 Loading exhibits from: {csv_path}")
    print("=" * 60)
    
    imported_count = 0
    seen_numbers = {} # Track duplicates: {'A-1': 1}
    
    # 3. Read and Insert
    with open(csv_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row_num, row in enumerate(reader, start=2):
            try:
                original_number = row['Exhibit Number'].strip()
                exhibit_number = original_number
                
                # Handle Duplicates
                if original_number in seen_numbers:
                    seen_numbers[original_number] += 1
                    count = seen_numbers[original_number]
                    exhibit_number = f"{original_number}_{count}" # e.g. A-1_2
                else:
                    seen_numbers[original_number] = 1
                
                exhibit_data = {
                    'exhibit_number': exhibit_number,
                    'description': row['Description'].strip(),
                    'date': row['Date'].strip() if row['Date'].strip() != 'Unknown' else None,
                    'category': row['Category'].strip(),
                    'priority': int(row['Priority']) if row['Priority'].strip() else 5,
                    'file_type': row['File Type'].strip() if row['File Type'].strip() else None,
                    'keywords': row['Keywords'].strip(),
                    'legal_significance': row['Legal Significance'].strip(),
                    'status': row['Status'].strip()
                }
                
                db.add_exhibit(exhibit_data, "CSV_Master_Import")
                imported_count += 1
                
                if imported_count % 100 == 0:
                    print(f"   Imported {imported_count} exhibits...")
                
            except Exception as e:
                print(f"❌ Error Row {row_num}: {e}")
                continue

    # 4. Final Verification
    stats = db.get_stats()
    print("=" * 60)
    print(f"✅ FINAL COUNT: {imported_count} exhibits imported")
    print(f"📊 DB Stats Total: {stats['total_exhibits']}")
    print("=" * 60)
    
    db.close()
    return imported_count

if __name__ == "__main__":
    csv_file = r"C:\Users\dalec\Downloads\Exhibit and Evidence Tracking Table - Table 1 (1).csv"
    import_csv_robust(csv_file)
