"""
Comprehensive QA Automation & Feature Verification Suite
Smart India Hackathon (SIH 2026) - Victim Safety & Rehabilitation Portal
Problem Statement: PS 26094

Tests all 28 critical system features across all 5 personas:
1. Victim
2. Police Officer
3. Counsellor
4. Protection Officer
5. District Magistrate / Admin
"""

import sys
import time
import requests
import json

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

results = []

def record_test(test_id, category, description, passed, details="", duration_ms=0):
    status = "PASS" if passed else "FAIL"
    results.append({
        "id": test_id,
        "category": category,
        "description": description,
        "status": status,
        "details": details,
        "duration_ms": duration_ms
    })
    badge = "[PASS]" if passed else "[FAIL]"
    print(f"{badge} {test_id} | {category:15} | {description[:45]:45} | ({duration_ms}ms) {details}")

def run_all_qa_tests():
    print("=" * 85)
    print("STARTING COMPREHENSIVE QA AUTOMATION TEST SUITE")
    print(f"Target Backend:  {BASE_URL}")
    print(f"Target Frontend: {FRONTEND_URL}")
    print("=" * 85)

    # -------------------------------------------------------------
    # CATEGORY 1: SYSTEM HEALTH & FRONTEND CONNECTIVITY
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        passed = r.status_code == 200 and r.json().get("status") == "healthy"
        record_test("TEST-01", "System Health", "FastAPI /health check", passed, f"HTTP {r.status_code}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-01", "System Health", "FastAPI /health check", False, str(e))

    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        passed = r.status_code == 200 and "online" in r.json().get("status", "")
        record_test("TEST-02", "System Health", "FastAPI root metadata & disclaimer", passed, f"HTTP {r.status_code}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-02", "System Health", "FastAPI root metadata & disclaimer", False, str(e))

    t0 = time.time()
    try:
        r = requests.get(FRONTEND_URL, timeout=5)
        passed = r.status_code == 200 and "<html" in r.text.lower()
        record_test("TEST-03", "Frontend UI", "Vite React server active on port 3000", passed, f"HTTP {r.status_code}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-03", "Frontend UI", "Vite React server active on port 3000", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 2: AUTHENTICATION ACROSS ALL 5 USER PERSONAS
    # -------------------------------------------------------------
    personas = [
        ("TEST-04", "police_officer", "police.demo@sih.test", "SIH-Police@2026", "Vijay Prakash"),
        ("TEST-05", "counsellor", "counsellor.demo@sih.test", "SIH-Counsel@2026", "Ananya Sharma"),
        ("TEST-06", "protection_officer", "protection.demo@sih.test", "SIH-Protect@2026", "Ratna Kumari"),
        ("TEST-07", "district_officer", "admin.demo@sih.test", "SIH-Admin@2026", "Rajesh Verma"),
        ("TEST-08", "victim", "VIC-DEMO-0001", "Victim@2026#001", "Ramesh Babu"),
    ]

    for test_id, role, ident, pwd, expected_name in personas:
        t0 = time.time()
        try:
            r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"identifier": ident, "password": pwd, "role": role}, timeout=5)
            data = r.json()
            full_name = data.get("user", {}).get("full_name", "")
            passed = r.status_code == 200 and data.get("status") == "success" and expected_name in full_name
            record_test(test_id, "Authentication", f"Login as {role}", passed, f"User: {full_name}", int((time.time() - t0) * 1000))
        except Exception as e:
            record_test(test_id, "Authentication", f"Login as {role}", False, str(e))

    # Security check: invalid credentials rejected
    t0 = time.time()
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"identifier": "victim@sih.test", "password": "WrongPassword123!"}, timeout=5)
        passed = r.status_code == 401
        record_test("TEST-09", "Security", "Invalid credentials rejected with HTTP 401", passed, f"HTTP {r.status_code}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-09", "Security", "Invalid credentials rejected with HTTP 401", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 3: POLICE OFFICER WORKFLOWS
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/dashboard/police", timeout=5)
        data = r.json()
        metrics = data.get("metrics", {})
        passed = r.status_code == 200 and "total_registered_cases" in metrics and len(data.get("cases", [])) > 0
        record_test("TEST-10", "Police Flow", "Fetch Police Dashboard & Station Metrics", passed, f"Cases: {metrics.get('total_registered_cases')}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-10", "Police Flow", "Fetch Police Dashboard & Station Metrics", False, str(e))

    # Register new victim & legal case
    new_victim_id = None
    new_victim_code = None
    new_temp_pwd = None
    t0 = time.time()
    try:
        reg_payload = {
            "name": "Meera Bai",
            "age_group": "26-35",
            "gender": "Female",
            "preferred_language": "te",
            "email": "meera.bai@sih.test",
            "case_category": "Assault and physical violence",
            "incident_description": "Workplace intimidation and threat under PoA Act.",
            "police_station": "Suryaraopet Police Station, Vijayawada",
            "assigned_counsellor": "Dr. Ananya Sharma",
            "assigned_protection_officer": "Smt. K. Ratna Kumari",
            "protection_required": True,
            "rehabilitation_requirements": "Safe Shelter & Legal Aid Sanction"
        }
        r = requests.post(f"{BASE_URL}/api/v1/officials/register-victim", json=reg_payload, timeout=5)
        data = r.json()
        v_data = data.get("data", {})
        new_victim_id = v_data.get("victim_id")
        new_victim_code = v_data.get("victim_code")
        new_temp_pwd = v_data.get("temporary_password")
        passed = r.status_code == 200 and new_victim_id and new_victim_code and new_temp_pwd
        record_test("TEST-11", "Police Flow", "Official Victim & Case Registration", passed, f"Code: {new_victim_code}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-11", "Police Flow", "Official Victim & Case Registration", False, str(e))

    # Authenticate as the newly registered victim
    t0 = time.time()
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
            "identifier": new_victim_code,
            "password": new_temp_pwd,
            "role": "victim"
        }, timeout=5)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "success" and data.get("user", {}).get("full_name") == "Meera Bai"
        record_test("TEST-12", "Victim Flow", "Login as newly registered victim", passed, f"Logged in as Meera Bai", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-12", "Victim Flow", "Login as newly registered victim", False, str(e))

    # Police Assisted Check-In on victim's behalf
    t0 = time.time()
    try:
        assisted_payload = {
            "victim_id": new_victim_id,
            "recorded_by": "11000000-0000-0000-0000-000000000001",
            "stress_score": 2.0,
            "anxiety_score": 2.0,
            "fear_score": 1.5,
            "sleep_score": 2.0,
            "safety_score": 2.5,
            "threat_score": 1.0,
            "social_support_score": 3.0,
            "functioning_score": 2.0,
            "case_related_distress": 2.0,
            "immediate_danger": False,
            "free_text_response": "Assisted interview conducted at Suryaraopet Police Station. Victim in stable condition."
        }
        r = requests.post(f"{BASE_URL}/api/v1/officials/assisted-checkin", json=assisted_payload, timeout=5)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "success" and "assessment" in data
        record_test("TEST-13", "Police Flow", "Assisted Check-In by Police Official", passed, f"Assisted checkin logged", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-13", "Police Flow", "Assisted Check-In by Police Official", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 4: DYNAMIC ML RISK SCORING & SAFETY ALERTS
    # -------------------------------------------------------------
    # Baseline low distress checkin
    baseline_score = None
    t0 = time.time()
    try:
        low_chk = {
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
            "free_text_response": "I feel safe at home and supportive family is here."
        }
        r = requests.post(f"{BASE_URL}/api/v1/checkins", json=low_chk, timeout=5)
        risk_r = requests.get(f"{BASE_URL}/api/v1/risk/{new_victim_id}/latest", timeout=5)
        assessment = risk_r.json().get("latest_assessment", {})
        baseline_score = assessment.get("dynamic_distress_score", 0)
        passed = r.status_code == 200 and baseline_score < 50
        record_test("TEST-14", "ML Risk Engine", "Dynamic Baseline Scoring (< 50)", passed, f"Score: {baseline_score}/100", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-14", "ML Risk Engine", "Dynamic Baseline Scoring (< 50)", False, str(e))

    # High distress checkin with acute threat & fear
    escalated_score = None
    t0 = time.time()
    try:
        high_chk = {
            "victim_id": new_victim_id,
            "channel": "web",
            "language": "te",
            "stress_score": 4.0,
            "anxiety_score": 4.0,
            "fear_score": 4.0,
            "sleep_score": 3.5,
            "safety_score": 0.5,
            "threat_score": 4.0,
            "social_support_score": 1.0,
            "functioning_score": 3.5,
            "case_related_distress": 4.0,
            "immediate_danger": True,
            "free_text_response": "The accused party stalked my house and threatened my brother. I cannot sleep."
        }
        r = requests.post(f"{BASE_URL}/api/v1/checkins", json=high_chk, timeout=5)
        risk_r = requests.get(f"{BASE_URL}/api/v1/risk/{new_victim_id}/latest", timeout=5)
        assessment = risk_r.json().get("latest_assessment", {})
        escalated_score = assessment.get("dynamic_distress_score", 0)
        risk_level = assessment.get("risk_level", "")
        passed = r.status_code == 200 and escalated_score > baseline_score and risk_level in ["HIGH", "CRITICAL"]
        record_test("TEST-15", "ML Risk Engine", "Dynamic Score Escalation (> baseline & CRITICAL)", passed, f"Score: {escalated_score}/100 ({risk_level})", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-15", "ML Risk Engine", "Dynamic Score Escalation (> baseline & CRITICAL)", False, str(e))

    # Automatic safety alert generation
    generated_alert_id = None
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/alerts?status=NEW", timeout=5)
        alerts = r.json().get("alerts", [])
        matching = [a for a in alerts if a.get("victim_id") == new_victim_id]
        passed = r.status_code == 200 and len(matching) > 0
        if matching:
            generated_alert_id = matching[0].get("id")
        record_test("TEST-16", "Alert Engine", "Automated Safety Alert Triggering", passed, f"Alert ID: {generated_alert_id}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-16", "Alert Engine", "Automated Safety Alert Triggering", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 5: VICTIM THREAT REPORTING & CHATBOT PRIVACY
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        threat_payload = {
            "victim_id": new_victim_id,
            "threat_type": "Direct In-Person Harassment",
            "severity": 5,
            "description": "Two individuals intercepted victim near market and issued warning to withdraw FIR."
        }
        r = requests.post(f"{BASE_URL}/api/v1/threats", json=threat_payload, timeout=5)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "success" and "threat_event" in data
        record_test("TEST-17", "Threat Flow", "Direct Threat Report Submission", passed, "Severity 5/5 logged", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-17", "Threat Flow", "Direct Threat Report Submission", False, str(e))

    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/threats/{new_victim_id}", timeout=5)
        th_list = r.json().get("threats", [])
        passed = r.status_code == 200 and len(th_list) > 0
        record_test("TEST-18", "Threat Flow", "Retrieve Victim Threat Event History", passed, f"Total Events: {len(th_list)}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-18", "Threat Flow", "Retrieve Victim Threat Event History", False, str(e))

    # Victim Chatbot Supportive Flow
    t0 = time.time()
    try:
        chat_payload = {
            "session_id": "qa-chat-session-001",
            "victim_id": new_victim_id,
            "message_text": "I am feeling very scared about going to the court tomorrow morning.",
            "language": "en"
        }
        r = requests.post(f"{BASE_URL}/api/v1/chat/message", json=chat_payload, timeout=5)
        data = r.json()
        passed = r.status_code == 200 and "bot_message" in data and len(data["bot_message"].get("message_text", "")) > 10
        record_test("TEST-19", "Chatbot AI", "Supportive Empathetic Chat Response", passed, "Empathetic reply generated", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-19", "Chatbot AI", "Supportive Empathetic Chat Response", False, str(e))

    # CRITICAL PRIVACY ASSERTION: Victim payload must NEVER include psychometric/NLP scores
    t0 = time.time()
    try:
        chat_payload = {
            "session_id": "qa-chat-session-privacy",
            "victim_id": new_victim_id,
            "message_text": "I feel hopeless and completely broken.",
            "language": "en"
        }
        r = requests.post(f"{BASE_URL}/api/v1/chat/message", json=chat_payload, timeout=5)
        data = r.json()
        # Ensure nlp_analysis is absent
        privacy_safe = ("nlp_analysis" not in data) and ("distress_score" not in data)
        record_test("TEST-20", "Data Privacy", "Strict Privacy: Redact NLP & Distress Scores from Victim", privacy_safe, "Zero internal scores exposed", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-20", "Data Privacy", "Strict Privacy: Redact NLP & Distress Scores from Victim", False, str(e))

    # OFFICIAL ACCESS: Counsellor & Protection Officer CAN view emotion telemetry
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/officials/chat-analysis/{new_victim_id}", timeout=5)
        data = r.json()
        analyses = data.get("analyses", [])
        passed = r.status_code == 200 and len(analyses) > 0 and "emotion_label" in analyses[-1]
        record_test("TEST-21", "Official Telemetry", "Official NLP Emotion Telemetry Store Access", passed, f"Analyzed {len(analyses)} sessions", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-21", "Official Telemetry", "Official NLP Emotion Telemetry Store Access", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 6: COUNSELLOR & PROTECTION INTERVENTIONS
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/dashboard/counsellor", timeout=5)
        data = r.json()
        kpi = data.get("kpi", {})
        passed = r.status_code == 200 and "critical_risk" in kpi and len(data.get("victims", [])) > 0
        record_test("TEST-22", "Counsellor Flow", "Counsellor Dashboard & Risk Triage Summary", passed, f"Monitored: {kpi.get('total_assigned')}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-22", "Counsellor Flow", "Counsellor Dashboard & Risk Triage Summary", False, str(e))

    # Counsellor acknowledges alert
    t0 = time.time()
    try:
        if generated_alert_id:
            r = requests.post(f"{BASE_URL}/api/v1/alerts/{generated_alert_id}/acknowledge", timeout=5)
            passed = r.status_code == 200 and r.json().get("alert", {}).get("status") == "ACKNOWLEDGED"
            record_test("TEST-23", "Alert Engine", "Counsellor Acknowledges Safety Alert", passed, "Status: ACKNOWLEDGED", int((time.time() - t0) * 1000))
        else:
            record_test("TEST-23", "Alert Engine", "Counsellor Acknowledges Safety Alert", False, "No alert ID available")
    except Exception as e:
        record_test("TEST-23", "Alert Engine", "Counsellor Acknowledges Safety Alert", False, str(e))

    # Record Human Clinical Intervention
    t0 = time.time()
    try:
        inv_payload = {
            "victim_id": new_victim_id,
            "alert_id": generated_alert_id,
            "intervention_type": "Scheduled In-Person Counselling & Protective Safe Haven",
            "notes": "Emergency psychosocial support conducted. Relocation recommended to District Women Shelter.",
            "override_reason": None
        }
        r = requests.post(f"{BASE_URL}/api/v1/interventions", json=inv_payload, timeout=5)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "success" and data.get("intervention", {}).get("status") == "SCHEDULED"
        record_test("TEST-24", "Interventions", "Record Human Clinical Intervention", passed, "Intervention scheduled", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-24", "Interventions", "Record Human Clinical Intervention", False, str(e))

    # Protection Dashboard & Escort Queue
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/dashboard/protection", timeout=5)
        data = r.json()
        metrics = data.get("metrics", {})
        passed = r.status_code == 200 and "active_threat_events" in metrics and len(data.get("threat_events", [])) > 0
        record_test("TEST-25", "Protection Flow", "Protection Dashboard & Active Threats", passed, f"Open Threats: {metrics.get('active_threat_events')}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-25", "Protection Flow", "Protection Dashboard & Active Threats", False, str(e))

    # Resolve Safety Alert
    t0 = time.time()
    try:
        if generated_alert_id:
            r = requests.post(f"{BASE_URL}/api/v1/alerts/{generated_alert_id}/resolve", timeout=5)
            passed = r.status_code == 200 and r.json().get("alert", {}).get("status") == "RESOLVED"
            record_test("TEST-26", "Alert Engine", "Resolve Safety Alert After Action Taken", passed, "Status: RESOLVED", int((time.time() - t0) * 1000))
        else:
            record_test("TEST-26", "Alert Engine", "Resolve Safety Alert After Action Taken", False, "No alert ID available")
    except Exception as e:
        record_test("TEST-26", "Alert Engine", "Resolve Safety Alert After Action Taken", False, str(e))

    # -------------------------------------------------------------
    # CATEGORY 7: DISTRICT MAGISTRATE & ML MONITORING
    # -------------------------------------------------------------
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/dashboard/district", timeout=5)
        data = r.json()
        passed = r.status_code == 200 and "metrics" in data and len(data.get("welfare_records", [])) > 0
        record_test("TEST-27", "District Flow", "District Inter-Departmental Metrics & DBT Records", passed, f"Active Cases: {data.get('metrics', {}).get('total_active_cases')}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-27", "District Flow", "District Inter-Departmental Metrics & DBT Records", False, str(e))

    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/ml/metrics", timeout=5)
        data = r.json()
        models = data.get("models_evaluated", {})
        rf = models.get("RandomForest", {})
        passed = r.status_code == 200 and rf.get("accuracy", 0) >= 0.95 and rf.get("recall", 0) == 1.0
        record_test("TEST-28", "ML Metrics", "AI / ML Performance Validation (96% Acc, 1.0 Recall)", passed, f"F1: {rf.get('f1_score')}", int((time.time() - t0) * 1000))
    except Exception as e:
        record_test("TEST-28", "ML Metrics", "AI / ML Performance Validation (96% Acc, 1.0 Recall)", False, str(e))

    # -------------------------------------------------------------
    # SUMMARY REPORT
    # -------------------------------------------------------------
    print("\n" + "=" * 85)
    print("COMPREHENSIVE QA TEST EXECUTION REPORT")
    print("=" * 85)
    
    total = len(results)
    passed_count = sum(1 for r in results if r["status"] == "PASS")
    failed_count = total - passed_count
    pass_pct = (passed_count / total) * 100

    print(f"Total Test Cases Executed: {total}")
    print(f"Passed:                     {passed_count} ({pass_pct:.1f}%)")
    print(f"Failed:                     {failed_count}")
    print("=" * 85)

    if failed_count == 0:
        print("RESULT: ALL 28 END-TO-END QA TEST CASES PASSED WITH 100% SUCCESS!")
    else:
        print(f"RESULT: {failed_count} TEST CASES FAILED - INSPECT LOGS ABOVE.")
    print("=" * 85)

    return failed_count == 0

if __name__ == "__main__":
    success = run_all_qa_tests()
    sys.exit(0 if success else 1)
