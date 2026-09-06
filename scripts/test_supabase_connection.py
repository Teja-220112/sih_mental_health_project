import os
import requests
import json

SUPABASE_URL = "https://ewiadxzmaboxprmqtedc.supabase.co"
SUPABASE_KEY = "sb_publishable_T2q7_VA32ivoXtqq1NcvJQ_c3whI105"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

tables_to_check = [
    "districts", "profiles", "victims", "cases",
    "mental_health_checkins", "ai_assessments", "alerts",
    "interventions", "threat_events", "welfare_support",
    "questionnaires", "questions"
]

def check_supabase():
    print(f"Connecting to Supabase project at {SUPABASE_URL}...")
    
    # 1. Health Check
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=10)
        print(f"Supabase REST API status: {r.status_code}")
    except Exception as e:
        print(f"Failed to reach Supabase API: {e}")
        return

    # 2. Check each table
    existing_tables = []
    missing_tables = []

    for tbl in tables_to_check:
        try:
            res = requests.get(f"{SUPABASE_URL}/rest/v1/{tbl}?select=count", headers=headers, timeout=5)
            if res.status_code == 200:
                existing_tables.append(tbl)
            else:
                missing_tables.append((tbl, res.status_code, res.text[:100]))
        except Exception as e:
            missing_tables.append((tbl, 'error', str(e)))

    print("\n--- DATABASE VERIFICATION RESULT ---")
    print(f"Existing Tables ({len(existing_tables)}): {', '.join(existing_tables)}")
    if missing_tables:
        print(f"\nMissing / Unmigrated Tables ({len(missing_tables)}):")
        for tbl, status, err in missing_tables:
            print(f"  - {tbl} (HTTP {status})")
    else:
        print("ALL REQUIRED SCHEMAS ARE PRESENT IN SUPABASE!")

if __name__ == '__main__':
    check_supabase()
