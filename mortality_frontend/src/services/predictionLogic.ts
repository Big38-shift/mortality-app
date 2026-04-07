import { MortalityInputs } from '../types';

export function calculateEngineeredFeatures(inputs: MortalityInputs) {
  const health_burden_index = ((inputs.under5_mortality_rate / 150) + (inputs.hiv_prevalence_pct / 25) + (inputs.tb_incidence_per100k / 400)) / 3;
  const socio_vulnerability = ((inputs.poverty_rate_pct / 100) + (1 - inputs.education_index) + (inputs.gini_coefficient / 65)) / 3;
  const infrastructure_score = ((inputs.clean_water_access_pct / 100) + (inputs.sanitation_access_pct / 100) + (inputs.physician_density_per1k / 6)) / 3;
  const gdp_log = Math.log1p(inputs.gdp_per_capita_usd);

  return {
    health_burden_index,
    socio_vulnerability,
    infrastructure_score,
    gdp_log,
  };
}

export function getRiskCategory(probability: number) {
  if (probability >= 0.7) return 'Critical';
  if (probability >= 0.5) return 'High';
  if (probability >= 0.3) return 'Moderate';
  return 'Low';
}

export function getPolicyRecommendations(probability: number) {
  if (probability >= 0.7) {
    return [
      "Immediate emergency health funding required.",
      "Intensive maternal and child health intervention programs.",
      "Rapid expansion of clean water and sanitation infrastructure.",
      "International aid coordination for disease control (HIV/TB/Malaria)."
    ];
  }
  if (probability >= 0.5) {
    return [
      "Strengthen primary healthcare systems.",
      "Increase immunization coverage targets.",
      "Implement poverty reduction and social safety net programs.",
      "Enhance physician training and retention strategies."
    ];
  }
  if (probability >= 0.3) {
    return [
      "Monitor health indicators for emerging trends.",
      "Invest in secondary education and vocational training.",
      "Promote urban planning and sustainable infrastructure.",
      "Gradual increase in public health expenditure."
    ];
  }
  return [
    "Maintain current health and socioeconomic standards.",
    "Focus on prevention of non-communicable diseases.",
    "Optimize healthcare efficiency and digital health records.",
    "Promote healthy lifestyle choices through public awareness."
  ];
}

export async function simulatePrediction(inputs: MortalityInputs) {
  const engineered = calculateEngineeredFeatures(inputs);
  
  // Simulation logic based on common trends
  let score = 0;
  score += engineered.health_burden_index * 2;
  score += engineered.socio_vulnerability * 1.5;
  score -= engineered.infrastructure_score * 1.2;
  score -= engineered.gdp_log * 0.5;
  score += (inputs.malaria_incidence_per1k / 100) * 0.5;
  score += (inputs.maternal_mortality_ratio / 500) * 0.8;
  score -= (inputs.life_expectancy_years - 60) * 0.1;

  // Sigmoid-like normalization
  const probability = 1 / (1 + Math.exp(-(score - 1)));
  const riskLabel = probability >= 0.5 ? 'HIGH RISK' : 'LOW RISK';
  const riskCategory = getRiskCategory(probability);

  return {
    ...inputs,
    ...engineered,
    predicted_probability: probability,
    predicted_risk_label: riskLabel,
    risk_category: riskCategory,
    contributions: [
      { name: 'Health Burden', value: engineered.health_burden_index * 10 },
      { name: 'Socio Vulnerability', value: engineered.socio_vulnerability * 8 },
      { name: 'Infrastructure', value: -engineered.infrastructure_score * 6 },
      { name: 'Economic Status', value: -engineered.gdp_log * 4 },
      { name: 'Maternal Health', value: (inputs.maternal_mortality_ratio / 100) * 2 },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  };
}
