"""JobForge AI Models"""
from app.models.user import User, SubscriptionTier
from app.models.user_preferences import UserPreferences
from app.models.resume import Resume
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.job_bookmark import JobBookmark
from app.models.interview import Interview, InterviewType, InterviewStatus
from app.models.email import EmailTemplate, EmailSchedule, EmailScheduleStatus

__all__ = [
    "User",
    "SubscriptionTier",
    "UserPreferences",
    "Resume",
    "Application",
    "ApplicationStatus",
    "Job",
    "JobBookmark",
    "Interview",
    "InterviewType",
    "InterviewStatus",
    "EmailTemplate",
    "EmailSchedule",
    "EmailScheduleStatus",
]
