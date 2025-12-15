"""JobForge AI - Resume Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse, ResumeAnalysisRequest
from app.crud import resume as resume_crud
from app.services.file_storage import save_resume_file, resolve_file_path
from app.services.resume_processing import extract_text_from_file
from app.services.resume_analysis import analyze_resume_text, ResumeAnalysisError

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
    file_bytes = await file.read()
    stored_path, relative_url = save_resume_file(
        user_id=current_user.id,
        filename=file.filename,
        content_type=file.content_type,
        file_bytes=file_bytes,
    )
    raw_text = extract_text_from_file(stored_path)

    resume_create = ResumeCreate(
        title=title,
        file_url=relative_url,
        file_type=file.content_type,
        raw_text=raw_text,
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

@router.post("/{resume_id}/analyze", response_model=ResumeResponse)
def analyze_resume(
    resume_id: UUID,
    analysis_input: ResumeAnalysisRequest | None = Body(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume (AI-powered)"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    # Ensure we have raw text available for analysis
    if not resume.raw_text and resume.file_url:
        file_path = resolve_file_path(resume.file_url)
        extracted_text = extract_text_from_file(file_path)
        if extracted_text:
            resume = resume_crud.update_resume(
                db,
                resume_id,
                ResumeUpdate(raw_text=extracted_text)
            ) or resume

    if not resume.raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text not available. Please re-upload your resume."
        )

    try:
        analysis_result = analyze_resume_text(
            resume_text=resume.raw_text,
            job_title=analysis_input.job_title if analysis_input else None,
            job_description=analysis_input.job_description if analysis_input else None,
            target_keywords=analysis_input.target_keywords if analysis_input else None,
        )
    except ResumeAnalysisError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    resume_update = ResumeUpdate(**analysis_result)
    updated_resume = resume_crud.update_resume(db, resume_id, resume_update)
    if not updated_resume:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save analysis results")
    return updated_resume

@router.get("/{resume_id}/download")
def download_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original resume file"""
    resume = resume_crud.get_resume(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    if not resume.file_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No file stored for this resume")

    file_path = resolve_file_path(resume.file_url)
    media_type = resume.file_type or "application/octet-stream"
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=file_path.name
    )
