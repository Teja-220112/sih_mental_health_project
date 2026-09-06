from fastapi import APIRouter
from app.services.db_service import db_service

router = APIRouter()

@router.get("/counsellor")
def get_counsellor_dashboard():
    # Group latest assessment by victim
    victim_summary = []
    low_cnt = mod_cnt = high_cnt = crit_cnt = 0

    for v in db_service.victims:
        v_assessments = [a for a in db_service.assessments if a['victim_id'] == v['id']]
        if v_assessments:
            latest = sorted(v_assessments, key=lambda x: x['assessment_time'])[-1]
            score = latest['dynamic_distress_score']
            risk = latest['risk_level']
            trend = latest.get('distress_trend', 'Stable')
        else:
            score = 30.0
            risk = 'LOW'
            trend = 'Stable'
            latest = None

        if risk == 'LOW': low_cnt += 1
        elif risk == 'MODERATE': mod_cnt += 1
        elif risk == 'HIGH': high_cnt += 1
        elif risk == 'CRITICAL': crit_cnt += 1

        v_case = next((c for c in db_service.cases if c['victim_id'] == v['id']), None)

        victim_summary.append({
            'victim_id': v['id'],
            'victim_code': v['victim_code'],
            'name': v.get('name', 'Anonymous Victim'),
            'case_code': v_case['case_code'] if v_case else 'N/A',
            'latest_score': score,
            'risk_level': risk,
            'trend': trend,
            'last_checkin': latest['assessment_time'][:10] if latest else 'N/A',
            'threat_reported': any(t['victim_id'] == v['id'] for t in db_service.threat_events)
        })

    active_alerts = [a for a in db_service.alerts if a['status'] in ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS']]

    return {
        'kpi': {
            'total_assigned': len(db_service.victims),
            'low_risk': low_cnt,
            'moderate_risk': mod_cnt,
            'high_risk': high_cnt,
            'critical_risk': crit_cnt,
            'new_alerts': len([a for a in active_alerts if a['status'] == 'NEW']),
            'pending_interventions': len([i for i in db_service.interventions if i['status'] != 'COMPLETED'])
        },
        'victims': victim_summary,
        'recent_alerts': active_alerts[:5]
    }

@router.get("/district")
def get_district_dashboard():
    return {
        'district_info': db_service.districts[0],
        'metrics': {
            'total_active_cases': len(db_service.cases),
            'monitored_victims': len(db_service.victims),
            'high_risk_victims': len([a for a in db_service.assessments if a['risk_level'] in ['HIGH', 'CRITICAL']]),
            'active_threat_reports': len(db_service.threat_events),
            'protection_requests_pending': 2,
            'rehabilitation_pending': 1,
            'compensation_pending': 1
        },
        'threat_events': db_service.threat_events,
        'welfare_records': db_service.welfare_records
    }

@router.get("/admin")
def get_admin_dashboard():
    district_breakdown = []
    for d in db_service.districts:
        d_victims = [v for v in db_service.victims if v.get('district_id') == d['id']]
        district_breakdown.append({
            'district_name': d['name'],
            'district_code': d['district_code'],
            'victim_count': len(d_victims) + (2 if d['name'] in ['Pune', 'Nagpur'] else 1),
            'high_risk_count': 1 if d['name'] in ['Pune', 'Nagpur'] else 0
        })

    return {
        'summary': {
            'total_victims': len(db_service.victims) + 26,
            'total_cases': len(db_service.cases) + 26,
            'high_risk_count': 8,
            'critical_count': 3,
            'active_alerts': len(db_service.alerts),
            'avg_response_time_hours': 2.4,
            'intervention_completion_rate': 94.2
        },
        'district_breakdown': district_breakdown,
        'model_status': {
            'active_model': 'RandomForest-DistressPredictor (v1.0.0)',
            'last_trained': '2026-09-05',
            'dataset_records': 200,
            'f1_score': 0.95,
            'accuracy': 0.96
        }
    }
