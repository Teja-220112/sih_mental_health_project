import os
import json
import uuid
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from app.risk.scoring_engine import scoring_engine
from app.nlp.nlp_engine import nlp_engine
from app.services.supabase_service import supabase_service

class MockDatabaseService:
    """
    High-Performance Data Store for MoSJE Prototype.
    Pre-populated with 100 synthetic victim cases for NTR District (AP-NTR-01), Andhra Pradesh.
    """
    def __init__(self):
        self.districts = [
            {'id': '11111111-1111-1111-1111-111111111111', 'name': 'NTR District (Vijayawada)', 'state': 'Andhra Pradesh', 'district_code': 'AP-NTR-01'},
            {'id': '22222222-2222-2222-2222-222222222222', 'name': 'Guntur', 'state': 'Andhra Pradesh', 'district_code': 'AP-GNT-02'},
            {'id': '33333333-3333-3333-3333-333333333333', 'name': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'district_code': 'AP-VSKP-03'},
            {'id': '44444444-4444-4444-4444-444444444444', 'name': 'Tirupati', 'state': 'Andhra Pradesh', 'district_code': 'AP-TPT-04'},
            {'id': '55555555-5555-5555-5555-555555555555', 'name': 'Kurnool', 'state': 'Andhra Pradesh', 'district_code': 'AP-KRN-05'}
        ]

        self.profiles = [
            # Predefined Hackathon Demo Officials (Part 5)
            {'id': '11000000-0000-0000-0000-000000000001', 'full_name': 'Inspector Vijay Prakash (Registration Officer)', 'email': 'police.demo@sih.test', 'password': 'SIH-Police@2026', 'role': 'police_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '20000000-0000-0000-0000-000000000002', 'full_name': 'Dr. Ananya Sharma (Senior Counsellor)', 'email': 'counsellor.demo@sih.test', 'password': 'SIH-Counsel@2026', 'role': 'counsellor', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '35000000-0000-0000-0000-000000000001', 'full_name': 'Smt. K. Ratna Kumari (Protection Officer)', 'email': 'protection.demo@sih.test', 'password': 'SIH-Protect@2026', 'role': 'protection_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '40000000-0000-0000-0000-000000000004', 'full_name': 'Rajesh Verma (District Administrator)', 'email': 'admin.demo@sih.test', 'password': 'SIH-Admin@2026', 'role': 'district_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            
            # Legacy/Alternate handles
            {'id': '10000000-0000-0000-0000-000000000001', 'full_name': 'Sunita Devi (Victim Demo)', 'email': 'victim@demo.mosje.gov.in', 'password': 'demo', 'role': 'victim', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '20000000-0000-0000-0000-000000000003', 'full_name': 'Dr. Ananya Sharma', 'email': 'counsellor@demo.mosje.gov.in', 'password': 'demo', 'role': 'counsellor', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '30000000-0000-0000-0000-000000000003', 'full_name': 'Rajesh Verma', 'email': 'district@demo.mosje.gov.in', 'password': 'demo', 'role': 'district_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '35000000-0000-0000-0000-000000000002', 'full_name': 'Smt. K. Ratna Kumari', 'email': 'protection@demo.mosje.gov.in', 'password': 'demo', 'role': 'protection_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '40000000-0000-0000-0000-000000000005', 'full_name': 'MoSJE Admin', 'email': 'admin@demo.mosje.gov.in', 'password': 'demo', 'role': 'admin', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'}
        ]

        # Load preloaded 100 synthetic victims if available
        synthetic_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic_100_victims.json')
        if os.path.exists(synthetic_path):
            with open(synthetic_path, 'r', encoding='utf-8') as f:
                syn_data = json.load(f)
                self.victims = syn_data.get('victims', [])
                self.cases = syn_data.get('cases', [])
                self.assessments = syn_data.get('assessments', [])
                self.alerts = syn_data.get('alerts', [])
                self.threat_events = syn_data.get('threat_events', [])
                self.welfare_records = syn_data.get('welfare_records', [])
                self.checkins = syn_data.get('checkins', [])
                self.credentials = syn_data.get('credentials', [])
                self.case_assignments = syn_data.get('case_assignments', [])
        else:
            self.victims = [
                {'id': '70000000-0000-0000-0000-000000000001', 'profile_id': '10000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-DEMO-0001', 'age_group': '26-35', 'gender': 'Female', 'preferred_language': 'en', 'consent_status': True, 'registration_date': '2026-08-01', 'district_id': '11111111-1111-1111-1111-111111111111', 'name': 'Sunita Devi', 'is_synthetic': True},
                {'id': '70000000-0000-0000-0000-000000000002', 'profile_id': '50000000-0000-0000-0000-000000000005', 'victim_code': 'VIC-DEMO-0002', 'age_group': '36-50', 'gender': 'Male', 'preferred_language': 'te', 'consent_status': True, 'registration_date': '2026-08-10', 'district_id': '22222222-2222-2222-2222-222222222222', 'name': 'Ramesh Kumar', 'is_synthetic': True}
            ]
            self.cases = [
                {'id': '80000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'case_code': 'CASE-DEMO-0001', 'case_type': 'SC/ST Atrocity & Intimidation', 'complaint_date': '2026-08-01', 'police_station': 'Suryaraopet Police Station, Vijayawada', 'district_id': '11111111-1111-1111-1111-111111111111', 'case_stage': 'Court / Trial', 'investigation_status': 'Charge Sheet Filed', 'court_case_status': 'Trial Commenced', 'days_since_complaint': 35, 'number_of_hearings': 3, 'next_hearing_date': '2026-09-12', 'is_synthetic': True}
            ]
            self.assessments = [
                {'id': '90000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-09-04T10:00:00Z', 'dynamic_distress_score': 43.0, 'risk_level': 'MODERATE', 'distress_trend': 'Improving', 'explanation': {'top_factors': [{'factor': 'Stable safety condition & counselling active', 'impact': 'positive'}]}}
            ]
            self.alerts = [
                {'id': 'a0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-DEMO-0001', 'alert_type': 'CRITICAL_DISTRESS_ESCALATION', 'severity': 'CRITICAL', 'message': 'Distress score peaked at 82/100 following threat report. Urgent protection review required.', 'status': 'IN_PROGRESS', 'created_at': '2026-08-20T10:05:00Z'}
            ]
            self.threat_events = [
                {'id': 'c0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'reported_at': '2026-08-20T08:30:00Z', 'threat_type': 'Witness Coercion & Verbal Threat', 'severity': 5, 'description': 'Two individuals approached victim near village square warning her against testifying.', 'action_taken': 'Escalated to District Protection Officer; FIR update requested.', 'status': 'RESOLVED'}
            ]
            self.welfare_records = [
                {'id': 'd0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'compensation_status': 'First Installment Disbursed (₹100,000)', 'rehabilitation_status': 'Temporary Relocation Approved', 'financial_assistance_status': 'Sanctioned', 'legal_aid_status': 'Government Advocate Assigned'}
            ]
            self.checkins = []
            self.credentials = []
            self.case_assignments = []

        self.interventions = [
            {'id': 'b0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-DEMO-0001', 'intervention_type': 'Urgent In-Person Counselling & Protection Escort', 'recommended_by_ai': True, 'approved_by': 'Rajesh Verma', 'status': 'COMPLETED', 'scheduled_at': '2026-08-21T09:00:00Z', 'completed_at': '2026-08-21T11:30:00Z', 'outcome': 'Counselling completed; police protection escort assigned during trial sessions.', 'notes': 'Victim reported feeling much safer following police deployment.'}
        ]
        self.chat_messages = []
        self.chat_emotion_analyses = []

    def add_chat_emotion_analysis(self, victim_id: str, session_id: str, message_id: str, nlp_analysis: dict) -> dict:
        analysis_id = str(uuid.uuid4())
        record = {
            'id': analysis_id,
            'victim_id': victim_id,
            'session_id': session_id,
            'message_id': message_id,
            'sentiment_label': nlp_analysis.get('sentiment_label', 'NEUTRAL'),
            'sentiment_score': nlp_analysis.get('sentiment_score', 0.5),
            'emotion_label': nlp_analysis.get('emotion_label', 'neutral'),
            'emotion_score': nlp_analysis.get('emotion_score', 0.5),
            'threat_signal': nlp_analysis.get('threat_signal', False),
            'threat_score': nlp_analysis.get('threat_score', 0),
            'extracted_entities': nlp_analysis.get('extracted_entities', []),
            'created_at': datetime.utcnow().isoformat() + 'Z'
        }
        self.chat_emotion_analyses.append(record)
        try:
            supabase_service.insert_record('chat_emotion_analyses', record)
        except Exception:
            pass
        return record

    def get_chat_emotion_analyses(self, victim_id: str) -> List[Dict[str, Any]]:
        return [a for a in self.chat_emotion_analyses if a.get('victim_id') == victim_id]

    def get_victim_by_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        for v in self.victims:
            if v.get('profile_id') == profile_id:
                return v
        return self.victims[0]

    def get_victim_by_id(self, victim_id: str) -> Optional[Dict[str, Any]]:
        for v in self.victims:
            if v.get('id') == victim_id:
                return v
        return None

    def add_checkin(self, victim_id: str, checkin_data: dict) -> dict:
        checkin_id = str(uuid.uuid4())
        checkin_obj = {
            'id': checkin_id,
            'victim_id': victim_id,
            'checkin_time': datetime.utcnow().isoformat() + 'Z',
            **checkin_data
        }
        self.checkins.append(checkin_obj)

        # Run NLP on free text if present
        free_text = checkin_data.get('free_text_response', '')
        nlp_res = nlp_engine.analyze_text(free_text)

        # Domain scores
        responses = {
            'stress': checkin_data.get('stress_score', 0) * 25,
            'anxiety': checkin_data.get('anxiety_score', 0) * 25,
            'fear': checkin_data.get('fear_score', 0) * 25,
            'sleep': checkin_data.get('sleep_score', 0) * 25,
            'safety': checkin_data.get('safety_score', 4) * 25,
            'threat': checkin_data.get('threat_score', 0) * 25,
            'social_support': checkin_data.get('social_support_score', 4) * 25,
            'functioning': checkin_data.get('functioning_score', 0) * 25,
            'case_related_distress': checkin_data.get('case_related_distress', 0) * 25
        }

        domain_res = scoring_engine.calculate_questionnaire_distress(responses)
        
        # Get previous score
        victim_history = [a for a in self.assessments if a['victim_id'] == victim_id]
        prev_score = victim_history[-1]['dynamic_distress_score'] if victim_history else 40.0

        imm_danger = checkin_data.get('immediate_danger', False)

        assessment = scoring_engine.compute_dynamic_distress_score(
            domain_scores=domain_res,
            nlp_res=nlp_res,
            previous_score=prev_score,
            case_risk_score=30.0,
            immediate_danger=imm_danger
        )

        assessment_id = str(uuid.uuid4())
        assessment_obj = {
            'id': assessment_id,
            'victim_id': victim_id,
            'checkin_id': checkin_id,
            'assessment_time': datetime.utcnow().isoformat() + 'Z',
            **assessment
        }
        self.assessments.append(assessment_obj)

        # Alert generation if HIGH or CRITICAL
        if assessment['risk_level'] in ['HIGH', 'CRITICAL'] or imm_danger:
            alert_id = str(uuid.uuid4())
            victim_info = self.get_victim_by_id(victim_id)
            code = victim_info['victim_code'] if victim_info else 'VIC-2026-UNKNOWN'
            alert_obj = {
                'id': alert_id,
                'victim_id': victim_id,
                'victim_code': code,
                'alert_type': 'IMMEDIATE_SAFETY_GATE' if imm_danger else f"{assessment['risk_level']}_DISTRESS_ELEVATION",
                'severity': assessment['risk_level'],
                'message': f"Victim {code} recorded new distress check-in with score {assessment['dynamic_distress_score']}/100 ({assessment['risk_level']}). Human review required.",
                'status': 'NEW',
                'created_at': datetime.utcnow().isoformat() + 'Z'
            }
            self.alerts.insert(0, alert_obj)

        # Cloud Sync to Supabase
        try:
            supabase_service.insert_record('mental_health_checkins', checkin_obj)
            supabase_service.insert_record('ai_assessments', assessment_obj)
            if imm_danger or assessment['risk_level'] in ['HIGH', 'CRITICAL']:
                supabase_service.insert_record('alerts', alert_obj)
        except Exception:
            pass

        return assessment_obj

    def register_victim_and_case(self, officer_id: str, data: dict) -> dict:
        """
        Official Registration Workflow:
        Creates a new victim profile, case record, and generates secure,
        one-time login credentials for the officer to privately hand to the victim.
        """
        victim_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())
        case_id = str(uuid.uuid4())
        
        next_num = len(self.victims) + 1
        victim_code = f"VIC-DEMO-{next_num:04d}"
        case_code = f"CASE-DEMO-{next_num:04d}"
        temp_password = f"Victim@2026#{next_num:03d}"
        email = data.get('email') or f"victim{next_num:03d}@sih.test"

        victim_record = {
            'id': victim_id,
            'profile_id': profile_id,
            'victim_code': victim_code,
            'name': data.get('name', f"Victim {victim_code}"),
            'email': email,
            'temporary_password': temp_password,
            'age_group': data.get('age_group', '26-35'),
            'gender': data.get('gender', 'Female'),
            'preferred_language': data.get('preferred_language', 'en'),
            'preferred_channel': 'web',
            'consent_status': True,
            'registration_date': datetime.utcnow().strftime('%Y-%m-%d'),
            'district_id': data.get('district_id', '11111111-1111-1111-1111-111111111111'),
            'district_name': 'NTR District (Vijayawada)',
            'district_code': 'AP-NTR-01',
            'assigned_counsellor': data.get('assigned_counsellor', 'Dr. Ananya Sharma'),
            'assigned_protection_officer': data.get('assigned_protection_officer', 'Smt. K. Ratna Kumari'),
            'assigned_registration_officer': 'Inspector Vijay Prakash',
            'is_synthetic': True,
            'is_active': True
        }
        self.victims.insert(0, victim_record)

        case_record = {
            'id': case_id,
            'victim_id': victim_id,
            'case_code': case_code,
            'case_category': data.get('case_category', 'Assault and physical violence'),
            'case_type': data.get('case_type', f"{data.get('case_category', 'Assault')} - {data.get('incident_description', 'SC/ST PoA Act Incident')}"),
            'incident_description': data.get('incident_description', 'Incident registered under SC/ST Protection of Atrocities Act.'),
            'complaint_date': data.get('complaint_date', datetime.utcnow().strftime('%Y-%m-%d')),
            'registration_date': datetime.utcnow().strftime('%Y-%m-%d'),
            'police_station': data.get('police_station', 'Suryaraopet Police Station, Vijayawada'),
            'district_id': data.get('district_id', '11111111-1111-1111-1111-111111111111'),
            'case_stage': 'Investigation',
            'investigation_status': 'Under Investigation',
            'court_case_status': 'Pre-Trial',
            'days_since_complaint': 1,
            'number_of_hearings': 0,
            'next_hearing_date': '2026-10-15',
            'protection_status': 'Active Police Patrol' if data.get('protection_required') else 'Under Evaluation',
            'rehabilitation_requirements': data.get('rehabilitation_requirements', 'Legal Aid Support Sanctioned'),
            'is_synthetic': True
        }
        self.cases.insert(0, case_record)

        # Baseline assessment
        baseline_score = 45.0
        assessment_id = str(uuid.uuid4())
        self.assessments.append({
            'id': assessment_id,
            'victim_id': victim_id,
            'assessment_time': datetime.utcnow().isoformat() + 'Z',
            'dynamic_distress_score': baseline_score,
            'risk_level': 'MODERATE',
            'distress_trend': 'Stable',
            'explanation': {'top_factors': [{'factor': 'Baseline case intake recorded by registration official', 'impact': 'moderate'}]}
        })

        # Save credential for immediate victim portal login
        cred_record = {
            'victim_id': victim_id,
            'victim_code': victim_code,
            'login_identifier': victim_code,
            'email': email,
            'temporary_password': temp_password,
            'full_name': victim_record['name'],
            'gender': victim_record['gender'],
            'age_group': victim_record['age_group'],
            'case_code': case_code,
            'case_category': case_record['case_category']
        }
        self.credentials.insert(0, cred_record)

        # Cloud Sync to Supabase
        try:
            supabase_service.insert_record('victims', {
                'id': victim_id,
                'victim_code': victim_code,
                'age_group': victim_record['age_group'],
                'gender': victim_record['gender'],
                'preferred_language': victim_record['preferred_language'],
                'preferred_channel': victim_record['preferred_channel'],
                'consent_status': victim_record['consent_status'],
                'registration_date': victim_record['registration_date'],
                'district_id': victim_record['district_id'],
                'is_active': True,
                'is_synthetic': True
            })
            supabase_service.insert_record('cases', {
                'id': case_id,
                'victim_id': victim_id,
                'case_code': case_code,
                'case_category': case_record['case_category'],
                'case_type': case_record['case_type'],
                'incident_description': case_record['incident_description'],
                'complaint_date': case_record['complaint_date'],
                'registration_date': case_record['registration_date'],
                'police_station': case_record['police_station'],
                'district_id': case_record['district_id'],
                'case_stage': case_record['case_stage'],
                'investigation_status': case_record['investigation_status'],
                'court_case_status': case_record['court_case_status'],
                'days_since_complaint': case_record['days_since_complaint'],
                'number_of_hearings': case_record['number_of_hearings'],
                'next_hearing_date': case_record['next_hearing_date'],
                'is_synthetic': True
            })
        except Exception:
            pass

        return {
            'victim_id': victim_id,
            'victim_code': victim_code,
            'login_identifier': victim_code,
            'email': email,
            'temporary_password': temp_password,
            'name': victim_record['name'],
            'case_code': case_code,
            'assigned_counsellor': victim_record['assigned_counsellor'],
            'assigned_protection_officer': victim_record['assigned_protection_officer'],
            'message': 'Victim profile and case registered successfully. Privately provide these credentials to the victim.'
        }

    def add_assisted_checkin(self, officer_id: str, victim_id: str, checkin_data: dict) -> dict:
        checkin_data['is_assisted'] = True
        checkin_data['recorded_by'] = officer_id
        return self.add_checkin(victim_id, checkin_data)

    def authenticate_user(self, identifier: str, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
        clean_id = (identifier or '').strip().lower()
        clean_pass = (password or '').strip()

        # 1. Match official profile
        for prof in self.profiles:
            if prof.get('email', '').lower() == clean_id or prof.get('role', '').lower() == clean_id:
                if not clean_pass or clean_pass == 'demo' or prof.get('password') == clean_pass or prof.get('role') == clean_pass:
                    return {'user': prof, 'victim': None, 'role': prof['role']}
        
        # 2. Match victim credentials
        for cred in self.credentials:
            if (cred.get('login_identifier', '').lower() == clean_id or 
                cred.get('victim_code', '').lower() == clean_id or 
                cred.get('email', '').lower() == clean_id or 
                cred.get('victim_id', '') == clean_id):
                if (not clean_pass or 
                    clean_pass == 'demo' or 
                    cred.get('temporary_password') == clean_pass or 
                    clean_pass == 'Victim@2026' or
                    clean_pass.lower() == 'victim'):
                    victim = self.get_victim_by_id(cred['victim_id'])
                    user_profile = {
                        'id': cred['victim_id'],
                        'full_name': cred.get('full_name', victim.get('name', 'Victim') if victim else 'Victim'),
                        'email': cred.get('email', ''),
                        'role': 'victim',
                        'district_id': victim.get('district_id', '11111111-1111-1111-1111-111111111111') if victim else '11111111-1111-1111-1111-111111111111',
                        'preferred_language': victim.get('preferred_language', 'en') if victim else 'en'
                    }
                    return {'user': user_profile, 'victim': victim, 'role': 'victim'}

        # 3. Match victim list directly by victim_code or name or email
        for vic in self.victims:
            if (vic.get('victim_code', '').lower() == clean_id or 
                vic.get('email', '').lower() == clean_id or 
                vic.get('id', '') == clean_id):
                user_profile = {
                    'id': vic['id'],
                    'full_name': vic.get('name', 'Victim'),
                    'email': vic.get('email', f"{vic['victim_code'].lower()}@sih.test"),
                    'role': 'victim',
                    'district_id': vic.get('district_id', '11111111-1111-1111-1111-111111111111'),
                    'preferred_language': vic.get('preferred_language', 'en')
                }
                return {'user': user_profile, 'victim': vic, 'role': 'victim'}

        return None

db_service = MockDatabaseService()
