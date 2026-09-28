"""
Seed Generator: 100 Preloaded Synthetic Victims for NTR District (AP-NTR-01), Andhra Pradesh
Smart India Hackathon (SIH 2026) - Victim Safety, Mental Health Monitoring & Rehabilitation Portal

Generates:
1. 4 Official Demo Accounts (police.demo@sih.test, counsellor.demo@sih.test, protection.demo@sih.test, admin.demo@sih.test)
2. 100 Synthetic Victim Profiles (VIC-DEMO-0001 to VIC-DEMO-0100) & linked cases
3. 100 Individual Victim Login Accounts & Passwords
4. 5-10 Longitudinal Check-ins per Victim (600-800 total check-in records)
5. AI Assessments, Risk Scores, and Distress Trends
6. Outputs:
   - Developer CSV: scripts/synthetic_victim_credentials.csv (gitignored)
   - JSON Fixture: backend/app/data/synthetic_100_victims.json
   - Idempotent SQL: supabase/seed_100_victims.sql
"""

import os
import csv
import json
import uuid
import random
from datetime import datetime, timedelta

# Deterministic seed for reproducible synthetic data
random.seed(42)

DISTRICT_ID = "11111111-1111-1111-1111-111111111111"
DISTRICT_CODE = "AP-NTR-01"
DISTRICT_NAME = "NTR District (Vijayawada)"
STATE = "Andhra Pradesh"

OFFICIAL_PROFILES = [
    {
        "id": "11000000-0000-0000-0000-000000000001",
        "full_name": "Inspector Vijay Prakash (Registration Officer)",
        "email": "police.demo@sih.test",
        "password": "SIH-Police@2026",
        "role": "police_officer",
        "district_id": DISTRICT_ID,
        "phone": "+91 9440796001",
        "preferred_language": "en"
    },
    {
        "id": "20000000-0000-0000-0000-000000000002",
        "full_name": "Dr. Ananya Sharma (Senior Counsellor)",
        "email": "counsellor.demo@sih.test",
        "password": "SIH-Counsel@2026",
        "role": "counsellor",
        "district_id": DISTRICT_ID,
        "phone": "+91 9876543211",
        "preferred_language": "en"
    },
    {
        "id": "35000000-0000-0000-0000-000000000001",
        "full_name": "Smt. K. Ratna Kumari (Protection Officer)",
        "email": "protection.demo@sih.test",
        "password": "SIH-Protect@2026",
        "role": "protection_officer",
        "district_id": DISTRICT_ID,
        "phone": "+91 9440796015",
        "preferred_language": "en"
    },
    {
        "id": "40000000-0000-0000-0000-000000000004",
        "full_name": "Rajesh Verma (District Administrator)",
        "email": "admin.demo@sih.test",
        "password": "SIH-Admin@2026",
        "role": "district_officer",
        "district_id": DISTRICT_ID,
        "phone": "+91 9876543212",
        "preferred_language": "en"
    }
]

FIRST_NAMES_FEMALE = [
    "Sunita", "Lakshmi", "Anuradha", "Bhavani", "Kavitha", "Sujatha", "Padma", "Swapna",
    "Manjula", "Sravani", "Deepika", "Sandhya", "Renuka", "Venkata", "Pushpa", "Madhavi",
    "Pravallika", "Geetha", "Srilatha", "Anusha", "Sailaja", "Sarojini", "Kumari", "Durga"
]

FIRST_NAMES_MALE = [
    "Ramesh", "Suresh", "Venkatesh", "Nagaraju", "Srinivas", "Kishore", "Prasad", "Mahesh",
    "Ravindra", "Satish", "Chandra", "Subba Rao", "Anji", "Kalyan", "Narasimha", "Babu",
    "Gopala", "Jagadish", "Ramana", "Mohan", "Appa Rao", "Siva", "Naresh", "Venkata"
]

LAST_NAMES = [
    "Devi", "Kumar", "Rao", "Reddy", "Chowdary", "Naidu", "Varma", "Goud", "Babu",
    "Prasad", "Raju", "Murthy", "Sastry", "Sharma", "Yadav", "Mudiraj", "Gari"
]

POLICE_STATIONS = [
    "Suryaraopet Police Station, Vijayawada",
    "Governorpet Police Station, Vijayawada",
    "Patamata Police Station, Vijayawada",
    "Satyanarayanapuram Police Station, Vijayawada",
    "Machavaram Police Station, Vijayawada",
    "Gunadala Police Station, Vijayawada",
    "Nandigama Police Station, NTR District",
    "Jaggayyapeta Police Station, NTR District",
    "Tiruvuru Police Station, NTR District",
    "Mylavaram Police Station, NTR District",
    "Kanchikacherla Police Station, NTR District",
    "Ibrahimpatnam Police Station, NTR District"
]

CASE_CATEGORIES = [
    ("Assault and physical violence", "Assault & Physical Violence with bodily injury during dispute"),
    ("Domestic violence and harassment", "Severe Domestic Coercion and continuous harassment"),
    ("Threats and intimidation", "Direct Witness Intimidation warning against court testimony"),
    ("Caste-based discrimination and atrocities", "SC/ST PoA Act Section 3(1)(r)(s) Public Humiliation & Abuse"),
    ("Land and property disputes involving threats", "Illegal Land Dispossession with violent retaliation threat"),
    ("Coercion and exploitation", "Economic Coercion and threat of eviction from leased farmland"),
    ("Witness safety and protection concerns", "Surveillance and stalking by accused family members"),
    ("Livelihood and rehabilitation difficulties", "Boycott and denial of agricultural labor employment"),
    ("Community pressure and social isolation", "Village council diktat enforcing social boycott"),
    ("Multiple simultaneous safety and support concerns", "Assault, ongoing intimidation, and acute trauma symptoms")
]

STAGES = ["Investigation", "Charge Sheet Filed", "Court / Trial", "Arguments", "Pre-Trial"]
INVESTIGATION_STATUSES = ["Under Investigation", "Charge Sheet Filed", "Supplemental Inquiry", "Witness Statements Recorded"]
COURT_STATUSES = ["Pre-Trial", "Pending Summons", "Trial Commenced", "Evidence Recording", "Pending Final Arguments"]

AGE_GROUPS = ["18-25", "26-35", "36-50", "50+"]

def generate_synthetic_dataset(count=100):
    victims = []
    cases = []
    credentials = []
    checkins = []
    assessments = []
    alerts = []
    threat_events = []
    welfare_records = []
    case_assignments = []

    base_date = datetime(2026, 7, 1)

    for i in range(1, count + 1):
        victim_uuid = f"70000000-0000-0000-0000-{i:012d}"
        profile_uuid = f"10000000-0000-0000-0000-{i:012d}"
        case_uuid = f"80000000-0000-0000-0000-{i:012d}"

        gender = random.choices(["Female", "Male"], weights=[0.55, 0.45])[0]
        first_name = random.choice(FIRST_NAMES_FEMALE if gender == "Female" else FIRST_NAMES_MALE)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        victim_code = f"VIC-DEMO-{i:04d}"
        case_code = f"CASE-DEMO-{i:04d}"
        email = f"victim{i:03d}@sih.test"
        password = f"Victim@2026#{i:03d}"

        age_group = random.choice(AGE_GROUPS)
        pref_lang = random.choices(["en", "te", "hi"], weights=[0.4, 0.5, 0.1])[0]
        reg_offset = random.randint(0, 45)
        reg_date = (base_date + timedelta(days=reg_offset)).strftime("%Y-%m-%d")

        category_name, inc_desc = CASE_CATEGORIES[(i - 1) % len(CASE_CATEGORIES)]
        station = random.choice(POLICE_STATIONS)

        # 1. Victim record
        victim = {
            "id": victim_uuid,
            "profile_id": profile_uuid,
            "victim_code": victim_code,
            "name": full_name,
            "email": email,
            "age_group": age_group,
            "gender": gender,
            "preferred_language": pref_lang,
            "preferred_channel": "web",
            "consent_status": True,
            "registration_date": reg_date,
            "district_id": DISTRICT_ID,
            "district_name": DISTRICT_NAME,
            "district_code": DISTRICT_CODE,
            "assigned_counsellor": "Dr. Ananya Sharma",
            "assigned_protection_officer": "Smt. K. Ratna Kumari",
            "assigned_registration_officer": "Inspector Vijay Prakash",
            "is_synthetic": True,
            "is_active": True
        }
        victims.append(victim)

        # 2. Case record
        case_days = random.randint(15, 90)
        complaint_date = (base_date + timedelta(days=reg_offset - random.randint(5, 20))).strftime("%Y-%m-%d")
        next_hearing = (datetime(2026, 9, 15) + timedelta(days=random.randint(2, 45))).strftime("%Y-%m-%d")
        case_record = {
            "id": case_uuid,
            "victim_id": victim_uuid,
            "case_code": case_code,
            "case_category": category_name,
            "case_type": f"{category_name} - {inc_desc}",
            "incident_description": inc_desc,
            "complaint_date": complaint_date,
            "registration_date": reg_date,
            "police_station": station,
            "district_id": DISTRICT_ID,
            "case_stage": random.choice(STAGES),
            "investigation_status": random.choice(INVESTIGATION_STATUSES),
            "court_case_status": random.choice(COURT_STATUSES),
            "days_since_complaint": case_days,
            "number_of_hearings": random.randint(0, 6),
            "next_hearing_date": next_hearing,
            "protection_status": "Active Police Patrol" if random.random() < 0.6 else "Under Review",
            "rehabilitation_requirements": random.choice(["Educational Grant", "Financial Aid Disbursed", "Legal Aid Assigned", "Skill Training"]),
            "is_synthetic": True
        }
        cases.append(case_record)

        # 3. Case Assignment
        case_assignments.append({
            "id": str(uuid.uuid4()),
            "case_id": case_uuid,
            "victim_id": victim_uuid,
            "registration_officer_id": OFFICIAL_PROFILES[0]["id"],
            "counsellor_id": OFFICIAL_PROFILES[1]["id"],
            "protection_officer_id": OFFICIAL_PROFILES[2]["id"],
            "assigned_at": reg_date + "T09:00:00Z",
            "status": "ACTIVE"
        })

        # 4. Credentials Record (for Developer CSV export)
        credentials.append({
            "victim_id": victim_uuid,
            "victim_code": victim_code,
            "login_identifier": victim_code,
            "email": email,
            "temporary_password": password,
            "full_name": full_name,
            "gender": gender,
            "age_group": age_group,
            "case_code": case_code,
            "case_category": category_name
        })

        # 5. Longitudinal Check-ins (5 to 10 per victim)
        num_checkins = random.randint(5, 10)
        baseline_distress = random.uniform(30.0, 75.0)
        trend_direction = random.choice(["increasing", "decreasing", "fluctuating", "stable"])

        current_distress = baseline_distress
        for c_idx in range(num_checkins):
            checkin_uuid = str(uuid.uuid4())
            assessment_uuid = str(uuid.uuid4())

            checkin_date = (datetime.strptime(reg_date, "%Y-%m-%d") + timedelta(days=(c_idx * 4) + random.randint(1, 3)))
            checkin_iso = checkin_date.strftime("%Y-%m-%dT%H:%M:%SZ")

            if trend_direction == "increasing":
                current_distress = min(96.0, current_distress + random.uniform(2.0, 9.0))
            elif trend_direction == "decreasing":
                current_distress = max(18.0, current_distress - random.uniform(2.0, 7.0))
            elif trend_direction == "fluctuating":
                current_distress = max(20.0, min(92.0, current_distress + random.uniform(-8.0, 9.0)))
            else:
                current_distress = max(22.0, min(80.0, current_distress + random.uniform(-2.5, 2.5)))

            score = round(current_distress, 1)
            if score >= 75.0:
                risk_lvl = "CRITICAL"
            elif score >= 50.0:
                risk_lvl = "HIGH"
            elif score >= 25.0:
                risk_lvl = "MODERATE"
            else:
                risk_lvl = "LOW"

            has_threat = (risk_lvl == "CRITICAL" and random.random() < 0.6) or (random.random() < 0.08)
            imm_danger = (score >= 85.0 and has_threat)

            checkin_obj = {
                "id": checkin_uuid,
                "victim_id": victim_uuid,
                "checkin_time": checkin_iso,
                "channel": "web",
                "language": pref_lang,
                "stress_score": round(score * 0.9, 1),
                "anxiety_score": round(score * 0.95, 1),
                "fear_score": round(score * (1.1 if has_threat else 0.8), 1),
                "sleep_score": round(score * 0.85, 1),
                "safety_score": round(max(5.0, 100.0 - score), 1),
                "threat_score": round(score * (1.15 if has_threat else 0.3), 1),
                "social_support_score": round(random.uniform(40.0, 85.0), 1),
                "functioning_score": round(score * 0.75, 1),
                "case_related_distress": round(score * 0.9, 1),
                "immediate_danger": imm_danger,
                "completed": True,
                "is_assisted": (c_idx == 0 and random.random() < 0.3),
                "recorded_by": OFFICIAL_PROFILES[0]["id"] if (c_idx == 0 and random.random() < 0.3) else None,
                "is_synthetic": True
            }
            checkins.append(checkin_obj)

            factors = []
            if score >= 70:
                factors.append({"factor": "Elevated fear of retaliation from accused party", "impact": "high"})
                factors.append({"factor": f"Upcoming court date on {next_hearing}", "impact": "high"})
            elif score >= 45:
                factors.append({"factor": "Procedural trial stress and livelihood disruption", "impact": "moderate"})
            else:
                factors.append({"factor": "Supportive community and active legal aid", "impact": "positive"})

            assessments.append({
                "id": assessment_uuid,
                "victim_id": victim_uuid,
                "checkin_id": checkin_uuid,
                "assessment_time": checkin_iso,
                "rule_based_score": score,
                "ml_prediction": score,
                "dynamic_distress_score": score,
                "risk_level": risk_lvl,
                "distress_trend": "Rapidly Increasing" if score > 75 and trend_direction == "increasing" else (
                    "Increasing" if trend_direction == "increasing" else (
                        "Improving" if trend_direction == "decreasing" else "Stable"
                    )
                ),
                "predicted_escalation": score >= 65.0,
                "escalation_probability": round(min(0.98, score / 100.0 + (0.15 if has_threat else -0.1)), 2),
                "explanation": {"top_factors": factors},
                "is_synthetic": True
            })

            # Create Alert on latest high/critical checkin
            if c_idx == num_checkins - 1 and (risk_lvl in ["CRITICAL", "HIGH"] or imm_danger):
                alert_uuid = str(uuid.uuid4())
                alerts.append({
                    "id": alert_uuid,
                    "victim_id": victim_uuid,
                    "victim_code": victim_code,
                    "victim_name": full_name,
                    "assessment_id": assessment_uuid,
                    "alert_type": "IMMEDIATE_DANGER_ALARM" if imm_danger else ("CRITICAL_DISTRESS_ESCALATION" if risk_lvl == "CRITICAL" else "HIGH_ANXIETY_SURGE"),
                    "severity": "CRITICAL" if imm_danger or risk_lvl == "CRITICAL" else "HIGH",
                    "message": f"Victim {victim_code} ({full_name}) registered distress score {score}/100 in NTR District. Urgent review recommended.",
                    "assigned_to": OFFICIAL_PROFILES[2]["id"], # Protection officer
                    "status": "NEW" if random.random() < 0.5 else "IN_PROGRESS",
                    "created_at": checkin_iso
                })

        # Threat event if elevated fear
        if any(c["fear_score"] > 70 for c in checkins[-num_checkins:]):
            threat_events.append({
                "id": str(uuid.uuid4()),
                "victim_id": victim_uuid,
                "case_id": case_uuid,
                "reported_at": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat() + "Z",
                "threat_type": random.choice(["Witness Coercion / Verbal Threat", "Physical Harassment", "Social Exclusion Enforcement"]),
                "severity": random.choice([3, 4, 5]),
                "description": f"Incident reported in {station} jurisdiction. Protection officer intervention requested.",
                "action_taken": "Escalated to District Protection Officer; Local police station patrol dispatched.",
                "status": "OPEN" if random.random() < 0.4 else "RESOLVED"
            })

        # Welfare record
        welfare_records.append({
            "id": str(uuid.uuid4()),
            "victim_id": victim_uuid,
            "compensation_status": random.choice(["First Installment Disbursed (₹100,000)", "Application Sanctioned", "Pending Police Verification"]),
            "rehabilitation_status": random.choice(["Skill Training Enrolled", "Educational Grant Sanctioned", "Temporary Relocation Under Review", "Safe Shelter Provided"]),
            "financial_assistance_status": "Sanctioned",
            "legal_aid_status": "Government Legal Aid Counsel Appointed"
        })

    return {
        "officials": OFFICIAL_PROFILES,
        "victims": victims,
        "cases": cases,
        "credentials": credentials,
        "case_assignments": case_assignments,
        "checkins": checkins,
        "assessments": assessments,
        "alerts": alerts,
        "threat_events": threat_events,
        "welfare_records": welfare_records
    }

def main():
    print("=" * 70)
    print("SIH 2026: Generating 100 Synthetic Victim Cases + Credentials + Officials")
    print("=" * 70)

    dataset = generate_synthetic_dataset(100)

    print(f"  [+] Official Demo Accounts: {len(dataset['officials'])}")
    for off in dataset['officials']:
        print(f"      - {off['role'].ljust(18)} : {off['email']} (Pwd: {off['password']})")

    print(f"\n  [+] Victims Generated:     {len(dataset['victims'])} (VIC-DEMO-0001 to VIC-DEMO-0100)")
    print(f"  [+] Cases Generated:       {len(dataset['cases'])} (CASE-DEMO-0001 to CASE-DEMO-0100)")
    print(f"  [+] Check-ins Generated:   {len(dataset['checkins'])} (Average {len(dataset['checkins']) // 100} per victim)")
    print(f"  [+] AI Assessments:        {len(dataset['assessments'])}")
    print(f"  [+] Active Alerts:         {len(dataset['alerts'])}")
    print(f"  [+] Threat Events:         {len(dataset['threat_events'])}")

    # 1. Export Developer CSV for Evaluator Demo Testing
    csv_path = os.path.join(os.path.dirname(__file__), "synthetic_victim_credentials.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "victim_id", "victim_code", "login_identifier", "email",
            "temporary_password", "full_name", "gender", "age_group",
            "case_code", "case_category"
        ])
        writer.writeheader()
        for cred in dataset["credentials"]:
            writer.writerow(cred)
    print(f"\n  [OK] Exported Developer Credentials CSV: {os.path.abspath(csv_path)}")

    # 2. Save JSON Dataset for Backend Services
    out_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "app", "data")
    os.makedirs(out_dir, exist_ok=True)
    json_path = os.path.join(out_dir, "synthetic_100_victims.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
    print(f"  [OK] Saved JSON Fixture: {os.path.abspath(json_path)}")

    # 3. Generate Idempotent SQL Seed
    sql_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed_100_victims.sql")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- Idempotent Synthetic 100 Victims & Officials for NTR District (AP-NTR-01)\n")
        f.write("-- Smart India Hackathon (SIH 2026) - Victim Safety & Rehabilitation Portal\n\n")

        # Districts
        f.write("-- 0. Seed Districts (Required for foreign key references)\n")
        f.write("INSERT INTO districts (id, name, state, district_code) VALUES \n")
        f.write("('11111111-1111-1111-1111-111111111111', 'NTR District (Vijayawada)', 'Andhra Pradesh', 'AP-NTR-01'),\n")
        f.write("('22222222-2222-2222-2222-222222222222', 'Guntur', 'Andhra Pradesh', 'AP-GNT-02'),\n")
        f.write("('33333333-3333-3333-3333-333333333333', 'Visakhapatnam', 'Andhra Pradesh', 'AP-VSKP-03'),\n")
        f.write("('44444444-4444-4444-4444-444444444444', 'Tirupati', 'Andhra Pradesh', 'AP-TPT-04'),\n")
        f.write("('55555555-5555-5555-5555-555555555555', 'Kurnool', 'Andhra Pradesh', 'AP-KRN-05')\n")
        f.write("ON CONFLICT (id) DO NOTHING;\n\n")

        # Officials
        f.write("-- 1. Predefined Official Demo Profiles\n")
        for off in dataset["officials"]:
            f.write(
                f"INSERT INTO profiles (id, full_name, email, phone, role, district_id, preferred_language, is_active, is_synthetic) "
                f"VALUES ('{off['id']}', '{off['full_name']}', '{off['email']}', '{off['phone']}', '{off['role']}', '{off['district_id']}', '{off['preferred_language']}', TRUE, TRUE) "
                f"ON CONFLICT (id) DO NOTHING;\n"
            )

        # Victims
        f.write("\n-- 1. Synthetic Victims\n")
        for v in dataset["victims"]:
            f.write(
                f"INSERT INTO victims (id, victim_code, age_group, gender, preferred_language, preferred_channel, consent_status, registration_date, district_id, is_active, is_synthetic) "
                f"VALUES ('{v['id']}', '{v['victim_code']}', '{v['age_group']}', '{v['gender']}', '{v['preferred_language']}', '{v['preferred_channel']}', TRUE, '{v['registration_date']}', '{v['district_id']}', TRUE, TRUE) "
                f"ON CONFLICT (id) DO NOTHING;\n"
            )

        # Cases
        f.write("\n-- 2. Synthetic Cases\n")
        for c in dataset["cases"]:
            escaped_type = c['case_type'].replace("'", "''")
            f.write(
                f"INSERT INTO cases (id, victim_id, case_code, case_type, complaint_date, registration_date, police_station, district_id, case_stage, investigation_status, court_case_status, days_since_complaint, number_of_hearings, next_hearing_date, is_synthetic) "
                f"VALUES ('{c['id']}', '{c['victim_id']}', '{c['case_code']}', '{escaped_type}', '{c['complaint_date']}', '{c['registration_date']}', '{c['police_station']}', '{c['district_id']}', '{c['case_stage']}', '{c['investigation_status']}', '{c['court_case_status']}', {c['days_since_complaint']}, {c['number_of_hearings']}, '{c['next_hearing_date']}', TRUE) "
                f"ON CONFLICT (id) DO NOTHING;\n"
            )

        # Checkins
        f.write("\n-- 3. Mental Health Checkins\n")
        for chk in dataset["checkins"]:
            f.write(
                f"INSERT INTO mental_health_checkins (id, victim_id, checkin_time, channel, language, stress_score, anxiety_score, fear_score, sleep_score, safety_score, immediate_danger, completed, is_synthetic) "
                f"VALUES ('{chk['id']}', '{chk['victim_id']}', '{chk['checkin_time']}', '{chk['channel']}', '{chk['language']}', {chk['stress_score']}, {chk['anxiety_score']}, {chk['fear_score']}, {chk['sleep_score']}, {chk['safety_score']}, {'TRUE' if chk['immediate_danger'] else 'FALSE'}, TRUE, TRUE) "
                f"ON CONFLICT (id) DO NOTHING;\n"
            )

    print(f"  [OK] Saved Idempotent SQL Seed: {os.path.abspath(sql_path)}")
    print("=" * 70)
    print("100 Synthetic Victims & Official Credential Export Complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
