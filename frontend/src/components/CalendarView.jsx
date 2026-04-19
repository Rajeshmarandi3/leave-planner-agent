import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, getDay, getDaysInMonth, isWeekend, isSameDay, addDays, subDays } from 'date-fns';

const CalendarView = ({ month, year, recommendedDays = [], holidays = [], onDayClick }) => {
  const date = new Date(year, month, 1);
  const now = new Date();
  const monthName = format(date, 'MMMM');
  const daysInMonth = getDaysInMonth(date);
  const startDay = getDay(startOfMonth(date));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to check if a day is a break (holiday or recommended)
  const isBaseBreak = (d) => {
    return holidays.some(h => isSameDay(new Date(h.date), d)) || 
           recommendedDays.some(r => isSameDay(new Date(r.date), d));
  };

  // Helper to check if a day is part of a contiguous break (including weekends)
  const isPartOfBreak = (d) => {
    if (isBaseBreak(d)) return true;
    if (!isWeekend(d)) return false;

    // For weekends, check if they are adjacent to a break day
    // This scales to check if it's connected to a holiday/recommendation chain
    let checkPrev = subDays(d, 1);
    while (isWeekend(checkPrev)) checkPrev = subDays(checkPrev, 1);
    if (isBaseBreak(checkPrev)) return true;

    let checkNext = addDays(d, 1);
    while (isWeekend(checkNext)) checkNext = addDays(checkNext, 1);
    if (isBaseBreak(checkNext)) return true;

    return false;
  };

  return (
    <div className="glass p-4 rounded-2xl border border-white border-opacity-5 flex flex-col h-full hover:border-opacity-20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{monthName}</h3>
        <span className="text-[10px] text-text-muted font-mono">{year}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-text-muted font-bold opacity-30">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 gap-x-0 flex-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const currentDay = new Date(year, month, day);
          const holidayMatch = holidays.find(h => isSameDay(new Date(h.date), currentDay));
          const recMatch = recommendedDays.find(r => isSameDay(new Date(r.date), currentDay));
          const isPast = currentDay < now && !isSameDay(currentDay, now);
          
          const inBreak = isPartOfBreak(currentDay);
          const prevInBreak = isPartOfBreak(subDays(currentDay, 1)) && getDay(currentDay) !== 0;
          const nextInBreak = isPartOfBreak(addDays(currentDay, 1)) && getDay(currentDay) !== 6;

          // Determine rounding
          let roundedClasses = "rounded-lg";
          if (inBreak) {
            if (prevInBreak && nextInBreak) roundedClasses = "rounded-none";
            else if (prevInBreak) roundedClasses = "rounded-r-lg rounded-l-none";
            else if (nextInBreak) roundedClasses = "rounded-l-lg rounded-r-none";
          }

          return (
            <motion.div
              key={day}
              whileHover={!isPast ? { scale: 1.1, zIndex: 10 } : {}}
              onClick={() => !isPast && onDayClick({ date: currentDay, holiday: holidayMatch, recommendation: recMatch })}
              className={`
                aspect-square flex flex-col items-center justify-center cursor-pointer text-[11px] font-medium transition-all relative
                ${inBreak ? 'bg-accent-primary bg-opacity-20 text-white' : ''}
                ${holidayMatch ? 'bg-emerald-500 bg-opacity-40' : ''}
                ${isPast ? 'opacity-20 grayscale pointer-events-none' : 'text-text-muted'}
                ${roundedClasses}
              `}
            >
              <span className={holidayMatch || recMatch ? 'font-bold underline underline-offset-2' : ''}>
                {day}
              </span>
              {recMatch && <div className="absolute top-1 right-1 w-1 h-1 bg-accent-primary rounded-full" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
