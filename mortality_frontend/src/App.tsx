import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  HeartPulse, 
  Users, 
  BarChart3,
  Stethoscope,
  Trash2,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  LogOut
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { MortalityInputs, DEFAULT_INPUTS, REGIONS, INCOME_GROUPS, PredictionRecord } from './types';
import { getPolicyRecommendations } from './services/predictionLogic';
import { useAuth } from './context/AuthContext';
import apiService from './services/apiService';

interface Stats {
  total: number;
  highRisk: number;
  lowRisk: number;
  avgProbability: number;
}

export const PredictorApp: React.FC = () => {
  const { token, user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'predict' | 'history'>('predict');
  const [inputs, setInputs] = useState<MortalityInputs>(DEFAULT_INPUTS);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, highRisk: 0, lowRisk: 0, avgProbability: 0 });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');

  // Load history and stats when auth is ready and token exists
  useEffect(() => {
    if (!authLoading && token) {
      loadData();
    } else if (!authLoading && !token) {
      // Auth loaded but no token - still set fetchingData to false
      setFetchingData(false);
    }
  }, [token, authLoading]);

  const loadData = async () => {
    setFetchingData(true);
    setError(null);
    try {
      const [historyData, statsData] = await Promise.all([
        apiService.getPredictions(token!),
        apiService.getStats(token!),
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send input features to backend, which will use the FNN ML model for prediction
      const result = await apiService.savePrediction(inputs, token!);
      
      setCurrentResult(result || null);
      await loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Prediction failed';
      setError(errorMsg);
      setCurrentResult(null);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await apiService.deletePrediction(id, token!);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('WARNING: This will wipe all prediction history. Proceed?')) {
      try {
        await apiService.clearAllPredictions(token!);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear history');
      }
    }
  };

  const filteredHistory = history
    .filter(item => {
      const riskMatch = filterRisk === 'All' || item.predicted_risk_label === filterRisk;
      const regionMatch = filterRegion === 'All' || item.region === filterRegion;
      return riskMatch && regionMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'Recent') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'Highest Risk') return b.predicted_probability - a.predicted_probability;
      if (sortBy === 'Lowest Risk') return a.predicted_probability - b.predicted_probability;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-900">
      {/* SECTION 1: Header */}
      <header className="bg-[#1a237e] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <Activity className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Deep Learning Mortality Risk Predictor</h1>
              <p className="text-blue-200 text-sm font-medium">
                Signed in as: {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('predict')}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2',
                  activeTab === 'predict' ? 'bg-white text-[#1a237e] shadow-md' : 'text-white hover:bg-white/10'
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Predictor
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2',
                  activeTab === 'history' ? 'bg-white text-[#1a237e] shadow-md' : 'text-white hover:bg-white/10'
                )}
              >
                <History className="w-4 h-4" />
                History
              </button>
            </nav>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {activeTab === 'predict' ? (
          <>
            {/* SECTION 2: Sidebar Input Panel */}
            <aside className="w-full md:w-[380px] bg-white border-r border-slate-200 overflow-y-auto p-6 shadow-xl z-10">
              <div className="space-y-8 pb-20">
                <div>
                  <h2 className="text-xs font-black text-[#1a237e] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Categorical Information
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Region</label>
                      <select 
                        value={inputs.region}
                        onChange={(e) => setInputs({...inputs, region: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      >
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Income Group</label>
                      <select 
                        value={inputs.income_group}
                        onChange={(e) => setInputs({...inputs, income_group: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      >
                        {INCOME_GROUPS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h2 className="text-xs font-black text-[#1a237e] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Socioeconomic Indicators
                  </h2>
                  <div className="space-y-5">
                    {[
                      { label: 'GDP per Capita ($)', key: 'gdp_per_capita_usd', min: 500, max: 100000, step: 500 },
                      { label: 'Poverty Rate (%)', key: 'poverty_rate_pct', min: 0, max: 100, step: 1 },
                      { label: 'Education Index', key: 'education_index', min: 0, max: 1, step: 0.01 },
                      { label: 'Unemployment (%)', key: 'unemployment_rate_pct', min: 0, max: 50, step: 0.1 },
                      { label: 'Gini Coefficient', key: 'gini_coefficient', min: 20, max: 70, step: 1 },
                      { label: 'Urban Pop (%)', key: 'urban_population_pct', min: 0, max: 100, step: 1 },
                      { label: 'Health Exp. (% GDP)', key: 'health_expenditure_pct_gdp', min: 1, max: 25, step: 0.1 },
                      { label: 'CO2 Emissions', key: 'co2_emissions_per_capita', min: 0, max: 50, step: 0.1 },
                      { label: 'Pop. Growth (%)', key: 'population_growth_rate', min: -2, max: 5, step: 0.1 },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{field.label}</label>
                          <span className="text-xs font-black text-blue-700">{(inputs as any)[field.key]}</span>
                        </div>
                        <input 
                          type="range" min={field.min} max={field.max} step={field.step}
                          value={(inputs as any)[field.key]}
                          onChange={(e) => setInputs({...inputs, [field.key]: Number(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a237e]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h2 className="text-xs font-black text-[#1a237e] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" />
                    Health Indicators
                  </h2>
                  <div className="space-y-5">
                    {[
                      { label: 'Life Expectancy', key: 'life_expectancy_years', min: 40, max: 90, step: 0.5 },
                      { label: 'Under-5 Mort. / 1k', key: 'under5_mortality_rate', min: 2, max: 200, step: 1 },
                      { label: 'Maternal Mort. / 100k', key: 'maternal_mortality_ratio', min: 5, max: 1200, step: 1 },
                      { label: 'Infant Mort. / 1k', key: 'infant_mortality_rate', min: 2, max: 150, step: 1 },
                      { label: 'Immunization DTP3 (%)', key: 'immunization_dtp3_pct', min: 0, max: 100, step: 1 },
                      { label: 'HIV Prevalence (%)', key: 'hiv_prevalence_pct', min: 0, max: 30, step: 0.1 },
                      { label: 'TB Incidence / 100k', key: 'tb_incidence_per100k', min: 0, max: 1000, step: 1 },
                      { label: 'Malaria Inc. / 1k', key: 'malaria_incidence_per1k', min: 0, max: 500, step: 1 },
                      { label: 'Clean Water (%)', key: 'clean_water_access_pct', min: 0, max: 100, step: 1 },
                      { label: 'Sanitation (%)', key: 'sanitation_access_pct', min: 0, max: 100, step: 1 },
                      { label: 'Physicians / 1k', key: 'physician_density_per1k', min: 0, max: 10, step: 0.1 },
                      { label: 'Hospital Beds / 1k', key: 'hospital_beds_per1k', min: 0, max: 20, step: 0.1 },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{field.label}</label>
                          <span className="text-xs font-black text-blue-700">{(inputs as any)[field.key]}</span>
                        </div>
                        <input 
                          type="range" min={field.min} max={field.max} step={field.step}
                          value={(inputs as any)[field.key]}
                          onChange={(e) => setInputs({...inputs, [field.key]: Number(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a237e]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full bg-[#1a237e] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-[#0d145e] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                  Run Prediction Model
                </button>
              </div>
            </aside>

            {/* SECTION 3: Prediction Output */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-5xl mx-auto space-y-8">
                {currentResult ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Risk Result Card */}
                    <div className={cn(
                      "p-8 rounded-3xl shadow-2xl border-l-[12px] flex flex-col md:flex-row items-center justify-between gap-8",
                      currentResult.predicted_risk_label === 'HIGH RISK' 
                        ? "bg-red-50 border-red-600" 
                        : "bg-emerald-50 border-emerald-600"
                    )}>
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg",
                          currentResult.predicted_risk_label === 'HIGH RISK' ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                        )}>
                          {currentResult.predicted_risk_label === 'HIGH RISK' ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Model Assessment</p>
                          <h2 className={cn(
                            "text-4xl font-black tracking-tight",
                            currentResult.predicted_risk_label === 'HIGH RISK' ? "text-red-600" : "text-emerald-600"
                          )}>
                            {currentResult.predicted_risk_label}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              currentResult.predicted_risk_label === 'HIGH RISK' ? "bg-red-200 text-red-800" : "bg-emerald-200 text-emerald-800"
                            )}>
                              {currentResult.risk_category} Severity
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-64 space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Probability</span>
                          <span className="text-3xl font-black text-slate-800">{(currentResult.predicted_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${currentResult.predicted_probability * 100}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              currentResult.predicted_risk_label === 'HIGH RISK' ? "bg-red-600" : "bg-emerald-600"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Risk Gauge (Custom Recharts Implementation) */}
                      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Risk Severity Gauge
                        </h3>
                        <div className="h-[240px] relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Low', value: 33, fill: '#10b981' },
                                  { name: 'Moderate', value: 34, fill: '#f59e0b' },
                                  { name: 'High', value: 33, fill: '#ef4444' }
                                ]}
                                cx="50%"
                                cy="80%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Needle */}
                          <motion.div 
                            initial={{ rotate: -90 }}
                            animate={{ rotate: (currentResult.predicted_probability * 180) - 90 }}
                            transition={{ type: 'spring', stiffness: 50 }}
                            className="absolute bottom-[20%] w-1 h-24 bg-slate-800 origin-bottom rounded-full z-10"
                            style={{ bottom: '20%' }}
                          >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full shadow-lg" />
                          </motion.div>
                          <div className="absolute bottom-[15%] text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</p>
                            <p className="text-2xl font-black text-slate-800">{(currentResult.predicted_probability * 100).toFixed(0)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 px-4">
                          <span>Safe</span>
                          <span>Moderate</span>
                          <span>Critical</span>
                        </div>
                      </div>

                      {/* Feature Contributions */}
                      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          Top Feature Contributions
                        </h3>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={currentResult?.contributions || []}
                              margin={{ left: 40, right: 20 }}
                            >
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                width={100}
                              />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {currentResult?.contributions?.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#1a237e' : '#94a3b8'} />
                                )) || null}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Policy Recommendations */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Plain English Interpretation & Policy Recommendations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Technical Context</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              The Feedforward Neural Network has analyzed 27 socioeconomic and health indicators. 
                              The resulting probability of <span className="font-bold text-slate-800">{(currentResult.predicted_probability * 100).toFixed(1)}%</span> 
                              indicates a <span className={cn(
                                "font-bold",
                                currentResult.predicted_risk_label === 'HIGH RISK' ? "text-red-600" : "text-emerald-600"
                              )}>{currentResult.risk_category}</span> risk level for the target population.
                            </p>
                          </div>
                          <div className={cn(
                            "p-6 rounded-2xl border",
                            currentResult.predicted_risk_label === 'HIGH RISK' ? "bg-red-50 border-red-100 text-red-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                          )}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Summary</h4>
                            <p className="text-sm font-medium leading-relaxed">
                              {currentResult.predicted_risk_label === 'HIGH RISK' 
                                ? "This region exhibits critical health vulnerabilities. Immediate policy intervention is required to prevent elevated mortality rates."
                                : "The region shows resilient health and socioeconomic indicators. Continued monitoring and preventative care are recommended."}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Policy Actions</h4>
                          <div className="space-y-4">
                            {getPolicyRecommendations(currentResult.predicted_probability).map((rec, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-black">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-slate-600 font-medium leading-tight">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Summary Table */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                      <button 
                        onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                        className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
                            <Info className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Full Input Summary</h3>
                            <p className="text-xs text-slate-400 font-medium">Review all 27 indicators used for this prediction</p>
                          </div>
                        </div>
                        {isSummaryOpen ? <ChevronUp className="w-6 h-6 text-slate-300" /> : <ChevronDown className="w-6 h-6 text-slate-300" />}
                      </button>
                      
                      <AnimatePresence>
                        {isSummaryOpen && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-100"
                          >
                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 bg-slate-50/50">
                              {Object.entries(inputs).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-xs font-black text-slate-700">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                      <Stethoscope className="w-12 h-12 text-blue-200" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ready for Analysis</h2>
                      <p className="text-slate-400 max-w-md mx-auto mt-2 font-medium">
                        Configure the socioeconomic and health indicators in the sidebar and click "Run Prediction Model" to see the assessment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </>
        ) : (
          /* SECTION 4: Prediction History */
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Predictions', value: stats.total, icon: Database, color: 'blue' },
                  { label: 'High Risk Cases', value: stats.highRisk, icon: ShieldAlert, color: 'red' },
                  { label: 'Low Risk Cases', value: stats.lowRisk, icon: ShieldCheck, color: 'emerald' },
                  { label: 'Avg Probability', value: `${(stats.avgProbability * 100).toFixed(1)}%`, icon: TrendingUp, color: 'indigo' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm',
                      stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      stat.color === 'red' ? 'bg-red-50 text-red-600' :
                      stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    )}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {fetchingData ? (
                <div className="h-[400px] bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a237e]"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading predictions...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Controls */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</label>
                        <select 
                          value={filterRisk}
                          onChange={(e) => setFilterRisk(e.target.value)}
                          className="block w-40 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option>All</option>
                          <option>HIGH RISK</option>
                          <option>LOW RISK</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</label>
                        <select 
                          value={filterRegion}
                          onChange={(e) => setFilterRegion(e.target.value)}
                          className="block w-40 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option>All</option>
                          {REGIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</label>
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block w-40 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option>Recent</option>
                          <option>Highest Risk</option>
                          <option>Lowest Risk</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Income</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Exp.</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Under-5 Mort.</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GDP</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prob (%)</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                            <tr key={item.id} className={cn(
                              'hover:bg-slate-50/50 transition-colors',
                              item.predicted_risk_label === 'HIGH RISK' ? 'bg-red-50/20' : 'bg-emerald-50/20'
                            )}>
                              <td className="p-4 text-xs font-bold text-slate-400">#{item.id}</td>
                              <td className="p-4 text-xs font-medium text-slate-600">{format(new Date(item.timestamp), 'MMM d, HH:mm')}</td>
                              <td className="p-4 text-xs font-bold text-slate-800">{item.region}</td>
                              <td className="p-4 text-xs font-medium text-slate-600">{item.income_group}</td>
                              <td className="p-4 text-xs font-bold text-slate-800">{item.life_expectancy_years}</td>
                              <td className="p-4 text-xs font-bold text-slate-800">{item.under5_mortality_rate}</td>
                              <td className="p-4 text-xs font-bold text-slate-800">${item.gdp_per_capita_usd.toLocaleString()}</td>
                              <td className="p-4 text-xs font-black text-blue-600">{(item.predicted_probability * 100).toFixed(1)}%</td>
                              <td className="p-4">
                                <span className={cn(
                                  'px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest',
                                  item.predicted_risk_label === 'HIGH RISK' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                )}>
                                  {item.predicted_risk_label}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-bold text-slate-600">{item.risk_category}</td>
                              <td className="p-4">
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={11} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-30">
                                  <Database className="w-12 h-12" />
                                  <p className="text-sm font-bold uppercase tracking-widest">No history records found</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Risk Distribution Pie */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Risk Label Distribution</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'High Risk', value: stats.highRisk, fill: '#ef4444' },
                                { name: 'Low Risk', value: stats.lowRisk, fill: '#10b981' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#ef4444" />
                              <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Probability Trend Line */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Prediction Probability Trend</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...history].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="id" hide />
                            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                            <Tooltip 
                              formatter={(v: any) => [`${(v * 100).toFixed(1)}%`, 'Probability']}
                              labelFormatter={(l) => `Record #${l}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predicted_probability" 
                              stroke="#1a237e" 
                              strokeWidth={3} 
                              dot={{ fill: '#1a237e', r: 4 }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey={() => 0.5} 
                              stroke="#ef4444" 
                              strokeDasharray="5 5" 
                              dot={false}
                              activeDot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
