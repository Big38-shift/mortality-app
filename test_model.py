import sys
sys.path.insert(0, 'mortality_backend')

from app.services.prediction_service import MortalityPredictionEngine

engine = MortalityPredictionEngine()
print(f"Model loaded: {engine.model_loaded}")

low_risk = {
    'gdp_per_capita_usd': 2000,
    'poverty_rate_pct': 25,
    'education_index': 0.6,
    'unemployment_rate_pct': 8,
    'gini_coefficient': 40,
    'urban_population_pct': 45,
    'health_expenditure_pct_gdp': 5,
    'co2_emissions_per_capita': 1.2,
    'population_growth_rate': 1.5,
    'life_expectancy_years': 65,
    'under5_mortality_rate': 40,
    'maternal_mortality_ratio': 250,
    'infant_mortality_rate': 30,
    'immunization_dtp3_pct': 85,
    'hiv_prevalence_pct': 1.2,
    'tb_incidence_per100k': 120,
    'malaria_incidence_per1k': 50,
    'clean_water_access_pct': 70,
    'sanitation_access_pct': 60,
    'physician_density_per1k': 0.8,
    'hospital_beds_per1k': 1.5,
    'region': 'Africa',
    'income_group': 'Low income',
}

high_risk = {
    'gdp_per_capita_usd': 500,
    'poverty_rate_pct': 60,
    'education_index': 0.3,
    'unemployment_rate_pct': 15,
    'gini_coefficient': 60,
    'urban_population_pct': 20,
    'health_expenditure_pct_gdp': 2,
    'co2_emissions_per_capita': 0.5,
    'population_growth_rate': 3,
    'life_expectancy_years': 50,
    'under5_mortality_rate': 100,
    'maternal_mortality_ratio': 500,
    'infant_mortality_rate': 80,
    'immunization_dtp3_pct': 50,
    'hiv_prevalence_pct': 5,
    'tb_incidence_per100k': 300,
    'malaria_incidence_per1k': 150,
    'clean_water_access_pct': 30,
    'sanitation_access_pct': 20,
    'physician_density_per1k': 0.2,
    'hospital_beds_per1k': 0.5,
    'region': 'Africa',
    'income_group': 'Low income',
}

print("\n=== LOW RISK TEST (DEFAULT VALUES) ===")
result = engine.predict(low_risk)
print(f"Probability: {result['predicted_probability']:.4f}")
print(f"Risk Label: {result['predicted_risk_label']}")
print(f"Risk Category: {result['risk_category']}")

print("\n=== HIGH RISK TEST (EXTREME NEGATIVE VALUES) ===")
result = engine.predict(high_risk)
print(f"Probability: {result['predicted_probability']:.4f}")
print(f"Risk Label: {result['predicted_risk_label']}")
print(f"Risk Category: {result['risk_category']}")
