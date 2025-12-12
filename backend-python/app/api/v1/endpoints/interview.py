"""JobForge AI - Interview Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.crud import interview as interview_crud

router = APIRouter()

@router.get("/", response_model=List[InterviewResponse])
def list_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interviews for the current user"""
    interviews = interview_crud.get_interviews_by_user(db, current_user.id)
    return interviews

@router.get("/upcoming", response_model=List[InterviewResponse])
def get_upcoming_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming interviews for the current user"""
    interviews = interview_crud.get_upcoming_interviews(db, current_user.id)
    return interviews

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific interview"""
    interview = interview_crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview"""
    # Verify the application belongs to the user
    from app.crud import application as application_crud
    application = application_crud.get_application(db, interview_data.application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Cannot create interview for another user's application"
        )
    
    interview = interview_crud.create_interview(db, interview_data, current_user.id)
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: UUID,
    interview_update: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an interview"""
    interview = interview_crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    
    updated_interview = interview_crud.update_interview(db, interview_id, interview_update)
    return updated_interview

@router.delete("/{interview_id}")
def delete_interview(
    interview_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an interview"""
    interview = interview_crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    
    interview_crud.delete_interview(db, interview_id)
    return {"message": "Interview deleted successfully"}

@router.patch("/{interview_id}/status")
def update_interview_status(
    interview_id: UUID,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update interview status"""
    interview = interview_crud.get_interview(db, interview_id)
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    
    from app.models.interview import InterviewStatus
    status_value = status_update.get("status")
    try:
        new_status = InterviewStatus(status_value)
        updated_interview = interview_crud.update_interview_status(db, interview_id, new_status)
        return updated_interview
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")
