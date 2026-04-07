export interface MortalityInputs {
  // Socioeconomic (9)
  gdp_per_capita_usd: number;
  poverty_rate_pct: number;
  education_index: number;
  unemployment_rate_pct: number;
  gini_coefficient: number;
  urban_population_pct: number;
  health_expenditure_pct_gdp: number;
  co2_emissions_per_capita: number;
  population_growth_rate: number;

  // Health (12)
  life_expectancy_years: number;
  under5_mortality_rate: number;
  maternal_mortality_ratio: number;
  infant_mortality_rate: number;
  immunization_dtp3_pct: number;
  hiv_prevalence_pct: number;
  tb_incidence_per100k: number;
  malaria_incidence_per1k: number;
  clean_water_access_pct: number;
  sanitation_access_pct: number;
  physician_density_per1k: number;
  hospital_beds_per1k: number;

  // Categoricals
  region: string;
  income_group: string;
}

export interface PredictionRecord extends MortalityInputs {
  id: number;
  timestamp: string;
  predicted_probability: number;
  predicted_risk_label: string;
  risk_category: string;
  confidence: number;
}

export const REGIONS = [
  'Africa',
  'Americas',
  'South-East Asia',
  'Europe',
  'Eastern Mediterranean',
  'Western Pacific',
];

export const INCOME_GROUPS = [
  'Low income',
  'Lower middle income',
  'Upper middle income',
  'High income',
];

export const DEFAULT_INPUTS: MortalityInputs = {
  gdp_per_capita_usd: 2000,
  poverty_rate_pct: 25,
  education_index: 0.6,
  unemployment_rate_pct: 8,
  gini_coefficient: 40,
  urban_population_pct: 45,
  health_expenditure_pct_gdp: 5,
  co2_emissions_per_capita: 1.2,
  population_growth_rate: 1.5,
  life_expectancy_years: 65,
  under5_mortality_rate: 40,
  maternal_mortality_ratio: 250,
  infant_mortality_rate: 30,
  immunization_dtp3_pct: 85,
  hiv_prevalence_pct: 1.2,
  tb_incidence_per100k: 120,
  malaria_incidence_per1k: 50,
  clean_water_access_pct: 70,
  sanitation_access_pct: 60,
  physician_density_per1k: 0.8,
  hospital_beds_per1k: 1.5,
  region: 'Africa',
  income_group: 'Low income',
};
