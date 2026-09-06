# AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System

**Smart India Hackathon Problem Statement PS ID: 26094**  
**Organization:** Ministry of Social Justice and Empowerment (MoSJE)  
**Department:** Department of Social Justice and Empowerment  
**Theme:** MedTech / BioTech / HealthTech  

> [!IMPORTANT]
> **Clinical & Legal Disclaimer**: This application is a hackathon screening prototype and NOT a clinical diagnostic system. AI-generated scores are screening and prioritization signals, not medical diagnoses. High-risk cases require review by an authorized human professional.

---

## 📌 Executive Summary
The system provides a continuous, supportive, and privacy-governed mental health monitoring and early-warning platform for victims, complainants, and witnesses during the investigation, trial, compensation, protection, and rehabilitation lifecycle under the SC/ST (Prevention of Atrocities) Act.

It separates conversational supportive AI from measurable NLP signal extraction, structured questionnaire scoring, threat detection, longitudinal trend analysis, and scikit-learn ML risk prediction, keeping human counsellors and district officers strictly in charge of final clinical and welfare decisions.

---

## 📐 System Architecture

```
                          +------------------------------------------+
                          |         React + TS + Tailwind UI         |
                          | (Victim / Counsellor / District / Admin) |
                          +--------------------+---------------------+
                                               | REST / SDK
                                               v
           +-----------------------------------+-----------------------------------+
           |                                                                       |
           v                                                                       v
+-------------------------------+                            +-------------------+
|     Supabase Auth & DB        |                            |  FastAPI Backend  |
|  (PostgreSQL + RLS + Seed)    |<==========================>|  (ML/NLP Engine)  |
+-------------------------------+   Service Role Key / REST  +---------+---------+
                                                                           |
                     +-------------------+--------------------+------------+
                     |                   |                    |
                     v                   v                    v
             +---------------+   +---------------+   +------------------+
             | NLP Engine    |   | ML Classifier |   | Chatbot Service  |
             | (Sentiment,   |   | (RandomForest |   | (OpenAI /        |
             |  Emotion,     |   |  Risk Model)  |   |  Fallback Flow)  |
             |  Threat Signal|   +---------------+   +------------------+
             +---------------+
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python FastAPI, Pydantic, Scikit-Learn, Joblib, Pandas, NumPy, VADER-Sentiment / Transformer NLP fallback, OpenAI API Service.
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row-Level Security (RLS) policies.
- **ML & Data**: Synthetic Victim Risk Dataset (200 records), RandomForest & Logistic Regression classifiers.

---

## 🚀 Key Features by User Role

### 1. 🟢 VICTIM / WITNESS PORTAL
- **Wellbeing Dashboard**: Dynamic Distress Score Gauge (0-100), Risk Level Badge (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), trend indicator, case & protection status summary.
- **Mental Health Check-in Wizard**: Step-by-step 0-4 scale questionnaire covering stress, anxiety, fear, sleep, safety, threat, social support, and functioning.
- **Immediate Safety Gate**: Instant trigger question (*"Do you feel in immediate danger?"*) that immediately generates a high-priority human review alert.
- **Supportive Chatbot**: Non-clinical empathetic AI assistant with NLP sentiment/emotion/threat signal analysis and optional speech-to-text simulation.
- **Threat & Safety Reporting**: Direct reporting tool for witness coercion or intimidation.

### 2. 🟠 COUNSELLOR PORTAL
- **Counsellor Dashboard**: KPI summary cards (Total assigned, Low, Moderate, High, Critical), prioritized victim case roster with visual risk badges.
- **Victim Profile Deep-Dive**: Recharts longitudinal distress curve, questionnaire domain breakdown, NLP signal indicators, threat logs.
- **AI Explainability Card**: *"WHY THIS SCORE?"* breakdown displaying top contributing risk factors.
- **Intervention Recorder & AI Override**: Schedule counselling, record clinical notes, and override AI recommendations with mandatory justification tracking.

### 3. 🔵 DISTRICT OFFICER PORTAL
- **District Overview**: District-wide active atrocity cases, protection requests, and threat events.
- **Welfare & Rehabilitation Tracker**: Real-time status for compensation disbursement (₹100,000 first installment), legal aid advocate assignment, and temporary relocation approvals.

### 4. 🟣 ADMIN / STATE PORTAL
- **State Analytics**: Comparative district caseload and high-risk victim distribution charts.
- **AI/ML Model Monitoring**: Live model performance metrics (Accuracy: 96.0%, F1-Score: 0.95, Precision, Recall, Confusion Matrix, feature importance).
- **Audit Logs**: Role-Based Access Control and RLS event security trail.

---

## 📊 Dynamic Distress Scoring Formula & Risk Levels

$$Score = 0.35 \times Q_{distress} + 0.15 \times NLP_{emotion} + 0.15 \times Threat + 0.15 \times Trend + 0.10 \times Case + 0.10 \times ML_{prob}$$

### Operational Risk Levels
- `0 — 29`: **LOW** (Green) — Periodic monitoring
- `30 — 49`: **MODERATE** (Amber) — Follow-up check-in scheduled
- `50 — 74`: **HIGH** (Orange) — Mandatory counsellor review triggered
- `75 — 100`: **CRITICAL** (Red) — Urgent safety & human intervention alert

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Generate Synthetic Dataset & Train ML Model
```bash
python scripts/generate_dataset.py
python scripts/train_model.py
```

### 2. Run Backend Unit Tests
```bash
python scripts/test_runner.py
```

### 3. Start FastAPI Backend (Port 8000)
```bash
start_backend.bat
# Or manually:
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 4. Start React Frontend (Port 3000)
```bash
start_frontend.bat
# Or manually:
cd frontend
npm run dev
```

---

## 🔑 Demo Login Accounts

| Role | Email Placeholder | Password | Description |
|---|---|---|---|
| **Victim** | `victim@demo.mosje.gov.in` | `demo123` | Sunita Devi (VIC-2026-101) — Escalating & Recovering Demo |
| **Counsellor** | `counsellor@demo.mosje.gov.in` | `demo123` | Dr. Ananya Sharma — Assigned Counsellor |
| **District Officer** | `district@demo.mosje.gov.in` | `demo123` | Rajesh Verma — Pune District Officer |
| **Admin** | `admin@demo.mosje.gov.in` | `demo123` | MoSJE System Administrator |

---

## 📝 MANUAL STEPS REQUIRED

### A. Required for Local Prototype
1. Run `python scripts/generate_dataset.py` to create `data/synthetic_victim_risk_dataset.csv`.
2. Run `python scripts/train_model.py` to produce `risk_model.joblib` and `model_metrics.json`.
3. Launch backend (`start_backend.bat`) and frontend (`start_frontend.bat`).

### B. Optional (Supabase Cloud & OpenAI Integration)
1. Create a Supabase project at [https://supabase.com](https://supabase.com).
2. Execute `supabase/migrations/20260905_initial_schema.sql` in the Supabase SQL Editor.
3. Execute `supabase/seed.sql` to populate demo records.
4. Copy your Supabase URL and Publishable Key into `.env`.
5. (Optional) Set `OPENAI_API_KEY` in `.env` for live GPT-3.5 supportive chatbot responses (otherwise demo deterministic chatbot runs automatically).

### C. Production Readiness Requirements
- Government SSO / DigiLocker integration.
- Approved HIPAA/MoHFW data governance compliance audit.
- Clinical validation trial with certified psychological professionals.
- Production SMS/WhatsApp notification gateway integration.

---

## 🛡️ License & Compliance
Designed for the **Ministry of Social Justice and Empowerment (MoSJE)** under Smart India Hackathon guidelines.
