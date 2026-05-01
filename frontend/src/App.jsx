import React, { useState } from 'react';
import Layout from './components/Layout';
import BalanceManager from './components/BalanceManager';
import CalendarView from './components/CalendarView';
import ReasoningPanel from './components/ReasoningPanel';
import CommandCenter from './components/CommandCenter';
import HolidaySidebar from './components/HolidaySidebar';
import LoadingSkeleton from './components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, MapPin } from 'lucide-react';

// The user's holiday list — this is the single source of truth.
// It will be populated from the uploaded file via Gemini extraction.

function App() {
  const [balances, setBalances] = useState({ paid: 0, casual: 0, sick: 0 });
  const [selectedBreak, setSelectedBreak] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [planSummary, setPlanSummary] = useState('');
  const [vacationBlocks, setVacationBlocks] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [audit, setAudit] = useState(null);

  const handleUploadSuccess = (data) => {
    if (data.balances) {
      setBalances(prev => ({
        paid: Math.max(prev.paid, data.balances.paid || 0),
        casual: Math.max(prev.casual, data.balances.casual || 0),
        sick: Math.max(prev.sick, data.balances.sick || 0)
      }));
    }
    if (data.holidays && data.holidays.length > 0) {
      setHolidays(prev => {
        const merged = [...prev, ...data.holidays];
        // Remove duplicates by date to ensure clean list
        const uniqueMap = new Map();
        merged.forEach(h => uniqueMap.set(h.date, h));
        return Array.from(uniqueMap.values());
      });
    }
  };

  const updateBalance = (type, value) => {
    setBalances(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const handleExecute = async (input) => {
    setIsOptimizing(true);
    setIsAnalyzed(false); 
    
    try {
      const response = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balances: balances,
          preferences: { interests: ['Nature', 'Mountains'], max_paid_leave_utilization: 1.0 },
          holidays: holidays,
          user_prompt: input || ""  // Pass user input as prompt for month preferences
        })
      });
      
      const data = await response.json();
      
      setPlanSummary(data.summary || 'Expert plan generated.');
      setVacationBlocks(data.vacation_blocks || []);
      // Use holidays from the response, but fall back to our current state
      setHolidays(data.holidays && data.holidays.length > 0 ? data.holidays : holidays);
      setAudit(data.balance_audit);
      
      // Auto-select the first break
      const blocks = data.vacation_blocks || [];
      if (blocks.length > 0) {
        setSelectedBreak(blocks[0]);
      }
      
      setIsAnalyzed(true);
    } catch (error) {
      console.error("Optimization failed:", error);
      setTimeout(() => setIsAnalyzed(true), 800);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Calculate total leave days for the legend
  const totalLeaveDays = vacationBlocks.reduce((sum, b) => sum + (b.leave_days?.length || 0), 0);

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <CommandCenter onExecute={handleExecute} onUploadSuccess={handleUploadSuccess} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <AnimatePresence>
            {isOptimizing && (
              <LoadingSkeleton />
            )}

            {isAnalyzed && !isOptimizing && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6 w-full"
              >
                <div className="top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-md py-4 -mx-6 px-6">
                  <BalanceManager balances={balances} onUpdate={updateBalance} />
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap items-center gap-4 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-accent-primary bg-opacity-30 border border-accent-primary border-opacity-40" />
                    <span className="text-[10px] text-text-muted font-medium">Paid Leave</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500 bg-opacity-30 border border-indigo-500 border-opacity-40" />
                    <span className="text-[10px] text-text-muted font-medium">Casual Leave</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500 bg-opacity-30 border border-emerald-500 border-opacity-40" />
                    <span className="text-[10px] text-text-muted font-medium">Public Holiday</span>
                  </div>
                </div>
                
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                  <div className="xl:w-3/4 space-y-6">
                    {/* Calendar Section - 4 months per row */}
                    <div className="overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <CalendarView 
                            key={i}
                            month={i}
                            year={2026}
                            onBreakClick={setSelectedBreak}
                            holidays={holidays}
                            vacationBlocks={vacationBlocks}
                            selectedBreak={selectedBreak}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="xl:w-1/4 xl:sticky xl:top-8 xl:h-fit">
                    {/* Right Sidebar - Trip Details, Travel Tip & Holidays */}
                    <div className="space-y-4 overflow-visible custom-scrollbar pr-2">
                      <ReasoningPanel selectedBreak={selectedBreak} audit={audit} />
                      {/* <HolidaySidebar /> */}
                    </div>
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
      </div>
      
    </Layout>
  );
}

export default App;
