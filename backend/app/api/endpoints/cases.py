from fastapi import APIRouter, HTTPException
from app.services.db_service import db_service

router = APIRouter()

@router.get("")
def get_cases():
    return {'cases': db_service.cases, 'count': len(db_service.cases)}

@router.get("/{case_id}")
def get_case_detail(case_id: str):
    for c in db_service.cases:
        if c['id'] == case_id:
            victim = db_service.get_victim_by_id(c['victim_id'])
            return {'case': c, 'victim': victim}
    raise HTTPException(status_code=404, detail="Case not found")
