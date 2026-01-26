import json
import os
import re
from datetime import datetime

# Paths
CATALOG_PATH = r"c:\Users\dalec\OneDrive\Desktop\BIGTIMEEEE\EVIDENCE_VAULT_CATALOG.json"
OUTPUT_PATH = r"c:\Users\dalec\OneDrive\Desktop\MASTER_INDEX_300.md"
CORE_EVIDENCE_DIR = r"c:\Users\dalec\OneDrive\Desktop\harperssafewayhome\MASTER_EVIDENCE_VAULT\CORE_CUSTODY_EVIDENCE"

# Categories and Keywords
CATEGORIES = {
    "HARD_EVIDENCE": {
        "keywords": ["acquittal", "assault", "complaint", "RCMP", "police", "verdict", "REPLY-12-03", "FORMAL COMPLAINT", "Canon", "SJPF", "arrest", "Drug Test", "Negative", "Dilute", "EXHIBIT A-5", "EXHIBIT A-56"],
        "weight": 10
    },
    "GAP_130_DAYS": {
        "keywords": ["Nov 12", "Christmas", "denied", "access", "GPS", "log", "message", "2025-11", "2025-12", "blackout", "silence", "bounced", "11-12-2025", "craig-emma-email"],
        "weight": 8
    },
    "STABILITY_BLUEPRINT": {
        "keywords": ["PLACED", "Harper's Place", "app", "blueprint", "co-parenting", "accord", "parenting plan", "User Interface", "renovation", "Stock Farm", "Home & Roofing"],
        "weight": 8
    },
    "SYSTEM_LOOP": {
        "keywords": ["Jane", "Ryan", "Henderson", "Gallant", "SJPF", "misconduct", "regulatory", "conflict", "bias", "Social Development", "TRANSCRIBED AFFIDAVIT", "HARPERRYAN11-12-2024"],
        "weight": 9
    }
}

def load_catalog(path):
    if not os.path.exists(path):
        print(f"Catalog not found at {path}. Scanning CORE_EVIDENCE_DIR instead.")
        return scan_directory(CORE_EVIDENCE_DIR)
    
    # Try multiple encodings
    for encoding in ['utf-8-sig', 'utf-16', 'utf-8', 'latin-1']:
        try:
            print(f"Trying to load JSON with encoding: {encoding}")
            with open(path, 'r', encoding=encoding) as f:
                return json.load(f)
        except (json.JSONDecodeError, UnicodeError):
            continue
            
    print("Failed to decode JSON with all standard encodings. Scanning directory instead.")
    return scan_directory(CORE_EVIDENCE_DIR)

def scan_directory(directory):
    files = []
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return files
        
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            file_path = os.path.join(root, filename)
            files.append({
                "name": filename,
                "path": file_path,
                "size": os.path.getsize(file_path),
                "modified": os.path.getmtime(file_path)
            })
    return files

def score_file(file_info):
    # Handle PowerShell JSON keys (Capitalized) and standard keys
    filename = file_info.get('Name') or file_info.get('name') or os.path.basename(file_info.get('FullName') or file_info.get('path') or '')
    path = file_info.get('FullName') or file_info.get('path') or ''
    
    if not filename and not path:
        return 0, "OTHER"
    
    best_score = 0
    assigned_category = "OTHER"
    
    for category, details in CATEGORIES.items():
        score = 0
        for keyword in details["keywords"]:
            if keyword.lower() in filename.lower() or keyword.lower() in path.lower():
                score += details["weight"]
        
        # Boost for Supplementals/JSON metadata
        if ".json" in filename:
            score -= 2 # De-prioritize raw json metadata unless it hits heavy keywords
            
        if score > best_score:
            best_score = score
            assigned_category = category
            
    return best_score, assigned_category

def generate_markdown(scored_files):
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write("# FDSJ-739-24 MASTER INDEX: THE LETHAL 300\n")
        f.write("**Generated:** " + datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n")
        f.write("This index represents the consolidated 'truth system' filtered from 5,000+ files.\n\n")
        
        categories_content = {cat: [] for cat in CATEGORIES.keys()}
        categories_content["OTHER"] = []
        
        for file_data in scored_files:
            score, category, info = file_data
            if score > 0:
                categories_content[category].append((score, info))
                
        # Hard Limit to ~300 total (approx 75 per category if balanced, but we just take top scoring)
        
        for category, items in categories_content.items():
            if not items: continue
            
            f.write(f"## {category.replace('_', ' ')}\n")
            f.write("| Score | File Name | Path |\n")
            f.write("|-------|-----------|------|\n")
            
            # Sort by score descending
            sorted_items = sorted(items, key=lambda x: x[0], reverse=True)
            
            for score, info in sorted_items[:100]: # Cap each category to avoid bloat
                name = info.get('Name') or info.get('name') or os.path.basename(info.get('FullName') or info.get('path') or 'Unknown')
                path = info.get('FullName') or info.get('path') or 'Unknown'
                f.write(f"| {score} | {name} | `{path}` |\n")
            f.write("\n")

def main():
    print("Loading catalog...")
    files = load_catalog(CATALOG_PATH)
    print(f"Loaded {len(files)} files.")
    
    scored_files = []
    print("Scoring files...")
    for f in files:
        # Normalize file object structure depending on where it came from (API vs Scan)
        # Assuming list of dicts or dict of dicts
        file_info = f if isinstance(f, dict) else {"name": str(f)}
        
        score, category = score_file(file_info)
        if score > 0:
            scored_files.append((score, category, file_info))
            
    print(f"Found {len(scored_files)} relevant files.")
    
    generate_markdown(scored_files)
    print(f"Master Index generated at: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
