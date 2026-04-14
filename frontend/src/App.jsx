import React, { useState } from 'react';
import Layout from './components/Layout';
import BalanceManager from './components/BalanceManager';
import CalendarView from './components/CalendarView';
import ReasoningPanel from './components/ReasoningPanel';
import CommandCenter from './components/CommandCenter';
import HolidaySidebar from './components/HolidaySidebar';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [balances, setBalances] = useState({ paid: 15, casual: 8, sick: 10 });
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleExecute = (input) => {
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzed(true);
    }, 800);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <CommandCenter onExecute={handleExecute} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {isAnalyzed && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-8"
              >
                <BalanceManager balances={balances} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2">
                    <CalendarView 
                      onDayClick={setSelectedDay}
                      holidays={[3, 14]}
                      recommendedDays={[13, 15]}
                    />
                  </div>
                  <div>
                    <ReasoningPanel selectedDay={selectedDay} />
                  </div>
                </div>
              </motion.div>
            )}
            
            {!isAnalyzed && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] flex items-center justify-center border-2 border-dashed border-white border-opacity-5 rounded-[40px]"
               >
                 <p className="text-text-muted text-lg font-medium opacity-50">Waiting for your input to generate the vacation strategy...</p>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <aside className="lg:col-span-1">
          <HolidaySidebar />
        </aside>
      </div>
      
      <footer className="mt-20 py-8 border-t border-border-glass text-center text-text-muted text-sm">
        Leave Planner Agent • Powered by Gemini Intelligence • 2026 Edition
      </footer>
    </Layout>
  );
}

export default App;
