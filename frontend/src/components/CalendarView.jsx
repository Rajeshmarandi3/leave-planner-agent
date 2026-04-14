import React from 'react';
import { Calendar as CalendarIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarView = ({ recommendedDays, holidays, onDayClick }) => {
  // Simple mock for April 2026
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const startDay = 3; // Wednesday

  return (
    <div className="glass p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-accent-primary" />
          <h2 className="text-2xl font-bold">April 2026</h2>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-primary" />
            <span>Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Holiday</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-text-muted text-sm font-medium py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(day => {
          const isHoliday = day === 3 || day === 14;
          const isRecommended = day === 13 || day === 15;
          const isWeekend = (day + startDay) % 7 === 0 || (day + startDay) % 7 === 1;

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05 }}
              onClick={() => onDayClick({ day, isHoliday, isRecommended, isWeekend })}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                ${isHoliday ? 'bg-emerald-500 bg-opacity-20 border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
                ${isRecommended ? 'bg-accent-primary bg-opacity-20 border border-accent-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]' : ''}
                ${!isHoliday && !isRecommended && isWeekend ? 'bg-white bg-opacity-5' : ''}
                ${!isHoliday && !isRecommended && !isWeekend ? 'hover:bg-white hover:bg-opacity-5' : ''}
              `}
            >
              <span className={`text-lg font-semibold ${isHoliday || isRecommended ? 'text-white' : 'text-text-muted'}`}>
                {day}
              </span>
              {isRecommended && <Zap className="w-3 h-3 text-accent-primary mt-1" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
