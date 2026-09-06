from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.db_service import db_service

router = APIRouter()

@router.get("")
def get_alerts(status: Optional[str] = None, severity: Optional[str] = None):
    alerts = db_service.alerts
    if status:
        alerts = [a for a in alerts if a['status'] == status]
    if severity:
        alerts = [a for a in alerts if a['severity'] == severity]
    return {'alerts': alerts, 'count': len(alerts)}

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    for alert in db_service.alerts:
        if alert['id'] == alert_id:
            alert['status'] = 'ACKNOWLEDGED'
            alert['acknowledged_at'] = datetime.utcnow().isoformat() + 'Z'
            return {'status': 'success', 'alert': alert}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for alert in db_service.alerts:
        if alert['id'] == alert_id:
            alert['status'] = 'RESOLVED'
            alert['resolved_at'] = datetime.utcnow().isoformat() + 'Z'
            return {'status': 'success', 'alert': alert}
    raise HTTPException(status_code=404, detail="Alert not found")
