import os
import requests
from typing import Dict, Any, List
from app.core.config import settings
from app.nlp.nlp_engine import nlp_engine

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.provider = settings.LLM_PROVIDER
        self.is_configured = bool(self.api_key and len(self.api_key) > 10)
        print(f"LLM Service Status: {'Configured (OpenAI)' if self.is_configured else 'Demo Fallback Mode (Deterministic Supportive Bot)'}")

    def generate_chat_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        nlp_res = nlp_engine.analyze_text(user_message)

        if self.is_configured:
            try:
                import openai
                client = openai.OpenAI(api_key=self.api_key)
                
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are a supportive, compassionate MoSJE assistant providing emotional support to victims/witnesses of atrocities. "
                            "SAFETY RULES:\n"
                            "1. NEVER diagnose PTSD, depression, anxiety, or any mental illness.\n"
                            "2. NEVER prescribe medication or offer legal advice.\n"
                            "3. Do NOT make promises about case outcomes.\n"
                            "4. Use empathetic, calm, non-judgmental language.\n"
                            "5. If the user mentions threats, danger, or severe fear, validate their feelings and reassure them that human counsellors and district officers are here to support them."
                        )
                    }
                ]

                if chat_history:
                    for msg in chat_history[-6:]:
                        messages.append({"role": msg.get("sender", "user"), "content": msg.get("message_text", "")})

                messages.append({"role": "user", "content": user_message})

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=250,
                    temperature=0.7
                )
                
                bot_reply = response.choices[0].message.content
                return {
                    'reply': bot_reply,
                    'mode': 'OpenAI-LLM',
                    'nlp_analysis': nlp_res
                }
            except Exception as e:
                print(f"OpenAI API Call failed: {e}. Falling back to deterministic bot.")

        # Fallback Deterministic Supportive Bot
        text_lower = user_message.lower()

        if nlp_res.get('threat_signal'):
            reply = (
                "I hear how alarming and stressful this situation is for you. Please know that your safety is our utmost priority. "
                "I have flagged this message so your assigned human counsellor and district protection officer can immediately review your situation. "
                "Would you like me to connect you directly with emergency support right now?"
            )
        elif 'scared' in text_lower or 'afraid' in text_lower or 'fear' in text_lower or nlp_res.get('emotion_label') == 'fear':
            reply = (
                "It sounds like you are feeling a lot of fear and anxiety right now. Going through legal proceedings and case steps can feel overwhelming. "
                "You are not alone in this journey. Taking slow, deep breaths can sometimes help center us. Would you like to share a bit more about what's making you feel unsafe?"
            )
        elif 'sleep' in text_lower or 'tired' in text_lower or 'insomnia' in text_lower:
            reply = (
                "Sleep disruption is a very common response when living under high stress or anxiety. "
                "Your counsellor can suggest gentle relaxation techniques. How many hours of rest have you been able to get over recent nights?"
            )
        elif 'court' in text_lower or 'trial' in text_lower or 'police' in text_lower or 'hearing' in text_lower:
            reply = (
                "Upcoming court hearings or legal proceedings often bring up intense worry. "
                "Remember that legal aid support and protection measures are available for your case. Would you like to check the current status of your welfare or protection support?"
            )
        else:
            reply = (
                "Thank you for sharing how you feel. Expressing your emotions is an important step in managing well-being. "
                "I am here to listen and help monitor your check-ins so your human counsellor can offer the best support possible. How else can I assist you today?"
            )

        return {
            'reply': reply,
            'mode': 'Demo Fallback Mode (Deterministic Supportive Flow)',
            'nlp_analysis': nlp_res
        }

llm_service = LLMService()
