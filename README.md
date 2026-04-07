# 🏥 Mortality Risk Predictor

Machine learning-powered mortality risk prediction system using a Feedforward Neural Network (FNN) trained on global health and socioeconomic indicators.

## 📊 Project Overview

**Prediction Model**: FNN with 3 hidden layers trained on 27 features
- **Input**: 21 numerical health/socioeconomic indicators + 6 region features
- **Output**: Mortality risk probability (0-1) and risk category
- **Accuracy**: Domain-knowledge fallback when preprocessors unavailable
- **Features**: User authentication, prediction history, detailed explanations

## 🏗️ Architecture

```
┌─────────────────────┐
│   React + Vite      │  Frontend (Vercel)
│   (TypeScript)      │  https://mortality-predictor.vercel.app
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────┐
│   FastAPI           │  Backend (Render)
│   Python 3.11       │  https://mortality-predictor-api.onrender.com
└──────────┬──────────┘
           │ SQL
           ↓
┌─────────────────────┐
│   PostgreSQL        │  Database (Supabase)
│   (Supabase)        │
└─────────────────────┘
```

## 🚀 Quick Deploy

### Option 1: Automated Deployment (Recommended)
```bash
# 1. Prepare environment
python prepare_deployment.py

# 2. Push to GitHub
git push origin main

# 3. Deploy both services automatically via Render & Vercel
# (CI/CD workflow handles this)
```

### Option 2: Manual Deployment

**1️⃣ Backend (Render)**
```bash
# Create Web Service on Render
# Build: pip install -r mortality_backend/requirements.txt
# Start: cd mortality_backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
# Set env vars from .env.example
```

**2️⃣ Frontend (Vercel)**
```bash
# Import project from GitHub
# Build: npm run build
# Output: mortality_frontend/dist
# Set VITE_API_URL env var
```

**Full Instructions**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL (or use Supabase)

### Backend Setup
```bash
cd mortality_backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Update DATABASE_URL with your Supabase credentials

# Run migrations (if needed)
alembic upgrade head

# Start server
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup
```bash
cd mortality_frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Update VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
# App available at http://localhost:5173
```

## 📁 Project Structure

```
mortality-app/
├── mortality_backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/                   # Config, security, dependencies
│   │   ├── models/                 # SQLAlchemy models (User, Prediction)
│   │   ├── routers/                # API endpoints (auth, predictions)
│   │   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── services/               # Business logic (auth, prediction, ML)
│   │   ├── database.py             # Database connection
│   │   └── main.py                 # FastAPI app initialization
│   ├── tests/                      # Unit tests
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment template
│
├── mortality_frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── context/                # React context (AuthContext)
│   │   ├── pages/                  # Page components (Login, Signup)
│   │   ├── services/               # API client, prediction logic
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── package.json                # Node dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── vercel.json                 # Vercel deployment config
│   └── .env.example                # Environment template
│
├── models/                         # ML model artifacts
│   ├── fnn_mortality_model.keras   # Trained model
│   ├── scaler.pkl                  # Feature scaler
│   ├── imputer.pkl                 # Missing value imputer
│   ├── le_region.pkl               # Region encoder
│   └── le_income.pkl               # Income group encoder
│
├── DEPLOYMENT_GUIDE.md             # Detailed deployment instructions
├── DEPLOYMENT_CHECKLIST.md         # Pre-deployment checklist
├── prepare_deployment.py           # Deployment automation script
└── README.md                       # This file
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Environment variable management
- ✅ HTTPS-ready endpoints

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Predictions
- `POST /api/predictions` - Create new prediction
- `GET /api/predictions` - Get user's prediction history
- `DELETE /api/predictions/{id}` - Delete specific prediction
- `DELETE /api/predictions` - Clear all predictions
- `GET /api/stats` - Get user statistics

### Documentation
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation
- `GET /openapi.json` - OpenAPI schema

## 🧠 ML Model Details

### Architecture
```
Input (27 features)
    ↓
Dense(128) + BatchNorm + ReLU + Dropout(0.30)
    ↓
Dense(64) + BatchNorm + ReLU + Dropout(0.25)
    ↓
Dense(32) + ReLU + Dropout(0.20)
    ↓
Dense(1) + Sigmoid
    ↓
Output (probability 0-1)
```

### Features Used
**Socioeconomic (9)**:
- GDP per capita, poverty rate, education index, unemployment, Gini coefficient, urbanization, health spending, CO2 emissions, population growth

**Health (12)**:
- Life expectancy, under-5 mortality, maternal mortality, infant mortality, vaccination rates, HIV/TB/malaria incidence, water/sanitation access, physician density, hospital beds

**Geographic (6)**:
- Region one-hot encoding (Africa, Americas, E. Mediterranean, Europe, SE Asia, W. Pacific)

### Prediction Logic
- **Threshold**: 0.5 (>= 0.5 = HIGH RISK, < 0.5 = LOW RISK)
- **Categories**: Critical (>70%), High (50-70%), Moderate (30-50%), Low (<30%)
- **Fallback**: Domain-knowledge scoring when preprocessors unavailable

## 📈 Usage Example

### Register & Login
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "full_name": "John Doe",
    "password": "secure_password"
  }'

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

### Make Prediction
```bash
curl -X POST http://localhost:8000/api/predictions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gdp_per_capita_usd": 50000,
    "poverty_rate_pct": 5,
    "education_index": 0.8,
    ...
  }'
```

## 🧪 Testing

### Backend Tests
```bash
cd mortality_backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd mortality_frontend
npm run lint
npm run build
```

## 📦 Deployment Platforms

| Component | Platform | Cost | Status |
|-----------|----------|------|--------|
| API | Render | Free ($0, or $12/mo for always-on) | ✅ Ready |
| Frontend | Vercel | Free | ✅ Ready |
| Database | Supabase | Free ($0, or $10+/mo for scaling) | ✅ Active |
| CI/CD | GitHub Actions | Free | ✅ Configured |

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://...
SECRET_KEY=<generated-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:8000
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
- [Architecture Diagram](DEPLOYMENT_GUIDE.md#deployment-stack) - System architecture

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check logs
docker logs mortality-predictor-api

# Test database connection
python -c "from app.database import SessionLocal; SessionLocal().execute('SELECT 1')"

# Verify model loading
python test_model.py
```

### Frontend Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install && npm run build

# Check environment variables
echo $VITE_API_URL
```

### Database Issues
```bash
# Check Supabase connection
psql postgresql://user:pass@host:5432/db

# Run migrations
alembic upgrade head

# Reset database (dev only)
alembic downgrade base
```

## 📞 Support

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📊 Project Status

- ✅ ML Model trained and integrated
- ✅ Backend API fully functional
- ✅ Frontend UI complete
- ✅ Authentication implemented
- ✅ Database configured
- ✅ Ready for production deployment
- 🔄 Monitoring & logging in progress

---

**Last Updated**: April 7, 2026  
**Version**: 1.0.0  
**Status**: 🚀 **Ready for Deployment**
