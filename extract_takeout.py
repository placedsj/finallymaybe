
import os
import zipfile
from pathlib import Path
import sys

def extract_takeout_zips(search_path, output_path):
    search_path = Path(search_path)
    output_path = Path(output_path)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"🔍 Searching for Takeout ZIPs in: {search_path}")
    zips = list(search_path.rglob("takeout-*.zip"))
    
    if not zips:
        print("❌ No 'takeout-*.zip' files found.")
        return

    print(f"📦 Found {len(zips)} ZIP files. Extracting to: {output_path}")
    
    for zip_file in zips:
        print(f"   extracting: {zip_file.name}...")
        try:
            with zipfile.ZipFile(zip_file, 'r') as zf:
                zf.extractall(output_path)
            print("   ✅ Done.")
        except Exception as e:
            print(f"   ❌ Error extracting {zip_file.name}: {e}")

    print("\n✅ All extraction operations complete.")
    print(f"📂 Extracted data is in: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_takeout.py <search_path> <output_path>")
        sys.exit(1)
    
    extract_takeout_zips(sys.argv[1], sys.argv[2])
