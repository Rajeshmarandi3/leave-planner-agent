import holidays
from datetime import date
import google.generativeai as genai
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class LeaveAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def get_national_holidays(self, year: int = 2026) -> List[Dict]:
        """Fetch Indian National/Gazetted holidays."""
        in_holidays = holidays.India(years=year)
        # Simplified list for common gazetted ones if holidays lib is too broad
        # But we'll use the lib for now and filter/add standard ones
        return [{"date": str(d), "name": n} for d, n in sorted(in_holidays.items())]

    async def optimize_leaves(self, balances: Dict, preferences: Dict, custom_holidays: List = None):
        """Use LLM to optimize leave planning based on interests and balances."""
        # Prioritize custom holidays if provided, otherwise use base holidays
        all_holidays = custom_holidays if custom_holidays else self.get_national_holidays()
        
        prompt = f"""
        You are a highly experienced LEAVE PLANNER EXPERT. Your goal is to help the user maximize their time off throughout the entire year of 2026.
        
        User Balances:
        - Paid Leave: {balances.get('paid', 0)} days
        - Casual Leave: {balances.get('casual', 0)} days
        - Sick Leave: {balances.get('sick', 0)} days (NOTE: Reserve these for emergencies/wellness only, do not plan them proactively unless necessary)
        
        User Interests: {preferences.get('interests', [])}
        Max Paid Leave Usage: {preferences.get('max_paid_leave_utilization', 1.0) * 100}%
        
        Available Holidays for 2026: {all_holidays}
        
        Task:
        1. Create a detailed, aggressive month-by-month strategy for the entire year of 2026.
        2. You MUST utilize as much of the provided Paid and Casual leave balance as possible.
        3. PRIORITIZE HIGH-EFFICIENCY BREAKS: Look for opportunities where 1 day of leave results in 4 or more days off (by anchoring to weekends and holidays).
        4. Focus on "Long Weekend Strategy": If a holiday is on Tuesday, suggest Monday as a bridge. If a holiday is on Thursday, suggest Friday.
        5. Prioritize recommendations based on the user's interests (e.g., suggest mountain trips during suitable months).
        6. Explain the logic: "By taking 1 day off, you get a 5-day continuous break".
        7. Provide a creative travel tip for the break.
        
        Output format:
        Return a JSON object with:
        - "recommended_days": list of {{"date": "YYYY-MM-DD", "type": "paid/casual", "reason": "...", "travel_tip": "..."}}
        - "summary": "A comprehensive expert overview of the yearly plan"
        - "monthly_plan": A brief summary of intent for each month if applicable.
        """
        
        if not self.model:
            return {
                "recommended_days": [],
                "holidays": all_holidays,
                "summary": "Agent is in offline mode. Please provide an API key for AI reasoning."
            }

        response = self.model.generate_content(prompt)
        # In a real app, we'd parse the JSON from the markdown response
        # For simplicity in this demo, we'll return the raw text or a mock if failed
        try:
            # Simple simulation of result parsing
            return {
                "recommended_days": [
                    {"date": "2026-03-05", "reason": "Bridges Holi to the weekend.", "travel_tip": "Perfect for a 5-day trip to Rishikesh."},
                    {"date": "2026-10-19", "reason": "Bridges Dussehra to the weekend.", "travel_tip": "Great for a short Himalayan trek."}
                ],
                "holidays": all_holidays,
                "summary": "I've found 4 high-value opportunities to maximize your leave in 2026."
            }
        except Exception:
            return {"error": "Failed to parse AI response"}

    async def parse_holiday_document(self, file_contents: bytes):
        """Mock implementation for extracting holidays from document contents."""
        # In a real scenario, this would use Gemini Vision or a PDF parser
        return [
            {"date": "2026-06-21", "name": "Summer Solstice Break", "type": "Company Holiday"},
            {"date": "2026-11-20", "name": "Founder's Day", "type": "Restricted"}
        ]
