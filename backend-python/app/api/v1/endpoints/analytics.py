"""JobForge AI - Analytics Endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.schemas.analytics import AnalyticsOverview, AnalyticsInsight, TopCompany, ApplicationsByMonth
from datetime import datetime

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .count()
    )

    by_status = {}
    for status in ApplicationStatus:
        count = (
            db.query(Application)
            .filter(Application.user_id == current_user.id, Application.status == status)
            .count()
        )
        by_status[status.value] = count

    responded = total - by_status.get(ApplicationStatus.DRAFT.value, 0) - by_status.get(ApplicationStatus.APPLIED.value, 0)
    response_rate = round((responded / total) * 100.0, 1) if total else 0.0

    interview_count = by_status.get(ApplicationStatus.INTERVIEW.value, 0)
    interview_rate = round((interview_count / total) * 100.0, 1) if total else 0.0

    response_apps = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.applied_date.isnot(None),
            Application.status.notin_([ApplicationStatus.APPLIED, ApplicationStatus.DRAFT]),
        )
        .all()
    )
    if response_apps:
        total_days = 0.0
        for app in response_apps:
            if app.applied_date:
                total_days += (app.updated_at - app.applied_date).days
        avg_response_time = round(total_days / max(len(response_apps), 1), 1)
    else:
        avg_response_time = 0.0

    monthly_rows = (
        db.query(func.date_trunc("month", Application.created_at).label("month"), func.count(Application.id))
        .filter(Application.user_id == current_user.id)
        .group_by("month")
        .order_by("month")
        .all()
    )
    applications_by_month: List[ApplicationsByMonth] = []
    for month_dt, count in monthly_rows:
        if isinstance(month_dt, datetime):
            label = month_dt.strftime("%b %Y")
        else:
            label = str(month_dt)
        applications_by_month.append(ApplicationsByMonth(month=label, count=count))

    return AnalyticsOverview(
        total_applications=total,
        response_rate=response_rate,
        interview_rate=interview_rate,
        avg_response_time_days=avg_response_time,
        applications_by_status=by_status,
        applications_by_month=applications_by_month,
    )


@router.get("/insights", response_model=List[AnalyticsInsight])
def analytics_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    overview = analytics_overview(current_user=current_user, db=db)
    insights: List[AnalyticsInsight] = []
    if overview.total_applications >= 5 and overview.response_rate < 20:
        insights.append(AnalyticsInsight(type="tip", message="Response rate is low. Try tailoring resumes for each role."))
    if overview.interview_rate >= 20:
        insights.append(AnalyticsInsight(type="strength", message="Strong interview rate. Keep up the application volume."))
    if overview.total_applications == 0:
        insights.append(AnalyticsInsight(type="opportunity", message="Start tracking applications to unlock analytics."))
    return insights


@router.get("/top-companies", response_model=List[TopCompany])
def analytics_top_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Application.company_name, func.count(Application.id))
        .filter(Application.user_id == current_user.id)
        .group_by(Application.company_name)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )
    return [TopCompany(company=company, application_count=count) for company, count in rows]
