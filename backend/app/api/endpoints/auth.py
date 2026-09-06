from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.db_service import db_service

router = APIRouter()

class DemoLoginRequest(BaseModel):
    role: str # victim, counsellor, district_officer, admin
    email: Optional[str] = None

@router.post("/demo-login")
def demo_login(req: DemoLoginRequest):
    role = req.role.lower()
    for profile in db_service.profiles:
        if profile['role'] == role:
            victim = db_service.get_victim_by_profile(profile['id']) if role == 'victim' else None
            return {
                'status': 'success',
                'user': profile,
                'victim': victim,
                'token': f"demo-jwt-token-{profile['role']}"
            }
    raise HTTPException(status_code=404, detail="Role profile not found")

@router.get("/me")
def get_current_user(role: str = "victim"):
    for profile in db_service.profiles:
        if profile['role'] == role:
            victim = db_service.get_victim_by_profile(profile['id']) if role == 'victim' else None
            return {
                'user': profile,
                'victim': victim
            }
    return {'user': db_service.profiles[0], 'victim': db_service.victims[0]}
