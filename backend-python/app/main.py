"""JobForge AI - Main FastAPI Application"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import time
from pathlib import Path
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.endpoints import auth, resume, application, interview, job

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting JobForge AI API...")
    print(f"Environment: {settings.ENVIRONMENT}")
    init_db()
    print("✅ Database initialized")
    yield
    print("👋 Shutting down JobForge AI API...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Job Application Orchestrator API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

upload_root = Path(settings.UPLOAD_DIR).expanduser().resolve()
upload_root.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_root), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}s")
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Validation error"}
    )

@app.get("/")
def root():
    return {
        "message": "Welcome to JobForge AI API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "jobforge-api",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION
    }

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1/resumes", tags=["Resumes"])
app.include_router(application.router, prefix="/api/v1/applications", tags=["Applications"])
app.include_router(interview.router, prefix="/api/v1/interviews", tags=["Interviews"])
app.include_router(job.router, prefix="/api/v1/jobs", tags=["Jobs"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
