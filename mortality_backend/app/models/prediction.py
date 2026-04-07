import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Socioeconomic (9)
    gdp_per_capita_usd = Column(Float)
    poverty_rate_pct = Column(Float)
    education_index = Column(Float)
    unemployment_rate_pct = Column(Float)
    gini_coefficient = Column(Float)
    urban_population_pct = Column(Float)
    health_expenditure_pct_gdp = Column(Float)
    co2_emissions_per_capita = Column(Float)
    population_growth_rate = Column(Float)

    # Health (12)
    life_expectancy_years = Column(Float)
    under5_mortality_rate = Column(Float)
    maternal_mortality_ratio = Column(Float)
    infant_mortality_rate = Column(Float)
    immunization_dtp3_pct = Column(Float)
    hiv_prevalence_pct = Column(Float)
    tb_incidence_per100k = Column(Float)
    malaria_incidence_per1k = Column(Float)
    clean_water_access_pct = Column(Float)
    sanitation_access_pct = Column(Float)
    physician_density_per1k = Column(Float)
    hospital_beds_per1k = Column(Float)

    # Categoricals
    region = Column(String)
    income_group = Column(String)

    # Engineered features
    health_burden_index = Column(Float)
    socio_vulnerability = Column(Float)
    infrastructure_score = Column(Float)
    gdp_log = Column(Float)

    # Model output
    predicted_probability = Column(Float)
    predicted_risk_label = Column(String)
    risk_category = Column(String)
    confidence = Column(Float)
    contributions = Column(JSONB)
