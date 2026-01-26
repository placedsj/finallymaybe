#!/usr/bin/env python3
"""
Exhibit Finder - Automated Evidence Discovery Tool
Scans directories to find exhibits based on your exhibit list
"""

import os
import csv
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple
import re
import hashlib

class ExhibitFinder:
    def __init__(self, search_dirs: List[str], exhibit_list_path: str):
        self.search_dirs = [Path(d) for d in search_dirs]
        self.exhibit_list_path = Path(exhibit_list_path)
        self.exhibits = []
        self.found_matches = []
        self.missing_exhibits = []
        
    def load_exhibit_list(self):
        """Load exhibit list from CSV file"""
        print(f"📋 Loading exhibit list from: {self.exhibit_list_path}")
        
        with open(self.exhibit_list_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            self.exhibits = list(reader)
        
        print(f"✅ Loaded {len(self.exhibits)} exhibits from list\n")
        return self.exhibits
    
    def scan_directories(self) -> List[Dict]:
        """Scan all search directories for files"""
        all_files = []
        
        print("🔍 Scanning directories for files...")
        for search_dir in self.search_dirs:
            if not search_dir.exists():
                print(f"⚠️  Directory not found: {search_dir}")
                continue
                
            print(f"   Scanning: {search_dir}")
            
            for root, dirs, files in os.walk(search_dir):
                for file in files:
                    file_path = Path(root) / file
                    
                    # Skip system files
                    if file.startswith('.') or file.startswith('~'):
                        continue
                    
                    # Get file info
                    try:
                        stat = file_path.stat()
                        file_info = {
                            'path': str(file_path),
                            'name': file,
                            'size': stat.st_size,
                            'modified': datetime.fromtimestamp(stat.st_mtime),
                            'extension': file_path.suffix.lower()
                        }
                        all_files.append(file_info)
                    except Exception as e:
                        print(f"⚠️  Error reading {file_path}: {e}")
        
        print(f"✅ Found {len(all_files)} total files\n")
        return all_files
    
    def calculate_match_score(self, exhibit: Dict, file_info: Dict) -> Tuple[float, List[str]]:
        """Calculate how well a file matches an exhibit"""
        score = 0.0
        reasons = []
        
        exhibit_num = exhibit.get('Exhibit Number', '').strip()
        exhibit_desc = exhibit.get('Description', '').lower()
        exhibit_date = exhibit.get('Date', '')
        exhibit_keywords = exhibit.get('Keywords', '').lower()
        
        file_name = file_info['name'].lower()
        file_name_no_ext = Path(file_info['name']).stem.lower()
        
        # Exact exhibit number match in filename (highest priority)
        if exhibit_num and exhibit_num.lower() in file_name:
            score += 100
            reasons.append(f"Exhibit number '{exhibit_num}' in filename")
        
        # Date match
        if exhibit_date:
            # Try to extract date from filename
            date_patterns = [
                r'(\d{4}[-_]\d{2}[-_]\d{2})',  # YYYY-MM-DD or YYYY_MM_DD
                r'(\d{2}[-_]\d{2}[-_]\d{4})',  # MM-DD-YYYY or MM_DD_YYYY
                r'(\d{8})',                     # YYYYMMDD
            ]
            for pattern in date_patterns:
                match = re.search(pattern, file_name)
                if match:
                    if exhibit_date.replace('-', '').replace('/', '') in match.group(1).replace('-', '').replace('_', ''):
                        score += 50
                        reasons.append(f"Date match: {exhibit_date}")
                        break
        
        # Keyword matching
        if exhibit_keywords:
            keywords = [k.strip() for k in exhibit_keywords.split(',')]
            matched_keywords = []
            for keyword in keywords:
                if keyword and keyword in file_name:
                    score += 20
                    matched_keywords.append(keyword)
            if matched_keywords:
                reasons.append(f"Keywords: {', '.join(matched_keywords)}")
        
        # Description word matching
        if exhibit_desc:
            desc_words = [w for w in exhibit_desc.split() if len(w) > 3]
            matched_words = []
            for word in desc_words[:5]:  # Check first 5 significant words
                if word in file_name_no_ext:
                    score += 10
                    matched_words.append(word)
            if matched_words:
                reasons.append(f"Description words: {', '.join(matched_words)}")
        
        # File type matching
        expected_type = exhibit.get('File Type', '').lower()
        if expected_type:
            if expected_type in file_info['extension']:
                score += 15
                reasons.append(f"File type match: {file_info['extension']}")
        
        return score, reasons
    
    def match_exhibits(self, files: List[Dict]):
        """Match files to exhibits"""
        print("🎯 Matching files to exhibits...\n")
        
        for exhibit in self.exhibits:
            exhibit_num = exhibit.get('Exhibit Number', 'Unknown')
            best_match = None
            best_score = 0
            best_reasons = []
            
            for file_info in files:
                score, reasons = self.calculate_match_score(exhibit, file_info)
                
                if score > best_score:
                    best_score = score
                    best_match = file_info
                    best_reasons = reasons
            
            if best_match and best_score >= 30:  # Minimum threshold
                match_result = {
                    'exhibit': exhibit,
                    'file': best_match,
                    'score': best_score,
                    'reasons': best_reasons,
                    'status': 'FOUND'
                }
                self.found_matches.append(match_result)
                print(f"✅ Exhibit {exhibit_num}: FOUND")
                print(f"   File: {best_match['name']}")
                print(f"   Score: {best_score}")
                print(f"   Reasons: {', '.join(best_reasons)}")
                print()
            else:
                self.missing_exhibits.append({
                    'exhibit': exhibit,
                    'status': 'MISSING',
                    'best_score': best_score
                })
                print(f"❌ Exhibit {exhibit_num}: NOT FOUND")
                print(f"   Description: {exhibit.get('Description', 'N/A')}")
                print()
    
    def generate_report(self, output_path: str = 'exhibit_finder_report.json'):
        """Generate JSON report of findings"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_exhibits': len(self.exhibits),
                'found': len(self.found_matches),
                'missing': len(self.missing_exhibits),
                'success_rate': f"{(len(self.found_matches) / len(self.exhibits) * 100):.1f}%"
            },
            'found_matches': self.found_matches,
            'missing_exhibits': self.missing_exhibits
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📊 SUMMARY")
        print(f"{'='*60}")
        print(f"Total Exhibits: {report['summary']['total_exhibits']}")
        print(f"Found: {report['summary']['found']} ✅")
        print(f"Missing: {report['summary']['missing']} ❌")
        print(f"Success Rate: {report['summary']['success_rate']}")
        print(f"\n📄 Full report saved to: {output_path}")
        
        return report
    
    def generate_upload_script(self, output_path: str = 'upload_exhibits.txt'):
        """Generate list of file paths to upload"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("# Exhibit Files to Upload\n")
            f.write(f"# Generated: {datetime.now()}\n")
            f.write(f"# Total: {len(self.found_matches)} files\n\n")
            
            for match in sorted(self.found_matches, key=lambda x: x['exhibit'].get('Exhibit Number', '')):
                exhibit_num = match['exhibit'].get('Exhibit Number', 'Unknown')
                file_path = match['file']['path']
                f.write(f"# Exhibit {exhibit_num}\n")
                f.write(f"{file_path}\n\n")
        
        print(f"📝 Upload list saved to: {output_path}")

def main():
    """Main execution"""
    print("="*60)
    print("🔍 EXHIBIT FINDER - Automated Evidence Discovery")
    print("="*60)
    print()
    
    # Configuration
    SEARCH_DIRECTORIES = [
        r"C:\Users\dalec\OneDrive\Desktop",
        r"C:\Users\dalec\Documents",
        r"C:\Users\dalec\Downloads",
        # Add more directories as needed
    ]
    
    EXHIBIT_LIST_CSV = "exhibit_list.csv"
    
    # Create finder instance
    finder = ExhibitFinder(SEARCH_DIRECTORIES, EXHIBIT_LIST_CSV)
    
    # Load exhibit list
    finder.load_exhibit_list()
    
    # Scan directories
    files = finder.scan_directories()
    
    # Match exhibits
    finder.match_exhibits(files)
    
    # Generate reports
    finder.generate_report()
    finder.generate_upload_script()
    
    print("\n✅ Exhibit discovery complete!")

if __name__ == "__main__":
    main()
