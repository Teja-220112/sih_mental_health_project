from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from app.services.llm_service import llm_service
from app.services.db_service import db_service

router = APIRouter()

class ChatSessionCreate(BaseModel):
    victim_id: str
    language: Optional[str] = 'en'

class ChatMessageCreate(BaseModel):
    session_id: str
    victim_id: str
    message_text: str
    language: Optional[str] = 'en'

@router.post("/session")
def create_session(req: ChatSessionCreate):
    session_id = str(uuid.uuid4())
    session_obj = {
        'id': session_id,
        'victim_id': req.victim_id,
        'started_at': datetime.utcnow().isoformat() + 'Z',
        'language': req.language,
        'messages': []
    }
    return {'status': 'success', 'session': session_obj}

@router.post("/message")
def send_message(req: ChatMessageCreate):
    res = llm_service.generate_chat_response(req.message_text, victim_id=req.victim_id)

    msg_id = str(uuid.uuid4())
    user_msg = {
        'id': msg_id,
        'session_id': req.session_id,
        'victim_id': req.victim_id,
        'sender': 'victim',
        'message_text': req.message_text,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }

    bot_msg = {
        'id': str(uuid.uuid4()),
        'session_id': req.session_id,
        'victim_id': req.victim_id,
        'sender': 'bot',
        'message_text': res['reply'],
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }

    db_service.chat_messages.append(user_msg)
    db_service.chat_messages.append(bot_msg)

    # Persist psychological telemetry & emotion signals to restricted store (Accessible ONLY by officials)
    nlp_res = res['nlp_analysis']
    db_service.add_chat_emotion_analysis(
        victim_id=req.victim_id,
        session_id=req.session_id,
        message_id=msg_id,
        nlp_analysis=nlp_res
    )

    # Auto-alert if high threat detected in chat
    if nlp_res.get('threat_signal'):
        alert_id = str(uuid.uuid4())
        v = db_service.get_victim_by_id(req.victim_id)
        code = v['victim_code'] if v else 'VIC-2026-101'
        db_service.alerts.insert(0, {
            'id': alert_id,
            'victim_id': req.victim_id,
            'victim_code': code,
            'alert_type': 'CHAT_THREAT_SIGNAL_DETECTED',
            'severity': 'HIGH',
            'message': f"Threat signal detected in chat message from victim {code}: '{req.message_text[:80]}...'",
            'status': 'NEW',
            'created_at': datetime.utcnow().isoformat() + 'Z'
        })

    # Note: nlp_analysis is intentionally REDACTED from victim-facing response for psychological privacy
    return {
        'user_message': user_msg,
        'bot_message': bot_msg,
        'mode': res['mode']
    }

@router.get("/officials/analysis/{victim_id}")
def get_chat_analysis_for_officials(victim_id: str):
    """
    Restricted to authorized officials (Counsellor, Protection Officer, District Admin).
    Returns chronological psychological telemetry & emotion signals extracted from chat sessions.
    """
    analyses = db_service.get_chat_emotion_analyses(victim_id)
    return {
        'status': 'success',
        'victim_id': victim_id,
        'analyses': analyses,
        'total_count': len(analyses)
    }
