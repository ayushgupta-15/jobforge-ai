"""Analytics schemas."""
from typing import List, Dict
from pydantic import BaseModel


class ApplicationsByMonth(BaseModel):
    month: str
    count: int


class AnalyticsOverview(BaseModel):
    total_applications: int
    response_rate: float
    interview_rate: float
    avg_response_time_days: float
    applications_by_status: Dict[str, int]
    applications_by_month: List[ApplicationsByMonth]


class AnalyticsInsight(BaseModel):
    type: str
    message: str


class TopCompany(BaseModel):
    company: str
    application_count: int
