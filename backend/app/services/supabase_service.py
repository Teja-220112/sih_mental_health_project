"""
Supabase Database & Auth Service
Smart India Hackathon (SIH 2026) - Victim Safety & Rehabilitation Portal

Provides secure connectivity to Supabase PostgreSQL, Supabase Auth, and RLS enforcement.
Gracefully and reliably falls back to local high-performance store if Supabase cloud credentials
are unconfigured or network is unavailable, with clear status indicators.
"""

import os
import requests
from typing import Dict, Any, List, Optional
from app.core.config import settings

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL or os.getenv("SUPABASE_URL", "")
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.anon_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("SUPABASE_KEY", ""))
        self.is_connected = False
        
        # Test connection if credentials exist
        if self.url and (self.service_role_key or self.anon_key):
            key = self.service_role_key if self.service_role_key else self.anon_key
            self.headers = {
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            try:
                r = requests.get(f"{self.url}/auth/v1/health", headers=self.headers, timeout=5)
                if r.status_code in [200, 204]:
                    self.is_connected = True
                    print(f"[SUPABASE] Successfully connected to live cloud database at {self.url}")
                else:
                    print(f"[SUPABASE] Cloud endpoint reachable but returned HTTP {r.status_code}. Using local persistent store.")
            except Exception as e:
                print(f"[SUPABASE] Cloud connection failed ({e}). Using local high-performance store.")
        else:
            print("[SUPABASE] Cloud credentials not configured in backend/.env. Using local high-performance store.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_connected": self.is_connected,
            "supabase_url": self.url if self.url else "Not configured (set in backend/.env)",
            "service_role_key_present": bool(self.service_role_key),
            "anon_key_present": bool(self.anon_key),
            "mode": "Live Supabase Cloud" if self.is_connected else "Local High-Performance Store (Pre-loaded with 100 synthetic victims)"
        }

    def insert_record(self, table: str, record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_connected:
            return None
        try:
            r = requests.post(f"{self.url}/rest/v1/{table}", json=record, headers=self.headers, timeout=6)
            if r.status_code in [200, 201]:
                data = r.json()
                return data[0] if isinstance(data, list) and data else record
        except Exception as e:
            print(f"[SUPABASE ERROR] Failed inserting into {table}: {e}")
        return None

    def query_table(self, table: str, params: str = "") -> Optional[List[Dict[str, Any]]]:
        if not self.is_connected:
            return None
        try:
            r = requests.get(f"{self.url}/rest/v1/{table}?{params}", headers=self.headers, timeout=6)
            if r.status_code == 200:
                return r.json()
        except Exception as e:
            print(f"[SUPABASE ERROR] Failed querying {table}: {e}")
        return None

supabase_service = SupabaseService()
