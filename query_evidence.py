import sqlite3

DB_PATH = "FDSJ739_EVIDENCE.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Query for evidence statistics
print("="*60)
print("FDSJ-739-24 Evidence Database Query Report")
print("="*60)
print()

# Total exhibits
cursor.execute("SELECT COUNT(*) FROM exhibits")
total = cursor.fetchone()[0]
print(f"Total Exhibits: {total}")

# Files with matches
cursor.execute("SELECT COUNT(*) FROM exhibits WHERE matched_file != 'MISSING'")
matched = cursor.fetchone()[0]
print(f"Matched Files: {matched}")

# Files marked missing
cursor.execute("SELECT COUNT(*) FROM exhibits WHERE matched_file = 'MISSING'")
missing = cursor.fetchone()[0]
print(f"Missing Files: {missing}")

# Files verified to exist
cursor.execute("SELECT COUNT(*) FROM exhibits WHERE file_exists = 1")
verified = cursor.fetchone()[0]
print(f"Files Verified on Disk: {verified}")

print()
print("Sample of Key Exhibits:")
print("-" * 60)

# Query key exhibits
cursor.execute("""
SELECT exhibit_number, description, matched_file 
FROM exhibits 
WHERE exhibit_number IN ('A-1', 'A-2', 'A-6', 'A-7', 'A-10', 'A-11')
ORDER BY exhibit_number
""")

for row in cursor.fetchall():
    ex, desc, matched = row
    print(f"{ex}: {desc[:50]}...")
    print(f"     File: {matched}")
    print()

# FTS5 search test
print("Full-Text Search Test:")
print("-" * 60)
cursor.execute("""
SELECT exhibit_number, description
FROM exhibits_fts
WHERE exhibits_fts MATCH 'assault OR meth OR breastmilk'
LIMIT 5
""")

for row in cursor.fetchall():
    print(f"{row[0]}: {row[1][:60]}...")

conn.close()
