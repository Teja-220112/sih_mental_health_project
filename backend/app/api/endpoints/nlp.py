from fastapi import APIRouter
from pydantic import BaseModel
from app.nlp.nlp_engine import nlp_engine

router = APIRouter()

class NLPAnalyzeRequest(BaseModel):
    text: str

@router.post("/analyze")
def analyze_text(req: NLPAnalyzeRequest):
    res = nlp_engine.analyze_text(req.text)
    return {
        'status': 'success',
        'analysis': res,
        'disclaimer': 'NLP signals are screening markers, not a medical/clinical diagnosis.'
    }
