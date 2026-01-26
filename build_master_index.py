import json
import os
import csv
from pathlib import Path

# Configuration
CATALOG_PATH = r"c:\Users\dalec\OneDrive\Desktop\BIGTIMEEEE\EVIDENCE_VAULT_CATALOG.json"
EXHIBIT_DIR = r"c:\Users\dalec\OneDrive\Desktop\EXHIBIT PACKAGE"
CORE_DIR = r"c:\Users\dalec\OneDrive\Desktop\harperssafewayhome\MASTER_EVIDENCE_VAULT\CORE_CUSTODY_EVIDENCE"
OUTPUT_FILE = "MASTER_INDEX.md"
OUTPUT_CSV = "MASTER_EVIDENCE_LIST.csv"

# Keywords & Scoring
SCORING_RULES = {
    "CRITICAL": {
        "keywords": ["ASSAULT", "CHOKING", "KNIFE", "METH", "DRUG", "POISON", "ADULTERATED", "ACQUITTAL", "VERDICT", "NOT GUILTY"],
        "score": 50
    },
    "SYSTEM_LOOP": {
        "keywords": ["JANE RYAN", "HENDERSON", "GALLANT", "NBASW", "CONFLICT", "MISCONDUCT", "COMPLAINT", "PROFESSIONAL MISCONDUCT"],
        "score": 30
    },
    "GAP_DENIAL": {
        "keywords": ["DENIAL", "MISSED", "ACCESS", "GATEKEEPING", "NO CONTACT", "BLOCK", "WITHHELD"],
        "score": 25
    },
    "STABILITY": {
        "keywords": ["HARPER'S PLACE", "PLACED", "BLUEPRINT", "CLEAN", "TEST RESULT", "EVALUATION", "PSYCH", "EMPLOYMENT", "INVOICE"],
        "score": 20
    },
    "EVIDENCE_TYPE": {
        "keywords": ["GPS", "LOG", "CALENDAR", "TIMELINE", "VIDEO", ".MOV", ".MP4", "AFFIDAVIT"],
        "score": 15
    },
    "COMMUNICATION": {
        "keywords": ["TEXT", "EMAIL", "MESSAGE", "SCREENSHOT"],
        "score": 5
    }
}

def load_catalog(path):
    try:
        # Try UTF-16 (common for PowerShell output)
        with open(path, 'r', encoding='utf-16') as f:
            return json.load(f)
    except UnicodeError:
        try:
            # Fallback to UTF-8
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading catalog (UTF-8 fallback): {e}")
            return []
    except Exception as e:
        print(f"Error loading catalog: {e}")
        return []

def scan_directory(path):
    files = []
    for root, _, filenames in os.walk(path):
        for name in filenames:
            files.append({
                "Name": name,
                "FullName": os.path.join(root, name),
                "Source": "Local Scan"
            })
    return files

def calculate_score(file_obj):
    score = 0
    name = file_obj.get("Name", "").upper()
    path = file_obj.get("FullName", "").upper()
    
    # Keyword Scoring
    categories = []
    
    for cat, rules in SCORING_RULES.items():
        for kw in rules["keywords"]:
            if kw in name or kw in path:
                score += rules["score"]
                if cat not in categories:
                    categories.append(cat)
                # Break to avoid double counting same keyword in multiple ways? 
                # No, we want accumulation but maybe not for every keyword in same category
                # Actually, let's allow accumulation to value density
    
    # Context Scoring
    if "CORE_CUSTODY_EVIDENCE" in path:
        score += 20
        categories.append("CORE_EVIDENCE")
    
    if "FORMAL COMPLAINT" in name:
        score += 20
        
    return score, list(set(categories))

def main():
    print("Loading Data...")
    catalog_files = load_catalog(CATALOG_PATH)
    exhibit_files = scan_directory(EXHIBIT_DIR)
    core_files = scan_directory(CORE_DIR)
    
    # Merge and Deduplicate
    all_files = {}
    
    for f in catalog_files + exhibit_files + core_files:
        name = f.get("Name")
        if name and name not in all_files:
            all_files[name] = f
    
    print(f"Total Unique Files Found: {len(all_files)}")
    
    # Score Files
    scored_files = []
    for name, f in all_files.items():
        score, cats = calculate_score(f)
        f["LethalityScore"] = score
        f["Categories"] = ", ".join(cats)
        scored_files.append(f)
    
    # Sort by Score DESC
    scored_files.sort(key=lambda x: x["LethalityScore"], reverse=True)
    
    # Select Top 300
    top_300 = scored_files[:300]
    
    # Generate MD Output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# MASTER INDEX: FDSJ-739-24 LETHAL CORE\n")
        f.write(f"**Total Priority Files:** {len(top_300)}\n")
        f.write("**Generated:** {Date}\n\n")
        
        f.write("| Rank | Score | Filename | Categories | Source |\n")
        f.write("|---|---|---|---|---|\n")
        
        for i, item in enumerate(top_300):
            source = "Catalog" if "Length" in item else "Local Scan"
            f.write(f"| {i+1} | {item['LethalityScore']} | `{item['Name']}` | {item['Categories']} | {source} |\n")

    # Generate CSV Output
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Rank', 'LethalityScore', 'Name', 'Categories', 'FullName', 'Source']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for i, item in enumerate(top_300):
            writer.writerow({
                'Rank': i+1,
                'LethalityScore': item['LethalityScore'],
                'Name': item['Name'],
                'Categories': item['Categories'],
                'FullName': item['FullName'],
                'Source': "Catalog" if "Length" in item else "Local Scan"
            })
            
    print(f"Index built: {OUTPUT_FILE} and {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
