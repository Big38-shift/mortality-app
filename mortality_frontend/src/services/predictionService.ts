import { MortalityInputs, PredictionResult } from './types';

export function calculateEngineeredFeatures(inputs: MortalityInputs) {
  const health_burden_index = (inputs.hivPrevalence * 10 + inputs.tbIncidence / 10 + inputs.undernourishment) / 3;
  const socio_vulnerability = (inputs.unemployment + inputs.giniIndex + (100 - inputs.literacyRate)) / 3;
  const infrastructure_score = (inputs.electricityAccess + inputs.waterAccess + inputs.sanitationAccess + inputs.internetUsers) / 4;
  const gdp_log = Math.log10(Math.max(1, inputs.gdpPerCapita));

  return {
    health_burden_index,
    socio_vulnerability,
    infrastructure_score,
    gdp_log,
  };
}

/**
 * Simulates the Feedforward Neural Network prediction.
 * In a real app, this would call a backend or use TensorFlow.js with the saved model.
 */
export async function predictMortality(inputs: MortalityInputs): Promise<PredictionResult> {
  const engineered = calculateEngineeredFeatures(inputs);
  
  // Mocking the model logic based on common public health trends
  // Higher health burden, higher vulnerability, lower infrastructure -> Higher risk
  let score = 0;
  score += engineered.health_burden_index * 0.5;
  score += engineered.socio_vulnerability * 0.4;
  score -= engineered.infrastructure_score * 0.3;
  score -= engineered.gdp_log * 2;
  score += (inputs.maternalMortality / 100) * 0.5;
  score += (inputs.infantMortality / 10) * 0.4;
  score -= (inputs.lifeExpectancy - 60) * 0.2;

  // Sigmoid-like normalization to [0, 1]
  const probability = 1 / (1 + Math.exp(-(score / 10 - 2)));
  const riskLevel = probability > 0.5 ? 'High' : 'Low';

  // Mocking feature contributions (SHAP-like values)
  const contributions = [
    { name: 'Health Burden', value: engineered.health_burden_index * 0.2 },
    { name: 'Socio Vulnerability', value: engineered.socio_vulnerability * 0.15 },
    { name: 'Infrastructure', value: -engineered.infrastructure_score * 0.1 },
    { name: 'Economic Status', value: -engineered.gdp_log * 0.5 },
    { name: 'Maternal Health', value: (inputs.maternalMortality / 100) * 0.3 },
    { name: 'Infant Health', value: (inputs.infantMortality / 10) * 0.2 },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const recommendations = [];
  if (riskLevel === 'High') {
    recommendations.push("Prioritize universal health coverage and maternal health interventions.");
    recommendations.push("Invest in basic infrastructure: clean water and sanitation systems.");
    recommendations.push("Implement targeted nutritional support programs to reduce undernourishment.");
  } else {
    recommendations.push("Maintain current health expenditure and focus on non-communicable disease prevention.");
    recommendations.push("Strengthen secondary and tertiary education to sustain socioeconomic stability.");
    recommendations.push("Digitalize health records to improve monitoring of emerging health trends.");
  }

  return {
    probability,
    riskLevel,
    contributions,
    recommendations,
  };
}
