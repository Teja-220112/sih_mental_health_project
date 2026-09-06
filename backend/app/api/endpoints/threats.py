from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.services.db_service import db_service

router = APIRouter()

class ThreatReportCreate(BaseModel):
    victim_id: str
    threat_type: str
    severity: int # 1 to 5
    description: str

@router.post("")
def report_threat(req: ThreatReportCreate):
    th_id = str(uuid.uuid4())
    victim = db_service.get_victim_by_id(req.victim_id)
    code = victim['victim_code'] if victim else 'VIC-2026-101'

    threat_obj = {
        'id': th_id,
        'victim_id': req.victim_id,
        'reported_at': datetime.utcnow().isoformat() + 'Z',
        'threat_type': req.threat_type,
        'severity': req.severity,
        'description': req.description,
        'action_taken': 'Assigned to District Protection Officer',
        'status': 'OPEN'
    }

    db_service.threat_events.insert(0, threat_obj)

    # Immediately generate high/critical alert
    db_service.alerts.insert(0, {
        'id': str(uuid.uuid4()),
        'victim_id': req.victim_id,
        'victim_code': code,
        'alert_type': 'DIRECT_THREAT_REPORTED',
        'severity': 'CRITICAL' if req.severity >= 4 else 'HIGH',
        'message': f"Victim {code} reported direct threat/intimidation: {req.threat_type}. Immediate protection review triggered.",
        'status': 'NEW',
        'created_at': datetime.utcnow().isoformat() + 'Z'
    })

    return {'status': 'success', 'threat_event': threat_obj}

@router.get("/{victim_id}")
def get_victim_threats(victim_id: str):
    threats = [t for t in db_service.threat_events if t['victim_id'] == victim_id]
    return {'victim_id': victim_id, 'threats': threats}
