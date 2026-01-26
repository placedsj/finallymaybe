#!/usr/bin/env python3
"""
Evidence Search - Command-line search interface
"""

import sqlite3
from pathlib import Path
from datetime import datetime

class EvidenceSearch:
    def __init__(self, db_path="evidence_database/database/evidence.db"):
        self.db_path = Path(db_path)
        if not self.db_path.exists():
            print(f"❌ Database not found: {self.db_path}")
            print("Run database_builder.py first to create the database.")
            exit(1)
        self.conn = sqlite3.connect(self.db_path)
        
    def search(self, query, source_type=None, category=None, date_from=None, date_to=None, limit=50):
        """Search evidence database"""
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print(f"🔍 SEARCHING FOR: '{query}'")
        print("="*60)
        
        # Build SQL query
        sql = """
            SELECT DISTINCT e.id, e.file_name, e.source_type, e.category, 
                   e.exhibit_number, e.created_date, e.extracted_text
            FROM evidence_items e
            LEFT JOIN search_index s ON s.rowid = e.id
            WHERE 1=1
        """
        params = []
        
        # Add search term
        if query:
            sql += " AND (e.extracted_text LIKE ? OR e.file_name LIKE ? OR s.content LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
        
        # Add filters
        if source_type:
            sql += " AND e.source_type = ?"
            params.append(source_type)
        
        if category:
            sql += " AND e.category = ?"
            params.append(category)
        
        if date_from:
            sql += " AND e.created_date >= ?"
            params.append(date_from)
        
        if date_to:
            sql += " AND e.created_date <= ?"
            params.append(date_to)
        
        sql += f" ORDER BY e.created_date DESC LIMIT {limit}"
        
        cursor.execute(sql, params)
        results = cursor.fetchall()
        
        if not results:
            print("\n❌ No results found")
            return []
        
        print(f"\n✅ Found {len(results)} results:\n")
        
        for idx, row in enumerate(results, 1):
            evidence_id, file_name, source_type, category, exhibit_num, date, text = row
            
            print(f"{idx}. {file_name}")
            print(f"   Type: {source_type or 'unknown'} | Category: {category or 'uncategorized'}")
            if exhibit_num:
                print(f"   Exhibit: {exhibit_num}")
            print(f"   Date: {date or 'unknown'}")
            
            # Show snippet of matching text
            if text and query:
                # Find query in text
                text_lower = text.lower()
                query_lower = query.lower()
                pos = text_lower.find(query_lower)
                if pos != -1:
                    start = max(0, pos - 50)
                    end = min(len(text), pos + len(query) + 50)
                    snippet = text[start:end]
                    if start > 0:
                        snippet = "..." + snippet
                    if end < len(text):
                        snippet = snippet + "..."
                    print(f"   Match: {snippet}")
            
            print()
        
        return results
    
    def search_emails(self, query, from_addr=None, to_addr=None, date_from=None):
        """Search specifically in emails"""
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print(f"📧 EMAIL SEARCH: '{query}'")
        print("="*60)
        
        sql = """
            SELECT e.id, em.from_address, em.to_address, em.subject, 
                   em.body, em.date_sent, ei.file_name
            FROM emails e
            JOIN evidence_items ei ON e.evidence_id = ei.id
            LEFT JOIN emails em ON e.id = em.id
            WHERE (em.subject LIKE ? OR em.body LIKE ?)
        """
        params = [f"%{query}%", f"%{query}%"]
        
        if from_addr:
            sql += " AND em.from_address LIKE ?"
            params.append(f"%{from_addr}%")
        
        if to_addr:
            sql += " AND em.to_address LIKE ?"
            params.append(f"%{to_addr}%")
        
        if date_from:
            sql += " AND em.date_sent >= ?"
            params.append(date_from)
        
        sql += " ORDER BY em.date_sent DESC LIMIT 50"
        
        cursor.execute(sql, params)
        results = cursor.fetchall()
        
        if not results:
            print("\n❌ No emails found")
            return []
        
        print(f"\n✅ Found {len(results)} emails:\n")
        
        for idx, row in enumerate(results, 1):
            email_id, from_addr, to_addr, subject, body, date_sent, file_name = row
            
            print(f"{idx}. {subject or '(No Subject)'}")
            print(f"   From: {from_addr}")
            print(f"   To: {to_addr}")
            print(f"   Date: {date_sent}")
            
            # Show snippet
            if body and query:
                body_lower = body.lower()
                query_lower = query.lower()
                pos = body_lower.find(query_lower)
                if pos != -1:
                    start = max(0, pos - 50)
                    end = min(len(body), pos + len(query) + 50)
                    snippet = body[start:end]
                    if start > 0:
                        snippet = "..." + snippet
                    if end < len(body):
                        snippet = snippet + "..."
                    print(f"   Preview: {snippet}")
            
            print()
        
        return results
    
    def get_stats(self):
        """Get database statistics"""
        cursor = self.conn.cursor()
        
        print("\n" + "="*60)
        print("📊 DATABASE STATISTICS")
        print("="*60)
        
        # Total evidence
        cursor.execute("SELECT COUNT(*) FROM evidence_items")
        total = cursor.fetchone()[0]
        print(f"\n📁 Total evidence items: {total:,}")
        
        # By type
        print("\n📋 By Type:")
        cursor.execute("""
            SELECT source_type, COUNT(*) as count
            FROM evidence_items
            GROUP BY source_type
            ORDER BY count DESC
        """)
        for row in cursor.fetchall():
            print(f"   {row[0] or 'unknown':15s}: {row[1]:,}")
        
        # Total emails
        cursor.execute("SELECT COUNT(*) FROM emails")
        email_count = cursor.fetchone()[0]
        print(f"\n📧 Total emails: {email_count:,}")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python search.py <query> [options]")
        print("\nOptions:")
        print("  --type <type>        Filter by source type (email, pdf, image, etc.)")
        print("  --category <cat>     Filter by category")
        print("  --from <date>        Filter from date (YYYY-MM-DD)")
        print("  --to <date>          Filter to date (YYYY-MM-DD)")
        print("  --email              Search emails only")
        print("  --stats              Show database statistics")
        print("\nExamples:")
        print("  python search.py meth")
        print("  python search.py gatekeeping --type email")
        print("  python search.py harper --from 2024-01-01")
        print("  python search.py --stats")
        sys.exit(1)
    
    searcher = EvidenceSearch()
    
    # Check for stats flag
    if '--stats' in sys.argv:
        searcher.get_stats()
        searcher.close()
        return
    
    query = sys.argv[1]
    
    # Parse options
    source_type = None
    category = None
    date_from = None
    date_to = None
    email_only = False
    
    for i, arg in enumerate(sys.argv):
        if arg == '--type' and i + 1 < len(sys.argv):
            source_type = sys.argv[i + 1]
        elif arg == '--category' and i + 1 < len(sys.argv):
            category = sys.argv[i + 1]
        elif arg == '--from' and i + 1 < len(sys.argv):
            date_from = sys.argv[i + 1]
        elif arg == '--to' and i + 1 < len(sys.argv):
            date_to = sys.argv[i + 1]
        elif arg == '--email':
            email_only = True
    
    # Perform search
    if email_only:
        searcher.search_emails(query, date_from=date_from)
    else:
        searcher.search(query, source_type, category, date_from, date_to)
    
    searcher.close()

if __name__ == "__main__":
    main()
