import csv
import glob
import os

OCR_DIR = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\CSV N SUCH FROM SMALL SD"
ocr_files = glob.glob(os.path.join(OCR_DIR, "*ocr*.csv"))

if not ocr_files:
    print("No files found!")
else:
    target_file = ocr_files[0]
    print(f"Reading: {target_file}")
    
    with open(target_file, 'r', encoding='utf-8', errors='ignore') as f:
        # Read the first few lines as plain text to check for BOM or weirdness
        print("\n--- First 3 lines raw ---")
        f.seek(0)
        for _ in range(3):
            print(repr(f.readline()))
            
        f.seek(0)
        reader = csv.DictReader(f)
        print(f"\nDetected Fieldnames: {reader.fieldnames}")
        
        try:
            row = next(reader)
            print("\n--- First Row Parsed ---")
            for k, v in row.items():
                print(f"Key: {repr(k)} | Value Length: {len(v) if v else 0} | Value Preview: {repr(v)[:50]}...")
        except StopIteration:
            print("File is empty (no data rows).")
