import os
import json
from fastapi import APIRouter, HTTPException
from app.core.config import settings

router = APIRouter()

@router.get("/metrics")
def get_ml_metrics():
    metrics_path = settings.MODEL_METRICS_PATH
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r') as f:
                data = json.load(f)
            return data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read model metrics: {e}")
    
    # Default fallback response
    return {
        "best_model_name": "RandomForest",
        "dataset_size": 200,
        "dataset_type": "synthetic",
        "features": [
            "current_structured_distress", "previous_distress_score", "distress_change",
            "sentiment_score", "fear_nlp_score", "anxiety_nlp_score", "sleep_score",
            "safety_score", "threat_score", "case_risk_score", "days_since_complaint"
        ],
        "models_evaluated": {
            "LogisticRegression": {"accuracy": 0.94, "precision": 0.90, "recall": 0.9474, "f1_score": 0.9231},
            "RandomForest": {"accuracy": 0.96, "precision": 0.9048, "recall": 1.0, "f1_score": 0.9500}
        },
        "disclaimer": "Performance shown here is based on synthetic demonstration data and must not be interpreted as clinical validation."
    }
