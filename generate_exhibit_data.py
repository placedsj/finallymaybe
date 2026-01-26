"""
Load all 558 exhibits from CSV and generate TypeScript data file
"""

import csv
import json

def load_all_exhibits(csv_path):
    """Load all exhibits from CSV including duplicates"""
    
    exhibits = []
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row_num, row in enumerate(reader, start=1):
            try:
                # Create exhibit object matching your TypeScript interface
                exhibit = {
                    'id': f"exhibit-{row_num}",
                    'exhibitNumber': row['Exhibit Number'].strip(),
                    'description': row['Description'].strip(),
                    'date': row['Date'].strip() if row['Date'].strip() != 'Unknown' else 'Date Unknown',
                    'category': row['Category'].strip(),
                    'priority': int(row['Priority']) if row['Priority'].strip() else 5,
                    'fileType': row['File Type'].strip() if row['File Type'].strip() else 'document',
                    'keywords': row['Keywords'].strip(),
                    'legalRelevance': row['Legal Significance'].strip(),
                    'status': row['Status'].strip(),
                    'witnesses': [],  # Can be populated later
                    'fileHash': None,  # Can be populated later
                    'perjuryFlag': 'PERJURY' in row['Category'].strip(),
                    'contradictionNote': row['Legal Significance'].strip() if 'PERJURY' in row['Category'].strip() else None,
                    'bestInterestMapping': {
                        'legalArgument': row['Legal Significance'].strip()
                    }
                }
                
                exhibits.append(exhibit)
                
            except Exception as e:
                print(f"Error on row {row_num}: {e}")
                continue
    
    return exhibits


def generate_typescript_file(exhibits, output_path):
    """Generate TypeScript file with exhibit data"""
    
    ts_content = f"""// Auto-generated exhibit data from CSV
// Total exhibits: {len(exhibits)}
// Generated: {__import__('datetime').datetime.now().isoformat()}

import {{ Exhibit }} from './types';

export const ALL_EXHIBITS: Exhibit[] = {json.dumps(exhibits, indent=2)};

// Statistics
export const EXHIBIT_STATS = {{
  total: {len(exhibits)},
  critical: {len([e for e in exhibits if e['priority'] >= 10])},
  byCategory: {{
"""
    
    # Calculate category counts
    categories = {}
    for ex in exhibits:
        cat = ex['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        ts_content += f"    '{cat}': {count},\n"
    
    ts_content += """  },
  byPriority: {
"""
    
    # Calculate priority counts
    priorities = {}
    for ex in exhibits:
        pri = ex['priority']
        priorities[pri] = priorities.get(pri, 0) + 1
    
    for pri, count in sorted(priorities.items(), reverse=True):
        ts_content += f"    {pri}: {count},\n"
    
    ts_content += """  }
};

// Helper functions
export function getExhibitsByCategory(category: string): Exhibit[] {
  return ALL_EXHIBITS.filter(ex => ex.category === category);
}

export function getCriticalExhibits(): Exhibit[] {
  return ALL_EXHIBITS.filter(ex => ex.priority >= 10);
}

export function searchExhibits(keyword: string): Exhibit[] {
  const search = keyword.toLowerCase();
  return ALL_EXHIBITS.filter(ex => 
    ex.description.toLowerCase().includes(search) ||
    ex.keywords.toLowerCase().includes(search) ||
    ex.exhibitNumber.toLowerCase().includes(search)
  );
}
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    return output_path


if __name__ == "__main__":
    csv_file = r"C:\Users\dalec\Downloads\Exhibit and Evidence Tracking Table - Table 1 (1).csv"
    output_file = r"C:\Users\dalec\OneDrive\Desktop\finallymaybe\exhibitData.ts"
    
    print("📂 Loading all exhibits from CSV...")
    exhibits = load_all_exhibits(csv_file)
    
    print(f"✅ Loaded {len(exhibits)} exhibits")
    print(f"\n📊 Statistics:")
    print(f"   Critical (Priority 10): {len([e for e in exhibits if e['priority'] >= 10])}")
    
    categories = {}
    for ex in exhibits:
        cat = ex['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n   By Category:")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"      {cat}: {count}")
    
    print(f"\n📝 Generating TypeScript file...")
    output = generate_typescript_file(exhibits, output_file)
    
    print(f"✅ Created: {output}")
    print(f"\n🎯 Next step: Import this in your React app:")
    print(f"   import {{ ALL_EXHIBITS }} from './exhibitData';")
