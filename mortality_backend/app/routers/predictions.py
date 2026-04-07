from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionInput, PredictionResponse, StatsResponse
from app.core.dependencies import get_current_user
from app.services.prediction_service import predict_mortality_risk
from typing import List

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.get("/predictions", response_model=List[PredictionResponse])
def get_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all predictions for the logged-in user."""
    return db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.timestamp.desc()).all()


@router.post("/predictions", response_model=PredictionResponse, status_code=201)
def save_prediction(
    payload: PredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a prediction result to the database.
    Uses the FNN ML model to generate predictions from input features.
    """
    try:
        # Prepare features for ML model (extract the 23 numerical + 2 categorical features)
        features = {
            # Socioeconomic
            "gdp_per_capita_usd": payload.gdp_per_capita_usd,
            "poverty_rate_pct": payload.poverty_rate_pct,
            "education_index": payload.education_index,
            "unemployment_rate_pct": payload.unemployment_rate_pct,
            "gini_coefficient": payload.gini_coefficient,
            "urban_population_pct": payload.urban_population_pct,
            "health_expenditure_pct_gdp": payload.health_expenditure_pct_gdp,
            "co2_emissions_per_capita": payload.co2_emissions_per_capita,
            "population_growth_rate": payload.population_growth_rate,
            # Health
            "life_expectancy_years": payload.life_expectancy_years,
            "under5_mortality_rate": payload.under5_mortality_rate,
            "maternal_mortality_ratio": payload.maternal_mortality_ratio,
            "infant_mortality_rate": payload.infant_mortality_rate,
            "immunization_dtp3_pct": payload.immunization_dtp3_pct,
            "hiv_prevalence_pct": payload.hiv_prevalence_pct,
            "tb_incidence_per100k": payload.tb_incidence_per100k,
            "malaria_incidence_per1k": payload.malaria_incidence_per1k,
            "clean_water_access_pct": payload.clean_water_access_pct,
            "sanitation_access_pct": payload.sanitation_access_pct,
            "physician_density_per1k": payload.physician_density_per1k,
            "hospital_beds_per1k": payload.hospital_beds_per1k,
            # Categoricals
            "region": payload.region,
            "income_group": payload.income_group,
        }
        
        # Call ML model to get actual prediction
        prediction_result = predict_mortality_risk(features)
        
        # Store the ML model's predictions in the database
        pred = Prediction(
            user_id=current_user.id,
            # Store all input features
            gdp_per_capita_usd=payload.gdp_per_capita_usd,
            poverty_rate_pct=payload.poverty_rate_pct,
            education_index=payload.education_index,
            unemployment_rate_pct=payload.unemployment_rate_pct,
            gini_coefficient=payload.gini_coefficient,
            urban_population_pct=payload.urban_population_pct,
            health_expenditure_pct_gdp=payload.health_expenditure_pct_gdp,
            co2_emissions_per_capita=payload.co2_emissions_per_capita,
            population_growth_rate=payload.population_growth_rate,
            life_expectancy_years=payload.life_expectancy_years,
            under5_mortality_rate=payload.under5_mortality_rate,
            maternal_mortality_ratio=payload.maternal_mortality_ratio,
            infant_mortality_rate=payload.infant_mortality_rate,
            immunization_dtp3_pct=payload.immunization_dtp3_pct,
            hiv_prevalence_pct=payload.hiv_prevalence_pct,
            tb_incidence_per100k=payload.tb_incidence_per100k,
            malaria_incidence_per1k=payload.malaria_incidence_per1k,
            clean_water_access_pct=payload.clean_water_access_pct,
            sanitation_access_pct=payload.sanitation_access_pct,
            physician_density_per1k=payload.physician_density_per1k,
            hospital_beds_per1k=payload.hospital_beds_per1k,
            region=payload.region,
            income_group=payload.income_group,
            # Store the ML model's predictions (not the frontend simulation)
            predicted_probability=float(prediction_result["predicted_probability"]),
            predicted_risk_label=prediction_result["predicted_risk_label"],
            risk_category=prediction_result["risk_category"],
            confidence=float(prediction_result["confidence"]),
            contributions=prediction_result.get("contributions", []),
            # Note: The ML model prediction replaces frontend simulation
        )
        db.add(pred)
        db.commit()
        db.refresh(pred)
        return pred
        
    except ValueError as e:
        # Handle feature preprocessing errors from ML model
        raise HTTPException(status_code=422, detail=f"Prediction failed: {str(e)}")
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Internal server error during prediction: {str(e)}")


@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a single prediction by ID."""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    db.delete(pred)
    db.commit()
    return {"success": True}


@router.delete("/predictions")
def clear_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all predictions for the logged-in user."""
    db.query(Prediction).filter(Prediction.user_id == current_user.id).delete()
    db.commit()
    return {"success": True}


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary statistics for the logged-in user."""
    base = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    total = base.count()
    high = base.filter(Prediction.predicted_risk_label == "HIGH RISK").count()
    low = base.filter(Prediction.predicted_risk_label == "LOW RISK").count()
    avg = db.query(func.avg(Prediction.predicted_probability)).filter(
        Prediction.user_id == current_user.id
    ).scalar() or 0.0

    return {
        "total": total,
        "highRisk": high,
        "lowRisk": low,
        "avgProbability": round(avg, 4)
    }
