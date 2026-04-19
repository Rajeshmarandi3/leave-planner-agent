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
            key={selectedDay.date.toString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white bg-opacity-5 p-4 rounded-2xl border border-border-glass">
              <h3 className="flex items-center gap-2 text-accent-secondary font-medium mb-2">
                <Info className="w-4 h-4" />
                Context for {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(selectedDay.date)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {selectedDay.holiday 
                  ? `This is a holiday: ${selectedDay.holiday.name}. A great anchor for your break.`
                  : selectedDay.recommendation 
                  ? selectedDay.recommendation.reason
                  : "A standard working day. No specific optimization triggers found for this date."}
              </p>
            </div>

            {selectedDay.recommendation && (
              <div className="bg-accent-primary bg-opacity-10 p-4 rounded-2xl border border-accent-primary border-opacity-30">
                <h3 className="flex items-center gap-2 text-accent-primary font-medium mb-2">
                  <MapPin className="w-4 h-4" />
                  Expert Travel Tip
                </h3>
                <p className="text-sm text-text-active leading-relaxed">
                  {selectedDay.recommendation.travel_tip}
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
