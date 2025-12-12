"""JobForge AI - Resume Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse
from app.crud import resume as resume_crud

router = APIRouter()

@router.get("/", response_model=List[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for the current user"""
    resumes = resume_crud.get_resumes_by_user(db, current_user.id)
    return resumes

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new resume"""
    # In a real application, you would handle file upload to cloud storage
    # For now, we'll just create the resume record
    file_content = await file.read()
    
    resume_create = ResumeCreate(
        title=title,
        file_url=f"/uploads/resumes/{file.filename}",
        file_type=file.content_type,
    )
    resume = resume_crud.create_resume(db, resume_create, current_user.id)
    return resume

@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: UUID,
    resume_update: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a resume"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    
    updated_resume = resume_crud.update_resume(db, resume_id, resume_update)
    return updated_resume

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    
    resume_crud.delete_resume(db, resume_id)
    return {"message": "Resume deleted successfully"}

@router.post("/{resume_id}/set-primary", response_model=ResumeResponse)
def set_primary_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set a resume as primary"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    
    updated_resume = resume_crud.set_primary_resume(db, current_user.id, resume_id)
    return updated_resume

@router.post("/{resume_id}/analyze")
def analyze_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume (AI-powered)"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    
    # Mock analysis - in real implementation, call AI service
    analysis = {
        "ats_score": 78,
        "keyword_match_score": 85,
        "strengths": ["Clear structure", "Good use of keywords", "Professional format"],
        "weaknesses": ["Missing metrics", "Could add more action verbs"],
        "suggestions": ["Add quantifiable achievements", "Include more technical skills", "Use industry keywords"]
    }
    
    resume_update = ResumeUpdate(**analysis)
    updated_resume = resume_crud.update_resume(db, resume_id, resume_update)
    return updated_resume
