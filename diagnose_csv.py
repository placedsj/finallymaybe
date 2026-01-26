import csv
import glob
import os

OCR_DIR = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CSV N SUCH FROM SMALL SD"
ocr_files = glob.glob(os.path.join(OCR_DIR, "*ocr*.csv"))

print(f"Checking {len(ocr_files)} files...")

for ocr_file in ocr_files[:3]:  # Check first 3 files
    print(f"\nFile: {os.path.basename(ocr_file)}")
    with open(ocr_file, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        print(f"Fieldnames: {reader.fieldnames}")
        try:
            row = next(reader)
            print("First row values:")
            for k, v in row.items():
                short_v = (v[:20] + '...') if v and len(v) > 20 else v
                print(f"  [{k}] -> '{short_v}'")
            
            # Specific check for raw_text
            if 'raw_text' in row:
                print(f"  Direct access 'raw_text': Found, len={len(row['raw_text'])}")
            else:
                print(f"  Direct access 'raw_text': NOT FOUND. Available keys: {list(row.keys())}")
                
        except StopIteration:
            print("  Empty file")
