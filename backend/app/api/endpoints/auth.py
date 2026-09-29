from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.db_service import db_service

router = APIRouter()

class DemoLoginRequest(BaseModel):
    role: str # victim, counsellor, protection_officer, district_officer, admin, police_officer
    email: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

@router.post("/login")
def login(req: LoginRequest):
    ident = req.identifier or req.email or req.role
    if not ident:
        raise HTTPException(status_code=400, detail="Identifier or email required")
    
    auth_result = db_service.authenticate_user(ident, req.password, req.role)
    if not auth_result:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Verify your official email or victim registration code."
        )
    
    profile = auth_result['user']
    victim = auth_result.get('victim')
    return {
        'status': 'success',
        'user': profile,
        'victim': victim,
        'token': f"sih-session-token-{profile.get('role', 'user')}-{profile.get('id')}"
    }

@router.post("/demo-login")
def demo_login(req: DemoLoginRequest):
    role = req.role.lower()
    for profile in db_service.profiles:
        if (profile['role'] == role or 
            (role == 'police' and profile['role'] == 'police_officer') or 
            (role == 'protection' and profile['role'] == 'protection_officer') or
            (role == 'admin' and profile['role'] in ['district_officer', 'admin'])):
            victim = db_service.get_victim_by_profile(profile['id']) if profile['role'] == 'victim' else None
            return {
                'status': 'success',
                'user': profile,
                'victim': victim,
                'token': f"demo-jwt-token-{profile['role']}"
            }

    if role == 'victim' and db_service.victims:
        vic = db_service.victims[0]
        user_prof = {
            'id': vic['id'],
            'full_name': vic.get('name', 'Sunita Devi'),
            'email': vic.get('email', 'victim001@sih.test'),
            'role': 'victim',
            'district_id': vic.get('district_id', '11111111-1111-1111-1111-111111111111'),
            'preferred_language': vic.get('preferred_language', 'en')
        }
        return {
            'status': 'success',
            'user': user_prof,
            'victim': vic,
            'token': "demo-jwt-token-victim"
        }

    raise HTTPException(status_code=404, detail="Role profile not found")

@router.get("/me")
def get_current_user(role: str = "victim"):
    clean_role = role.lower()
    for profile in db_service.profiles:
        if (profile['role'] == clean_role or 
            (clean_role == 'police' and profile['role'] == 'police_officer') or 
            (clean_role == 'protection' and profile['role'] == 'protection_officer') or
            (clean_role == 'admin' and profile['role'] in ['district_officer', 'admin'])):
            victim = db_service.get_victim_by_profile(profile['id']) if profile['role'] == 'victim' else None
            return {
                'user': profile,
                'victim': victim
            }

    if clean_role == 'victim' and db_service.victims:
        vic = db_service.victims[0]
        user_prof = {
            'id': vic['id'],
            'full_name': vic.get('name', 'Sunita Devi'),
            'email': vic.get('email', 'victim001@sih.test'),
            'role': 'victim',
            'district_id': vic.get('district_id', '11111111-1111-1111-1111-111111111111'),
            'preferred_language': vic.get('preferred_language', 'en')
        }
        return {'user': user_prof, 'victim': vic}

    return {'user': db_service.profiles[0], 'victim': db_service.victims[0] if db_service.victims else None}
