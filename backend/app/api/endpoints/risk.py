from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.db_service import db_service

router = APIRouter()

@router.get("/{victim_id}/latest")
def get_latest_risk(victim_id: str):
    assessments = [a for a in db_service.assessments if a['victim_id'] == victim_id]
    if not assessments:
        raise HTTPException(status_code=404, detail="No assessments found for victim")
    
    sorted_history = sorted(assessments, key=lambda x: x['assessment_time'])
    latest = sorted_history[-1]
    prev = sorted_history[-2] if len(sorted_history) > 1 else latest

    return {
        'victim_id': victim_id,
        'latest_assessment': latest,
        'previous_assessment': prev,
        'total_assessments': len(sorted_history)
    }

@router.get("/{victim_id}/history")
def get_risk_history(victim_id: str):
    assessments = [a for a in db_service.assessments if a['victim_id'] == victim_id]
    return {
        'victim_id': victim_id,
        'history': sorted(assessments, key=lambda x: x['assessment_time'])
    }
