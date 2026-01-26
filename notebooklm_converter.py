#!/usr/bin/env python3
"""
NotebookLM CSV Converter - Convert NotebookLM exhibit extraction to Exhibit Finder format
"""

import csv
import sys
from pathlib import Path

def convert_notebooklm_to_exhibit_finder(input_csv, output_csv="exhibit_list_converted.csv"):
    """
    Convert NotebookLM CSV format to Exhibit Finder format
    
    Expected NotebookLM columns:
    - Exhibit Number
    - Description
    - Date
    - Category
    - Priority
    - File Type
    - Keywords
    - Legal Significance
    - Status
    - Source
    
    Output Exhibit Finder columns:
    - Exhibit Number
    - Description
    - Date
    - Keywords
    - File Type
    - Category
    - Priority
    """
    
    print("="*60)
    print("📋 NOTEBOOKLM CSV CONVERTER")
    print("="*60)
    print(f"Input: {input_csv}")
    print(f"Output: {output_csv}")
    print()
    
    exhibits = []
    
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Map NotebookLM format to Exhibit Finder format
            exhibit = {
                'Exhibit Number': row.get('Exhibit Number', ''),
                'Description': row.get('Description', ''),
                'Date': row.get('Date', 'Unknown'),
                'Keywords': row.get('Keywords', ''),
                'File Type': row.get('File Type', 'pdf'),
                'Category': row.get('Category', 'INTEGRITY'),
                'Priority': row.get('Priority', '5')
            }
            
            exhibits.append(exhibit)
    
    # Write to Exhibit Finder format
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Exhibit Number', 'Description', 'Date', 'Keywords', 'File Type', 'Category', 'Priority']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(exhibits)
    
    print(f"✅ Converted {len(exhibits)} exhibits")
    print(f"📁 Output saved to: {output_csv}")
    print()
    print("Next steps:")
    print(f"  1. Run: python exhibit_finder.py")
    print(f"  2. Review: exhibit_finder_report.json")
    print(f"  3. Upload found exhibits to app")

def main():
    if len(sys.argv) < 2:
        print("Usage: python notebooklm_converter.py <input_csv>")
        print("\nExample:")
        print("  python notebooklm_converter.py notebooklm_exhibits.csv")
        sys.exit(1)
    
    input_csv = sys.argv[1]
    
    if not Path(input_csv).exists():
        print(f"❌ File not found: {input_csv}")
        sys.exit(1)
    
    convert_notebooklm_to_exhibit_finder(input_csv)

if __name__ == "__main__":
    main()
