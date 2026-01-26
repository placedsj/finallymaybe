"""
Google Takeout Evidence Scanner
Scans Google Takeout directory and integrates evidence into database
"""

import os
import json
from pathlib import Path
from evidence_database import EvidenceDatabase
from datetime import datetime

class TakeoutScanner:
    def __init__(self, takeout_path, db_path="evidence.db"):
        self.takeout_path = Path(takeout_path)
        self.db = EvidenceDatabase(db_path)
        self.found_evidence = []
        
        # Critical evidence we're looking for
        self.critical_files = {
            "IMG_0669.MOV": {
                "description": "Video documenting applicant throwing an object that hits the minor child, Harper",
                "category": "SAFETY",
                "priority": 10,
                "date": "2024-12-09",
                "keywords": "assault child harper object throw video",
                "legal_significance": "Direct visual evidence of physical endangerment and assault on a minor child. Critical for establishing a pattern of violence."
            },
            "IMG_0128.MOV": {
                "description": "Video showing aftermath of a shattered mirror, with applicant unclothed, aggressive, and visible blood",
                "category": "SAFETY",
                "priority": 10,
                "date": "2024-11-30",
                "keywords": "shattered mirror blood aggressive weapon video",
                "legal_significance": "Evidence of a violent domestic incident, potential use of a weapon, and an unsafe environment for the child."
            },
            "IMG_0115.MOV": {
                "description": "Video containing applicant's quote 'Fucking leave so I can feed our child'",
                "category": "PERJURY",
                "priority": 9,
                "date": "2024-12-09",
                "keywords": "perjury refutal feed child video",
                "legal_significance": "Directly refutes a potential claim that the applicant was prevented from feeding the child, impacting credibility."
            },
            "IMG_0666.MOV": {
                "description": "Video evidence from December 9th incident",
                "category": "SAFETY",
                "priority": 9,
                "date": "2024-12-09",
                "keywords": "video december assault incident",
                "legal_significance": "Additional video documentation of the critical December 9th assault incident."
            },
            "IMG_0667.MOV": {
                "description": "Video evidence from December 9th incident sequence",
                "category": "SAFETY",
                "priority": 9,
                "date": "2024-12-09",
                "keywords": "video december assault incident",
                "legal_significance": "Part of the 96-minute video sequence documenting the December 9th assault."
            }
        }
    
    def scan_directory(self):
        """Scan the Takeout directory for evidence files"""
        print(f"🔍 Scanning: {self.takeout_path}")
        print("=" * 80)
        
        # Find all video and image files
        video_extensions = ['.mov', '.mp4', '.avi']
        image_extensions = ['.jpg', '.jpeg', '.png']
        
        for root, dirs, files in os.walk(self.takeout_path):
            for file in files:
                file_path = Path(root) / file
                file_ext = file_path.suffix.lower()
                
                # Extract base filename (Google Takeout adds hash suffixes)
                # e.g., "IMG_0669-c8f483d8c905ab39.mov" -> "IMG_0669.MOV"
                base_name = file.split('-')[0].upper()
                if '.' in base_name:
                    base_name = base_name.split('.')[0]
                base_name_with_ext = f"{base_name}{file_ext.upper()}"
                
                # Check if this is a critical evidence file
                if base_name_with_ext in self.critical_files:
                    self.process_critical_file(base_name_with_ext, file_path)
                
                # Also catalog all media files
                elif file_ext in video_extensions or file_ext in image_extensions:
                    self.catalog_media_file(file, file_path)
    
    def process_critical_file(self, filename, file_path):
        """Process a critical evidence file"""
        evidence = self.critical_files[filename.upper()]
        
        # Generate exhibit number (check what's available)
        exhibit_number = self.generate_exhibit_number(filename)
        
        print(f"\n🔴 CRITICAL EVIDENCE FOUND: {filename}")
        print(f"   Path: {file_path}")
        print(f"   Exhibit: {exhibit_number}")
        print(f"   Priority: {evidence['priority']}")
        
        # Add to database
        exhibit_data = {
            'exhibit_number': exhibit_number,
            'description': evidence['description'],
            'date': evidence['date'],
            'category': evidence['category'],
            'priority': evidence['priority'],
            'file_type': file_path.suffix[1:],
            'keywords': evidence['keywords'],
            'legal_significance': evidence['legal_significance'],
            'status': f"Original - Digital Video - Located at {file_path}"
        }
        
        self.db.add_exhibit(exhibit_data, "Google_Takeout_Scan")
        self.found_evidence.append(exhibit_data)
        
        # Map to relevant modules
        if evidence['category'] == 'SAFETY' and evidence['priority'] == 10:
            # Map to Module 7 (December 9th Incident)
            if '2024-12-09' in evidence['date']:
                self.db.map_exhibit_to_module(
                    exhibit_number, 7, 
                    "December 9th Critical Incident Report",
                    "Core video evidence of assault"
                )
            
            # Map to Module 12 (Substance Abuse)
            self.db.map_exhibit_to_module(
                exhibit_number, 12,
                "Substance Abuse Pattern Documentation",
                "Video evidence of drug-seeking behavior"
            )
            
            # Map to Module 14 (Child Endangerment)
            self.db.map_exhibit_to_module(
                exhibit_number, 14,
                "Child Endangerment & Medical Neglect",
                "Direct evidence of child being present during violence"
            )
    
    def catalog_media_file(self, filename, file_path):
        """Catalog a media file for potential future use"""
        # Just log it for now
        pass
    
    def generate_exhibit_number(self, filename):
        """Generate the next available exhibit number"""
        # Check existing exhibits
        existing = self.db.search_exhibits()
        
        # For video files, use V-series
        if filename.upper().endswith('.MOV') or filename.upper().endswith('.MP4'):
            v_numbers = [int(ex['exhibit_number'].split('-')[1]) 
                        for ex in existing 
                        if ex['exhibit_number'].startswith('V-')]
            next_num = max(v_numbers) + 1 if v_numbers else 1
            return f"V-{next_num}"
        else:
            # Use next available A-number
            a_numbers = [int(ex['exhibit_number'].split('-')[1]) 
                        for ex in existing 
                        if ex['exhibit_number'].startswith('A-') and ex['exhibit_number'][2:].isdigit()]
            next_num = max(a_numbers) + 1 if a_numbers else 64
            return f"A-{next_num}"
    
    def generate_report(self):
        """Generate a summary report"""
        print("\n" + "=" * 80)
        print("📊 SCAN SUMMARY")
        print("=" * 80)
        print(f"Total Critical Evidence Found: {len(self.found_evidence)}")
        
        if self.found_evidence:
            print("\n🔴 Critical Evidence Located:")
            for evidence in self.found_evidence:
                print(f"   {evidence['exhibit_number']}: {evidence['description'][:60]}...")
        
        # Update database stats
        stats = self.db.get_stats()
        print(f"\n📈 Updated Database Statistics:")
        print(f"   Total Exhibits: {stats['total_exhibits']}")
        print(f"   Critical (Priority 10): {stats['critical_count']}")
        
        return self.found_evidence
    
    def close(self):
        """Close database connection"""
        self.db.close()


def main():
    """Main execution"""
    takeout_path = r"C:\Users\dalec\OneDrive\Desktop\googldrivereadyforupload\Takeout\Takeout"
    
    print("🚀 Google Takeout Evidence Scanner")
    print("=" * 80)
    print(f"Scanning: {takeout_path}\n")
    
    scanner = TakeoutScanner(takeout_path)
    scanner.scan_directory()
    scanner.generate_report()
    scanner.close()
    
    print("\n✅ Scan complete!")
    print("\nNext steps:")
    print("1. Review located video files")
    print("2. Verify file integrity")
    print("3. Create video summaries for court filing")
    print("4. Update exhibit index")


if __name__ == "__main__":
    main()
