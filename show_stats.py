from evidence_database import EvidenceDatabase

db = EvidenceDatabase()
stats = db.get_stats()

print(f"\n📊 EVIDENCE DATABASE STATISTICS")
print("=" * 60)
print(f"Total Exhibits: {stats['total_exhibits']}")
print(f"Critical (Priority 10): {stats['critical_count']}")

print(f"\nBy Category:")
for k, v in sorted(stats['by_category'].items(), key=lambda x: x[1], reverse=True):
    print(f"  {k}: {v}")

print(f"\nBy Priority:")
for k, v in sorted(stats['by_priority'].items(), key=lambda x: x[0], reverse=True):
    print(f"  Priority {k}: {v}")

db.close()
