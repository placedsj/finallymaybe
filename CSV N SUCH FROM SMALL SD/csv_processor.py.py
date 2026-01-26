import pandas as pd
import os
import re

os.chdir(r'E:\drive-download-20251203T114420Z-1-001')

print("="*70)
print("LOADING EVIDENCE - ORGANIZING BY CATEGORY")
print("="*70)

messages = pd.read_excel(
    'im going to paste some transcribed messages here,....xlsx',
    sheet_name='Sheet1',
    dtype={'Date (Approx.)': str}
)
print(f"\n✓ Loaded {len(messages):,} records\n")

# Keyword categories
categories = {
    'Drug': r'drug|sober|high|meth|cocaine|addict|test',
    'Assault': r'assault|punch|hit|struck|violence|attack',
    'Custody': r'harper|custody|access|denied|contact',
    'Legal': r'police|jail|court|rcmp|charged|arrest',
    'Threats': r'threat|jail|report|blackmail',
}

print("EVIDENCE BREAKDOWN:")
for cat, pattern in categories.items():
    mask = (
        messages['Key Allegations/Summary'].fillna('').str.contains(pattern, case=False, regex=True) |
        messages['Full Message/Statement'].fillna('').str.contains(pattern, case=False, regex=True)
    )
    count = len(messages[mask])
    print(f"  {cat:15s}: {count:>6,} entries")
    
    if count > 0:
        messages[mask].to_excel(f"EVIDENCE_{cat}.xlsx", index=False)

# Export full database
messages.to_excel('EVIDENCE_COMPLETE.xlsx', index=False)
print(f"\n✓ EVIDENCE_COMPLETE.xlsx: {len(messages):,} total records")
print("✓ Category files created")
