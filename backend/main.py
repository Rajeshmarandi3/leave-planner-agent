from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from schemas import LeaveBalances, UserPreferences, OptimizationResponse, Holiday, OptimizeRequest, UploadResponse
from agent import LeaveAgent
from typing import List, Optional

app = FastAPI(title="Leave Planner Agent API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = LeaveAgent()

@app.get("/")
async def root():
    return {"status": "online", "message": "Leave Planner Agent is ready."}

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizeRequest):
    custom_holidays = None
    if request.holidays and len(request.holidays) > 0:
        custom_holidays = [h.dict() for h in request.holidays]
    result = await agent.optimize_leaves(
        request.balances.dict(),
        request.preferences.dict(),
        custom_holidays=custom_holidays
    )
    return result

@app.post("/upload-holidays", response_model=UploadResponse)
async def upload_holidays(files: List[UploadFile] = File(...)):
    final_balances = {"paid": 0, "casual": 0, "sick": 0}
    final_holidays = []
    
    for file in files:
        contents = await file.read()
        try:
            data = await agent.parse_holiday_document(contents, file.filename)
            
            if "holidays" in data:
                final_holidays.extend(data["holidays"])
            
            if "balances" in data:
                b = data["balances"]
                final_balances["paid"] = max(final_balances["paid"], b.get("paid", 0))
                final_balances["casual"] = max(final_balances["casual"], b.get("casual", 0))
                final_balances["sick"] = max(final_balances["sick"], b.get("sick", 0))
                
        except Exception as e:
            print(f"Error parsing file {file.filename}: {e}")
            
    return {
        "balances": final_balances,
        "holidays": final_holidays,
        "message": f"{len(files)} files received and processed."
    }

@app.get("/baseline-holidays")
async def get_baseline():
    return agent.get_national_holidays()
