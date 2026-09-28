-- Initial Schema Migration for MoSJE AI Mental Health Monitoring System
-- Date: 2026-09-06

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('victim', 'police_officer', 'counsellor', 'protection_officer', 'district_officer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Districts
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
    district_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Districts
INSERT INTO districts (id, name, state, district_code) VALUES 
('11111111-1111-1111-1111-111111111111', 'NTR District (Vijayawada)', 'Andhra Pradesh', 'AP-NTR-01'),
('22222222-2222-2222-2222-222222222222', 'Guntur', 'Andhra Pradesh', 'AP-GNT-02'),
('33333333-3333-3333-3333-333333333333', 'Visakhapatnam', 'Andhra Pradesh', 'AP-VSKP-03'),
('44444444-4444-4444-4444-444444444444', 'Tirupati', 'Andhra Pradesh', 'AP-TPT-04'),
('55555555-5555-5555-5555-555555555555', 'Kurnool', 'Andhra Pradesh', 'AP-KRN-05')
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles (links to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'victim',
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    preferred_language TEXT DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Victims
CREATE TABLE IF NOT EXISTS victims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    victim_code TEXT UNIQUE NOT NULL,
    age_group TEXT,
    gender TEXT,
    preferred_language TEXT DEFAULT 'en',
    preferred_channel TEXT DEFAULT 'web',
    consent_status BOOLEAN DEFAULT TRUE,
    registration_date DATE DEFAULT CURRENT_DATE,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cases
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    case_code TEXT UNIQUE NOT NULL,
    case_type TEXT NOT NULL,
    complaint_date DATE NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE,
    police_station TEXT,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    case_stage TEXT NOT NULL DEFAULT 'Investigation',
    investigation_status TEXT DEFAULT 'In Progress',
    court_case_status TEXT DEFAULT 'Pending Hearing',
    next_hearing_date DATE,
    number_of_hearings INTEGER DEFAULT 0,
    days_since_complaint INTEGER DEFAULT 30,
    case_delay_indicator NUMERIC DEFAULT 0.2,
    assigned_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. Case Assignments (Officers, Counsellors, Protection Officers)
CREATE TABLE IF NOT EXISTS case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    registration_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    counsellor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    protection_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Protection Status
CREATE TABLE IF NOT EXISTS protection_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    protection_required BOOLEAN DEFAULT FALSE,
    protection_status TEXT DEFAULT 'Under Evaluation',
    intimidation_reported BOOLEAN DEFAULT FALSE,
    relocation_required BOOLEAN DEFAULT FALSE,
    relocation_status TEXT DEFAULT 'Not Requested',
    last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Threat Events
CREATE TABLE IF NOT EXISTS threat_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    threat_type TEXT NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    source TEXT DEFAULT 'victim_report',
    description TEXT,
    action_taken TEXT DEFAULT 'Pending Review',
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Welfare Support
CREATE TABLE IF NOT EXISTS welfare_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    compensation_status TEXT DEFAULT 'Applied',
    rehabilitation_status TEXT DEFAULT 'Assessment Pending',
    financial_assistance_status TEXT DEFAULT 'In Process',
    legal_aid_status TEXT DEFAULT 'Assigned',
    counsellor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_support_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Questionnaires
CREATE TABLE IF NOT EXISTS questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Questions
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    domain TEXT NOT NULL,
    response_type TEXT DEFAULT 'scale_0_4',
    min_value INTEGER DEFAULT 0,
    max_value INTEGER DEFAULT 4,
    weight NUMERIC DEFAULT 1.0,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

-- 10. Mental Health Checkins
CREATE TABLE IF NOT EXISTS mental_health_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    checkin_time TIMESTAMPTZ DEFAULT NOW(),
    channel TEXT DEFAULT 'web',
    language TEXT DEFAULT 'en',
    questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE SET NULL,
    stress_score NUMERIC DEFAULT 0,
    anxiety_score NUMERIC DEFAULT 0,
    fear_score NUMERIC DEFAULT 0,
    sleep_score NUMERIC DEFAULT 0,
    safety_score NUMERIC DEFAULT 0,
    social_support_score NUMERIC DEFAULT 0,
    functioning_score NUMERIC DEFAULT 0,
    structured_distress_score NUMERIC DEFAULT 0,
    immediate_danger BOOLEAN DEFAULT FALSE,
    free_text_response TEXT,
    voice_recording_path TEXT,
    completed BOOLEAN DEFAULT TRUE,
    is_assisted BOOLEAN DEFAULT FALSE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Questionnaire Responses
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id UUID REFERENCES mental_health_checkins(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response_value NUMERIC NOT NULL,
    response_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    language TEXT DEFAULT 'en',
    channel TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('victim', 'bot', 'system')),
    message_text TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NLP Analysis
CREATE TABLE IF NOT EXISTS nlp_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    sentiment_label TEXT,
    sentiment_score NUMERIC,
    emotion_label TEXT,
    emotion_score NUMERIC,
    fear_score NUMERIC DEFAULT 0,
    anxiety_score NUMERIC DEFAULT 0,
    sadness_score NUMERIC DEFAULT 0,
    anger_score NUMERIC DEFAULT 0,
    threat_signal BOOLEAN DEFAULT FALSE,
    threat_score NUMERIC DEFAULT 0,
    model_name TEXT DEFAULT 'XLM-R-Multilingual-Emotion',
    model_version TEXT DEFAULT 'v1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AI Assessments
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    checkin_id UUID REFERENCES mental_health_checkins(id) ON DELETE SET NULL,
    assessment_time TIMESTAMPTZ DEFAULT NOW(),
    questionnaire_distress_score NUMERIC DEFAULT 0,
    sentiment_score NUMERIC DEFAULT 0,
    emotion_score NUMERIC DEFAULT 0,
    voice_stress_score NUMERIC DEFAULT 0,
    behavior_change_score NUMERIC DEFAULT 0,
    trend_score NUMERIC DEFAULT 0,
    case_risk_score NUMERIC DEFAULT 0,
    threat_score NUMERIC DEFAULT 0,
    dynamic_distress_score NUMERIC NOT NULL,
    risk_level risk_level NOT NULL,
    predicted_escalation BOOLEAN DEFAULT FALSE,
    escalation_probability NUMERIC DEFAULT 0,
    prediction_horizon TEXT DEFAULT '7_days',
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_name TEXT DEFAULT 'RandomForest-DistressPredictor',
    model_version TEXT DEFAULT 'v1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES ai_assessments(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL,
    severity risk_level NOT NULL,
    message TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status alert_status DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- 17. Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    intervention_type TEXT NOT NULL,
    recommended_by_ai BOOLEAN DEFAULT TRUE,
    recommended_reason TEXT,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'PLANNED',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Case Events
CREATE TABLE IF NOT EXISTS case_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    source TEXT DEFAULT 'court_record',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_victims_district ON victims(district_id);
CREATE INDEX IF NOT EXISTS idx_cases_victim ON cases(victim_id);
CREATE INDEX IF NOT EXISTS idx_cases_district ON cases(district_id);
CREATE INDEX IF NOT EXISTS idx_checkins_victim ON mental_health_checkins(victim_id);
CREATE INDEX IF NOT EXISTS idx_assessments_victim ON ai_assessments(victim_id);
CREATE INDEX IF NOT EXISTS idx_assessments_risk ON ai_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_alerts_victim ON alerts(victim_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_interventions_victim ON interventions(victim_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE victims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- 1. Profiles: Authenticated users can view profiles
DROP POLICY IF EXISTS "Public profiles viewable by all" ON profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON profiles FOR SELECT USING (true);

-- 2. Victims: Officials see all assigned/district victims; Victims see ONLY their own record
DROP POLICY IF EXISTS "Victims viewable by all" ON victims;
CREATE POLICY "Victims viewable by assigned officials or self" ON victims FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'counsellor', 'protection_officer', 'district_officer', 'admin'))
);
CREATE POLICY "Victims insertable by registration officials" ON victims FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'admin'))
);

-- 3. Checkins: Victims can view and insert their own checkins; Officials can view all
DROP POLICY IF EXISTS "Checkins viewable by all" ON mental_health_checkins;
CREATE POLICY "Checkins viewable by owner or officials" ON mental_health_checkins FOR SELECT USING (
    victim_id IN (SELECT id FROM victims WHERE profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'counsellor', 'protection_officer', 'district_officer', 'admin'))
);
CREATE POLICY "Checkins insertable by victim or official" ON mental_health_checkins FOR INSERT WITH CHECK (
    victim_id IN (SELECT id FROM victims WHERE profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'counsellor', 'admin'))
);

-- 4. AI Risk Assessments: STRICTLY OFFICIALS ONLY - VICTIMS BLOCKED
DROP POLICY IF EXISTS "Assessments viewable by all" ON ai_assessments;
CREATE POLICY "Assessments viewable ONLY by authorized officials" ON ai_assessments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'counsellor', 'protection_officer', 'district_officer', 'admin'))
);

-- 5. Alerts: STRICTLY OFFICIALS ONLY - VICTIMS BLOCKED
DROP POLICY IF EXISTS "Alerts viewable by all" ON alerts;
CREATE POLICY "Alerts viewable ONLY by authorized officials" ON alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('police_officer', 'counsellor', 'protection_officer', 'district_officer', 'admin'))
);

-- 20. Chat Emotion Analyses (Psychological Telemetry - Strictly Restricted from Victims)
CREATE TABLE IF NOT EXISTS chat_emotion_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES victims(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    sentiment_label TEXT,
    sentiment_score NUMERIC,
    emotion_label TEXT,
    emotion_score NUMERIC,
    threat_signal BOOLEAN DEFAULT FALSE,
    threat_score NUMERIC DEFAULT 0,
    extracted_entities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_emotion_victim ON chat_emotion_analyses(victim_id);
ALTER TABLE chat_emotion_analyses ENABLE ROW LEVEL SECURITY;

-- 6. Chat Emotion Analyses: STRICTLY OFFICIALS ONLY - VICTIMS BLOCKED
DROP POLICY IF EXISTS "Chat emotions viewable by all" ON chat_emotion_analyses;
CREATE POLICY "Chat emotion analyses viewable ONLY by authorized officials" ON chat_emotion_analyses FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('counsellor', 'protection_officer', 'district_officer', 'admin'))
);

