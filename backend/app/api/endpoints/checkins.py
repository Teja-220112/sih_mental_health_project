from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.db_service import db_service

router = APIRouter()

class CheckinCreateRequest(BaseModel):
    victim_id: str
    stress_score: float # 0 to 4
    anxiety_score: float # 0 to 4
    fear_score: float # 0 to 4
    sleep_score: float # 0 to 4
    safety_score: float # 0 to 4
    threat_score: float # 0 to 4
    social_support_score: float # 0 to 4
    functioning_score: float # 0 to 4
    case_related_distress: float # 0 to 4
    immediate_danger: bool = False
    free_text_response: Optional[str] = ""
    voice_recording_path: Optional[str] = None

@router.post("")
def create_checkin(req: CheckinCreateRequest):
    victim = db_service.get_victim_by_id(req.victim_id)
    if not victim:
        # Fallback to demo victim
        req.victim_id = db_service.victims[0]['id']

    assessment = db_service.add_checkin(req.victim_id, req.dict())
    return {
        'status': 'success',
        'message': 'Check-in processed successfully. High-risk cases are automatically escalated for human review.',
        'assessment': assessment
    }

@router.get("/{victim_id}")
def get_victim_checkins(victim_id: str):
    checkins = [c for c in db_service.checkins if c['victim_id'] == victim_id]
    assessments = [a for a in db_service.assessments if a['victim_id'] == victim_id]
    return {
        'victim_id': victim_id,
        'checkins': checkins,
        'assessments': sorted(assessments, key=lambda x: x['assessment_time'])
    }

@router.get("/{victim_id}/trend")
def get_victim_trend(victim_id: str):
    assessments = [a for a in db_service.assessments if a['victim_id'] == victim_id]
    sorted_history = sorted(assessments, key=lambda x: x['assessment_time'])

    chart_data = []
    for item in sorted_history:
        chart_data.append({
            'date': item['assessment_time'][:10],
            'score': item['dynamic_distress_score'],
            'risk_level': item['risk_level'],
            'trend': item.get('distress_trend', 'Stable')
        })

    latest = sorted_history[-1] if sorted_history else {
        'dynamic_distress_score': 0.0,
        'risk_level': 'LOW',
        'distress_trend': 'Stable'
    }

    return {
        'victim_id': victim_id,
        'latest_score': latest['dynamic_distress_score'],
        'latest_risk_level': latest['risk_level'],
        'latest_trend': latest.get('distress_trend', 'Stable'),
        'total_assessments': len(sorted_history),
        'chart_data': chart_data
    }
