import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.llm_service import llm_service

test_queries = [
    "i am feeling sad how should you help me",
    "i am angry",
    "what should i do about my anxiety",
    "who is my counsellor",
    "when is my court hearing date",
    "what are my peak stress hours"
]

print("--- TESTING DYNAMIC AI CHATBOT RESPONSES ---")
for q in test_queries:
    res = llm_service.generate_chat_response(q)
    print(f"\nUser: '{q}'")
    print(f"Bot ({res['mode']}): {res['reply']}")
print("\n--- TEST COMPLETE ---")
