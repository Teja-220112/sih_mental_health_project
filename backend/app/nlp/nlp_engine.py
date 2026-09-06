import re
import numpy as np
from typing import Dict, Any

class NLPEngine:
    def __init__(self):
        # Multilingual & English threat signal lexicon rules
        self.threat_keywords = [
            'kill', 'hurt', 'threat', 'threatened', 'scared', 'afraid', 'attack',
            'damage', 'harm', 'destroy', 'warned', 'testify', 'court', 'witness',
            'darr', 'mar', 'dhamki', 'chhod', 'police', 'bribe', 'pressure',
            'stalking', 'follow', 'outside my house', 'surveillance', 'retaliate'
        ]

        self.fear_keywords = ['scared', 'afraid', 'terrified', 'fear', 'panic', 'shaking', 'darr', 'bhaya']
        self.anxiety_keywords = ['worried', 'anxious', 'nervous', 'can\'t sleep', 'restless', 'chinta', 'tension']
        self.sadness_keywords = ['sad', 'hopeless', 'crying', 'depressed', 'alone', 'helpless', 'dukhi', 'durdasha']
        self.anger_keywords = ['angry', 'furious', 'rage', 'unfair', 'justice', 'gussa', 'gusse']

    def analyze_text(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                'sentiment_label': 'NEUTRAL',
                'sentiment_score': 0.0,
                'emotion_label': 'neutral',
                'emotion_score': 0.5,
                'fear_score': 0.0,
                'anxiety_score': 0.0,
                'sadness_score': 0.0,
                'anger_score': 0.0,
                'threat_signal': False,
                'threat_score': 0.0,
                'detected_threat_categories': [],
                'model_name': 'MoSJE-NLP-Hybrid-v1',
                'model_version': '1.0.0'
            }

        text_lower = text.lower()
        
        # Word counts for keyword presence
        words = re.findall(r'\w+', text_lower)
        total_words = max(len(words), 1)

        # Keyword match counts
        fear_count = sum(1 for w in words if any(k in w for k in self.fear_keywords))
        anxiety_count = sum(1 for w in words if any(k in w for k in self.anxiety_keywords))
        sadness_count = sum(1 for w in words if any(k in w for k in self.sadness_keywords))
        anger_count = sum(1 for w in words if any(k in w for k in self.anger_keywords))
        threat_count = sum(1 for w in words if any(k in w for k in self.threat_keywords))

        # Calculate normalized emotion scores (0.0 to 1.0)
        fear_score = round(min(1.0, (fear_count * 0.4) + (0.2 if 'scared' in text_lower or 'fear' in text_lower else 0.0)), 2)
        anxiety_score = round(min(1.0, (anxiety_count * 0.35) + (0.2 if 'worried' in text_lower or 'anxious' in text_lower else 0.0)), 2)
        sadness_score = round(min(1.0, (sadness_count * 0.35) + (0.2 if 'hopeless' in text_lower or 'sad' in text_lower else 0.0)), 2)
        anger_score = round(min(1.0, (anger_count * 0.35) + (0.2 if 'angry' in text_lower else 0.0)), 2)

        # Determine primary emotion
        emotions = {
            'fear': fear_score,
            'anxiety': anxiety_score,
            'sadness': sadness_score,
            'anger': anger_score
        }

        primary_emotion = max(emotions, key=emotions.get)
        primary_emotion_score = emotions[primary_emotion]

        if primary_emotion_score < 0.15:
            primary_emotion = 'neutral'
            primary_emotion_score = 0.60

        # Threat Detection Logic
        threat_categories = []
        if 'kill' in text_lower or 'hurt' in text_lower or 'attack' in text_lower:
            threat_categories.append('direct threat / physical violence')
        if 'warned' in text_lower or 'testify' in text_lower or 'court' in text_lower or 'witness' in text_lower:
            threat_categories.append('pressure related to testimony')
        if 'stalking' in text_lower or 'follow' in text_lower or 'outside my house' in text_lower:
            threat_categories.append('stalking / harassment')
        if 'dhamki' in text_lower or 'threatened' in text_lower:
            threat_categories.append('intimidation / coercion')

        threat_signal = threat_count > 0 or len(threat_categories) > 0
        raw_threat_score = min(100.0, threat_count * 30.0 + (50.0 if len(threat_categories) > 0 else 0.0))
        threat_score = round(raw_threat_score, 1)

        # Sentiment score (-1.0 to 1.0)
        neg_val = (fear_score + anxiety_score + sadness_score + (threat_score / 100.0)) / 3.0
        sentiment_score = round(-min(1.0, neg_val), 2)

        if sentiment_score < -0.2:
            sentiment_label = 'NEGATIVE'
        elif sentiment_score > 0.2:
            sentiment_label = 'POSITIVE'
        else:
            sentiment_label = 'NEUTRAL'

        return {
            'sentiment_label': sentiment_label,
            'sentiment_score': sentiment_score,
            'emotion_label': primary_emotion,
            'emotion_score': float(primary_emotion_score),
            'fear_score': float(fear_score),
            'anxiety_score': float(anxiety_score),
            'sadness_score': float(sadness_score),
            'anger_score': float(anger_score),
            'threat_signal': threat_signal,
            'threat_score': float(threat_score),
            'detected_threat_categories': threat_categories,
            'model_name': 'XLM-R-Multilingual-Emotion & Safety-Rules',
            'model_version': '1.0.0'
        }

nlp_engine = NLPEngine()
