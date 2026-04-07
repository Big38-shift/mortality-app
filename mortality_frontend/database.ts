import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'predictions.db');
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Socioeconomic (9)
      gdp_per_capita_usd REAL,
      poverty_rate_pct REAL,
      education_index REAL,
      unemployment_rate_pct REAL,
      gini_coefficient REAL,
      urban_population_pct REAL,
      health_expenditure_pct_gdp REAL,
      co2_emissions_per_capita REAL,
      population_growth_rate REAL,
      
      -- Health (12)
      life_expectancy_years REAL,
      under5_mortality_rate REAL,
      maternal_mortality_ratio REAL,
      infant_mortality_rate REAL,
      immunization_dtp3_pct REAL,
      hiv_prevalence_pct REAL,
      tb_incidence_per100k REAL,
      malaria_incidence_per1k REAL,
      clean_water_access_pct REAL,
      sanitation_access_pct REAL,
      physician_density_per1k REAL,
      hospital_beds_per1k REAL,
      
      -- Categoricals
      region TEXT,
      income_group TEXT,
      
      -- Engineered (4)
      health_burden_index REAL,
      socio_vulnerability REAL,
      infrastructure_score REAL,
      gdp_log REAL,
      
      -- Output
      predicted_probability REAL,
      predicted_risk_label TEXT,
      risk_category TEXT
    )
  `);
}

export function savePrediction(data: any) {
  const stmt = db.prepare(`
    INSERT INTO predictions (
      gdp_per_capita_usd, poverty_rate_pct, education_index, unemployment_rate_pct, 
      gini_coefficient, urban_population_pct, health_expenditure_pct_gdp, 
      co2_emissions_per_capita, population_growth_rate,
      life_expectancy_years, under5_mortality_rate, maternal_mortality_ratio, 
      infant_mortality_rate, immunization_dtp3_pct, hiv_prevalence_pct, 
      tb_incidence_per100k, malaria_incidence_per1k, clean_water_access_pct, 
      sanitation_access_pct, physician_density_per1k, hospital_beds_per1k,
      region, income_group,
      health_burden_index, socio_vulnerability, infrastructure_score, gdp_log,
      predicted_probability, predicted_risk_label, risk_category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    data.gdp_per_capita_usd, data.poverty_rate_pct, data.education_index, data.unemployment_rate_pct,
    data.gini_coefficient, data.urban_population_pct, data.health_expenditure_pct_gdp,
    data.co2_emissions_per_capita, data.population_growth_rate,
    data.life_expectancy_years, data.under5_mortality_rate, data.maternal_mortality_ratio,
    data.infant_mortality_rate, data.immunization_dtp3_pct, data.hiv_prevalence_pct,
    data.tb_incidence_per100k, data.malaria_incidence_per1k, data.clean_water_access_pct,
    data.sanitation_access_pct, data.physician_density_per1k, data.hospital_beds_per1k,
    data.region, data.income_group,
    data.health_burden_index, data.socio_vulnerability, data.infrastructure_score, data.gdp_log,
    data.predicted_probability, data.predicted_risk_label, data.risk_category
  );
}

export function loadAllPredictions() {
  return db.prepare('SELECT * FROM predictions ORDER BY timestamp DESC').all();
}

export function getSummaryStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM predictions').get() as any;
  const highRisk = db.prepare("SELECT COUNT(*) as count FROM predictions WHERE predicted_risk_label = 'HIGH RISK'").get() as any;
  const lowRisk = db.prepare("SELECT COUNT(*) as count FROM predictions WHERE predicted_risk_label = 'LOW RISK'").get() as any;
  const avgProb = db.prepare('SELECT AVG(predicted_probability) as avg FROM predictions').get() as any;

  return {
    total: total.count,
    highRisk: highRisk.count,
    lowRisk: lowRisk.count,
    avgProbability: avgProb.avg || 0
  };
}

export function deletePrediction(id: number) {
  return db.prepare('DELETE FROM predictions WHERE id = ?').run(id);
}

export function clearAllPredictions() {
  return db.prepare('DELETE FROM predictions').run();
}
