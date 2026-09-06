from typing import Dict, Any, List
from app.nlp.nlp_engine import nlp_engine
from app.ml.predict import risk_predictor

class HybridScoringEngine:
    """
    Transparent Hybrid Scoring Engine for MoSJE Prototype.
    Note: AI-generated scores are screening signals, not medical diagnoses.
    """

    # Domain prototype weights
    DOMAIN_WEIGHTS = {
        'stress': 0.15,
        'anxiety': 0.15,
        'fear': 0.15,
        'sleep': 0.10,
        'safety': 0.15,          # lower safety -> higher distress
        'threat': 0.10,
        'social_support': 0.05,  # lower support -> higher distress
        'functioning': 0.10,
        'case_related_distress': 0.05
    }

    # Hybrid component weights
    HYBRID_WEIGHTS = {
        'questionnaire': 0.35,
        'nlp_emotion': 0.15,
        'threat_safety': 0.15,
        'longitudinal_trend': 0.15,
        'case_context': 0.10,
        'ml_escalation': 0.10
    }

    def calculate_questionnaire_distress(self, responses: Dict[str, float]) -> Dict[str, float]:
        """
        responses: dict mapping domain name to 0-100 normalized score
        (e.g., scale 0-4 where 4 -> 100)
        """
        stress = responses.get('stress', 0.0)
        anxiety = responses.get('anxiety', 0.0)
        fear = responses.get('fear', 0.0)
        sleep = responses.get('sleep', 0.0)
        safety_inv = 100.0 - responses.get('safety', 100.0) # lower safety means higher score
        threat = responses.get('threat', 0.0)
        social_inv = 100.0 - responses.get('social_support', 100.0)
        functioning = responses.get('functioning', 0.0)
        case_distress = responses.get('case_related_distress', 0.0)

        structured_distress = (
            stress * self.DOMAIN_WEIGHTS['stress'] +
            anxiety * self.DOMAIN_WEIGHTS['anxiety'] +
            fear * self.DOMAIN_WEIGHTS['fear'] +
            sleep * self.DOMAIN_WEIGHTS['sleep'] +
            safety_inv * self.DOMAIN_WEIGHTS['safety'] +
            threat * self.DOMAIN_WEIGHTS['threat'] +
            social_inv * self.DOMAIN_WEIGHTS['social_support'] +
            functioning * self.DOMAIN_WEIGHTS['functioning'] +
            case_distress * self.DOMAIN_WEIGHTS['case_related_distress']
        )

        return {
            'structured_distress_score': round(structured_distress, 1),
            'stress_score': stress,
            'anxiety_score': anxiety,
            'fear_score': fear,
            'sleep_score': sleep,
            'safety_score': responses.get('safety', 100.0),
            'threat_score': threat,
            'social_support_score': responses.get('social_support', 100.0),
            'functioning_score': functioning,
            'case_related_distress': case_distress
        }

    def compute_dynamic_distress_score(
        self,
        domain_scores: Dict[str, float],
        nlp_res: Dict[str, Any],
        previous_score: float = 40.0,
        case_risk_score: float = 20.0,
        immediate_danger: bool = False,
        recent_threat_count: int = 0
    ) -> Dict[str, Any]:

        structured_distress = domain_scores['structured_distress_score']
        
        # NLP / Emotion Component (0-100)
        fear_nlp = nlp_res.get('fear_score', 0.0) * 100.0
        anxiety_nlp = nlp_res.get('anxiety_score', 0.0) * 100.0
        nlp_emotion_component = (fear_nlp * 0.5) + (anxiety_nlp * 0.5)

        # Threat / Safety Component (0-100)
        nlp_threat_score = nlp_res.get('threat_score', 0.0)
        q_threat_score = domain_scores.get('threat_score', 0.0)
        q_safety_inv = 100.0 - domain_scores.get('safety_score', 100.0)
        threat_safety_component = min(100.0, max(nlp_threat_score, q_threat_score) * 0.6 + q_safety_inv * 0.4)

        # Longitudinal Trend Component
        distress_change = structured_distress - previous_score
        if distress_change > 10:
            trend_direction = "Rapidly Increasing"
            trend_score = min(100.0, 50.0 + distress_change * 3.0)
        elif distress_change > 3:
            trend_direction = "Increasing"
            trend_score = min(100.0, 30.0 + distress_change * 2.0)
        elif distress_change < -5:
            trend_direction = "Improving"
            trend_score = max(0.0, 20.0 + distress_change * 1.5)
        else:
            trend_direction = "Stable"
            trend_score = 25.0

        # ML Escalation Prediction
        feature_payload = {
            'current_structured_distress': structured_distress,
            'previous_distress_score': previous_score,
            'distress_change': distress_change,
            'sentiment_score': nlp_res.get('sentiment_score', 0.0),
            'fear_nlp_score': nlp_res.get('fear_score', 0.0),
            'anxiety_nlp_score': nlp_res.get('anxiety_score', 0.0),
            'sleep_score': domain_scores.get('sleep_score', 0.0),
            'safety_score': domain_scores.get('safety_score', 100.0),
            'threat_score': max(nlp_threat_score, q_threat_score),
            'case_risk_score': case_risk_score,
            'recent_threat_count': recent_threat_count
        }

        ml_pred = risk_predictor.predict_escalation(feature_payload)
        ml_prob = ml_pred['escalation_probability']
        ml_component = ml_prob * 100.0

        # Final Weighted Hybrid Score Calculation
        raw_final_score = (
            structured_distress * self.HYBRID_WEIGHTS['questionnaire'] +
            nlp_emotion_component * self.HYBRID_WEIGHTS['nlp_emotion'] +
            threat_safety_component * self.HYBRID_WEIGHTS['threat_safety'] +
            trend_score * self.HYBRID_WEIGHTS['longitudinal_trend'] +
            case_risk_score * self.HYBRID_WEIGHTS['case_context'] +
            ml_component * self.HYBRID_WEIGHTS['ml_escalation']
        )

        final_distress_score = round(min(100.0, max(0.0, raw_final_score)), 1)

        # Immediate Danger Gate
        if immediate_danger:
            risk_level = "CRITICAL"
            final_distress_score = max(final_distress_score, 85.0)
        elif final_distress_score >= 75 or threat_safety_component >= 75:
            risk_level = "CRITICAL"
        elif final_distress_score >= 50:
            risk_level = "HIGH"
        elif final_distress_score >= 30:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Generate Explainability JSON
        top_factors = []
        if immediate_danger:
            top_factors.append({"factor": "IMMEDIATE DANGER FLAG REPORTED BY VICTIM", "impact": "critical"})
        if nlp_res.get('threat_signal') or q_threat_score > 40:
            top_factors.append({"factor": "Recent intimidation or threat signal detected", "impact": "high"})
        if distress_change >= 5:
            top_factors.append({"factor": f"Distress increased by +{round(distress_change, 1)} points from previous assessment", "impact": "high"})
        if domain_scores.get('sleep_score', 0) >= 60:
            top_factors.append({"factor": "Severe sleep disturbance / insomnia reported", "impact": "high"})
        if domain_scores.get('fear_score', 0) >= 60 or fear_nlp >= 50:
            top_factors.append({"factor": "Elevated fear & terror levels", "impact": "high"})
        if domain_scores.get('safety_score', 100) <= 40:
            top_factors.append({"factor": "Victim reports feeling unsafe in current living environment", "impact": "high"})
        if case_risk_score >= 50:
            top_factors.append({"factor": "Ongoing court trial delay / upcoming high-pressure hearing", "impact": "moderate"})
        if len(top_factors) == 0:
            top_factors.append({"factor": "Stable responses across distress domains", "impact": "positive"})

        explanation = {
            'top_factors': top_factors,
            'weights_applied': self.HYBRID_WEIGHTS,
            'components': {
                'structured_questionnaire': structured_distress,
                'nlp_emotion': nlp_emotion_component,
                'threat_safety': threat_safety_component,
                'longitudinal_trend': trend_score,
                'case_context': case_risk_score,
                'ml_escalation': ml_component
            },
            'disclaimer': 'AI-assisted screening assessment — prototype weights applied. Requires human professional review.'
        }

        return {
            'dynamic_distress_score': final_distress_score,
            'risk_level': risk_level,
            'distress_trend': trend_direction,
            'distress_change': round(distress_change, 1),
            'predicted_escalation': ml_pred['predicted_escalation'],
            'escalation_probability': ml_prob,
            'immediate_danger': immediate_danger,
            'explanation': explanation,
            'domain_scores': domain_scores,
            'nlp_analysis': nlp_res,
            'ml_prediction': ml_pred
        }

scoring_engine = HybridScoringEngine()
