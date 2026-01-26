import csv
import os
import difflib

NOTEBOOK_CSV = r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\notebooklm_exhibits.csv"
EVIDENCE_DIR = r"C:\Users\dalec\OneDrive\Desktop\harperssafewayhome\MASTER_EVIDENCE_VAULT\CORE_CUSTODY_EVIDENCE"
OUTPUT_REPORT = "EVIDENCE_AUDIT_REPORT.md"
CLEAN_CSV = "CLEAN_FDSJ739_DATA.csv"

def is_relevant(row):
    # Keywords for this specific case
    keywords = ["Craig", "Emma", "Harper", "Schulz", "Ryan", "FDSJ", "Meth", "Assault", "Diaper", "Black Eye", "SJPF"]
    combined = " ".join(str(v) for v in row.values()).lower()
    
    # Exclude obvious unrelated templates
    if "kuldip" in combined or "maureen" in combined or "constitution" in combined or "columbia law" in combined:
        return False
        
    for k in keywords:
        if k.lower() in combined:
            return True
    return False

def main():
    print("Reading NotebookLM CSV...")
    relevant_rows = []
    headers = []
    
    try:
        with open(NOTEBOOK_CSV, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames
            for row in reader:
                if is_relevant(row):
                    relevant_rows.append(row)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    print(f"Found {len(relevant_rows)} relevant rows out of original file.")

    # List evidence files
    print("Scanning Evidence Directory...")
    try:
        evidence_files = os.listdir(EVIDENCE_DIR)
    except Exception as e:
        print(f"Error reading evidence dir: {e}")
        evidence_files = []

    # Matching logic
    matches = []
    missing_files = []
    
    # Create simple map of lower-case filenames for exact-ish matching
    files_lower = {f.lower(): f for f in evidence_files}
    
    for row in relevant_rows:
        desc = row.get('Description', '') or row.get('Keywords', '')
        ex_num = row.get('Exhibit Number', 'Unknown')
        file_hint = row.get('File Type', '') # Sometimes contains filename hint in 'Keywords' column in this messy CSV?
        
        # In the CSV viewed, the 'Keywords' often had file-like names or 'Original - Screenshot' was in legal significance?
        # Let's look at the structure: Exhibit Number,Description,Date,Category,Priority,File Type,Keywords,Legal Significance,Status,Source
        # Row 39: Keywords="black eye photo craig assault"
        
    # Manual Overrides for known tricky files
    manual_matches = {
        "A-1": ["DECEMBER10THDAMAGETOFACEWHARPER.jpg", "black eye", "injury", "face", "bruise"],
        "A-4": ["rash", "medical", "skin", "bum", "diaper"],
        "A-6": ["pipe", "torch", "meth", "drug", "paraphernalia"],
        "A-7": ["police", "arrest", "charge", "2390069"],
        "A-56": ["craig", "drug", "negative", "test"],
        "A-11": ["breastmilk", "milk", "nursing"]
    }

    for row in relevant_rows:
        desc = row.get('Description', '') or row.get('Keywords', '')
        ex_num = row.get('Exhibit Number', 'Unknown')
        keywords_str = row.get('Keywords', '')
        
        match_found = None
        
        # 1. Check Manual Overrides first
        if ex_num in manual_matches:
            target_keywords = manual_matches[ex_num]
            best_score = 0
            for ev_file in evidence_files:
                # If exact filename match
                if ev_file in target_keywords:
                    match_found = ev_file
                    break
                
                # Check keyword overlap count
                hits = sum(1 for k in target_keywords if k.lower() in ev_file.lower())
                if hits > best_score:
                    best_score = hits
                    best_match = ev_file
            
            if not match_found and best_score >= 1: # at least one keyword for override
                 match_found = best_match

        # 2. Key Word Search (Fallback)
        if not match_found:
            keywords_list = keywords_str.split()
            # Clean keywords
            keywords_list = [k for k in keywords_list if len(k) > 3] 
            
            if len(keywords_list) > 0:
                best_score = 0
                best_file = None
                
                for ev_file in evidence_files:
                    hits = sum(1 for k in keywords_list if k.lower() in ev_file.lower())
                    if hits > best_score:
                        best_score = hits
                        best_file = ev_file
                
                if best_score >= 2: # Require stronger match for generic
                    match_found = best_file
                elif best_score == 1 and len(keywords_list) == 1:
                    match_found = best_file

        row['MATCHED_FILE'] = match_found if match_found else "MISSING"
        matches.append(row)

    # Write Clean CSV
    clean_headers = headers + ['MATCHED_FILE']
    with open(CLEAN_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=clean_headers)
        writer.writeheader()
        writer.writerows(matches)

    # Write Report
    with open(OUTPUT_REPORT, 'w', encoding='utf-8') as f:
        f.write("# NotebookLM Evidence Audit Report\n\n")
        f.write(f"**Total Relevant Entries Found:** {len(matches)}\n")
        f.write(f"**Source CSV:** `{NOTEBOOK_CSV}`\n")
        f.write(f"**Evidence Vault:** `{EVIDENCE_DIR}`\n\n")
        
        f.write("## Discrepancy Summary\n")
        f.write("A significant number of unrelated 'template' rows (Kuldip Singh, US Constitution) were filtered out.\n\n")
        
        f.write("## Evidence Status\n\n")
        f.write("| Exhibit | Description | Keywords | Matched File in Vault |\n")
        f.write("|---------|-------------|----------|-----------------------|\n")
        for row in matches:
            status = "✅ " + row['MATCHED_FILE'] if row['MATCHED_FILE'] != "MISSING" else "❌ MISSING"
            f.write(f"| {row.get('Exhibit Number')} | {row.get('Description')[:50]}... | {row.get('Keywords')} | {status} |\n")

    print(f"Done. Report saved to {OUTPUT_REPORT}")

if __name__ == "__main__":
    main()
