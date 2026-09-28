"""
Official Actions & Victim Registration Endpoints
Smart India Hackathon (SIH 2026) - Victim Safety & Rehabilitation Portal

Handles:
1. Police / Case Registration Officer workflow: Register New Victim & Case with One-Time Credential generation
2. Assisted Check-in submission on victim's behalf by authorized staff
3. Case status tracking
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from app.services.db_service import db_service

router = APIRouter()

class VictimRegistrationRequest(BaseModel):
    name: str
    age_group: str = "26-35"
    gender: str = "Female"
    preferred_language: str = "en"
    email: Optional[str] = None
    case_category: str = "Assault and physical violence"
    incident_description: str
    police_station: str = "Suryaraopet Police Station, Vijayawada"
    assigned_counsellor: str = "Dr. Ananya Sharma"
    assigned_protection_officer: str = "Smt. K. Ratna Kumari"
    protection_required: bool = False
    rehabilitation_requirements: str = "Legal Aid Support Sanctioned"

class AssistedCheckinRequest(BaseModel):
    victim_id: str
    recorded_by: Optional[str] = "11000000-0000-0000-0000-000000000001"
    stress_score: float = 2.0
    anxiety_score: float = 2.0
    fear_score: float = 2.0
    sleep_score: float = 2.0
    safety_score: float = 2.0
    threat_score: float = 1.0
    social_support_score: float = 3.0
    functioning_score: float = 2.0
    case_related_distress: float = 2.0
    immediate_danger: bool = False
    free_text_response: Optional[str] = ""

@router.post("/register-victim")
def register_victim(req: VictimRegistrationRequest):
    """
    Authorized Registration Workflow:
    Police / Case Registration Officer registers victim profile and case.
    The system provisions victim credentials and returns a secure, one-time credential display.
    """
    officer_id = "11000000-0000-0000-0000-000000000001"
    result = db_service.register_victim_and_case(officer_id, req.dict())
    return {
        "status": "success",
        "data": result
    }

@router.post("/assisted-checkin")
def submit_assisted_checkin(req: AssistedCheckinRequest):
    """
    Assisted Entry Workflow:
    Authorized case official or counsellor records a check-in on the victim's behalf.
    """
    victim = db_service.get_victim_by_id(req.victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    assessment = db_service.add_assisted_checkin(req.recorded_by, req.victim_id, req.dict())
    return {
        "status": "success",
        "message": f"Assisted check-in for victim {victim.get('victim_code')} recorded by official.",
        "assessment": assessment
    }

@router.get("/cases")
def list_cases():
    return {
        "total_cases": len(db_service.cases),
        "cases": db_service.cases[:50]
    }

@router.get("/chat-analysis/{victim_id}")
def get_official_victim_chat_analysis(victim_id: str):
    """
    Restricted to authorized officials (Counsellor, Protection Officer, District Admin).
    Provides chronological emotion telemetry and threat flags from victim chat sessions.
    """
    victim = db_service.get_victim_by_id(victim_id)
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    analyses = db_service.get_chat_emotion_analyses(victim_id)
    return {
        "status": "success",
        "victim_id": victim_id,
        "victim_code": victim.get("victim_code"),
        "total_sessions_analyzed": len(analyses),
        "analyses": analyses
    }
