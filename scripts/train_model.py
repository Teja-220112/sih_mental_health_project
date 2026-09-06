import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

def train_risk_models(data_path='data/synthetic_victim_risk_dataset.csv', model_dir='backend/app/ml/models'):
    os.makedirs(model_dir, exist_ok=True)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    
    # Target variable: escalation_within_7_days (binary 0/1) or multi-class risk_level
    # We will train a binary escalation prediction model and multi-class risk model
    feature_cols = [
        'current_structured_distress', 'previous_distress_score', 'distress_change',
        'sentiment_score', 'fear_nlp_score', 'anxiety_nlp_score', 'sleep_score',
        'safety_score', 'threat_score', 'case_risk_score', 'days_since_complaint',
        'case_delay_indicator', 'number_of_hearings', 'recent_threat_count',
        'engagement_change', 'age_group', 'case_stage'
    ]

    numeric_features = [
        'current_structured_distress', 'previous_distress_score', 'distress_change',
        'sentiment_score', 'fear_nlp_score', 'anxiety_nlp_score', 'sleep_score',
        'safety_score', 'threat_score', 'case_risk_score', 'days_since_complaint',
        'case_delay_indicator', 'number_of_hearings', 'recent_threat_count',
        'engagement_change'
    ]
    categorical_features = ['age_group', 'case_stage']

    X = df[feature_cols]
    y = df['escalation_within_7_days']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )

    models = {
        'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=6)
    }

    try:
        from xgboost import XGBClassifier
        models['XGBoost'] = XGBClassifier(n_estimators=100, random_state=42, max_depth=4, eval_metric='logloss')
    except ImportError:
        print("XGBoost not installed, using RandomForest and LogisticRegression")

    results = {}
    best_model = None
    best_score = -1.0
    best_model_name = ""

    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    for name, clf in models.items():
        clf.fit(X_train_proc, y_train)
        y_pred = clf.predict(X_test_proc)
        y_proba = clf.predict_proba(X_test_proc)[:, 1] if hasattr(clf, "predict_proba") else y_pred

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        try:
            auc = roc_auc_score(y_test, y_proba)
        except Exception:
            auc = 0.0

        results[name] = {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(auc, 4),
            'confusion_matrix': cm
        }

        print(f"Model: {name} | F1: {f1:.4f} | Accuracy: {acc:.4f}")

        if f1 > best_score:
            best_score = f1
            best_model = clf
            best_model_name = name

    # Save preprocessor & best model
    joblib.dump(preprocessor, os.path.join(model_dir, 'preprocessor.joblib'))
    joblib.dump(best_model, os.path.join(model_dir, 'risk_model.joblib'))

    metrics_payload = {
        'best_model_name': best_model_name,
        'dataset_size': len(df),
        'dataset_type': 'synthetic',
        'features': feature_cols,
        'models_evaluated': results,
        'disclaimer': 'Performance shown here is based on synthetic demonstration data and must not be interpreted as clinical validation.'
    }

    with open(os.path.join(model_dir, 'model_metrics.json'), 'w') as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Best model ({best_model_name}) saved successfully to {model_dir}")
    return metrics_payload

if __name__ == '__main__':
    train_risk_models()
