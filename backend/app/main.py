from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import (
    auth, checkins, chat, nlp, risk, alerts, interventions, threats, cases, dashboard, ml, officials
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend ML/NLP & Dynamic Distress Scoring Engine for MoSJE Hackathon Prototype (PS 26094)"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers for both /api/v1 (frontend) and /api (tests / legacy)
for prefix in ["/api/v1", "/api"]:
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["Auth"])
    app.include_router(checkins.router, prefix=f"{prefix}/checkins", tags=["Checkins"])
    app.include_router(chat.router, prefix=f"{prefix}/chat", tags=["Chat"])
    app.include_router(nlp.router, prefix=f"{prefix}/nlp", tags=["NLP"])
    app.include_router(risk.router, prefix=f"{prefix}/risk", tags=["Risk Engine"])
    app.include_router(alerts.router, prefix=f"{prefix}/alerts", tags=["Alerts"])
    app.include_router(interventions.router, prefix=f"{prefix}/interventions", tags=["Interventions"])
    app.include_router(threats.router, prefix=f"{prefix}/threats", tags=["Threats"])
    app.include_router(cases.router, prefix=f"{prefix}/cases", tags=["Cases"])
    app.include_router(dashboard.router, prefix=f"{prefix}/dashboard", tags=["Dashboard"])
    app.include_router(ml.router, prefix=f"{prefix}/ml", tags=["ML Monitoring"])
    app.include_router(officials.router, prefix=f"{prefix}/officials", tags=["Officials"])

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Resolve static frontend build directory
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if not os.path.exists(static_dir):
    # Fallback to root static if present
    static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static")

if os.path.exists(static_dir) and os.path.exists(os.path.join(static_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MoSJE-AI-Backend"}

@app.get("/")
def root():
    if os.path.exists(static_dir) and os.path.exists(os.path.join(static_dir, "index.html")):
        return FileResponse(os.path.join(static_dir, "index.html"))
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "disclaimer": "AI-generated scores are screening and prioritization signals, not medical diagnoses. High-risk cases require review by an authorized human professional.",
        "llm_status": "Configured (OpenAI)" if settings.OPENAI_API_KEY else "Demo Fallback Mode (Deterministic Supportive Bot)"
    }

# SPA Fallback for client-side routing (e.g. /login, /dashboard)
if os.path.exists(static_dir):
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Do not catch API routes, docs or health checks
        if full_path.startswith("api") or full_path in ["health", "docs", "openapi.json", "redoc"]:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(static_dir, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(static_dir, "index.html"))
