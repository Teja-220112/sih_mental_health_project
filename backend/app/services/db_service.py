import uuid
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from app.risk.scoring_engine import scoring_engine
from app.nlp.nlp_engine import nlp_engine

class MockDatabaseService:
    """
    High-Performance Data Store for MoSJE Prototype.
    Pre-populated with realistic longitudinal demo data using valid Hexadecimal UUIDs.
    """
    def __init__(self):
        self.districts = [
            {'id': '11111111-1111-1111-1111-111111111111', 'name': 'Pune', 'state': 'Maharashtra', 'district_code': 'MH-PUNE-01'},
            {'id': '22222222-2222-2222-2222-222222222222', 'name': 'Nagpur', 'state': 'Maharashtra', 'district_code': 'MH-NAGP-02'},
            {'id': '33333333-3333-3333-3333-333333333333', 'name': 'Nashik', 'state': 'Maharashtra', 'district_code': 'MH-NASH-03'},
            {'id': '44444444-4444-4444-4444-444444444444', 'name': 'Thane', 'state': 'Maharashtra', 'district_code': 'MH-THAN-04'},
            {'id': '55555555-5555-5555-5555-555555555555', 'name': 'Chhatrapati Sambhajinagar', 'state': 'Maharashtra', 'district_code': 'MH-CSAM-05'}
        ]

        self.profiles = [
            {'id': '10000000-0000-0000-0000-000000000001', 'full_name': 'Sunita Devi (Victim Demo)', 'email': 'victim@demo.mosje.gov.in', 'role': 'victim', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '20000000-0000-0000-0000-000000000002', 'full_name': 'Dr. Ananya Sharma (Counsellor)', 'email': 'counsellor@demo.mosje.gov.in', 'role': 'counsellor', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '30000000-0000-0000-0000-000000000003', 'full_name': 'Rajesh Verma (District Officer)', 'email': 'district@demo.mosje.gov.in', 'role': 'district_officer', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '40000000-0000-0000-0000-000000000004', 'full_name': 'System Administrator (MoSJE)', 'email': 'admin@demo.mosje.gov.in', 'role': 'admin', 'district_id': '11111111-1111-1111-1111-111111111111', 'preferred_language': 'en'},
            {'id': '50000000-0000-0000-0000-000000000005', 'full_name': 'Ramesh Kumar (Victim 2)', 'email': 'victim2@demo.mosje.gov.in', 'role': 'victim', 'district_id': '22222222-2222-2222-2222-222222222222', 'preferred_language': 'hi'}
        ]

        self.victims = [
            {'id': '70000000-0000-0000-0000-000000000001', 'profile_id': '10000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-2026-101', 'age_group': '26-35', 'gender': 'Female', 'preferred_language': 'en', 'consent_status': True, 'registration_date': '2026-08-01', 'district_id': '11111111-1111-1111-1111-111111111111', 'name': 'Sunita Devi'},
            {'id': '70000000-0000-0000-0000-000000000002', 'profile_id': '50000000-0000-0000-0000-000000000005', 'victim_code': 'VIC-2026-102', 'age_group': '36-50', 'gender': 'Male', 'preferred_language': 'hi', 'consent_status': True, 'registration_date': '2026-08-10', 'district_id': '22222222-2222-2222-2222-222222222222', 'name': 'Ramesh Kumar'},
            {'id': '70000000-0000-0000-0000-000000000003', 'profile_id': None, 'victim_code': 'VIC-2026-103', 'age_group': '18-25', 'gender': 'Female', 'preferred_language': 'en', 'consent_status': True, 'registration_date': '2026-08-15', 'district_id': '11111111-1111-1111-1111-111111111111', 'name': 'Priya S.'},
            {'id': '70000000-0000-0000-0000-000000000004', 'profile_id': None, 'victim_code': 'VIC-2026-104', 'age_group': '50+', 'gender': 'Male', 'preferred_language': 'mr', 'consent_status': True, 'registration_date': '2026-08-18', 'district_id': '33333333-3333-3333-3333-333333333333', 'name': 'Ganpat R.'}
        ]

        self.cases = [
            {'id': '80000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'case_code': 'POA-PUNE-2026-042', 'case_type': 'SC/ST Atrocity & Intimidation', 'complaint_date': '2026-08-01', 'police_station': 'Haveli Police Station', 'district_id': '11111111-1111-1111-1111-111111111111', 'case_stage': 'Court / Trial', 'investigation_status': 'Charge Sheet Filed', 'court_case_status': 'Trial Commenced', 'days_since_complaint': 35, 'number_of_hearings': 3, 'next_hearing_date': '2026-09-12'},
            {'id': '80000000-0000-0000-0000-000000000002', 'victim_id': '70000000-0000-0000-0000-000000000002', 'case_code': 'POA-NAGP-2026-089', 'case_type': 'Land Dispossess Atrocity', 'complaint_date': '2026-08-10', 'police_station': 'Sadar Police Station', 'district_id': '22222222-2222-2222-2222-222222222222', 'case_stage': 'Investigation', 'investigation_status': 'Under Investigation', 'court_case_status': 'Pre-Trial', 'days_since_complaint': 26, 'number_of_hearings': 1, 'next_hearing_date': '2026-09-20'}
        ]

        # Longitudinal history for VIC-2026-101
        self.assessments = [
            {'id': '90000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-05T10:00:00Z', 'dynamic_distress_score': 38.0, 'risk_level': 'MODERATE', 'distress_trend': 'Stable', 'explanation': {'top_factors': [{'factor': 'Baseline stress from case filing', 'impact': 'moderate'}]}},
            {'id': '90000000-0000-0000-0000-000000000002', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-09T10:00:00Z', 'dynamic_distress_score': 45.0, 'risk_level': 'MODERATE', 'distress_trend': 'Increasing', 'explanation': {'top_factors': [{'factor': 'Upcoming hearing anxiety', 'impact': 'moderate'}]}},
            {'id': '90000000-0000-0000-0000-000000000003', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-13T10:00:00Z', 'dynamic_distress_score': 57.0, 'risk_level': 'HIGH', 'distress_trend': 'Increasing', 'explanation': {'top_factors': [{'factor': 'Sleep disruption reported', 'impact': 'high'}]}},
            {'id': '90000000-0000-0000-0000-000000000004', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-17T10:00:00Z', 'dynamic_distress_score': 71.0, 'risk_level': 'HIGH', 'distress_trend': 'Increasing', 'explanation': {'top_factors': [{'factor': 'Verbal intimidation reported', 'impact': 'high'}]}},
            {'id': '90000000-0000-0000-0000-000000000005', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-20T10:00:00Z', 'dynamic_distress_score': 82.0, 'risk_level': 'CRITICAL', 'distress_trend': 'Rapidly Increasing', 'explanation': {'top_factors': [{'factor': 'Recent threat signal', 'impact': 'high'}, {'factor': 'Distress jumped by +11 points', 'impact': 'high'}, {'factor': 'Poor sleep & severe fear', 'impact': 'high'}]}},
            {'id': '90000000-0000-0000-0000-000000000006', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-24T10:00:00Z', 'dynamic_distress_score': 67.0, 'risk_level': 'HIGH', 'distress_trend': 'Improving', 'explanation': {'top_factors': [{'factor': 'Police escort provided', 'impact': 'positive'}]}},
            {'id': '90000000-0000-0000-0000-000000000007', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-08-29T10:00:00Z', 'dynamic_distress_score': 52.0, 'risk_level': 'HIGH', 'distress_trend': 'Improving', 'explanation': {'top_factors': [{'factor': 'Distress trend improving post intervention', 'impact': 'positive'}]}},
            {'id': '90000000-0000-0000-0000-000000000008', 'victim_id': '70000000-0000-0000-0000-000000000001', 'assessment_time': '2026-09-04T10:00:00Z', 'dynamic_distress_score': 43.0, 'risk_level': 'MODERATE', 'distress_trend': 'Improving', 'explanation': {'top_factors': [{'factor': 'Stable safety condition & counselling active', 'impact': 'positive'}]}},
            
            # Other victims
            {'id': '90000000-0000-0000-0000-000000000009', 'victim_id': '70000000-0000-0000-0000-000000000002', 'assessment_time': '2026-09-04T12:00:00Z', 'dynamic_distress_score': 76.0, 'risk_level': 'CRITICAL', 'distress_trend': 'Increasing', 'explanation': {'top_factors': [{'factor': 'Land dispute violence fear', 'impact': 'high'}]}},
            {'id': '90000000-0000-0000-0000-000000000010', 'victim_id': '70000000-0000-0000-0000-000000000003', 'assessment_time': '2026-09-03T09:00:00Z', 'dynamic_distress_score': 24.0, 'risk_level': 'LOW', 'distress_trend': 'Stable', 'explanation': {'top_factors': [{'factor': 'Good family support network', 'impact': 'positive'}]}},
            {'id': '90000000-0000-0000-0000-000000000011', 'victim_id': '70000000-0000-0000-0000-000000000004', 'assessment_time': '2026-09-02T15:00:00Z', 'dynamic_distress_score': 48.0, 'risk_level': 'MODERATE', 'distress_trend': 'Improving', 'explanation': {'top_factors': [{'factor': 'Legal aid assistance active', 'impact': 'positive'}]}}
        ]

        self.alerts = [
            {'id': 'a0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-2026-101', 'alert_type': 'CRITICAL_DISTRESS_ESCALATION', 'severity': 'CRITICAL', 'message': 'Distress score peaked at 82/100 following threat report. Urgent protection review required.', 'status': 'IN_PROGRESS', 'created_at': '2026-08-20T10:05:00Z'},
            {'id': 'a0000000-0000-0000-0000-000000000002', 'victim_id': '70000000-0000-0000-0000-000000000002', 'victim_code': 'VIC-2026-102', 'alert_type': 'HIGH_FEAR_SIGNAL', 'severity': 'CRITICAL', 'message': 'Intimidation signal detected in chat message regarding property dispute.', 'status': 'NEW', 'created_at': '2026-09-04T12:05:00Z'}
        ]

        self.interventions = [
            {'id': 'b0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'victim_code': 'VIC-2026-101', 'intervention_type': 'Urgent In-Person Counselling & Protection Escort', 'recommended_by_ai': True, 'approved_by': 'Rajesh Verma', 'status': 'COMPLETED', 'scheduled_at': '2026-08-21T09:00:00Z', 'completed_at': '2026-08-21T11:30:00Z', 'outcome': 'Counselling completed; police protection escort assigned during trial sessions.', 'notes': 'Victim reported feeling much safer following police deployment.'}
        ]

        self.threat_events = [
            {'id': 'c0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'reported_at': '2026-08-20T08:30:00Z', 'threat_type': 'Witness Coercion & Verbal Threat', 'severity': 5, 'description': 'Two individuals approached victim near village square warning her against testifying.', 'action_taken': 'Escalated to District Protection Officer; FIR update requested.', 'status': 'RESOLVED'}
        ]

        self.welfare_records = [
            {'id': 'd0000000-0000-0000-0000-000000000001', 'victim_id': '70000000-0000-0000-0000-000000000001', 'compensation_status': 'First Installment Disbursed (₹100,000)', 'rehabilitation_status': 'Temporary Relocation Approved', 'financial_assistance_status': 'Sanctioned', 'legal_aid_status': 'Government Advocate Assigned'}
        ]

        self.checkins = []
        self.chat_messages = []

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

        return assessment_obj

db_service = MockDatabaseService()
