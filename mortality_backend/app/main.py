from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.database import create_tables
from app.routers import auth, predictions

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for the Deep Learning Mortality Risk Predictor.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS — allow the React frontend to talk to this API ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Create database tables on startup ────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_tables()


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(predictions.router)


# ── Root & Health endpoints ───────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "api": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
