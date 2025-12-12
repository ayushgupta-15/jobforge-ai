"""JobForge AI - Application Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationStats
from app.crud import application as application_crud

router = APIRouter()

@router.get("/", response_model=List[ApplicationResponse])
def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for the current user"""
    applications = application_crud.get_applications_by_user(db, current_user.id)
    return applications

@router.get("/stats", response_model=ApplicationStats)
def get_application_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for the current user's applications"""
    stats = application_crud.get_application_stats(db, current_user.id)
    return stats

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application"""
    application = application_crud.get_application(db, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new application"""
    application = application_crud.create_application(db, application_data, current_user.id)
    return application

@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: UUID,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an application"""
    application = application_crud.get_application(db, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    updated_application = application_crud.update_application(db, application_id, application_update)
    return updated_application

@router.delete("/{application_id}")
def delete_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an application"""
    application = application_crud.get_application(db, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    application_crud.delete_application(db, application_id)
    return {"message": "Application deleted successfully"}

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: UUID,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application status"""
    application = application_crud.get_application(db, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    from app.models.application import ApplicationStatus
    status_value = status_update.get("status")
    try:
        new_status = ApplicationStatus(status_value)
        updated_application = application_crud.update_application_status(db, application_id, new_status)
        return updated_application
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")
