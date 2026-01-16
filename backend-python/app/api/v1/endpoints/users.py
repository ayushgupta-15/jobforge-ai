"""JobForge AI - User Profile & Preferences Endpoints"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.preferences import UserPreferencesResponse, UserPreferencesUpdate
from app.crud import user as user_crud
from app.crud import user_preferences as preferences_crud

router = APIRouter()


@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_user = user_crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated_user


@router.post("/me/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload_dir = Path(settings.UPLOAD_DIR).expanduser().resolve() / "profile_pictures"
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "").suffix or ".bin"
    filename = f"{uuid.uuid4().hex}{suffix}"
    file_path = upload_dir / filename
    contents = await file.read()
    file_path.write_bytes(contents)
    public_url = f"/uploads/profile_pictures/{filename}"
    user_crud.update_user(db, current_user.id, UserUpdate(profile_picture_url=public_url))
    return {"url": public_url}


@router.get("/me/preferences", response_model=UserPreferencesResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = preferences_crud.get_by_user_id(db, current_user.id)
    if not prefs:
        prefs = preferences_crud.create_default(db, current_user.id)
    return prefs


@router.put("/me/preferences", response_model=UserPreferencesResponse)
def update_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = preferences_crud.upsert(db, current_user.id, preferences)
    return prefs
