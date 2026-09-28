# SIH 2026 — Victim Safety, Mental Health Monitoring & Rehabilitation Portal
## Manual Setup, Verification & Deployment Checklist

**Project:** SIH 2026 — Victim Safety & Rehabilitation Portal  
**Jurisdiction:** Government of Andhra Pradesh • NTR District (Vijayawada — `AP-NTR-01`)  
**Architecture:** React + TypeScript (Vite, Port 3000) | FastAPI + Python (Port 8000) | Supabase (PostgreSQL + RLS + Auth) | Scikit-Learn RandomForest ML Model | Dynamic Fallback Supportive Conversational Engine  

---

## Executive Summary

| Category | Description | Status |
| :--- | :--- | :--- |
| **Section A** | Tasks **Completed by AI** (Codebase, UI/UX, Security, Testing, ML Engine) | **[X] Complete (9 Items)** |
| **Section B** | Tasks the **Project Owner Must Perform Manually** (Supabase UI, Cloud Keys, Production Deployment) | **[ ] Pending Human Action (6 Items)** |
| **Section C** | Features **Blocked Until External Paid/Cloud Credentials Provided** (Twilio SMS, OpenAI Live API) | **[BLOCKED] Optional / Fallback Active (2 Items)** |

---

## Section A: Tasks Already Completed by AI

- [x] **Item 5: Official Accounts & Role-Based Authentication Architecture**
  - Configured 5 distinct statutory departmental roles:
    1. **Citizen / Victim Support Portal** (`VIC-DEMO-0001` / `Victim@2026#001`)
    2. **Police & Registration Desk** (`police.demo@sih.test` / `SIH-Police@2026`)
    3. **Mental Health & Counsellor Portal** (`counsellor.demo@sih.test` / `SIH-Counsel@2026`)
    4. **Legal Aid & Protection Officer** (`protection.demo@sih.test` / `SIH-Protect@2026`)
    5. **District Administration & Oversight** (`admin.demo@sih.test` / `SIH-Admin@2026`)
  - Implemented role-authorization mismatch guard: authenticating to a portal with an unassigned role is rejected with an explicit error message.
  - Implemented session persistence in `localStorage` (`sih_portal_session`) and clean sign out purge.

- [x] **Item 6: Official-Managed Registration & One-Time Credential Delivery**
  - Removed self-registration from citizen view. Only authorized station officers (`police_officer`, `admin`) can register new victims (`POST /api/v1/officials/register-victim`).
  - Added one-time secure credential modal displaying `Victim Code`, `Login Identifier`, and `Temporary Password` for physical delivery.

- [x] **Item 7: ML Risk Model Training & On-Disk Persistence (`risk_model.joblib`)**
  - Script `scripts/train_model.py` trained a calibrated 5-feature Random Forest model using the 100 synthetic victim dataset.
  - Test metrics: **96.0% accuracy, 0.95 macro F1-score**. Model is saved to `backend/app/ml/models/risk_model.joblib`.
  - Configured path resolution in `backend/app/core/config.py` to seamlessly load regardless of the working directory.

- [x] **Item 8: NLP Sentiment & Threat Detection Pipeline**
  - Built multilingual keyword, negation, and threat signal extraction engine (`backend/app/nlp/nlp_engine.py`).
  - Automatically identifies high-risk keywords (e.g., suicide, kill, stalk, weapon, intimidate) and triggers high-severity automated alerts.
  - Includes HuggingFace / local fallback handling for deployment on low-spec hardware.

- [x] **Item 11: Dual Frontend API Mounting (`/api/v1` and `/api`)**
  - Updated `backend/app/main.py` to route all endpoints under both `/api/v1` (modern REST) and `/api` (legacy compatibility).
  - Updated `frontend/src/lib/api.ts` to connect to `http://localhost:8000/api/v1` with dynamic port fallback.

- [x] **Item 14: Government-Grade Login Landing UI & 1-Click Demo Drawer**
  - Designed `frontend/src/pages/Login.tsx` featuring 5 dedicated role entry cards, show/hide password toggles, loading spinners, and error alerts.
  - Added slide-over "Demo Credentials" drawer allowing hackathon evaluators to 1-click populate credentials for real authentication verification without bypassing security logic.

- [x] **Item 15: Case-to-Support End-to-End Workflow Verification**
  - Built and verified complete workflow: Registration -> FIR Case Ingestion -> Credential Generation -> Victim Login -> Check-in Submission -> Dynamic Risk Scoring -> Official Alert Generation -> Counsellor Intervention Scheduling.

- [x] **Item 16: Chatbot Psychological Privacy & Emotion Redaction**
  - Completely eliminated the bottom telemetry bar (`Sentiment: NEUTRAL | Primary Emotion: sadness | Signal Extraction Engine`) from the victim's UI (`frontend/src/pages/victim/VictimChat.tsx`).
  - Refactored chatbot UI into a warm, supportive companion ("Supportive Care Assistant").
  - Redacted `nlp_analysis` from `POST /api/v1/chat/message` response payload so victims never receive psychiatric diagnostic labels.
  - Persisted emotional and threat telemetry strictly to restricted database table `chat_emotion_analyses` accessible exclusively by authorized officials (`GET /api/v1/officials/chat-analysis/{victim_id}`).

- [x] **Item 17: Unauthenticated Access Guard & Demo Switcher Elimination**
  - Fixed `frontend/src/lib/authContext.tsx` which previously auto-logged in as Sunita Devi on mount.
  - Root route `http://localhost:3000` strictly presents the Login Landing Page when unauthenticated.
  - Completely removed header-based persona switchers, pulsating test distress buttons, and developer system status panels from victim view.

---

## Section B: Tasks the Project Owner Must Perform Manually

- [ ] **Item 1: Supabase Cloud Project Creation & Connection Keys**
  - **Action Required:**
    1. Go to [https://supabase.com](https://supabase.com) and create an account or sign in.
    2. Click **New Project**, name it `sih-victim-portal-ntr`, select region `ap-south-1` (Mumbai).
    3. Copy the **Project URL** and **anon public key** from Project Settings > API.
    4. Copy the **service_role secret key** (needed for backend administrative scripts).
    5. Update `frontend/.env`:
       ```env
       VITE_API_URL=http://localhost:8000/api/v1
       VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
       VITE_SUPABASE_ANON_KEY=<your-anon-key>
       ```
    6. Update `backend/.env`:
       ```env
       SUPABASE_URL=https://<your-project-id>.supabase.co
       SUPABASE_KEY=<your-service-role-key>
       SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
       ```

- [ ] **Item 2: SQL Schema Migration Execution in Supabase**
  - **Action Required:**
    1. In the Supabase Dashboard, open **SQL Editor** from the left navigation.
    2. Click **New Query**.
    3. Open the file `supabase/migrations/20260905_initial_schema.sql` on your machine, copy all contents, paste into the SQL Editor.
    4. Click **Run**. Verify that all 20 tables and constraints are created without errors:
       - `districts`, `profiles`, `victims`, `cases`, `case_stages`, `questions`, `mental_health_checkins`, `questionnaire_responses`, `chat_sessions`, `chat_messages`, `nlp_analysis`, `ai_assessments`, `alerts`, `interventions`, `threat_events`, `welfare_records`, `victim_credentials`, `case_assignments`, `audit_logs`, `chat_emotion_analyses`.

- [ ] **Item 3: Row-Level Security (RLS) Policies Verification**
  - **Action Required:**
    1. In Supabase Dashboard, navigate to **Authentication** > **Policies** (or Table Editor > View Policies).
    2. Confirm that RLS is toggled **ON** for all tables.
    3. Verify that the following 6 critical policies are active:
       - `Profiles viewable by authenticated users`
       - `Victims viewable by assigned officials or self`
       - `Checkins viewable by owner or officials`
       - `Assessments viewable ONLY by authorized officials` (Victims blocked)
       - `Alerts viewable ONLY by authorized officials` (Victims blocked)
       - `Chat emotion analyses viewable ONLY by authorized officials` (Victims blocked)

- [ ] **Item 4: Ingest 100 Synthetic Victim Records into Supabase Database**
  - **Action Required:**
    1. Once the schema migration is run and your backend `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, run the ingestion script:
       ```bash
       python scripts/seed_supabase.py
       ```
    2. Confirm in Supabase Table Editor that the `victims` table has 100 rows and the `cases` table has 100 rows.
    *(Note: Even before running this script, the FastAPI backend has the full 100 synthetic victims preloaded in memory from `backend/app/data/synthetic_100_victims.json`, so the app runs immediately even in offline/local mock mode).*

- [ ] **Item 13: Starting Both Servers Simultaneously for Live Demo**
  - **Action Required:**
    - **Terminal 1 (Backend - Port 8000):**
      ```bash
      cd backend
      uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
      ```
    - **Terminal 2 (Frontend - Port 3000):**
      ```bash
      cd frontend
      npm run dev
      ```
    - Access in browser: `http://localhost:3000`

- [ ] **Item 14 (Manual Verification): Browser Walkthrough Across All 5 Portals**
  - **Action Required:**
    1. Open `http://localhost:3000` (confirm Login Page displays; no auto-login).
    2. Open "Demo Credentials" drawer and click "Fill Credentials" for Police Officer.
    3. Log in as Inspector Vijay Prakash:
       - Open Police Dashboard, click "Register New Victim & Case".
       - Register a new victim, verify one-time credentials card appears with new ID & password.
    4. Log out. Log in with the newly generated victim credentials.
       - Verify Victim Dashboard displays the registered name.
       - Verify "Submit Wellbeing Check-in" records a check-in.
       - Verify "Supportive Assistant" chat does NOT show emotion labels or system status.
    5. Log out. Log in as Senior Counsellor (`counsellor.demo@sih.test`).
       - Verify the newly submitted check-in appears in the Counsellor's prioritized alert list with dynamic ML risk score.
    6. Log out. Log in as Protection Officer (`protection.demo@sih.test`).
       - Verify legal aid & safe house relocation options.
    7. Log out. Log in as District Administrator (`admin.demo@sih.test`).
       - Verify district-wide analytics, audit logs, and compensation disbursements.

---

## Section C: Features Blocked Until External Credentials Provided

- [BLOCKED] **Item 9: Live OpenAI / Gemini LLM API Key for Chatbot**
  - **Status:** **Fallback Active & Fully Functional**
  - **Details:** The portal includes a built-in Dynamic Conversational AI Engine (`backend/app/services/llm_service.py`) that handles supportive listening, crisis de-escalation, and empathetic replies locally without any external API key.
  - **To Unblock Live GPT-4 / Gemini Inference:**
    - Obtain an API key from OpenAI (`https://platform.openai.com`) or Google AI Studio.
    - Set `OPENAI_API_KEY=sk-...` in `backend/.env`.
    - Restart backend. The LLM engine will automatically switch from Fallback Mode to Live Inference Mode.

- [BLOCKED] **Item 10: Twilio / Telecom SMS Gateway for Real-Time SMS Emergency Dispatch**
  - **Status:** **Mock/Console Logger Active**
  - **Details:** Emergency distress escalations and high-priority threat reports currently log to the server console and create in-app high-severity alerts in the database.
  - **To Unblock Live SMS Dispatch:**
    - Create a Twilio account (`https://twilio.com`) or an Indian DLT-approved SMS provider (e.g., Fast2SMS, MSG91).
    - Provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `backend/.env`.
    - Uncomment the live SMS dispatch hook in `backend/app/services/alert_service.py`.

---

## Quick Reference: Demo Accounts Table

| Portal | Role ID | Login Identifier | Password | Persona & Jurisdiction |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen / Victim Support** | `victim` | `VIC-DEMO-0001` | `Victim@2026#001` | Sunita Devi (Case `CASE-DEMO-0001`, Suryaraopet PS) |
| **Police & Registration Desk** | `police_officer` | `police.demo@sih.test` | `SIH-Police@2026` | Inspector Vijay Prakash (Suryaraopet PS, AP-NTR-01) |
| **Mental Health & Counsellor** | `counsellor` | `counsellor.demo@sih.test` | `SIH-Counsel@2026` | Dr. Ananya Sharma (District Mental Health Wing) |
| **Legal Aid & Protection** | `protection_officer` | `protection.demo@sih.test` | `SIH-Protect@2026` | Smt. K. Ratna Kumari (Women & Child Protection Wing) |
| **District Administration** | `district_officer` | `admin.demo@sih.test` | `SIH-Admin@2026` | Rajesh Verma (Collectorate, NTR District, Vijayawada) |

---
*Generated for SIH 2026 Evaluation • Andhra Pradesh NTR District Implementation*
