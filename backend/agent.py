import holidays as holidays_lib
from datetime import date, timedelta
import google.generativeai as genai
import os
import tempfile
from typing import List, Dict, Set, Tuple, Optional
from dotenv import load_dotenv
import json

load_dotenv()

# ──────────────────────────────────────────────────────────
#  Templates for creative names and travel tips per month
# ──────────────────────────────────────────────────────────
MONTH_TIPS = {
    1: "Perfect for a heritage circuit: Delhi → Agra → Jaipur, or the Rann of Kutch white desert festival.",
    2: "Great time for Goa beaches before peak summer, or explore Pondicherry's French Quarter.",
    3: "Experience Holi in Mathura-Vrindavan, or catch cherry blossoms in Shillong, Meghalaya.",
    4: "Ideal for Kerala backwaters houseboat, or a South India temple trail: Hampi → Mysore → Coorg.",
    5: "Fly to Andaman Islands or Lakshadweep for pristine beaches — peak pre-monsoon clarity.",
    6: "Ladakh road trip via Manali, or Spiti Valley for breathtaking high-altitude landscapes.",
    7: "Western Ghats waterfalls and monsoon treks, or Munnar tea gardens in the mist.",
    8: "Monsoon magic in Meghalaya — living root bridges, Dawki river, and Cherrapunji.",
    9: "Sikkim for Kanchenjunga views, or the Valley of Flowers in Uttarakhand.",
    10: "Witness the grand Mysuru Dasara procession or Varanasi Ramlila celebrations.",
    11: "Diwali in Jaipur with thousands of diyas, or Pushkar Camel Fair in Rajasthan.",
    12: "Goa for legendary New Year's parties, or Manali/Auli for a white Christmas in the snow.",
}

MONTH_PREFIXES = {
    1: "Winter", 2: "Late-Winter", 3: "Spring", 4: "Spring",
    5: "Pre-Summer", 6: "Summer", 7: "Monsoon", 8: "Monsoon",
    9: "Autumn", 10: "Festival", 11: "Festival", 12: "Year-End",
}

HOLIDAY_NICKNAMES = {
    "Republic Day": "Republic Day Heritage Explorer",
    "Holi": "Holi Color Festival Retreat",
    "Ram Navami": "Ram Navami Temple Trail",
    "Good Friday": "Easter Spring Break",
    "Buddha Purnima": "Buddha Purnima Serenity Escape",
    "Independence Day": "Independence Day Mountain Retreat",
    "Gandhi Jayanti": "Gandhi Jayanti Cultural Trail",
    "Dussehra": "Dussehra Festival Break",
    "Diwali": "Diwali Lights Festival",
    "Christmas Day": "Christmas & New Year Finale",
    "Christmas": "Christmas & New Year Finale",
}


def _is_weekend(d: date) -> bool:
    return d.weekday() >= 5


class LeavePlanner:
    """Algorithmic leave planner that dynamically computes optimal vacation
    blocks from ANY holiday list and ANY leave balance."""

    def __init__(self, holiday_list: List[Dict], paid: int, casual: int, year: int = 2026):
        self.year = year
        self.paid_rem = paid
        self.casual_rem = casual
        self.total = paid + casual

        # Map to track which date is what type of leave
        self.leave_assignments: Dict[date, str] = {} 

        # Parse holiday dates (only for the target year)
        self.holiday_dates: Dict[date, str] = {}
        for h in holiday_list:
            try:
                d = date.fromisoformat(h["date"])
            except (ValueError, KeyError):
                continue
            if d.year == year:
                self.holiday_dates[d] = h.get("name", "Holiday")

        self.used_days: Set[date] = set()

        # Block past dates (and today) from being assigned leaves
        today = date.today()
        d = date(year, 1, 1)
        while d <= today and d.year == year:
            self.used_days.add(d)
            d += timedelta(days=1)

    def _consume_leaves(self, days: List[date]):
        """Assign leave types to the given days, prioritizing paid leave."""
        for d in sorted(days):
            if d in self.used_days:
                continue
            if self.paid_rem > 0:
                self.leave_assignments[d] = "paid"
                self.paid_rem -= 1
            elif self.casual_rem > 0:
                self.leave_assignments[d] = "casual"
                self.casual_rem -= 1
            self.used_days.add(d)

    def is_free(self, d: date) -> bool:
        """Weekend or public holiday → already a free day."""
        return _is_weekend(d) or d in self.holiday_dates

    def _expand_range(self, start: date, end: date) -> Tuple[date, date]:
        """Expand a date range outward to swallow adjacent free days."""
        while self.is_free(start - timedelta(days=1)):
            start -= timedelta(days=1)
        while self.is_free(end + timedelta(days=1)):
            end += timedelta(days=1)
        return start, end

    # ─── candidate generation ───────────────────────────────

    def _bridge_candidates(self) -> List[Dict]:
        """Generate every plausible bridge opportunity around each holiday."""
        candidates = []
        sorted_holidays = sorted(self.holiday_dates.keys())

        for idx, h_date in enumerate(sorted_holidays):
            h_name = self.holiday_dates[h_date]

            # ── gap before the holiday ──
            backward_full: List[date] = []
            d = h_date - timedelta(days=1)
            while not self.is_free(d):
                backward_full.insert(0, d)
                d -= timedelta(days=1)

            # ── gap after the holiday ──
            forward_full: List[date] = []
            d = h_date + timedelta(days=1)
            while not self.is_free(d):
                forward_full.append(d)
                d += timedelta(days=1)

            # Generate partial backward candidates (1 .. N closest days)
            for n in range(1, len(backward_full) + 1):
                days = backward_full[-n:]           # N days closest to holiday
                avail = [x for x in days if x not in self.used_days]
                if not avail:
                    continue
                s, e = self._expand_range(min(avail), h_date)
                bl = (e - s).days + 1
                candidates.append(self._make_candidate(
                    h_name, avail, s, e, bl))

            # Generate partial forward candidates
            for n in range(1, len(forward_full) + 1):
                days = forward_full[:n]             # N days closest to holiday
                avail = [x for x in days if x not in self.used_days]
                if not avail:
                    continue
                s, e = self._expand_range(h_date, max(avail))
                bl = (e - s).days + 1
                candidates.append(self._make_candidate(
                    h_name, avail, s, e, bl))

            # Full both-directions candidate
            both = backward_full + forward_full
            avail = [x for x in both if x not in self.used_days]
            if avail:
                s_start = min(backward_full) if backward_full else h_date
                s_end = max(forward_full) if forward_full else h_date
                s, e = self._expand_range(s_start, s_end)
                bl = (e - s).days + 1
                candidates.append(self._make_candidate(
                    h_name, avail, s, e, bl))

            # ── pair with next nearby holiday ──
            if idx + 1 < len(sorted_holidays):
                next_h = sorted_holidays[idx + 1]
                gap_days = (next_h - h_date).days
                if gap_days <= 12:
                    between: List[date] = []
                    d = h_date + timedelta(days=1)
                    while d < next_h:
                        if not self.is_free(d):
                            between.append(d)
                        d += timedelta(days=1)
                    avail = [x for x in between if x not in self.used_days]
                    if avail:
                        s, e = self._expand_range(h_date, next_h)
                        bl = (e - s).days + 1
                        combined_name = f"{h_name} + {self.holiday_dates[next_h]}"
                        candidates.append(self._make_candidate(
                            combined_name, avail, s, e, bl))

        return candidates

    @staticmethod
    def _make_candidate(name, leave_days, start, end, break_length):
        return {
            "name": name,
            "leave_days": leave_days,
            "start": start,
            "end": end,
            "break_length": break_length,
            "efficiency": break_length / len(leave_days) if leave_days else 0,
        }

    # ─── greedy selection ───────────────────────────────────

    def plan(self) -> List[Dict]:
        remaining = self.total
        blocks: List[Dict] = []

        # Phase 1 — greedy bridge selection
        for _ in range(50):
            if self.paid_rem + self.casual_rem <= 0:
                break
            candidates = self._bridge_candidates()
            candidates = [c for c in candidates if c["leave_days"]]
            if not candidates:
                break

            candidates.sort(key=lambda c: (c["efficiency"], -len(c["leave_days"])),
                            reverse=True)

            picked = None
            total_rem = self.paid_rem + self.casual_rem
            for cand in candidates:
                if len(cand["leave_days"]) <= total_rem:
                    picked = cand
                    break

            if picked is None and candidates:
                best = candidates[0]
                trimmed = sorted(best["leave_days"])[:total_rem]
                s, e = self._expand_range(min(trimmed), max(trimmed))
                picked = self._make_candidate(
                    best["name"], trimmed, s, e, (e - s).days + 1)

            if picked:
                self._consume_leaves(picked["leave_days"])
                blocks.append(picked)

        # Phase 2 — standalone long-weekends (Fri / Mon)
        if self.paid_rem + self.casual_rem > 0:
            for target_weekday in (4, 0): 
                for month in range(1, 13):
                    if self.paid_rem + self.casual_rem <= 0:
                        break
                    for day in range(1, 32):
                        if self.paid_rem + self.casual_rem <= 0:
                            break
                        try:
                            d = date(self.year, month, day)
                        except ValueError:
                            continue
                        if d in self.used_days or self.is_free(d):
                            continue
                        if d.weekday() == target_weekday:
                            self._consume_leaves([d])
                            s, e = self._expand_range(d, d)
                            blocks.append(self._make_candidate(
                                "Long Weekend", [d], s, e, (e - s).days + 1))

        # Phase 3 — Smart Fill: find largest gaps between existing blocks and fill them
        if self.paid_rem + self.casual_rem > 0:
            # We want to distribute remaining leaves rather than clustering in January
            # Iterate through months but skip those that already have many leave days
            for month in [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]: # Random-ish order or prioritize end of year
                if self.paid_rem + self.casual_rem <= 0:
                    break
                for day in range(1, 32):
                    if self.paid_rem + self.casual_rem <= 0:
                        break
                    try:
                        d = date(self.year, month, day)
                    except ValueError:
                        continue
                    if d in self.used_days or self.is_free(d):
                        continue
                    
                    self._consume_leaves([d])
                    s, e = self._expand_range(d, d)
                    blocks.append(self._make_candidate(
                        "Extra Day Off", [d], s, e, (e - s).days + 1))

        # Merge overlapping / adjacent blocks
        blocks = self._merge_blocks(blocks)
        return blocks

    # ─── merge & format ─────────────────────────────────────

    def _merge_blocks(self, blocks: List[Dict]) -> List[Dict]:
        if not blocks:
            return []
        blocks.sort(key=lambda b: b["start"])
        merged = [blocks[0].copy()]
        for blk in blocks[1:]:
            last = merged[-1]
            # Merge if overlapping or adjacent (touching within 1 day)
            if blk["start"] <= last["end"] + timedelta(days=1):
                last["end"] = max(last["end"], blk["end"])
                combined = set(last["leave_days"]) | set(blk["leave_days"])
                last["leave_days"] = sorted(combined)
                last["break_length"] = (last["end"] - last["start"]).days + 1
                if blk["name"] not in last["name"]:
                    last["name"] = last["name"] + " + " + blk["name"]
            else:
                merged.append(blk.copy())
        return merged

    def to_vacation_blocks(self) -> List[Dict]:
        """Run the planner and return JSON-serialisable vacation blocks."""
        raw_blocks = self.plan()
        result = []
        for blk in raw_blocks:
            month = blk["start"].month
            leave_strs = [d.isoformat() for d in blk["leave_days"]]
            # Include type information for each day
            leave_details = [
                {"date": d.isoformat(), "type": self.leave_assignments.get(d, "paid")}
                for d in blk["leave_days"]
            ]
            n_leaves = len(leave_strs)
            break_len = blk["break_length"]

            # Creative name
            base_name = blk["name"]
            nice_name = HOLIDAY_NICKNAMES.get(base_name, None)
            if nice_name is None:
                parts = base_name.split(" + ")
                for p in parts:
                    if p in HOLIDAY_NICKNAMES:
                        nice_name = HOLIDAY_NICKNAMES[p]
                        break
            if nice_name is None:
                nice_name = f"{MONTH_PREFIXES.get(month, '')} {base_name} Break".strip()

            # Reason
            start_fmt = blk["start"].strftime("%a %b %d")
            end_fmt = blk["end"].strftime("%a %b %d")
            reason = (
                f"Take {n_leaves} leave day{'s' if n_leaves != 1 else ''} to create a "
                f"{break_len}-day break ({start_fmt} → {end_fmt}). "
                f"Efficiency: {break_len / n_leaves:.1f}× multiplier."
            )

            result.append({
                "name": nice_name,
                "start_date": blk["start"].isoformat(),
                "end_date": blk["end"].isoformat(),
                "leave_days": leave_strs,
                "leave_details": leave_details,
                "reason": reason,
                "travel_tip": MONTH_TIPS.get(month, "Explore something new!"),
            })
        return result


# ════════════════════════════════════════════════════════════
#  LeaveAgent — the public façade used by FastAPI
# ════════════════════════════════════════════════════════════

class LeaveAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    def get_national_holidays(self, year: int = 2026) -> List[Dict]:
        """Fetch Indian National/Gazetted holidays (fallback only)."""
        in_holidays = holidays_lib.India(years=year)
        return [{"date": str(d), "name": n} for d, n in sorted(in_holidays.items())]

    async def optimize_leaves(self, balances: Dict, preferences: Dict, custom_holidays: List = None):
        """Generate an optimised leave plan.

        Priority: custom_holidays (user's uploaded list) → holidays.India() fallback.
        The plan is computed ALGORITHMICALLY so it works for any input.
        """
        # ── holiday source ──
        if custom_holidays and len(custom_holidays) > 0:
            all_holidays = custom_holidays
        else:
            all_holidays = self.get_national_holidays()

        paid = balances.get("paid", 0)
        casual = balances.get("casual", 0)
        sick = balances.get("sick", 0)

        # ── run algorithmic planner ──
        planner = LeavePlanner(all_holidays, paid, casual)
        vacation_blocks = planner.to_vacation_blocks()

        # ── audit ──
        total_assigned = sum(len(b["leave_days"]) for b in vacation_blocks)
        paid_used = sum(1 for b in vacation_blocks for ld in b["leave_details"] if ld["type"] == "paid")
        casual_used = sum(1 for b in vacation_blocks for ld in b["leave_details"] if ld["type"] == "casual")
        
        audit = {
            "initial_paid": paid,
            "initial_casual": casual,
            "final_paid": paid - paid_used,
            "final_casual": casual - casual_used,
        }

        print("\n" + "=" * 40)
        print("  Expert Leave Audit Summary")
        print("=" * 40)
        print(f"  PAID LEAVE:   {audit['initial_paid']} -> {audit['final_paid']}")
        print(f"  CASUAL LEAVE: {audit['initial_casual']} -> {audit['final_casual']}")
        print(f"  TOTAL DAYS ASSIGNED: {total_assigned} / {paid + casual}")
        print("=" * 40 + "\n")

        print("\n" + "=" * 40)
        print("  Leaves Assigned (JSON)")
        print("=" * 40)
        all_assigned_leaves = []
        for b in vacation_blocks:
            all_assigned_leaves.extend(b["leave_details"])
        print(json.dumps(all_assigned_leaves, indent=2))
        print("=" * 40 + "\n")

        summary = (
            f"🎯 Expert Strategy: I've mapped all {paid_used} Paid + {casual_used} Casual "
            f"= {total_assigned} leave days across {len(vacation_blocks)} high-efficiency "
            f"vacation blocks. By strategically bridging holidays and weekends, you "
            f"maximise your rest days — that's smart planning! "
            f"Sick leaves ({sick}) are fully reserved for emergencies."
        )

        return {
            "vacation_blocks": vacation_blocks,
            "holidays": all_holidays,
            "summary": summary,
            "balance_audit": audit,
        }

    async def parse_holiday_document(self, file_contents: bytes, filename: str):
        """Use Gemini to extract balances and holidays from a document."""
        import json
        import os
        import tempfile
        
        try:
            if not self.model:
                raise ValueError("Gemini API key is not configured.")

            content_to_pass = None
            tmp_path = None
            
            try:
                # If it's a text file (CSV, TXT), just use the string content directly
                content_to_pass = file_contents.decode('utf-8')
            except UnicodeDecodeError:
                # For binary files (PDF, PNG), upload to Gemini
                ext = os.path.splitext(filename)[1]
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                    tmp.write(file_contents)
                    tmp_path = tmp.name
                    
                mime_type = None
                if ext.lower() == '.csv':
                    mime_type = 'text/csv'
                elif ext.lower() == '.pdf':
                    mime_type = 'application/pdf'
                    
                content_to_pass = genai.upload_file(path=tmp_path, mime_type=mime_type)

            prompt = '''
            Analyze this document. It may contain an employee's leave balance information and/or a company holiday list.
            Extract any leave balances (paid, casual, sick) and the list of holidays (date in YYYY-MM-DD format, and name).
            Return EXACTLY a JSON object with this exact structure, with no markdown code blocks around it (just raw JSON text):
            {
              "balances": {"paid": 0, "casual": 0, "sick": 0},
              "holidays": [{"date": "YYYY-MM-DD", "name": "Holiday Name"}]
            }
            Fill in the numbers and dates you find. If you don't find a balance, default it to 0. If you don't find holidays, return an empty array [].
            '''
            
            response = self.model.generate_content([content_to_pass, prompt])
            
            # Try to parse the response as JSON
            resp_text = response.text.strip()
            if resp_text.startswith('```json'):
                resp_text = resp_text[7:-3].strip()
            elif resp_text.startswith('```'):
                resp_text = resp_text[3:-3].strip()
                
            data = json.loads(resp_text)
            return data
            
        finally:
            if 'tmp_path' in locals() and tmp_path:
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
