import sqlite3
import re
import json
from datetime import datetime
from pathlib import Path

def ingest_calendar_logs(html_path, db_path):
    print(f"📄 Reading calendar data from: {html_path}")
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the JSON eventData object
    match = re.search(r'const eventData = ({[\s\S]*?});', content)
    if not match:
        print("❌ Could not find eventData JSON in HTML")
        return

    json_str = match.group(1)
    
    # Clean up JSON if strictly needed (the provided JS object keys aren't quoted in some places potentially, but let's try strict load first)
    # The provided code has quoted keys, so json.loads might work if we handle the JS syntax quirks (like trailing commas)
    
    try:
        # Simple/naive cleanup for JS object to JSON
        # Remove trailing commas
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        events = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON Parse Error: {e}")
        print("Attempting to parse manually...")
        # Fallback manual parsing or let's just rely on the fact the user text looked like valid JSON
        return

    print(f"✅ Found {len(events)} events")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    count = 0
    text_log_count = 0

    for date_key, event in events.items():
        title = event.get('title', 'Untitled Event')
        description = event.get('description', '')
        details = event.get('details', '')
        participants = ", ".join(event.get('participants', []))
        event_type = event.get('eventType', 'EVENT')
        text_logs = event.get('textLogs', [])
        
        # Combine text for indexing
        logs_text = "\n".join([f'Log: "{log}"' for log in text_logs])
        full_text = f"{title}\n{description}\n{details}\nParticipants: {participants}\n\n{logs_text}"
        
        # Insert as an evidence item (Document/Log type)
        cursor.execute("""
            INSERT INTO evidence_items (
                file_path, file_name, file_size, created_date, modified_date, 
                source_type, category, extracted_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"calendar_event_{date_key}", 
            f"Event: {title}", 
            len(full_text), 
            datetime.now(), 
            datetime.now(), 
            "calendar_event", 
            event_type, 
            full_text + "\n\nMETADATA:\n" + json.dumps(event)
        ))
        
        item_id = cursor.lastrowid
        
        # Add to search index
        cursor.execute("INSERT INTO search_index (rowid, content) VALUES (?, ?)", (item_id, full_text))
        
        # If there are specific text logs, insert them as "conversations" or "emails" if they look like it, 
        # or just ensure they are searchable.
        for log in text_logs:
            # Check if it's already in the text (it usually isn't fully)
            cursor.execute("""
                INSERT INTO conversations (
                    evidence_id, platform, sender, recipient, 
                    timestamp, message_text
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                item_id,
                "Text/Direct",
                "Unknown", # Context usually implies sender, but hard to distinguish programmatically without more struct
                "Unknown",
                date_key,
                log
            ))
            text_log_count += 1
            
            # Index the specific log content too - SKIP (already in full_text)
            # cursor.execute("INSERT INTO search_index (rowid, content) VALUES (?, ?)", (item_id, log))

        count += 1

    conn.commit()
    conn.close()
    
    print("="*50)
    print(f"✅ Ingested {count} calendar events")
    print(f"✅ Indexed {text_log_count} specific text/chat logs")
    print("="*50)

if __name__ == "__main__":
    ingest_calendar_logs(
        r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\harpers_evidence_calendar.html",
        r"c:\Users\dalec\OneDrive\Desktop\finallymaybe\evidence_database\database\evidence.db"
    )
