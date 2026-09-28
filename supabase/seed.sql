-- Seed Data for MoSJE AI Mental Health Monitoring System
-- Date: 2026-09-06 (Updated with 100% valid Hexadecimal UUIDs)

-- Districts
INSERT INTO districts (id, name, state, district_code) VALUES
('11111111-1111-1111-1111-111111111111', 'NTR District (Vijayawada)', 'Andhra Pradesh', 'AP-NTR-01'),
('22222222-2222-2222-2222-222222222222', 'Guntur', 'Andhra Pradesh', 'AP-GNT-02'),
('33333333-3333-3333-3333-333333333333', 'Visakhapatnam', 'Andhra Pradesh', 'AP-VSKP-03'),
('44444444-4444-4444-4444-444444444444', 'Tirupati', 'Andhra Pradesh', 'AP-TPT-04'),
('55555555-5555-5555-5555-555555555555', 'Kurnool', 'Andhra Pradesh', 'AP-KRN-05')
ON CONFLICT (id) DO NOTHING;

-- Profiles (Demo accounts)
INSERT INTO profiles (id, full_name, email, phone, role, district_id, preferred_language) VALUES
('10000000-0000-0000-0000-000000000001', 'Sunita Devi (Victim Demo)', 'victim@demo.mosje.gov.in', '+91 9876543210', 'victim', '11111111-1111-1111-1111-111111111111', 'en'),
('20000000-0000-0000-0000-000000000002', 'Dr. Ananya Sharma (Counsellor)', 'counsellor@demo.mosje.gov.in', '+91 9876543211', 'counsellor', '11111111-1111-1111-1111-111111111111', 'en'),
('30000000-0000-0000-0000-000000000003', 'Rajesh Verma (District Officer)', 'district@demo.mosje.gov.in', '+91 9876543212', 'district_officer', '11111111-1111-1111-1111-111111111111', 'en'),
('35000000-0000-0000-0000-000000000001', 'Smt. K. Ratna Kumari (Protection Officer)', 'protection@demo.mosje.gov.in', '+91 9876543215', 'protection_officer', '11111111-1111-1111-1111-111111111111', 'en'),
('40000000-0000-0000-0000-000000000004', 'System Administrator (MoSJE)', 'admin@demo.mosje.gov.in', '+91 9876543213', 'admin', '11111111-1111-1111-1111-111111111111', 'en'),
('50000000-0000-0000-0000-000000000005', 'Ramesh Kumar (Victim 2)', 'victim2@demo.mosje.gov.in', '+91 9876543214', 'victim', '22222222-2222-2222-2222-222222222222', 'te')
ON CONFLICT (id) DO NOTHING;

-- Questionnaires
INSERT INTO questionnaires (id, name, version, description, active) VALUES
('60000000-0000-0000-0000-000000000001', 'Periodic Victim Distress Check-in', 'v1.0', 'Standard 10-item screening questionnaire for SC/ST atrocity victims and witnesses.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Questions
INSERT INTO questions (id, questionnaire_id, question_text, domain, display_order, weight) VALUES
('60000000-0000-0000-0000-000000000101', '60000000-0000-0000-0000-000000000001', 'How stressed have you felt recently?', 'stress', 1, 0.15),
('60000000-0000-0000-0000-000000000102', '60000000-0000-0000-0000-000000000001', 'How worried or anxious have you felt?', 'anxiety', 2, 0.15),
('60000000-0000-0000-0000-000000000103', '60000000-0000-0000-0000-000000000001', 'How often have you felt afraid?', 'fear', 3, 0.15),
('60000000-0000-0000-0000-000000000104', '60000000-0000-0000-0000-000000000001', 'How difficult has it been to feel calm?', 'anxiety', 4, 0.10),
('60000000-0000-0000-0000-000000000105', '60000000-0000-0000-0000-000000000001', 'How well have you been sleeping?', 'sleep', 5, 0.10),
('60000000-0000-0000-0000-000000000106', '60000000-0000-0000-0000-000000000001', 'How safe do you currently feel in your residence/village?', 'safety', 6, 0.15),
('60000000-0000-0000-0000-000000000107', '60000000-0000-0000-0000-000000000001', 'Have you recently experienced threats, intimidation or pressure?', 'threat', 7, 0.10),
('60000000-0000-0000-0000-000000000108', '60000000-0000-0000-0000-000000000001', 'How worried are you about something related to your ongoing court case?', 'case_related_distress', 8, 0.05),
('60000000-0000-0000-0000-000000000109', '60000000-0000-0000-0000-000000000001', 'How supported do you feel by people you trust?', 'social_support', 9, 0.05),
('60000000-0000-0000-0000-000000000110', '60000000-0000-0000-0000-000000000001', 'How difficult has it been to perform your daily activities?', 'functioning', 10, 0.10)
ON CONFLICT (id) DO NOTHING;

-- Victims
INSERT INTO victims (id, profile_id, victim_code, age_group, gender, preferred_language, consent_status, registration_date, district_id) VALUES
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'VIC-DEMO-0001', '26-35', 'Female', 'en', TRUE, '2026-08-01', '11111111-1111-1111-1111-111111111111'),
('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000005', 'VIC-DEMO-0002', '36-50', 'Male', 'te', TRUE, '2026-08-10', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Cases
INSERT INTO cases (id, victim_id, case_code, case_type, complaint_date, police_station, district_id, case_stage, investigation_status, court_case_status, days_since_complaint, number_of_hearings) VALUES
('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'CASE-DEMO-0001', 'SC/ST Atrocity & Intimidation', '2026-08-01', 'Suryaraopet Police Station, Vijayawada', '11111111-1111-1111-1111-111111111111', 'Court / Trial', 'Charge Sheet Filed', 'Trial Commenced', 35, 3),
('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'CASE-DEMO-0002', 'Land Dispossess Atrocity', '2026-08-10', 'Arundelpet Police Station, Guntur', '22222222-2222-2222-2222-222222222222', 'Investigation', 'Under Investigation', 'Pre-Trial', 26, 1)
ON CONFLICT (id) DO NOTHING;

-- Longitudinal History for Demo Victim VIC-DEMO-0001
INSERT INTO ai_assessments (id, victim_id, assessment_time, questionnaire_distress_score, sentiment_score, emotion_score, threat_score, dynamic_distress_score, risk_level, predicted_escalation, escalation_probability, explanation) VALUES
('90000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '2026-08-05T10:00:00Z', 35.0, -0.2, 0.3, 10.0, 38.0, 'MODERATE', FALSE, 0.15, '{"top_factors": [{"factor": "Baseline stress from recent filing", "impact": "moderate"}]}'),
('90000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', '2026-08-09T10:00:00Z', 42.0, -0.4, 0.45, 20.0, 45.0, 'MODERATE', FALSE, 0.28, '{"top_factors": [{"factor": "Court date approaching", "impact": "moderate"}]}'),
('90000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', '2026-08-13T10:00:00Z', 55.0, -0.6, 0.65, 40.0, 57.0, 'HIGH', TRUE, 0.62, '{"top_factors": [{"factor": "Sleep disruption reported", "impact": "high"}, {"factor": "Increased fear score", "impact": "high"}]}'),
('90000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001', '2026-08-17T10:00:00Z', 68.0, -0.75, 0.78, 65.0, 71.0, 'HIGH', TRUE, 0.79, '{"top_factors": [{"factor": "Direct verbal threat at market", "impact": "high"}, {"factor": "Severe anxiety", "impact": "high"}]}'),
('90000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000001', '2026-08-20T10:00:00Z', 80.0, -0.9, 0.92, 85.0, 82.0, 'CRITICAL', TRUE, 0.94, '{"top_factors": [{"factor": "Recent intimidation signal", "impact": "high"}, {"factor": "Distress increased by 11 points", "impact": "high"}, {"factor": "Severe sleep disturbance", "impact": "high"}, {"factor": "Safety score critical", "impact": "high"}]}'),
('90000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000001', '2026-08-24T10:00:00Z', 65.0, -0.6, 0.60, 45.0, 67.0, 'HIGH', FALSE, 0.52, '{"top_factors": [{"factor": "Police escort provided", "impact": "moderate"}, {"factor": "Ongoing counselling", "impact": "moderate"}]}'),
('90000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000001', '2026-08-29T10:00:00Z', 50.0, -0.4, 0.40, 30.0, 52.0, 'HIGH', FALSE, 0.35, '{"top_factors": [{"factor": "Distress trend improving post intervention", "impact": "positive"}]}'),
('90000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000001', '2026-09-04T10:00:00Z', 40.0, -0.2, 0.25, 15.0, 43.0, 'MODERATE', FALSE, 0.18, '{"top_factors": [{"factor": "Stable safety condition", "impact": "positive"}, {"factor": "Regular counselling support", "impact": "positive"}]}');

-- Active Alerts
INSERT INTO alerts (id, victim_id, assessment_id, alert_type, severity, message, assigned_to, status, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000005', 'CRITICAL_DISTRESS_ESCALATION', 'CRITICAL', 'Victim VIC-DEMO-0001 distress score peaked at 82/100 following threat report. Urgent protection and counselling review required.', '20000000-0000-0000-0000-000000000002', 'IN_PROGRESS', '2026-08-20T10:05:00Z')
ON CONFLICT (id) DO NOTHING;

-- Recorded Interventions
INSERT INTO interventions (id, victim_id, alert_id, intervention_type, recommended_by_ai, recommended_reason, approved_by, status, scheduled_at, completed_at, outcome, notes) VALUES
('b0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Urgent In-Person Counselling & Protection Escort', TRUE, 'Peak distress (82/100) and reported witness intimidation prior to trial.', '30000000-0000-0000-0000-000000000003', 'COMPLETED', '2026-08-21T09:00:00Z', '2026-08-21T11:30:00Z', 'Counselling completed; police protection escort assigned during trial sessions.', 'Victim reported feeling much safer following police deployment.')
ON CONFLICT (id) DO NOTHING;

-- Threat Events
INSERT INTO threat_events (id, victim_id, case_id, reported_at, threat_type, severity, description, action_taken, status) VALUES
('c0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '2026-08-20T08:30:00Z', 'Witness Coercion & Verbal Threat', 5, 'Two individuals approached victim near village square warning her against testifying.', 'Escalated to District Protection Officer; FIR update requested.', 'RESOLVED')
ON CONFLICT (id) DO NOTHING;

-- Welfare Support
INSERT INTO welfare_support (id, victim_id, compensation_status, rehabilitation_status, financial_assistance_status, legal_aid_status, counsellor_id, last_support_date) VALUES
('d0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'First Installment Disbursed (₹100,000)', 'Temporary Relocation Approved', 'Sanctioned', 'Government Advocate Assigned', '20000000-0000-0000-0000-000000000002', '2026-08-22')
ON CONFLICT (id) DO NOTHING;
