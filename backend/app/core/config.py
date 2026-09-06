import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "MoSJE AI Mental Health Monitoring System")
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mosje-ai-mental-health-hackathon-super-secret-key-2026")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    
    # NLP Models
    SENTIMENT_MODEL_NAME: str = os.getenv("SENTIMENT_MODEL_NAME", "vader_multilingual_fallback")
    EMOTION_MODEL_NAME: str = os.getenv("EMOTION_MODEL_NAME", "xlm_roberta_emotion")
    THREAT_MODEL_NAME: str = os.getenv("THREAT_MODEL_NAME", "hybrid_safety_classifier")
    
    # ML Model Paths
    RISK_MODEL_PATH: str = os.getenv("RISK_MODEL_PATH", "backend/app/ml/models/risk_model.joblib")
    PREPROCESSOR_PATH: str = os.getenv("PREPROCESSOR_PATH", "backend/app/ml/models/preprocessor.joblib")
    MODEL_METRICS_PATH: str = os.getenv("MODEL_METRICS_PATH", "backend/app/ml/models/model_metrics.json")

settings = Settings()
