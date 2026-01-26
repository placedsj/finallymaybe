"""
Unified Evidence Database System for FDSJ 739-24
Consolidates all exhibit inventories and maps to 20-module filing blueprint
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
import threading

class EvidenceDatabase:
    def __init__(self, db_path="evidence.db"):
        self.db_path = db_path
        self._local = threading.local()
        self.init_database()
    
    def get_connection(self):
        """Get or create a thread-local database connection"""
        if not hasattr(self._local, 'conn') or self._local.conn is None:
            self._local.conn = sqlite3.connect(
                self.db_path, 
                check_same_thread=False  # Allow connection sharing, but we manage it per thread
            )
            self._local.conn.row_factory = sqlite3.Row
            # Optimize performance
            self._local.conn.execute("PRAGMA journal_mode=WAL")
            self._local.conn.execute("PRAGMA synchronous=NORMAL")
            self._local.conn.execute("PRAGMA cache_size=-64000")  # 64MB cache
        return self._local.conn
    
    def init_database(self):
        """Initialize SQLite database with comprehensive schema"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Main exhibits table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS exhibits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exhibit_number TEXT UNIQUE NOT NULL,
                description TEXT NOT NULL,
                date TEXT,
                category TEXT NOT NULL,
                priority INTEGER NOT NULL,
                file_type TEXT,
                keywords TEXT,
                legal_significance TEXT,
                status TEXT,
                source_inventory TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add Indices for Performance
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_exhibits_category ON exhibits(category)",
            "CREATE INDEX IF NOT EXISTS idx_exhibits_priority ON exhibits(priority)",
            "CREATE INDEX IF NOT EXISTS idx_exhibits_date ON exhibits(date)",
            "CREATE INDEX IF NOT EXISTS idx_exhibits_keywords ON exhibits(keywords)"
        ]
        
        for idx in indices:
            cursor.execute(idx)
        
        # Module mapping table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS module_mappings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exhibit_number TEXT NOT NULL,
                module_number INTEGER NOT NULL,
                module_name TEXT NOT NULL,
                relevance_note TEXT,
                FOREIGN KEY (exhibit_number) REFERENCES exhibits(exhibit_number)
            )
        """)
        
        # Filing modules table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS filing_modules (
                module_number INTEGER PRIMARY KEY,
                module_name TEXT NOT NULL,
                focus TEXT NOT NULL,
                system_prompt TEXT NOT NULL,
                completion_status TEXT DEFAULT 'Not Started'
            )
        """)
        
        # Missing evidence tracker
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS missing_evidence (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL,
                description TEXT,
                referenced_in TEXT,
                priority INTEGER,
                status TEXT DEFAULT 'Pending'
            )
        """)
        
        self.get_connection().commit()
    
    def add_exhibit(self, exhibit_data, source_inventory):
        """Add or update an exhibit"""
        cursor = self.get_connection().cursor()
        
        exhibit_data['source_inventory'] = source_inventory
        
        cursor.execute("""
            INSERT OR REPLACE INTO exhibits 
            (exhibit_number, description, date, category, priority, file_type, 
             keywords, legal_significance, status, source_inventory)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exhibit_data.get('exhibit_number'),
            exhibit_data.get('description'),
            exhibit_data.get('date'),
            exhibit_data.get('category'),
            exhibit_data.get('priority'),
            exhibit_data.get('file_type'),
            exhibit_data.get('keywords'),
            exhibit_data.get('legal_significance'),
            exhibit_data.get('status'),
            exhibit_data.get('source_inventory')
        ))
        
        self.get_connection().commit()
        return cursor.lastrowid
    
    def map_exhibit_to_module(self, exhibit_number, module_number, module_name, relevance_note=""):
        """Map an exhibit to a filing module"""
        cursor = self.get_connection().cursor()
        cursor.execute("""
            INSERT INTO module_mappings 
            (exhibit_number, module_number, module_name, relevance_note)
            VALUES (?, ?, ?, ?)
        """, (exhibit_number, module_number, module_name, relevance_note))
        self.get_connection().commit()
    
    def search_exhibits(self, keyword=None, category=None, min_priority=None, limit=None, offset=0):
        """Search exhibits by various criteria with pagination"""
        cursor = self.get_connection().cursor()
        
        query = "SELECT * FROM exhibits WHERE 1=1"
        params = []
        
        if keyword:
            query += " AND (keywords LIKE ? OR description LIKE ?)"
            params.extend([f"%{keyword}%", f"%{keyword}%"])
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if min_priority:
            query += " AND priority >= ?"
            params.append(min_priority)
        
        query += " ORDER BY priority DESC, exhibit_number"
        
        if limit:
            query += " LIMIT ? OFFSET ?"
            params.extend([limit, offset])
        
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_critical_exhibits(self):
        """Get all Priority 10 exhibits"""
        return self.search_exhibits(min_priority=10)
    
    def get_exhibits_by_module(self, module_number):
        """Get all exhibits mapped to a specific module"""
        cursor = self.get_connection().cursor()
        cursor.execute("""
            SELECT e.*, m.relevance_note 
            FROM exhibits e
            JOIN module_mappings m ON e.exhibit_number = m.exhibit_number
            WHERE m.module_number = ?
            ORDER BY e.priority DESC
        """, (module_number,))
        return [dict(row) for row in cursor.fetchall()]
    
    def get_stats(self):
        """Get database statistics"""
        cursor = self.get_connection().cursor()
        
        stats = {}
        
        # Total exhibits
        cursor.execute("SELECT COUNT(*) as count FROM exhibits")
        stats['total_exhibits'] = cursor.fetchone()['count']
        
        # By category
        cursor.execute("""
            SELECT category, COUNT(*) as count 
            FROM exhibits 
            GROUP BY category 
            ORDER BY count DESC
        """)
        stats['by_category'] = {row['category']: row['count'] for row in cursor.fetchall()}
        
        # By priority
        cursor.execute("""
            SELECT priority, COUNT(*) as count 
            FROM exhibits 
            GROUP BY priority 
            ORDER BY priority DESC
        """)
        stats['by_priority'] = {row['priority']: row['count'] for row in cursor.fetchall()}
        
        # Critical exhibits
        stats['critical_count'] = len(self.get_critical_exhibits())
        
        return stats
    
    def export_exhibit_index(self, output_file="exhibit_index.txt"):
        """Export formatted exhibit index for court filing"""
        cursor = self.get_connection().cursor()
        cursor.execute("SELECT * FROM exhibits ORDER BY exhibit_number")
        exhibits = cursor.fetchall()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("EXHIBIT INDEX - SCHULZ V. RYAN (FDSJ 739-24)\n")
            f.write("=" * 80 + "\n\n")
            
            for exhibit in exhibits:
                f.write(f"Exhibit {exhibit['exhibit_number']}\n")
                f.write(f"  Description: {exhibit['description']}\n")
                f.write(f"  Date: {exhibit['date'] or 'Unknown'}\n")
                f.write(f"  Category: {exhibit['category']} | Priority: {exhibit['priority']}\n")
                f.write(f"  Legal Significance: {exhibit['legal_significance']}\n")
                f.write(f"  Status: {exhibit['status']}\n")
                f.write("-" * 80 + "\n\n")
        
        return output_file
    
    def close(self):
        """Close database connection"""
        if self.get_connection():
            self.get_connection().close()


# Initialize and populate database
def populate_database():
    """Populate database with all three exhibit inventories"""
    db = EvidenceDatabase()
    
    # Inventory Set 3 - Latest and most comprehensive
    inventory_3 = [
        {"exhibit_number": "A-1", "description": "Photograph of Craig Schulz's black eye following assault", "date": "2024-11-19", "category": "SAFETY", "priority": 10, "file_type": "jpg", "keywords": "black eye assault injury", "legal_significance": "Physical evidence of domestic violence victim status", "status": "Original - Photograph"},
        {"exhibit_number": "A-2", "description": "Text message from Applicant admitting to hitting Respondent", "date": "2024-11-21", "category": "PERJURY", "priority": 10, "file_type": "png", "keywords": "text sorry hitting admission", "legal_significance": "Irrefutable admission of violence; refutes Applicant's abuse claims", "status": "Original - Screenshot"},
        {"exhibit_number": "A-3", "description": "Summary of events regarding mirror shattering incident", "date": "2024-11-30", "category": "SAFETY", "priority": 8, "file_type": "pdf", "keywords": "mirror shatter violence summary", "legal_significance": "Documents pattern of aggressive behavior and property damage", "status": "Original - Document"},
        {"exhibit_number": "A-4", "description": "Photographs documenting Harper's severe diaper rash and healing", "date": "2024-11-17", "category": "SAFETY", "priority": 9, "file_type": "jpg", "keywords": "diaper rash neglect healing", "legal_significance": "Evidence of neglect under Applicant and recovery under Respondent", "status": "Original - Photograph"},
        {"exhibit_number": "A-5", "description": "Meticulous records of Harper's weight and milestones", "date": "2024-11-12", "category": "INTEGRITY", "priority": 8, "file_type": "pdf", "keywords": "weight records milestones care", "legal_significance": "Demonstrates Respondent's consistent and proactive parental care", "status": "Original - Log"},
        {"exhibit_number": "A-6", "description": "Text from Applicant inviting Respondent for sexual intercourse", "date": "2025-02-09", "category": "INTEGRITY", "priority": 9, "file_type": "png", "keywords": "text invitation sex contradiction", "legal_significance": "Contradicts Applicant's sworn claims of fear and desire for no contact", "status": "Original - Screenshot"},
        {"exhibit_number": "A-7", "description": "Communication logs and police wellness check records", "date": "2024-12-09", "category": "OBSTRUCTION", "priority": 9, "file_type": "pdf", "keywords": "police wellness check logs", "legal_significance": "Refutes claim of no updates; proves Applicant feared drug test", "status": "Original - Government Record"},
        {"exhibit_number": "A-8", "description": "Photos and receipts for essential items purchased for Harper", "date": "Unknown", "category": "FINANCIAL", "priority": 7, "file_type": "jpg", "keywords": "receipts carseat highchair clothing", "legal_significance": "Proves Respondent provides necessities Applicant fails to supply", "status": "Original - Receipts/Photos"},
        {"exhibit_number": "A-9", "description": "Screenshots of Applicant's account lockouts/numerical errors", "date": "Unknown", "category": "INTEGRITY", "priority": 6, "file_type": "png", "keywords": "account lockout dyscalculia pattern", "legal_significance": "Supports claim of undisclosed disability impacting stability", "status": "Original - Screenshot"},
        {"exhibit_number": "A-11", "description": "Communication logs between Respondent and Jane Ryan", "date": "2024-12-10", "category": "COMMUNICATION", "priority": 7, "file_type": "pdf", "keywords": "jane ryan conversation well-being", "legal_significance": "Documents proactive efforts to ensure child's safety with family", "status": "Original - Log"},
        {"exhibit_number": "A-12", "description": "Interim Order on Consent granting parenting time", "date": "2025-03-22", "category": "OBSTRUCTION", "priority": 10, "file_type": "pdf", "keywords": "interim order consent court", "legal_significance": "Establishes legal parenting time Applicant has systematically breached", "status": "Copy - Court Record"},
        {"exhibit_number": "A-13", "description": "Comprehensive log of 105+ consecutive days of denied access", "date": "2025-06-04", "category": "OBSTRUCTION", "priority": 10, "file_type": "pdf", "keywords": "denied access log 105 days", "legal_significance": "Proves systematic parental alienation and contempt of court", "status": "Original - Log"},
        {"exhibit_number": "A-14", "description": "Log of 51 unanswered calls and June 18 'October' email", "date": "2025-06-18", "category": "OBSTRUCTION", "priority": 10, "file_type": "pdf", "keywords": "unanswered calls email october", "legal_significance": "Proves deliberate intent to block access until final hearing", "status": "Original - Screenshot/Log"},
        {"exhibit_number": "A-17", "description": "Video thumbnail/summary of Nov 19 assault with infant present", "date": "2024-11-19", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "video summary thumbnail assault", "legal_significance": "Captures violence and endangerment while Respondent held child", "status": "Original - Summary/Thumbnail"},
        {"exhibit_number": "A-18", "description": "Video thumbnail/summary of Dec 9 'Where's my drugs' incident", "date": "2024-12-09", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "video summary drugs rod", "legal_significance": "Proves drug-seeking rage and assault with child in arms", "status": "Original - Summary/Thumbnail"},
        {"exhibit_number": "A-21", "description": "Financial records of Applicant's substance-related mismanagement", "date": "2024-07-01", "category": "FINANCIAL", "priority": 9, "file_type": "pdf", "keywords": "financial mismanagement drug expenditures", "legal_significance": "Links household fund diversion to suspected drug purchases", "status": "Original - Bank Record"},
        {"exhibit_number": "A-22", "description": "Evidence of e-transfers from Applicant to alleged dealer Tony Baker", "date": "2024-08-01", "category": "FINANCIAL", "priority": 10, "file_type": "pdf", "keywords": "etransfer tony baker dealer", "legal_significance": "Direct financial link to illicit substance acquisition", "status": "Original - Screenshot"},
        {"exhibit_number": "A-23", "description": "Handwritten notes acknowledging smoking and lack of income", "date": "Unknown", "category": "INTEGRITY", "priority": 9, "file_type": "jpg", "keywords": "handwritten notes smoking breastfeeding", "legal_significance": "Admission of substance use during breastfeeding and financial instability", "status": "Original - Document"},
        {"exhibit_number": "A-25", "description": "Police report confirming Respondent escorted for safety", "date": "2024-08-05", "category": "SAFETY", "priority": 8, "file_type": "pdf", "keywords": "police report safety escort", "legal_significance": "Documents early pattern of Applicant's volatility requiring intervention", "status": "Original - Government Record"},
        {"exhibit_number": "A-26", "description": "Police report confirming Respondent as victim of assault", "date": "2024-11-19", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "police report victim assault", "legal_significance": "Third-party corroboration refuting Applicant's abuse claims", "status": "Original - Government Record"},
        {"exhibit_number": "A-33", "description": "Texts evidencing Applicant's relationship with parolee Cole Brook", "date": "2024-10-31", "category": "SAFETY", "priority": 9, "file_type": "png", "keywords": "text cole brook parolee", "legal_significance": "Proves high-risk associations in the home where child resides", "status": "Original - Screenshot"},
        {"exhibit_number": "A-45", "description": "Text: 'Leave it in the mailbox I don't want Craig to bitch'", "date": "Unknown", "category": "SAFETY", "priority": 10, "file_type": "png", "keywords": "mailbox drop drug concealment", "legal_significance": "Direct evidence of clandestine drug acquisition in the home", "status": "Original - Screenshot"},
        {"exhibit_number": "A-47", "description": "Motion for Disclosure of Applicant's financial records", "date": "2025-02-12", "category": "FINANCIAL", "priority": 8, "file_type": "pdf", "keywords": "motion disclosure bank records", "legal_significance": "Formal legal request to expose drug-related financial patterns", "status": "Copy - Court Record"},
        {"exhibit_number": "A-48", "description": "Motion to Compel Medical Records (Prenatal/Postnatal)", "date": "2025-02-12", "category": "SAFETY", "priority": 9, "file_type": "pdf", "keywords": "motion medical records prenatal", "legal_significance": "Seeks truth regarding meth exposure during pregnancy", "status": "Copy - Court Record"},
        {"exhibit_number": "A-60", "description": "Veterinary Invoice for Luna ($531.28 paid by Respondent)", "date": "2025-01-09", "category": "FINANCIAL", "priority": 6, "file_type": "pdf", "keywords": "vet bill luna care", "legal_significance": "Rebuts claim that Applicant cared for Respondent's pets", "status": "Original - Invoice"},
        {"exhibit_number": "A-61", "description": "Birth Certificate Long-Form purchase confirmation", "date": "2025-01-01", "category": "INTEGRITY", "priority": 7, "file_type": "pdf", "keywords": "birth certificate order receipt", "legal_significance": "Proves Respondent's proactive steps to secure child's identity", "status": "Original - Receipt"},
        {"exhibit_number": "A-63", "description": "Formal Complaint against Social Worker Jacqueline Gallant", "date": "2025-02-08", "category": "INTEGRITY", "priority": 10, "file_type": "pdf", "keywords": "complaint gallant conflict misconduct", "legal_significance": "Documents systemic conflict of interest and failure to protect child", "status": "Original - Document"},
        {"exhibit_number": "K-1", "description": "Photo of Applicant with propane torch and meth pipe", "date": "2025-05-21", "category": "SAFETY", "priority": 10, "file_type": "jpg", "keywords": "photo meth pipe torch", "legal_significance": "Smoking gun visual evidence of active methamphetamine use", "status": "Original - Photograph"},
        {"exhibit_number": "M-1", "description": "Text Admission: 'I'm really sorry for hitting you Craig'", "date": "2024-11-21", "category": "PERJURY", "priority": 10, "file_type": "png", "keywords": "text admission sorry hitting", "legal_significance": "Direct evidence Applicant lied about being the abuse victim", "status": "Original - Screenshot"},
        {"exhibit_number": "Q-1", "description": "Saint John Police Interaction Log (Comprehensive)", "date": "2024-06-01", "category": "INTEGRITY", "priority": 9, "file_type": "pdf", "keywords": "police log sjpf interactions", "legal_significance": "Proves pattern of Respondent instigating police to document safety", "status": "Original - Government Record"},
        {"exhibit_number": "R-1", "description": "Criminal Assault Charge Confirmation (SJPF 25-2390069)", "date": "2025-09-23", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "criminal charge assault emma", "legal_significance": "Third-party verification of Applicant's criminal violence", "status": "Original - Government Record"},
        {"exhibit_number": "S-1", "description": "FaceTime/Text Thread: The Nick Incident (Intoxicated Person)", "date": "2025-04-01", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "nick incident intoxicated bath", "legal_significance": "Proves Applicant lied to hide intoxicated person near child in bath", "status": "Original - Screenshot/Log"},
        {"exhibit_number": "T-1", "description": "Applicant's 'Negative - Dilute' drug test result", "date": "2025-01-29", "category": "SAFETY", "priority": 10, "file_type": "pdf", "keywords": "drug test dilute emma", "legal_significance": "Suggests deliberate attempt to mask methamphetamine use", "status": "Copy - Government Record"},
        {"exhibit_number": "T-2", "description": "Respondent's Clean 13-Panel drug test result", "date": "2025-01-31", "category": "INTEGRITY", "priority": 9, "file_type": "pdf", "keywords": "drug test negative craig", "legal_significance": "Scientifically proves Respondent's sobriety and parental fitness", "status": "Original - Government Record"},
        {"exhibit_number": "Z-1", "description": "Log of 51 unanswered calls over 7-week period", "date": "2025-07-20", "category": "OBSTRUCTION", "priority": 10, "file_type": "pdf", "keywords": "call log unanswered torture", "legal_significance": "Factual record of Applicant's absolute refusal to co-parent", "status": "Original - Log"},
    ]
    
    for exhibit in inventory_3:
        db.add_exhibit(exhibit, "Inventory_3_Comprehensive")
    
    print(f"✓ Loaded {len(inventory_3)} exhibits from Inventory Set 3")
    
    # Get stats
    stats = db.get_stats()
    print(f"\n📊 Database Statistics:")
    print(f"   Total Exhibits: {stats['total_exhibits']}")
    print(f"   Critical (Priority 10): {stats['critical_count']}")
    print(f"\n   By Category:")
    for category, count in stats['by_category'].items():
        print(f"      {category}: {count}")
    
    return db


if __name__ == "__main__":
    db = populate_database()
    
    # Export exhibit index
    index_file = db.export_exhibit_index()
    print(f"\n✓ Exported exhibit index to: {index_file}")
    
    # Show critical exhibits
    print(f"\n🔴 CRITICAL EXHIBITS (Priority 10):")
    critical = db.get_critical_exhibits()
    for ex in critical:
        print(f"   {ex['exhibit_number']}: {ex['description'][:60]}...")
    
    db.close()
