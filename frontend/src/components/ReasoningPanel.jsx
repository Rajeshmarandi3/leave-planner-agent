import React from 'react';
import { BrainCircuit, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReasoningPanel = ({ selectedDay }) => {
  return (
    <div className="glass p-6 rounded-3xl h-full min-h-[400px]">
      <div className="flex items-center gap-3 mb-6">
        <BrainCircuit className="w-6 h-6 text-accent-secondary" />
        <h2 className="text-xl font-bold">Agent Reasoning</h2>
      </div>

      <AnimatePresence mode="wait">
        {selectedDay ? (
          <motion.div
            key={selectedDay.day}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white bg-opacity-5 p-4 rounded-2xl border border-border-glass">
              <h3 className="flex items-center gap-2 text-accent-secondary font-medium mb-2">
                <Info className="w-4 h-4" />
                Context for April {selectedDay.day}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {selectedDay.isHoliday 
                  ? "This is a gazetted national holiday (Good Friday). It provides a natural anchor for a long weekend."
                  : selectedDay.isRecommended 
                  ? "I recommend taking this day off to bridge the gap between the mid-week holiday and the upcoming weekend. This maximizes your 'break-to-leave' ratio."
                  : "A standard working day. No specific optimization triggers found for this date."}
              </p>
            </div>

            {selectedDay.isRecommended && (
              <div className="bg-accent-primary bg-opacity-10 p-4 rounded-2xl border border-accent-primary border-opacity-30">
                <h3 className="flex items-center gap-2 text-accent-primary font-medium mb-2">
                  <MapPin className="w-4 h-4" />
                  Travel Recommendation
                </h3>
                <p className="text-sm text-text-active leading-relaxed">
                  Based on your interest in <strong>Mountains</strong>, this 5-day block (Apr 11-15) is perfect for a quick escape to the Western Ghats before the monsoon season starts.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
            <div className="w-12 h-12 bg-white bg-opacity-5 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-text-muted text-sm max-w-[200px]">
              Select a highlighted day on the calendar to see the Agent's reasoning and travel tips.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReasoningPanel;
