import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HolidaySidebar = () => {
  const nationalHolidays = [
    { date: "Jan 26", name: "Republic Day", type: "National" },
    { date: "Mar 04", name: "Holi", type: "Gazetted" },
    { date: "Mar 26", name: "Ram Navami", type: "Gazetted" },
    { date: "Apr 03", name: "Good Friday", type: "Gazetted" },
    { date: "May 01", name: "Buddha Purnima", type: "Gazetted" },
    { date: "Aug 15", name: "Independence Day", type: "National" },
    { date: "Oct 02", name: "Gandhi Jayanti", type: "National" },
    { date: "Oct 20", name: "Dussehra", type: "Gazetted" },
    { date: "Nov 08", name: "Diwali", type: "Gazetted" },
    { date: "Dec 25", name: "Christmas Day", type: "Gazetted" }
  ];

  return (
    <div className="glass p-6 rounded-[32px] h-[calc(100vh-200px)] sticky top-6 overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent-primary bg-opacity-20 rounded-xl">
          <Calendar className="w-5 h-5 text-accent-primary" />
        </div>
        <h2 className="text-xl font-bold">2026 Holidays</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {nationalHolidays.map((holiday, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group glass bg-opacity-5 p-4 rounded-2xl border border-white border-opacity-5 hover:border-opacity-20 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent-primary font-bold">{holiday.type}</span>
                <h3 className="font-semibold text-sm mt-1">{holiday.name}</h3>
                <p className="text-xs text-text-muted mt-1">{holiday.date}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HolidaySidebar;
