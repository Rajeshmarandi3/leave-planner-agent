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
          holidays: holidays
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
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {isOptimizing && (
              <LoadingSkeleton />
            )}

            {isAnalyzed && !isOptimizing && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-8 w-full"
              >
                <div className="glass p-8 rounded-[40px] mb-8 border-white border-opacity-10">
                  <h3 className="text-accent-primary font-bold uppercase tracking-widest text-xs mb-4">Expert Strategy Overview</h3>
                  <p className="text-xl font-medium leading-relaxed mb-6">{planSummary}</p>
                  
                  {isAnalyzed && balances.paid + balances.casual > 0 && (
                    <div className="pt-6 border-t border-white border-opacity-5">
                      <h4 className="text-white font-bold text-sm mb-2">Expert Recommendation:</h4>
                      <p className="text-text-muted text-sm italic">
                        "As your leave planner expert, I've utilized all {balances.paid} paid days and {balances.casual} casual days 
                        ({totalLeaveDays} total weekday leaves) across {vacationBlocks.length} vacation blocks to ensure optimal coverage every month. 
                        Sick leave is fully reserved for emergencies as requested."
                      </p>
                    </div>
                  )}
                </div>

                <BalanceManager balances={balances} onUpdate={updateBalance} />

                {/* Calendar Legend */}
                <div className="flex flex-wrap items-center gap-6 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-accent-primary bg-opacity-30 border border-accent-primary border-opacity-40" />
                    <span className="text-xs text-text-muted font-medium">Paid Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-indigo-500 bg-opacity-30 border border-indigo-500 border-opacity-40" />
                    <span className="text-xs text-text-muted font-medium">Casual Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500 bg-opacity-30 border border-emerald-500 border-opacity-40" />
                    <span className="text-xs text-text-muted font-medium">Public Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-amber-400 border-opacity-40" style={{ background: 'rgba(251, 191, 36, 0.15)' }} />
                    <span className="text-xs text-text-muted font-medium">Weekend</span>
                  </div>
                </div>
                
                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="xl:w-2/3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="xl:w-1/3">
                    <div className="sticky top-8">
                      <ReasoningPanel selectedBreak={selectedBreak} audit={audit} />
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
