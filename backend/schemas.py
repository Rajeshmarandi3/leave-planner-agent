from pydantic import BaseModel
from typing import List, Optional, Dict

class LeaveBalances(BaseModel):
    paid: int
    casual: int
    sick: int

class UserPreferences(BaseModel):
    interests: List[str]
    max_paid_leave_utilization: float = 1.0  # e.g. 0.5 for half

class Holiday(BaseModel):
    date: str
    name: str

class Recommendation(BaseModel):
    date: str
    reason: str
    travel_tip: Optional[str] = None

class OptimizationResponse(BaseModel):
    recommended_days: List[Recommendation]
    holidays: List[Holiday]
    summary: str
