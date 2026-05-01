import React from 'react';
import { Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationCarousel from './DestinationCarousel';

const ReasoningPanel = ({ selectedBreak, audit }) => {
  return (
    <div className="glass p-4 rounded-3xl h-full min-h-[280px] flex flex-col">
      <AnimatePresence mode="wait">
        {selectedBreak ? (
          <motion.div
            key={selectedBreak.start_date}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3 flex-1 overflow-hidden flex flex-col"
          >
            <div className="flex flex-col gap-3">
              <div className="bg-white bg-opacity-5 p-5 rounded-2xl border border-border-glass flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-accent-secondary" />
                  <h3 className="text-accent-secondary font-medium text-xs">Trip Details</h3>
                </div>
                
                <p className="text-sm font-bold text-white mb-1 line-clamp-2">{selectedBreak.name || 'Planned Break'}</p>
                <p className="text-[10px] text-text-muted mb-2">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(selectedBreak.start_date))}
                  {' - '}
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(selectedBreak.end_date))}
                </p>

                <p className="text-[10px] text-text-muted leading-relaxed line-clamp-6 overflow-hidden">
                  {selectedBreak.reason}
                </p>
              </div>

              <div className="bg-accent-primary bg-opacity-10 p-5 rounded-2xl border border-accent-primary border-opacity-30 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                  <h3 className="text-accent-primary font-medium text-xs">Expert Travel Tip</h3>
                </div>
                
                {/* AI-Recommended Destination Carousel */}
                <DestinationCarousel 
                  images={selectedBreak.destination_images || []}
                  destinationName={selectedBreak.name || 'Recommended Destination'}
                />
                
                <p className="text-xs text-text-active leading-relaxed line-clamp-10 overflow-hidden">
                  {selectedBreak.travel_tip}
                </p>
              </div>
            </div>
            
            <button className="w-full bg-white bg-opacity-5 hover:bg-opacity-10 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white border-opacity-5 hover:border-opacity-10 mt-auto">
               Book this break
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-3">
            <div className="w-10 h-10 bg-white bg-opacity-5 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-text-muted text-xs max-w-[180px]">
              Select a vacation block on the calendar to see the Expert's full planning strategy.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReasoningPanel;
