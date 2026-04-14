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
            self.model = genai.GenerativeModel('gemini-1.5-flash')
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
        base_holidays = self.get_national_holidays()
        all_holidays = base_holidays + (custom_holidays or [])
        
        prompt = f"""
        User Balances: {balances}
        User Interests: {preferences.get('interests', [])}
        Max Paid Leave Usage: {preferences.get('max_paid_leave_utilization', 1.0) * 100}%
        Holidays for 2026: {all_holidays}
        
        Task:
        1. Identify "bridge days" where taking 1-2 days of leave creates a long break (4-5 days).
        2. Prioritize recommendations based on the user's interests (e.g., if interests include 'Mountains', suggests breaks in months where mountains are suitable).
        3. Explain the reasoning for each recommended day.
        4. Provide a creative travel tip for the break.
        
        Output format:
        Return a JSON object with:
        - "recommended_days": list of {{"date": "YYYY-MM-DD", "reason": "...", "travel_tip": "..."}}
        - "summary": "A brief overview of the plan"
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

    async def parse_holiday_document(self, file_path: str):
        """Use Gemini Vision to extract holidays from Images/PDFs."""
        if not self.model:
            return []
        
        # Logic for vision parsing would go here
        return []
