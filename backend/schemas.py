from pydantic import BaseModel
from typing import List, Optional, Dict

class LeaveBalances(BaseModel):
    paid: int
    casual: int
    sick: int

class BalanceAudit(BaseModel):
    initial_paid: int
    initial_casual: int
    final_paid: int
    final_casual: int

class UserPreferences(BaseModel):
    interests: List[str]
    max_paid_leave_utilization: float = 1.0  # e.g. 0.5 for half

class Holiday(BaseModel):
    date: str
    name: str

class VacationBlock(BaseModel):
    name: Optional[str] = "Planned Break"
    start_date: str
    end_date: str
    leave_days: List[str]
    reason: str
    travel_tip: Optional[str] = None

class OptimizationResponse(BaseModel):
    vacation_blocks: List[VacationBlock]
    holidays: List[Holiday]
    summary: str
    balance_audit: Optional[BalanceAudit] = None
