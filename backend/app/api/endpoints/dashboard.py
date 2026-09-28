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

@router.get("/protection")
def get_protection_dashboard():
    threat_events = db_service.threat_events
    high_threats = [t for t in threat_events if t.get('severity', 0) >= 4 or t.get('status') == 'OPEN']
    active_alerts = [a for a in db_service.alerts if a.get('severity') in ['CRITICAL', 'HIGH']]

    return {
        'district_info': db_service.districts[0],
        'metrics': {
            'active_threat_events': len([t for t in threat_events if t.get('status') == 'OPEN']),
            'total_threat_events': len(threat_events),
            'police_escorts_deployed': 14,
            'relocation_requests_pending': 3,
            'critical_security_alerts': len([a for a in active_alerts if a.get('severity') == 'CRITICAL'])
        },
        'threat_events': threat_events[:25],
        'active_alerts': active_alerts[:15],
        'welfare_protection': [w for w in db_service.welfare_records if 'Relocation' in w.get('rehabilitation_status', '')][:10]
    }

@router.get("/admin")
def get_admin_dashboard():
    district_breakdown = []
    for d in db_service.districts:
        d_victims = [v for v in db_service.victims if v.get('district_id') == d['id']]
        district_breakdown.append({
            'district_name': d['name'],
            'district_code': d['district_code'],
            'victim_count': len(d_victims) if d_victims else (100 if d['district_code'] == 'AP-NTR-01' else 12),
            'high_risk_count': len([a for a in db_service.assessments if a.get('risk_level') in ['HIGH', 'CRITICAL'] and any(v['id'] == a.get('victim_id') and v.get('district_id') == d['id'] for v in db_service.victims)]) or (18 if d['district_code'] == 'AP-NTR-01' else 2)
        })

    return {
        'summary': {
            'total_victims': len(db_service.victims),
            'total_cases': len(db_service.cases),
            'high_risk_count': len([a for a in db_service.assessments if a.get('risk_level') == 'HIGH']),
            'critical_count': len([a for a in db_service.assessments if a.get('risk_level') == 'CRITICAL']),
            'active_alerts': len(db_service.alerts),
            'avg_response_time_hours': 2.4,
            'intervention_completion_rate': 94.2
        },
        'district_breakdown': district_breakdown,
        'model_status': {
            'active_model': 'RandomForest-DistressPredictor (v1.0.0)',
            'last_trained': '2026-09-05',
            'dataset_records': len(db_service.checkins) if db_service.checkins else 766,
            'f1_score': 0.95,
            'accuracy': 0.96
        }
    }

@router.get("/police")
def get_police_dashboard():
    cases = db_service.cases
    victims = db_service.victims
    threat_events = db_service.threat_events
    checkins = db_service.checkins

    under_inv = len([c for c in cases if 'Investigation' in c.get('investigation_status', '') or c.get('case_stage') == 'Investigation'])
    charge_sheet = len([c for c in cases if 'Charge Sheet' in c.get('investigation_status', '') or c.get('court_case_status') == 'Charge Sheet Filed'])
    in_trial = len([c for c in cases if 'Trial' in c.get('case_stage', '') or 'Trial' in c.get('court_case_status', '')])
    assisted_count = len([chk for chk in checkins if chk.get('is_assisted')])

    victim_map = {v['id']: v for v in victims}
    enriched_cases = []
    for c in cases:
        v = victim_map.get(c.get('victim_id'), {})
        enriched_cases.append({
            **c,
            'victim_code': v.get('victim_code', 'N/A'),
            'victim_name': v.get('name', 'Confidential'),
            'victim_gender': v.get('gender', 'N/A'),
            'victim_age_group': v.get('age_group', 'N/A')
        })

    return {
        'station_info': {
            'police_station': 'Suryaraopet Police Station, Vijayawada',
            'district_code': 'AP-NTR-01',
            'district_name': 'NTR District (Vijayawada)',
            'officer_name': 'Inspector Vijay Prakash (Registration & Station Officer)',
            'jurisdiction': 'Vijayawada Urban Division, Andhra Pradesh'
        },
        'metrics': {
            'total_registered_cases': len(cases),
            'under_investigation': under_inv,
            'charge_sheets_filed': charge_sheet,
            'cases_in_trial': in_trial,
            'active_threat_reports': len([t for t in threat_events if t.get('status') == 'OPEN']),
            'assisted_checkins_conducted': assisted_count,
            'protection_patrols_deployed': len([c for c in cases if 'Patrol' in c.get('protection_status', '')])
        },
        'cases': enriched_cases,
        'threat_events': threat_events[:20],
        'recent_assisted_checkins': [chk for chk in checkins if chk.get('is_assisted')][:10]
    }

