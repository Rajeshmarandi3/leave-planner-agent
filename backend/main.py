from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from schemas import LeaveBalances, UserPreferences, OptimizationResponse
from agent import LeaveAgent
from typing import List

app = FastAPI(title="Leave Planner Agent API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = LeaveAgent()

@app.get("/")
async def root():
    return {"status": "online", "message": "Leave Planner Agent is ready."}

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(balances: LeaveBalances, preferences: UserPreferences):
    result = await agent.optimize_leaves(balances.dict(), preferences.dict())
    return result

@app.post("/upload-holidays")
async def upload_holidays(file: UploadFile = File(...)):
    # Save file temporarily and parse
    contents = await file.read()
    # In a real scenario, we'd save and pass to agent.parse_holiday_document
    return {"message": f"File {file.filename} received. Scanning for holidays...", "count": 0}

@app.get("/baseline-holidays")
async def get_baseline():
    return agent.get_national_holidays()
