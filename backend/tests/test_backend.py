from fastapi.testclient import TestClient
from app.main import app
from app.nlp.nlp_engine import nlp_engine
from app.risk.scoring_engine import scoring_engine
from app.ml.predict import risk_predictor

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_nlp_threat_detection():
    res = nlp_engine.analyze_text("I am scared because they threatened me outside the court")
    assert res['threat_signal'] is True
    assert res['threat_score'] > 0
    assert 'fear' in res['emotion_label'] or res['fear_score'] > 0

def test_scoring_immediate_danger_gate():
    domain_scores = {
        'structured_distress_score': 45.0,
        'stress': 50, 'anxiety': 50, 'fear': 50, 'sleep': 50,
        'safety': 20, 'threat': 60, 'social_support': 50,
        'functioning': 50, 'case_related_distress': 50
    }
    nlp_res = {'fear_score': 0.8, 'anxiety_score': 0.7, 'threat_score': 80.0, 'sentiment_score': -0.8}
    
    result = scoring_engine.compute_dynamic_distress_score(
        domain_scores=domain_scores,
        nlp_res=nlp_res,
        immediate_danger=True
    )
    
    assert result['risk_level'] == 'CRITICAL'
    assert result['immediate_danger'] is True
    assert result['dynamic_distress_score'] >= 85.0

def test_ml_risk_predictor():
    sample_features = {
        'current_structured_distress': 75.0,
        'previous_distress_score': 55.0,
        'distress_change': 20.0,
        'sentiment_score': -0.8,
        'fear_nlp_score': 0.85,
        'anxiety_nlp_score': 0.8,
        'sleep_score': 80.0,
        'safety_score': 20.0,
        'threat_score': 75.0,
        'case_risk_score': 60.0,
        'days_since_complaint': 45,
        'recent_threat_count': 2
    }
    
    pred = risk_predictor.predict_escalation(sample_features)
    assert 'escalation_probability' in pred
    assert 0.0 <= pred['escalation_probability'] <= 1.0

def test_demo_login_endpoint():
    res = client.post("/api/auth/demo-login", json={"role": "counsellor"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "counsellor"
