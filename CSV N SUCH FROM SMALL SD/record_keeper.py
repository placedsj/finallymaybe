import os
import shutil
from pathlib import Path

# The path you identified as important
SOURCE_DIR = Path(r"C:\Users\dalec\OneDrive\Documents\harperssafewayhome\EVIDENCE_PHOTOS\drive-download-20251203T114420Z-1-001")
VAULT_DIR = Path(r"C:\Users\dalec\OneDrive\Documents\harperssafewayhome\MASTER_EVIDENCE_VAULT\RECORDS_CSV")

def import_records():
    if not SOURCE_DIR.exists():
        print(f"❌ Error: Path not found {SOURCE_DIR}")
        return

    VAULT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📊 Scanning for important records...")
    
    count = 0
    for root, _, files in os.walk(SOURCE_DIR):
        for f in files:
            if f.lower().endswith('.csv'):
                source_path = Path(root) / f
                dest_path = VAULT_DIR / f
                
                try:
                    # Using copy2 to keep the 'last modified' date of the record
                    shutil.copy2(source_path, dest_path)
                    print(f"✅ Imported Record: {f}")
                    count += 1
                except Exception as e:
                    print(f"❌ Failed to copy {f}: {e}")

    print(f"\n✅ Done. {count} CSV records secured in the Vault.")

if __name__ == "__main__":
    import_records()
