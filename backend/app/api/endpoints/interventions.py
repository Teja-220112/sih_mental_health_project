from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.services.db_service import db_service

router = APIRouter()

class InterventionCreate(BaseModel):
    victim_id: str
    alert_id: Optional[str] = None
    intervention_type: str
    notes: Optional[str] = ""
    override_reason: Optional[str] = None

@router.post("")
def create_intervention(req: InterventionCreate):
    inv_id = str(uuid.uuid4())
    victim = db_service.get_victim_by_id(req.victim_id)
    code = victim['victim_code'] if victim else 'VIC-2026-101'

    inv_obj = {
        'id': inv_id,
        'victim_id': req.victim_id,
        'victim_code': code,
        'alert_id': req.alert_id,
        'intervention_type': req.intervention_type,
        'recommended_by_ai': True if not req.override_reason else False,
        'override_reason': req.override_reason,
        'approved_by': 'Dr. Ananya Sharma (Counsellor)',
        'status': 'SCHEDULED',
        'scheduled_at': datetime.utcnow().isoformat() + 'Z',
        'notes': req.notes
    }

    db_service.interventions.insert(0, inv_obj)

    # Mark alert in progress if linked
    if req.alert_id:
        for alert in db_service.alerts:
            if alert['id'] == req.alert_id:
                alert['status'] = 'IN_PROGRESS'

    return {'status': 'success', 'intervention': inv_obj}

@router.get("/{victim_id}")
def get_victim_interventions(victim_id: str):
    invs = [i for i in db_service.interventions if i['victim_id'] == victim_id]
    return {'victim_id': victim_id, 'interventions': invs}
