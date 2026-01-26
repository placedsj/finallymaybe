#!/usr/bin/env python3
"""
Exhibit Copier - Copy found exhibits to organized folder
"""

import os
import json
import shutil
from pathlib import Path
from datetime import datetime

def copy_exhibits():
    """Copy all found exhibits to organized folder"""
    
    # Paths
    report_path = Path("exhibit_finder_report.json")
    destination_base = Path(r"C:\Users\dalec\OneDrive\Desktop\Exhibits")
    
    # Create destination folder
    destination_base.mkdir(exist_ok=True)
    
    print("="*60)
    print("📂 EXHIBIT COPIER - Organizing Your Evidence")
    print("="*60)
    print()
    
    # Load the report
    with open(report_path, 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    found_matches = report['found_matches']
    
    print(f"📋 Found {len(found_matches)} exhibits to copy")
    print(f"📁 Destination: {destination_base}")
    print()
    
    copied = 0
    failed = 0
    skipped = 0
    
    for match in found_matches:
        exhibit_num = match['exhibit']['Exhibit Number']
        source_path = Path(match['file']['path'])
        file_ext = match['file']['extension']
        
        # Create clean filename
        exhibit_desc = match['exhibit']['Description'][:50]  # Truncate long descriptions
        # Remove invalid filename characters
        clean_desc = "".join(c for c in exhibit_desc if c.isalnum() or c in (' ', '-', '_')).strip()
        
        # New filename: EXHIBIT_A-1_Description.ext
        new_filename = f"EXHIBIT_{exhibit_num}_{clean_desc}{file_ext}"
        destination_path = destination_base / new_filename
        
        # Check if source exists
        if not source_path.exists():
            print(f"❌ {exhibit_num}: Source file not found")
            print(f"   {source_path}")
            failed += 1
            continue
        
        # Check if already copied
        if destination_path.exists():
            print(f"⏭️  {exhibit_num}: Already exists, skipping")
            skipped += 1
            continue
        
        # Copy the file
        try:
            shutil.copy2(source_path, destination_path)
            print(f"✅ {exhibit_num}: Copied")
            print(f"   → {new_filename}")
            copied += 1
        except Exception as e:
            print(f"❌ {exhibit_num}: Copy failed - {e}")
            failed += 1
    
    print()
    print("="*60)
    print("📊 COPY SUMMARY")
    print("="*60)
    print(f"✅ Copied: {copied}")
    print(f"⏭️  Skipped (already exist): {skipped}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Total files in folder: {copied + skipped}")
    print()
    print(f"📂 Open folder: {destination_base}")
    print()
    print("✅ All exhibits organized and ready to upload!")

if __name__ == "__main__":
    copy_exhibits()
