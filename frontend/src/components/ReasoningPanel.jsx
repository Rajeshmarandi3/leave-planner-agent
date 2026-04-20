import React from 'react';
import { BrainCircuit, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReasoningPanel = ({ selectedBreak, audit }) => {
  return (
    <div className="glass p-6 rounded-3xl h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-accent-secondary" />
          <h2 className="text-xl font-bold">Expert Strategy</h2>
        </div>
        
        {audit && (
          <div className="flex items-center gap-2 bg-emerald-500 bg-opacity-10 px-3 py-1 rounded-full border border-emerald-500 border-opacity-20 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Optimized to Zero</span>
          </div>
        )}
      </div>

      {audit && (
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-5 p-3 rounded-2xl border border-white border-opacity-5">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Paid Audit</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{audit.initial_paid}</span>
              <span className="text-text-muted">→</span>
              <span className="text-xl font-bold text-emerald-400">{audit.final_paid}</span>
            </div>
          </div>
          <div className="bg-white bg-opacity-5 p-3 rounded-2xl border border-white border-opacity-5">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Casual Audit</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{audit.initial_casual}</span>
              <span className="text-text-muted">→</span>
              <span className="text-xl font-bold text-emerald-400">{audit.final_casual}</span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedBreak ? (
          <motion.div
            key={selectedBreak.start_date}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white bg-opacity-5 p-4 rounded-2xl border border-border-glass">
              <div className="flex items-center justify-between mb-2">
                <h3 className="flex items-center gap-2 text-accent-secondary font-medium">
                  <Info className="w-4 h-4" />
                  Trip Details
                </h3>
                <span className="bg-accent-secondary bg-opacity-20 text-[10px] text-accent-secondary px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                  {selectedBreak.leave_days?.length || 0} Leave Days
                </span>
              </div>
              
              <p className="text-lg font-bold text-white mb-1">{selectedBreak.name || 'Planned Break'}</p>
              <p className="text-xs text-text-muted mb-4">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(selectedBreak.start_date))}
                {' - '}
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(selectedBreak.end_date))}
              </p>

              <p className="text-sm text-text-muted leading-relaxed">
                {selectedBreak.reason}
              </p>
            </div>

            <div className="bg-accent-primary bg-opacity-10 p-4 rounded-2xl border border-accent-primary border-opacity-30">
              <h3 className="flex items-center gap-2 text-accent-primary font-medium mb-2">
                <MapPin className="w-4 h-4" />
                Expert Travel Tip
              </h3>
              <p className="text-sm text-text-active leading-relaxed">
                {selectedBreak.travel_tip}
              </p>
            </div>
            
            <button className="w-full bg-white bg-opacity-5 hover:bg-opacity-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white border-opacity-5 hover:border-opacity-10">
               Book this break
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
            <div className="w-12 h-12 bg-white bg-opacity-5 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-text-muted text-sm max-w-[200px]">
              Select a vacation block on the calendar to see the Expert's full planning strategy.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReasoningPanel;
