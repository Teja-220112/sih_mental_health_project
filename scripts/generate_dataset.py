import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_records=200, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    age_groups = ['18-25', '26-35', '36-50', '50+']
    genders = ['Female', 'Male', 'Non-binary/Other', 'Prefer not to say']
    case_types = ['SC/ST Atrocity', 'Domestic Violence', 'Sexual Violence', 'Witness Intimidation', 'Land/Property Grab']
    case_stages = ['Investigation', 'Court/Trial', 'Compensation', 'Protection', 'Rehabilitation']

    data = []

    for i in range(1, num_records + 1):
        victim_id = f"VIC-{i:03d}"
        age = random.choice(age_groups)
        gender = random.choice(genders)
        c_type = random.choice(case_types)
        c_stage = random.choice(case_stages)

        days_since_complaint = random.randint(10, 365)
        num_hearings = random.randint(0, 12)
        case_delay_indicator = round(min(1.0, days_since_complaint / 180.0 + random.uniform(-0.1, 0.2)), 2)

        # Baseline latent risk severity (0.0 to 1.0)
        latent_risk = np.random.beta(2, 2)

        # Derive correlated scores
        recent_threat_count = int(np.random.poisson(latent_risk * 3))
        threat_score = min(100.0, round(recent_threat_count * 25.0 + latent_risk * 25.0 + random.uniform(0, 15), 1))

        sleep_score = round(max(0.0, min(100.0, latent_risk * 80 + random.uniform(-10, 15))), 1) # higher means worse sleep
        stress_score = round(max(0.0, min(100.0, latent_risk * 85 + random.uniform(-10, 15))), 1)
        anxiety_score = round(max(0.0, min(100.0, latent_risk * 85 + random.uniform(-10, 15))), 1)
        fear_score = round(max(0.0, min(100.0, latent_risk * 90 + random.uniform(-10, 10))), 1)
        safety_score = round(max(0.0, min(100.0, (1 - latent_risk) * 85 + random.uniform(-10, 15))), 1) # lower safety = higher risk
        social_support_score = round(max(0.0, min(100.0, (1 - latent_risk) * 90 + random.uniform(-10, 10))), 1)
        functioning_score = round(max(0.0, min(100.0, latent_risk * 80 + random.uniform(-10, 15))), 1) # functional impairment
        case_related_distress = round(max(0.0, min(100.0, latent_risk * 85 + random.uniform(-10, 10))), 1)

        # NLP scores
        sentiment_score = round(max(-1.0, min(1.0, -latent_risk * 0.9 + random.uniform(-0.1, 0.2))), 2) # negative sentiment
        fear_nlp_score = round(max(0.0, min(1.0, latent_risk * 0.9 + random.uniform(-0.1, 0.1))), 2)
        anxiety_nlp_score = round(max(0.0, min(1.0, latent_risk * 0.85 + random.uniform(-0.1, 0.1))), 2)
        sadness_nlp_score = round(max(0.0, min(1.0, latent_risk * 0.8 + random.uniform(-0.1, 0.1))), 2)
        anger_nlp_score = round(max(0.0, min(1.0, latent_risk * 0.75 + random.uniform(-0.1, 0.1))), 2)

        # Longitudinal trend
        previous_distress = round(max(10.0, min(95.0, latent_risk * 80 + random.uniform(-20, 20))), 1)
        
        current_structured_distress = round(
            (stress_score * 0.15 + anxiety_score * 0.15 + fear_score * 0.15 + 
             sleep_score * 0.10 + (100 - safety_score) * 0.15 + threat_score * 0.10 + 
             (100 - social_support_score) * 0.05 + functioning_score * 0.10 + case_related_distress * 0.05),
            1
        )

        distress_change = round(current_structured_distress - previous_distress, 1)
        if distress_change > 10:
            distress_trend = "Rapidly Increasing"
        elif distress_change > 3:
            distress_trend = "Increasing"
        elif distress_change < -5:
            distress_trend = "Improving"
        else:
            distress_trend = "Stable"

        engagement_change = round(random.uniform(-0.5, 0.5), 2)
        case_risk_score = round(min(100.0, case_delay_indicator * 40 + recent_threat_count * 20 + latent_risk * 30), 1)

        # Hybrid Dynamic Distress Score (0-100)
        final_distress_score = round(
            min(100.0, max(0.0,
                current_structured_distress * 0.35 +
                (fear_nlp_score * 50 + anxiety_nlp_score * 50) * 0.15 +
                threat_score * 0.15 +
                max(0, distress_change) * 0.8 * 0.15 +
                case_risk_score * 0.10 +
                latent_risk * 10
            )),
            1
        )

        # Risk level mapping
        if final_distress_score >= 75 or threat_score >= 75 or recent_threat_count >= 2:
            risk_level = "CRITICAL"
        elif final_distress_score >= 50:
            risk_level = "HIGH"
        elif final_distress_score >= 30:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Target variable for ML prediction
        # Probability of escalation within 7 days
        esc_prob = 1 / (1 + np.exp(-(final_distress_score - 55) / 10.0))
        escalation_within_7_days = 1 if (esc_prob > 0.5 or (distress_change > 8 and final_distress_score > 45)) else 0

        data.append({
            'victim_id': victim_id,
            'age_group': age,
            'gender': gender,
            'case_type': c_type,
            'days_since_complaint': days_since_complaint,
            'case_stage': c_stage,
            'number_of_hearings': num_hearings,
            'case_delay_indicator': case_delay_indicator,
            'recent_threat_count': recent_threat_count,
            'threat_score': threat_score,
            'sleep_score': sleep_score,
            'stress_score': stress_score,
            'anxiety_score': anxiety_score,
            'fear_score': fear_score,
            'safety_score': safety_score,
            'social_support_score': social_support_score,
            'functioning_score': functioning_score,
            'case_related_distress': case_related_distress,
            'sentiment_score': sentiment_score,
            'fear_nlp_score': fear_nlp_score,
            'anxiety_nlp_score': anxiety_nlp_score,
            'sadness_nlp_score': sadness_nlp_score,
            'anger_nlp_score': anger_nlp_score,
            'engagement_change': engagement_change,
            'previous_distress_score': previous_distress,
            'current_structured_distress': current_structured_distress,
            'distress_change': distress_change,
            'distress_trend': distress_trend,
            'case_risk_score': case_risk_score,
            'final_distress_score': final_distress_score,
            'risk_level': risk_level,
            'escalation_within_7_days': escalation_within_7_days
        })

    df = pd.DataFrame(data)
    os.makedirs('data', exist_ok=True)
    out_path = os.path.join('data', 'synthetic_victim_risk_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} synthetic records saved to {out_path}")
    print(df['risk_level'].value_counts())

if __name__ == '__main__':
    generate_synthetic_dataset(200)
