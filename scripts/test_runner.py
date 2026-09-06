import sys
import os

backend_path = os.path.abspath('backend')
sys.path.insert(0, backend_path)

from tests.test_backend import (
    test_health_check,
    test_nlp_threat_detection,
    test_scoring_immediate_danger_gate,
    test_ml_risk_predictor,
    test_demo_login_endpoint
)

def run_all_tests():
    print("Running MoSJE Backend Unit Tests...")
    try:
        test_health_check()
        print("  [PASSED] test_health_check")
        
        test_nlp_threat_detection()
        print("  [PASSED] test_nlp_threat_detection")
        
        test_scoring_immediate_danger_gate()
        print("  [PASSED] test_scoring_immediate_danger_gate")
        
        test_ml_risk_predictor()
        print("  [PASSED] test_ml_risk_predictor")
        
        test_demo_login_endpoint()
        print("  [PASSED] test_demo_login_endpoint")
        
        print("\nALL BACKEND TESTS PASSED SUCCESSFULLY! (5/5)")
    except Exception as e:
        print(f"\n[FAILED] TEST ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_all_tests()
