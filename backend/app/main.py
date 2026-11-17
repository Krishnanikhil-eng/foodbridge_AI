from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import get_supabase_client

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="FoodBridge AI - Backend API Foundation"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to FoodBridge AI API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    supabase_configured = get_supabase_client() is not None
    return {
        "status": "healthy",
        "service": "FoodBridge AI Backend",
        "environment": settings.environment,
        "database": "configured" if supabase_configured else "not_configured"
    }
