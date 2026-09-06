import os
import joblib
import pandas as pd
import numpy as np
from app.core.config import settings

class RiskPredictor:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            model_path = settings.RISK_MODEL_PATH
            prep_path = settings.PREPROCESSOR_PATH

            if os.path.exists(model_path) and os.path.exists(prep_path):
                self.model = joblib.load(model_path)
                self.preprocessor = joblib.load(prep_path)
                self.is_loaded = True
                print(f"Loaded ML Risk Model successfully from {model_path}")
            else:
                print(f"ML Model files not found at {model_path}. Using rule-based fallback predictor.")
        except Exception as e:
            print(f"Failed to load ML model: {e}. Using fallback predictor.")
            self.is_loaded = False

    def predict_escalation(self, feature_dict: dict) -> dict:
        if not self.is_loaded:
            # Fallback heuristic calculation
            score = feature_dict.get('current_structured_distress', 50.0)
            threat = feature_dict.get('threat_score', 0.0)
            change = feature_dict.get('distress_change', 0.0)
            
            prob = min(0.99, max(0.01, (score * 0.5 + threat * 0.3 + max(0, change) * 2.0) / 100.0))
            return {
                'predicted_escalation': prob > 0.5,
                'escalation_probability': round(float(prob), 4),
                'model_name': 'Fallback-Rule-Predictor',
                'model_version': '1.0.0'
            }

        # Prepare DataFrame for model input
        input_data = pd.DataFrame([{
            'current_structured_distress': feature_dict.get('current_structured_distress', 40.0),
            'previous_distress_score': feature_dict.get('previous_distress_score', 40.0),
            'distress_change': feature_dict.get('distress_change', 0.0),
            'sentiment_score': feature_dict.get('sentiment_score', 0.0),
            'fear_nlp_score': feature_dict.get('fear_nlp_score', 0.0),
            'anxiety_nlp_score': feature_dict.get('anxiety_nlp_score', 0.0),
            'sleep_score': feature_dict.get('sleep_score', 0.0),
            'safety_score': feature_dict.get('safety_score', 100.0),
            'threat_score': feature_dict.get('threat_score', 0.0),
            'case_risk_score': feature_dict.get('case_risk_score', 20.0),
            'days_since_complaint': feature_dict.get('days_since_complaint', 30),
            'case_delay_indicator': feature_dict.get('case_delay_indicator', 0.2),
            'number_of_hearings': feature_dict.get('number_of_hearings', 1),
            'recent_threat_count': feature_dict.get('recent_threat_count', 0),
            'engagement_change': feature_dict.get('engagement_change', 0.0),
            'age_group': feature_dict.get('age_group', '26-35'),
            'case_stage': feature_dict.get('case_stage', 'Court / Trial')
        }])

        try:
            X_proc = self.preprocessor.transform(input_data)
            pred = self.model.predict(X_proc)[0]
            proba = self.model.predict_proba(X_proc)[0][1] if hasattr(self.model, "predict_proba") else float(pred)

            return {
                'predicted_escalation': bool(pred == 1),
                'escalation_probability': round(float(proba), 4),
                'model_name': type(self.model).__name__,
                'model_version': '1.0.0'
            }
        except Exception as e:
            print(f"Error during ML model inference: {e}")
            prob = (feature_dict.get('current_structured_distress', 50.0)) / 100.0
            return {
                'predicted_escalation': prob > 0.5,
                'escalation_probability': round(float(prob), 4),
                'model_name': 'Fallback-Inference-Engine',
                'model_version': '1.0.0'
            }

risk_predictor = RiskPredictor()
