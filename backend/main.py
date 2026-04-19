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
async def upload_holidays(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        contents = await file.read()
        # Simulate some processing time for each file
        import asyncio
        await asyncio.sleep(1) 
        results.append({"filename": file.filename, "status": "processed", "count": 12})
    
    return {"message": f"{len(files)} files received and processed.", "results": results}

@app.get("/baseline-holidays")
async def get_baseline():
    return agent.get_national_holidays()
