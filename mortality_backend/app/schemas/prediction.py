from pydantic import BaseModel
from datetime import datetime
from typing import Any, List, Optional


class FeatureContribution(BaseModel):
    """Feature contribution/importance for explainability."""
    name: str
    value: float


class PredictionInput(BaseModel):
    """
    Input schema for mortality predictions.
    Frontend sends only the 23 core health/socioeconomic features + 2 categorical features.
    The backend ML model generates all prediction outputs.
    """
    # Socioeconomic (9)
    gdp_per_capita_usd: float
    poverty_rate_pct: float
    education_index: float
    unemployment_rate_pct: float
    gini_coefficient: float
    urban_population_pct: float
    health_expenditure_pct_gdp: float
    co2_emissions_per_capita: float
    population_growth_rate: float
    
    # Health (12)
    life_expectancy_years: float
    under5_mortality_rate: float
    maternal_mortality_ratio: float
    infant_mortality_rate: float
    immunization_dtp3_pct: float
    hiv_prevalence_pct: float
    tb_incidence_per100k: float
    malaria_incidence_per1k: float
    clean_water_access_pct: float
    sanitation_access_pct: float
    physician_density_per1k: float
    hospital_beds_per1k: float
    
    # Categoricals (2)
    region: str
    income_group: str


class PredictionResponse(BaseModel):
    """Response schema for stored predictions from the database."""
    id: int
    timestamp: datetime
    # Core input features (23 + 2 categorical)
    gdp_per_capita_usd: float
    poverty_rate_pct: float
    education_index: float
    unemployment_rate_pct: float
    gini_coefficient: float
    urban_population_pct: float
    health_expenditure_pct_gdp: float
    co2_emissions_per_capita: float
    population_growth_rate: float
    life_expectancy_years: float
    under5_mortality_rate: float
    maternal_mortality_ratio: float
    infant_mortality_rate: float
    immunization_dtp3_pct: float
    hiv_prevalence_pct: float
    tb_incidence_per100k: float
    malaria_incidence_per1k: float
    clean_water_access_pct: float
    sanitation_access_pct: float
    physician_density_per1k: float
    hospital_beds_per1k: float
    region: str
    income_group: str
    # ML model predictions
    predicted_probability: float
    predicted_risk_label: str
    risk_category: str
    confidence: float
    contributions: Optional[List[FeatureContribution]] = None

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total: int
    highRisk: int
    lowRisk: int
    avgProbability: float
