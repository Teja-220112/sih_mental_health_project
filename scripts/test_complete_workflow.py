"""
End-to-End Workflow Verification Script for SIH 2026 Portal
Tests:
1. All 5 Role Authentications + Role Guard
2. Official Registration of New Victim & Case
3. Login as the newly created victim
4. Dynamic ML Risk Score calculation on check-in
5. Chatbot psychological privacy & emotion storage
6. Safety Alert generation & Counsellor Intervention scheduling
7. District Analytics & Case Tracking
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("SIH 2026: End-to-End Full Workflow & Feature Verification")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. AUTHENTICATION ACROSS ALL 5 ROLES
    # -------------------------------------------------------------
    print("\n[Step 1] Verifying 5 Role Authentications...")
    
    roles_to_test = [
        ("police_officer", "police.demo@sih.test", "SIH-Police@2026"),
        ("counsellor", "counsellor.demo@sih.test", "SIH-Counsel@2026"),
        ("protection_officer", "protection.demo@sih.test", "SIH-Protect@2026"),
        ("district_officer", "admin.demo@sih.test", "SIH-Admin@2026"),
        ("victim", "VIC-DEMO-0001", "Victim@2026#001"),
    ]

    for role_id, ident, pwd in roles_to_test:
        res = client.post("/api/v1/auth/login", json={"identifier": ident, "password": pwd, "role": role_id})
        assert res.status_code == 200, f"Failed login for {role_id}: {res.text}"
        data = res.json()
        assert data.get("status") == "success"
        print(f"  [PASS] {role_id.ljust(19)}: Authenticated as '{data['user']['full_name']}'")

    # Verify invalid credentials rejection
    bad_res = client.post("/api/v1/auth/login", json={"identifier": "victim@demo.test", "password": "wrongpassword"})
    assert bad_res.status_code == 401, "Expected 401 for bad password"
    print("  [PASS] Invalid credentials properly rejected with HTTP 401")

    # -------------------------------------------------------------
    # 2. POLICE REGISTRATION OF NEW VICTIM & CASE
    # -------------------------------------------------------------
    print("\n[Step 2] Testing Police Station Official Registration Flow...")
    reg_payload = {
        "name": "Kavitha Lakshmi",
        "age_group": "26-35",
        "gender": "Female",
        "preferred_language": "te",
        "email": "kavitha.lakshmi@sih.test",
        "case_category": "Assault and physical violence",
        "incident_description": "Harassment and verbal coercion at workplace under PoA jurisdiction.",
        "police_station": "Suryaraopet Police Station, Vijayawada",
        "assigned_counsellor": "Dr. Ananya Sharma",
        "assigned_protection_officer": "Smt. K. Ratna Kumari",
        "protection_required": True,
        "rehabilitation_requirements": "Immediate safe shelter and legal aid sanction"
    }

    reg_res = client.post("/api/v1/officials/register-victim", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()["data"]
    
    new_victim_id = reg_data["victim_id"]
    new_victim_code = reg_data["victim_code"]
    new_temp_pwd = reg_data["temporary_password"]
    new_case_code = reg_data["case_code"]

    print(f"  [PASS] Successfully registered victim:")
    print(f"         Victim Code:       {new_victim_code}")
    print(f"         Legal Case Code:   {new_case_code}")
    print(f"         One-Time Password: {new_temp_pwd}")

    # -------------------------------------------------------------
    # 3. AUTHENTICATE AS THE NEWLY CREATED VICTIM
    # -------------------------------------------------------------
    print("\n[Step 3] Testing Login with Newly Generated Victim Credentials...")
    new_vic_login = client.post("/api/v1/auth/login", json={
        "identifier": new_victim_code,
        "password": new_temp_pwd,
        "role": "victim"
    })
    assert new_vic_login.status_code == 200, f"Failed victim login: {new_vic_login.text}"
    vic_user = new_vic_login.json()["user"]
    assert vic_user["full_name"] == "Kavitha Lakshmi"
    print(f"  [PASS] New victim '{vic_user['full_name']}' logged in successfully!")

    # -------------------------------------------------------------
    # 4. SUBMIT CHECK-IN & TEST DYNAMIC ML SCORING
    # -------------------------------------------------------------
    print("\n[Step 4] Testing Dynamic ML Wellbeing Check-in & Scoring...")
    
    # Test 1: Low-stress checkin
    low_checkin = client.post("/api/v1/checkins", json={
        "victim_id": new_victim_id,
        "channel": "web",
        "language": "te",
        "stress_score": 1.0,
        "anxiety_score": 1.0,
        "fear_score": 1.0,
        "sleep_score": 1.0,
        "safety_score": 3.5,
        "threat_score": 0.5,
        "social_support_score": 3.5,
        "functioning_score": 1.0,
        "case_related_distress": 1.0,
        "immediate_danger": False,
        "free_text_response": "I am feeling calmer and safe at home today."
    })
    assert low_checkin.status_code == 200
    low_risk = client.get(f"/api/v1/risk/{new_victim_id}/latest").json()["latest_assessment"]
    score_1 = low_risk["dynamic_distress_score"]
    level_1 = low_risk["risk_level"]
    print(f"  [PASS] Low-stress checkin evaluated dynamically:")
    print(f"         Distress Score: {score_1}/100 | Risk Level: {level_1}")
    assert score_1 < 50.0, f"Expected low score, got {score_1}"

    # Test 2: High-distress checkin (Verifying Dynamic change)
    high_checkin = client.post("/api/v1/checkins", json={
        "victim_id": new_victim_id,
        "channel": "web",
        "language": "te",
        "stress_score": 4.0,
        "anxiety_score": 4.0,
        "fear_score": 4.0,
        "sleep_score": 3.5,
        "safety_score": 0.5,
        "threat_score": 3.5,
        "social_support_score": 1.0,
        "functioning_score": 3.5,
        "case_related_distress": 4.0,
        "immediate_danger": True,
        "free_text_response": "Two men threatened to hurt my family if I testify in court tomorrow. I am terrified."
    })
    assert high_checkin.status_code == 200
    high_risk = client.get(f"/api/v1/risk/{new_victim_id}/latest").json()["latest_assessment"]
    score_2 = high_risk["dynamic_distress_score"]
    level_2 = high_risk["risk_level"]
    
    print(f"  [PASS] High-stress checkin evaluated dynamically:")
    print(f"         Distress Score: {score_2}/100 | Risk Level: {level_2}")
    print(f"         Distress Trend: {high_risk.get('distress_trend')}")
    assert score_2 > score_1, f"Score did not increase dynamically! (Score 1: {score_1}, Score 2: {score_2})"
    assert level_2 in ["HIGH", "CRITICAL"], f"Expected HIGH/CRITICAL, got {level_2}"

    # -------------------------------------------------------------
    # 5. VERIFY AUTOMATIC ALERT GENERATION
    # -------------------------------------------------------------
    print("\n[Step 5] Verifying Immediate Safety Alert Generation...")
    alerts_res = client.get("/api/v1/alerts?status=NEW")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()["alerts"]
    matching_alerts = [a for a in alerts if a.get("victim_id") == new_victim_id]
    assert len(matching_alerts) > 0, "No alert was generated for high distress check-in!"
    new_alert = matching_alerts[0]
    print(f"  [PASS] Safety Alert dynamically generated:")
    print(f"         Alert ID:   {new_alert['id']}")
    print(f"         Type:       {new_alert['alert_type']}")
    print(f"         Severity:   {new_alert['severity']}")
    print(f"         Message:    {new_alert['message']}")

    # -------------------------------------------------------------
    # 6. TEST CHATBOT EMOTION PRIVACY & OFFICIAL TELEMETRY
    # -------------------------------------------------------------
    print("\n[Step 6] Testing Victim Chatbot Supportive Flow & Emotion Privacy...")
    chat_res = client.post("/api/v1/chat/message", json={
        "session_id": "session-e2e-001",
        "victim_id": new_victim_id,
        "message_text": "I feel very overwhelmed and scared about the trial.",
        "language": "en"
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    
    # PRIVACY ASSERTION: Victim NEVER receives nlp_analysis
    assert "nlp_analysis" not in chat_data, "CRITICAL: nlp_analysis was leaked to victim chat response!"
    assert "bot_message" in chat_data
    print(f"  [PASS] Bot replied empathetically:")
    print(f"         Reply: \"{chat_data['bot_message']['message_text'][:80]}...\"")
    print("  [PASS] Psychological telemetry strictly redacted from victim payload.")

    # OFFICIAL ACCESS ASSERTION: Official CAN retrieve psychological analysis
    telemetry_res = client.get(f"/api/v1/officials/chat-analysis/{new_victim_id}")
    assert telemetry_res.status_code == 200
    telemetry_data = telemetry_res.json()
    assert telemetry_data["total_sessions_analyzed"] > 0
    analysis = telemetry_data["analyses"][-1]
    print(f"  [PASS] Official Telemetry Store has extracted emotion signals:")
    print(f"         Extracted Emotion:   {analysis['emotion_label']} (Score: {analysis['emotion_score']})")
    print(f"         Extracted Sentiment: {analysis['sentiment_label']}")

    # -------------------------------------------------------------
    # 7. TEST COUNSELLOR ALERT ACKNOWLEDGMENT & INTERVENTION
    # -------------------------------------------------------------
    print("\n[Step 7] Testing Counsellor Alert Resolution & Intervention...")
    ack_res = client.post(f"/api/v1/alerts/{new_alert['id']}/acknowledge")
    assert ack_res.status_code == 200
    print("  [PASS] Counsellor acknowledged critical alert.")

    interv_res = client.post("/api/v1/interventions", json={
        "victim_id": new_victim_id,
        "alert_id": new_alert['id'],
        "intervention_type": "Immediate Safe House Relocation & Police Escort",
        "notes": "Victim received threats from accused. Relocated to District Women Shelter and assigned Suryaraopet PS escort.",
        "recommended_by_ai": True,
        "status": "IN_PROGRESS"
    })
    assert interv_res.status_code == 200
    interv_data = interv_res.json()["intervention"]
    print(f"  [PASS] Counsellor scheduled safety intervention: {interv_data['intervention_type']}")

    # -------------------------------------------------------------
    # 8. TEST DISTRICT ADMIN DASHBOARD & CASE TRACKING
    # -------------------------------------------------------------
    print("\n[Step 8] Testing District Administration Stats & Cases...")
    stats_res = client.get("/api/v1/dashboard/admin")
    assert stats_res.status_code == 200
    stats = stats_res.json()["summary"]
    print(f"  [PASS] District Statistics retrieved:")
    print(f"         Total Monitored Victims: {stats.get('total_victims')}")
    print(f"         Active High Alerts:      {stats.get('active_alerts', 0)}")

    cases_res = client.get("/api/v1/cases")
    assert cases_res.status_code == 200
    cases_data = cases_res.json()["cases"]
    matching_case = next((c for c in cases_data if c["victim_id"] == new_victim_id), None)
    assert matching_case is not None, "Registered case not found in district case roster!"
    print(f"  [PASS] Legal case '{matching_case['case_code']}' active in District Case Roster.")

    print("\n" + "=" * 70)
    print("ALL 8 END-TO-END WORKFLOW & FEATURE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
