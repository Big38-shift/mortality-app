"""Quick test script to debug model predictions."""
from app.services.prediction_service import get_prediction_engine

# Test with default LOW RISK inputs
low_risk_input = {
    'gdp_per_capita_usd': 50000,
    'poverty_rate_pct': 5,
    'education_index': 0.8,
    'unemployment_rate_pct': 3,
    'gini_coefficient': 0.30,
    'urban_population_pct': 75,
    'health_expenditure_pct_gdp': 8,
    'co2_emissions_per_capita': 5,
    'population_growth_rate': 0.5,
    'life_expectancy_years': 80,
    'under5_mortality_rate': 5,
    'maternal_mortality_ratio': 12,
    'infant_mortality_rate': 4,
    'immunization_dtp3_pct': 95,
    'hiv_prevalence_pct': 0.1,
    'tb_incidence_per100k': 5,
    'malaria_incidence_per1k': 0.5,
    'clean_water_access_pct': 98,
    'sanitation_access_pct': 97,
    'physician_density_per1k': 3,
    'hospital_beds_per1k': 5,
    'region': 'Europe',
    'income_group': 'High income'
}

# Test with HIGH RISK inputs
high_risk_input = {
    'gdp_per_capita_usd': 1000,
    'poverty_rate_pct': 60,
    'education_index': 0.3,
    'unemployment_rate_pct': 20,
    'gini_coefficient': 0.65,
    'urban_population_pct': 25,
    'health_expenditure_pct_gdp': 2,
    'co2_emissions_per_capita': 0.5,
    'population_growth_rate': 3,
    'life_expectancy_years': 55,
    'under5_mortality_rate': 100,
    'maternal_mortality_ratio': 400,
    'infant_mortality_rate': 80,
    'immunization_dtp3_pct': 40,
    'hiv_prevalence_pct': 18,
    'tb_incidence_per100k': 300,
    'malaria_incidence_per1k': 50,
    'clean_water_access_pct': 30,
    'sanitation_access_pct': 20,
    'physician_density_per1k': 0.2,
    'hospital_beds_per1k': 1,
    'region': 'Africa',
    'income_group': 'Low income'
}

engine = get_prediction_engine()
print('\n=== Testing LOW RISK scenario ===')
result_low = engine.predict(low_risk_input)
print(f'Probability: {result_low["predicted_probability"]:.4f}')
print(f'Label: {result_low["predicted_risk_label"]}')
print(f'Category: {result_low["risk_category"]}')
print(f'Contributions: {result_low["contributions"][:3]}')  # First 3 contributions
print()
print('=== Testing HIGH RISK scenario ===')
result_high = engine.predict(high_risk_input)
print(f'Probability: {result_high["predicted_probability"]:.4f}')
print(f'Label: {result_high["predicted_risk_label"]}')
print(f'Category: {result_high["risk_category"]}')
print(f'Contributions: {result_high["contributions"][:3]}')  # First 3 contributions
