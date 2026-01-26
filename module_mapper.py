"""
Module Mapping System - Maps exhibits to 20-module filing blueprint
Automatically suggests which exhibits support which legal arguments
"""

from evidence_database import EvidenceDatabase

# Define the 20-module filing blueprint
FILING_MODULES = [
    {
        "number": 1,
        "name": "Notice of Motion & Relief Sought (Form 37A)",
        "focus": "Immediate demands for sole custody, supervised access, and mandatory drug testing",
        "system_prompt": "You are a senior paralegal in New Brunswick. Draft a formal Notice of Motion for urgent relief. Use a clinical, assertive tone to list seven specific orders including Sole Custody and Mandatory Hair Follicle testing. Cite Rule 37.04 regarding ex-parte urgency.",
        "relevant_categories": ["SAFETY", "OBSTRUCTION"],
        "min_priority": 9
    },
    {
        "number": 2,
        "name": "Form 81C Answer & Counter-Application",
        "focus": "Formally rebutting Emma Ryan's initial application",
        "system_prompt": "Act as a legal analyst. Cross-reference the Applicant's Form 81A with the Respondent's evidence. Draft a point-by-point rebuttal that highlights 'empty box' litigation abuse regarding child support claims. Maintain strict legal neutrality.",
        "relevant_categories": ["PERJURY", "INTEGRITY"],
        "min_priority": 8
    },
    {
        "number": 3,
        "name": "Affidavit in Support (Form 81B) – Primary Narrative",
        "focus": "The sworn story of the relationship, the birth, and the eventual safety intervention",
        "system_prompt": "You are a legal ghostwriter. Transform raw personal notes into a sworn affidavit. Organize the narrative into numbered paragraphs. Ensure the voice is a 'Dedicated Dad' who is calm, factual, and focused on the child's best interests.",
        "relevant_categories": ["SAFETY", "INTEGRITY", "COMMUNICATION"],
        "min_priority": 7
    },
    {
        "number": 4,
        "name": "Financial Disclosure (Form 71B/72J) & Affidavit",
        "focus": "Proving income stability and explaining the diversion of funds to drug suppliers",
        "system_prompt": "Act as a forensic accountant. Summarize the Respondent's financial stability, noting Paul's Roofing income. Draft an explanatory affidavit regarding unfiled taxes and the $4,000+ of earnings diverted into the Applicant's accounts.",
        "relevant_categories": ["FINANCIAL"],
        "min_priority": 6
    },
    {
        "number": 5,
        "name": "The Proposed Parenting Plan (Phased Progression)",
        "focus": "A 3-step path for Emma to earn back access through sobriety",
        "system_prompt": "Design a rigorous, child-centered parenting plan. Structure a 3-phase progression (Immediate, Conditional, Future) that mandates 90 days of clean tests before unsupervised access. Use trauma-informed language.",
        "relevant_categories": ["SAFETY", "INTEGRITY"],
        "min_priority": 8
    },
    {
        "number": 6,
        "name": "Master Case Timeline (2024–2025)",
        "focus": "Every interaction from the first police call to the current 'Blackout'",
        "system_prompt": "Construct a two-column chronological matrix. Column 1: Date/Time. Column 2: Event summary with exhibit reference. Highlight the transition from daily contact to 124 days of denied access.",
        "relevant_categories": ["OBSTRUCTION", "COMMUNICATION"],
        "min_priority": 7
    },
    {
        "number": 7,
        "name": "December 9th Critical Incident Report",
        "focus": "Dissecting the day Emma was charged with assault",
        "system_prompt": "Analyze 96 minutes of video summary. Create a tactical log of the December 9th assault. Focus on the moment of self-defense and the Applicant's drug-seeking behavior while the child was present.",
        "relevant_categories": ["SAFETY"],
        "min_priority": 10,
        "key_exhibits": ["A-17", "A-18"]
    },
    {
        "number": 8,
        "name": "Communication Blackout & Alienation Log",
        "focus": "Documenting 18 missed Sundays and 51 unanswered calls",
        "system_prompt": "You are an evidentiary specialist. Summarize a 124-day communication blackout. Detail the specific Sundays denied and the strategic timing of access coinciding with Jane Ryan's work schedule.",
        "relevant_categories": ["OBSTRUCTION"],
        "min_priority": 9,
        "key_exhibits": ["A-13", "A-14", "Z-1"]
    },
    {
        "number": 9,
        "name": "Evidence Authentication & Chain of Custody",
        "focus": "Attesting to the validity of the 2,000+ screenshots",
        "system_prompt": "Draft an 'Affidavit of Authenticity' for digital evidence. Explain the OCR process used on 2,000+ screenshots and affirm that the messages were retrieved from original devices without alteration.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 7
    },
    {
        "number": 10,
        "name": "Exhibit Index & Multi-Category Cross-Reference",
        "focus": "Navigating A-1 through A-82",
        "system_prompt": "Create a Master Exhibit Index. For each entry, provide: Exhibit #, Date, Type (e.g., Sonix Transcript), and a 1-sentence relevance statement regarding parental fitness.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 5
    },
    {
        "number": 11,
        "name": "DARVO Framework Analysis",
        "focus": "Proving Emma's pattern of Deny, Attack, and Reverse Victim/Offender",
        "system_prompt": "Apply the DARVO psychological framework to the provided case materials. Identify specific instances where the Applicant fabricated abuse claims (Attack) to deflect from her criminal assault charges (Deny).",
        "relevant_categories": ["PERJURY", "SAFETY"],
        "min_priority": 9,
        "key_exhibits": ["M-1", "A-2", "R-1"]
    },
    {
        "number": 12,
        "name": "Substance Abuse Pattern Documentation",
        "focus": "Documenting meth use during pregnancy and parenting",
        "system_prompt": "Compile all indicators of substance abuse. Include 'Negative-Dilute' test results, text requests for 'balls,' and observations of pipe use. Link this behavior to the child's irritable medical symptoms.",
        "relevant_categories": ["SAFETY"],
        "min_priority": 10,
        "key_exhibits": ["K-1", "T-1", "A-45", "A-22"]
    },
    {
        "number": 13,
        "name": "IPV Analysis – Respondent as Victim",
        "focus": "Documenting the 50+ hits and the black eye",
        "system_prompt": "Draft a section titled 'Respondent as Victim of Intimate Partner Violence.' Summarize the physical injuries sustained on Nov 19th and Dec 9th. Use the police officer's direct quote: 'Defend yourself... just because she's a woman does not mean you can't'.",
        "relevant_categories": ["SAFETY", "PERJURY"],
        "min_priority": 10,
        "key_exhibits": ["A-1", "A-26", "M-1"]
    },
    {
        "number": 14,
        "name": "Child Endangerment & Medical Neglect",
        "focus": "Expired car seats, formula shortages, and vaping near the baby",
        "system_prompt": "Focus exclusively on Harper's physical safety. Document the use of an expired car seat and the absence of weather-appropriate clothing during exchanges. Cite the correlation between indoor smoking and the child's respiratory congestion.",
        "relevant_categories": ["SAFETY"],
        "min_priority": 8,
        "key_exhibits": ["A-4", "A-8"]
    },
    {
        "number": 15,
        "name": "Behavioral Contrasts: Stability vs. Volatility",
        "focus": "Contrasting Celebrate Recovery and job stability with fistfights and alcohol",
        "system_prompt": "Create a comparative analysis table. Left Side: Applicant's reported volatility and alcohol consumption (24 beers/day). Right Side: Respondent's sustained sobriety, recovery program participation, and Paul's Roofing success.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 8,
        "key_exhibits": ["T-2", "A-5"]
    },
    {
        "number": 16,
        "name": "Systemic Conflicts (The Architect's Network)",
        "focus": "Detailing connections between the family, the social worker, and the medical staff",
        "system_prompt": "Map the systemic conflicts in this case. Detail the personal relationship between social worker Jacqueline Gallant and the Applicant's brother. Explain how this 'Architect's Network' compromised the child protection investigation.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 9,
        "key_exhibits": ["A-63"]
    },
    {
        "number": 17,
        "name": "Professional Misconduct Summaries",
        "focus": "Formal complaints against Jacqueline Gallant and the commissioning error by Kerrie Garland",
        "system_prompt": "Summarize two formal professional complaints. 1. The NBASW complaint regarding conflict of interest. 2. The ethical breach regarding a family member commissioning legal documents. State how these impact the validity of the Applicant's evidence.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 9,
        "key_exhibits": ["A-63"]
    },
    {
        "number": 18,
        "name": "Medical Records & Disclosure Demands",
        "focus": "Demanding prenatal records and birth discharge info",
        "system_prompt": "Draft a compelling Motion for Medical Disclosure. Demand prenatal/postnatal records, citing the need for truthful medical history for the pediatrician. Specifically request birth discharge records to verify suspected drug exposure.",
        "relevant_categories": ["SAFETY"],
        "min_priority": 9,
        "key_exhibits": ["A-48"]
    },
    {
        "number": 19,
        "name": "Financial Forensics (Tony Baker / Diversion of Funds)",
        "focus": "Proving e-transfers to an investigated drug dealer",
        "system_prompt": "Analyze bank records and e-transfer screenshots. Document the pattern of funds flowing to 'Tony Baker.' Factually note that this individual is under investigation for drug dealing and had his own child removed by CPS.",
        "relevant_categories": ["FINANCIAL", "SAFETY"],
        "min_priority": 10,
        "key_exhibits": ["A-22", "A-21"]
    },
    {
        "number": 20,
        "name": "Concluding Statement of Best Interests",
        "focus": "The final plea for safety and a legacy of honesty for Harper",
        "system_prompt": "Draft a powerful 1-page Concluding Statement. Reiterate that this filing is a 'Foundation of Honesty.' Explicitly state that Harper's Best Interest is a divine mandate that requires a sober, stable, and transparent father.",
        "relevant_categories": ["INTEGRITY"],
        "min_priority": 7
    }
]


def auto_map_exhibits_to_modules():
    """Automatically map exhibits to relevant modules based on category and priority"""
    db = EvidenceDatabase()
    
    # First, populate the filing_modules table
    cursor = db.conn.cursor()
    for module in FILING_MODULES:
        cursor.execute("""
            INSERT OR REPLACE INTO filing_modules 
            (module_number, module_name, focus, system_prompt)
            VALUES (?, ?, ?, ?)
        """, (module['number'], module['name'], module['focus'], module['system_prompt']))
    db.conn.commit()
    
    print("✓ Loaded 20 filing modules into database\n")
    
    # Now map exhibits to modules
    all_exhibits = db.search_exhibits()
    mapping_count = 0
    
    for module in FILING_MODULES:
        print(f"\n📋 Module {module['number']}: {module['name']}")
        
        # Get exhibits that match this module's criteria
        relevant_exhibits = []
        
        # First, add any specifically mentioned key exhibits
        if 'key_exhibits' in module:
            for exhibit_num in module['key_exhibits']:
                exhibit = next((ex for ex in all_exhibits if ex['exhibit_number'] == exhibit_num), None)
                if exhibit:
                    relevant_exhibits.append(exhibit)
                    print(f"   🔑 {exhibit_num} (Key Exhibit)")
        
        # Then add exhibits matching category and priority criteria
        for exhibit in all_exhibits:
            if exhibit in relevant_exhibits:
                continue  # Skip if already added as key exhibit
                
            # Check if exhibit category matches module's relevant categories
            if exhibit['category'] in module.get('relevant_categories', []):
                # Check if priority meets minimum
                if exhibit['priority'] >= module.get('min_priority', 5):
                    relevant_exhibits.append(exhibit)
                    print(f"   ✓ {exhibit['exhibit_number']} - {exhibit['description'][:50]}...")
        
        # Map each relevant exhibit to this module
        for exhibit in relevant_exhibits:
            db.map_exhibit_to_module(
                exhibit['exhibit_number'],
                module['number'],
                module['name'],
                f"Supports {module['focus'][:50]}..."
            )
            mapping_count += 1
    
    print(f"\n\n✅ Created {mapping_count} exhibit-to-module mappings")
    
    # Show summary
    print("\n📊 Module Coverage Summary:")
    for module in FILING_MODULES:
        exhibits = db.get_exhibits_by_module(module['number'])
        print(f"   Module {module['number']:2d}: {len(exhibits):2d} exhibits")
    
    db.close()
    return mapping_count


if __name__ == "__main__":
    print("🔗 Auto-Mapping Exhibits to Filing Modules...\n")
    auto_map_exhibits_to_modules()
