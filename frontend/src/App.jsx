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

function App() {
  const [balances, setBalances] = useState({ paid: 15, casual: 8, sick: 10 });
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [planSummary, setPlanSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [holidays, setHolidays] = useState([]);

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
          preferences: { interests: ['Nature', 'Mountains'], max_paid_leave_utilization: 1.0 }
        })
      });
      
      const data = await response.json();
      
      // Filter out past dates for 2026 planning
      const now = new Date();
      const filteredRecommendations = (data.recommended_days || []).filter(d => new Date(d.date) >= now);
      const filteredHolidays = (data.holidays || []).filter(d => new Date(d.date) >= now);

      setPlanSummary(data.summary || 'Expert plan generated.');
      setRecommendations(filteredRecommendations);
      setHolidays(filteredHolidays);
      setIsAnalyzed(true);
    } catch (error) {
      console.error("Optimization failed:", error);
      setTimeout(() => setIsAnalyzed(true), 800);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <CommandCenter onExecute={handleExecute} />
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
                        "As your leave planner expert, I've prioritized your {balances.paid} paid days and {balances.casual} casual days 
                        to ensure optimal coverage every month. Sick leave is fully reserved for emergencies as requested."
                      </p>
                    </div>
                  )}
                </div>

                <BalanceManager balances={balances} onUpdate={updateBalance} />
                
                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="xl:w-2/3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <CalendarView 
                          key={i}
                          month={i}
                          year={2026}
                          onDayClick={setSelectedDay}
                          holidays={holidays}
                          recommendedDays={recommendations}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="xl:w-1/3">
                    <div className="sticky top-8">
                      <ReasoningPanel selectedDay={selectedDay} />
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
