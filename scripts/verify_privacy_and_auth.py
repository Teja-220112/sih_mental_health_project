"""
Verification script for Chatbot Privacy & Role-Based Authentication
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.db_service import db_service

client = TestClient(app)

def test_chat_privacy():
    print("Testing Victim Chatbot Privacy...")
    # 1. Post message to chat endpoint
    payload = {
        "session_id": "test-session-001",
        "victim_id": "70000000-0000-0000-0000-000000000001",
        "message_text": "I feel very anxious and scared about the court hearing tomorrow",
        "language": "en"
    }
    
    response = client.post("/api/v1/chat/message", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    # Verify nlp_analysis is NOT returned to victim
    assert "nlp_analysis" not in data, "CRITICAL PRIVACY VIOLATION: nlp_analysis is present in victim chat response!"
    assert "user_message" in data
    assert "bot_message" in data
    print("  [PASSED] nlp_analysis is strictly REDACTED from victim chat response.")

    # 2. Verify stored in chat_emotion_analyses for officials
    official_resp = client.get("/api/v1/officials/chat-analysis/70000000-0000-0000-0000-000000000001")
    assert official_resp.status_code == 200, f"Expected 200, got {official_resp.status_code}"
    official_data = official_resp.json()
    assert official_data.get("status") == "success"
    assert official_data.get("total_sessions_analyzed") > 0
    latest_analysis = official_data["analyses"][-1]
    assert "sentiment_label" in latest_analysis
    assert "emotion_label" in latest_analysis
    print(f"  [PASSED] Telemetry securely stored for officials: Emotion={latest_analysis['emotion_label']}, Sentiment={latest_analysis['sentiment_label']}.")

def test_role_authentication():
    print("Testing Role-Based Authentication & Portal Credentials...")
    
    # 1. Official demo login - Police
    pol_resp = client.post("/api/v1/auth/login", json={
        "identifier": "police.demo@sih.test",
        "password": "SIH-Police@2026",
        "role": "police_officer"
    })
    assert pol_resp.status_code == 200
    pol_data = pol_resp.json()
    assert pol_data["user"]["role"] == "police_officer"
    print("  [PASSED] Police demo credentials authenticated successfully.")

    # 2. Official demo login - Counsellor
    coun_resp = client.post("/api/v1/auth/login", json={
        "identifier": "counsellor.demo@sih.test",
        "password": "SIH-Counsel@2026",
        "role": "counsellor"
    })
    assert coun_resp.status_code == 200
    coun_data = coun_resp.json()
    assert coun_data["user"]["role"] == "counsellor"
    print("  [PASSED] Counsellor demo credentials authenticated successfully.")

    # 3. Victim demo login
    vic_resp = client.post("/api/v1/auth/login", json={
        "identifier": "VIC-DEMO-0001",
        "password": "Victim@2026#001",
        "role": "victim"
    })
    assert vic_resp.status_code == 200
    vic_data = vic_resp.json()
    assert vic_data["user"]["role"] == "victim"
    print("  [PASSED] Victim credentials authenticated successfully.")

if __name__ == "__main__":
    test_chat_privacy()
    test_role_authentication()
    print("\nALL PRIVACY & AUTHENTICATION TESTS PASSED!")
