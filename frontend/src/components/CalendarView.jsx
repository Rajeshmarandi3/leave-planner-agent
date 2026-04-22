import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, getDay, getDaysInMonth, isWeekend, isSameDay, addDays, subDays } from 'date-fns';

const parseDate = (dStr) => {
  if (!dStr) return new Date();
  const [y, m, d] = dStr.split('T')[0].split('-');
  return new Date(y, m - 1, d);
};

const CalendarView = ({ month, year, vacationBlocks = [], holidays = [], onBreakClick, selectedBreak }) => {
  const date = new Date(year, month, 1);
  const now = new Date();
  const monthName = format(date, 'MMMM');
  const daysInMonth = getDaysInMonth(date);
  const startDay = getDay(startOfMonth(date));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to find a block for a date
  const getBlockForDate = (d) => {
    return vacationBlocks.find(b => {
      const start = parseDate(b.start_date);
      const end = parseDate(b.end_date);
      return (d >= start && d <= end);
    });
  };

  // Count leave days in this month for the legend
  const monthLeaveDays = vacationBlocks.reduce((count, block) => {
    return count + (block.leave_days || []).filter(ld => {
      const d = parseDate(ld);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }, 0);

  const monthHolidayCount = holidays.filter(h => {
    const d = parseDate(h.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  return (
    <div className="glass p-4 rounded-2xl border border-white border-opacity-5 flex flex-col h-full hover:border-opacity-20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{monthName}</h3>
        <div className="flex items-center gap-2">
          {monthLeaveDays > 0 && (
            <span className="text-[9px] bg-accent-primary bg-opacity-20 text-accent-primary px-2 py-0.5 rounded-full font-bold">
              {monthLeaveDays}L
            </span>
          )}
          {monthHolidayCount > 0 && (
            <span className="text-[9px] bg-emerald-500 bg-opacity-20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              {monthHolidayCount}H
            </span>
          )}
          <span className="text-[10px] text-text-muted font-mono">{year}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center font-bold text-text-muted opacity-30">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 gap-x-0 flex-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const currentDay = new Date(year, month, day);
          const holidayMatch = holidays.find(h => isSameDay(parseDate(h.date), currentDay));
          const blockMatch = getBlockForDate(currentDay);
          const isPast = currentDay < now && !isSameDay(currentDay, now);
          const isWeekendDay = isWeekend(currentDay);
          
          const isSelected = selectedBreak && blockMatch && 
                            selectedBreak.start_date === blockMatch.start_date;
          
          const leaveDetail = blockMatch?.leave_details?.find(ld => isSameDay(parseDate(ld.date), currentDay));
          const isLeaveDay = !!leaveDetail;
          const leaveType = leaveDetail?.type;

          const inBreak = !!blockMatch;
          const prevInBreak = getBlockForDate(subDays(currentDay, 1))?.start_date === blockMatch?.start_date && getDay(currentDay) !== 0;
          const nextInBreak = getBlockForDate(addDays(currentDay, 1))?.start_date === blockMatch?.start_date && getDay(currentDay) !== 6;

          // Determine rounding
          let roundedClasses = "rounded-lg";
          if (inBreak) {
            if (prevInBreak && nextInBreak) roundedClasses = "rounded-none";
            else if (prevInBreak) roundedClasses = "rounded-r-lg rounded-l-none";
            else if (nextInBreak) roundedClasses = "rounded-l-lg rounded-r-none";
          }

          // Build cell classes based on priority:
          // 1. Paid Leave day (purple accent)
          // 2. Casual Leave day (indigo/blue accent)
          // 3. Public holiday (emerald green)
          // 4. Weekend (amber/warm — distinct color)
          let cellBg = '';
          let textColor = 'text-text-muted';
          let fontStyle = '';
          let cellStyle = {};

          if (isLeaveDay) {
            if (leaveType === 'paid') {
              cellBg = 'bg-accent-primary bg-opacity-30';
              textColor = 'text-white';
            } else {
              cellBg = 'bg-indigo-500 bg-opacity-30';
              textColor = 'text-indigo-200';
            }
            fontStyle = 'font-bold';
          } else if (holidayMatch) {
            // Public holidays — emerald green
            cellBg = 'bg-emerald-500 bg-opacity-30';
            textColor = 'text-emerald-300';
            fontStyle = 'font-bold';
          } else if (inBreak) {
            // In break range but a regular day
            cellBg = 'bg-accent-primary bg-opacity-10';
            textColor = 'text-white';
          }

          return (
            <motion.div
              key={day}
              whileHover={!isPast ? { scale: 1.1, zIndex: 10 } : {}}
              onClick={() => {
                if (!isPast && blockMatch) onBreakClick(blockMatch);
              }}
              className={`
                aspect-square flex flex-col items-center justify-center cursor-pointer text-[11px] font-medium transition-all relative
                ${cellBg}
                ${textColor}
                ${isSelected ? 'ring-2 ring-accent-secondary ring-inset shadow-[0_0_15px_rgba(20,184,166,0.2)]' : ''}
                ${isPast ? 'opacity-20 grayscale pointer-events-none' : ''}
                ${roundedClasses}
              `}
              style={cellStyle}
              title={holidayMatch ? holidayMatch.name : isLeaveDay ? 'Leave Day' : isWeekendDay ? 'Weekend' : ''}
            >
              <span className={`${fontStyle} ${(holidayMatch || isLeaveDay) ? 'underline underline-offset-2' : ''}`}>
                {day}
              </span>
              {isLeaveDay && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_4px_rgba(139,92,246,0.6)]" />
              )}
              {holidayMatch && !isLeaveDay && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
