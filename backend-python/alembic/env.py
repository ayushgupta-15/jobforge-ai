import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ✅ Correct Base import
from app.core.database import Base

# ✅ Import all models
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview

target_metadata = Base.metadata
