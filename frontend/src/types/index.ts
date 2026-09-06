export type UserRole = 'victim' | 'counsellor' | 'district_officer' | 'admin';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  district_id?: string;
  preferred_language?: string;
}

export interface VictimProfile {
  id: string;
  profile_id?: string;
  victim_code: string;
  name?: string;
  age_group?: string;
  gender?: string;
  preferred_language?: string;
  district_id?: string;
  registration_date?: string;
}

export interface CaseRecord {
  id: string;
  victim_id: string;
  case_code: string;
  case_type: string;
  complaint_date: string;
  police_station?: string;
  district_id?: string;
  case_stage: string;
  investigation_status?: string;
  court_case_status?: string;
  days_since_complaint?: number;
  number_of_hearings?: number;
  next_hearing_date?: string;
}

export interface AIAssessment {
  id: string;
  victim_id: string;
  assessment_time: string;
  dynamic_distress_score: number;
  risk_level: RiskLevel;
  distress_trend: 'Improving' | 'Stable' | 'Increasing' | 'Rapidly Increasing';
  distress_change?: number;
  predicted_escalation?: boolean;
  escalation_probability?: number;
  explanation: {
    top_factors: Array<{ factor: string; impact: string }>;
    components?: Record<string, number>;
    disclaimer?: string;
  };
}

export interface AlertRecord {
  id: string;
  victim_id: string;
  victim_code: string;
  alert_type: string;
  severity: RiskLevel;
  message: string;
  status: AlertStatus;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface InterventionRecord {
  id: string;
  victim_id: string;
  victim_code: string;
  alert_id?: string;
  intervention_type: string;
  recommended_by_ai: boolean;
  override_reason?: string;
  approved_by?: string;
  status: string;
  scheduled_at?: string;
  completed_at?: string;
  outcome?: string;
  notes?: string;
}

export interface ThreatEvent {
  id: string;
  victim_id: string;
  reported_at: string;
  threat_type: string;
  severity: number;
  description: string;
  action_taken?: string;
  status: string;
}

export interface NLPAnalysisResult {
  sentiment_label: string;
  sentiment_score: number;
  emotion_label: string;
  emotion_score: number;
  fear_score: number;
  anxiety_score: number;
  sadness_score: number;
  anger_score: number;
  threat_signal: boolean;
  threat_score: number;
  detected_threat_categories?: string[];
}
