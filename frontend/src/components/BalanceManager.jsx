import React from 'react';
import { Briefcase, HeartPulse, Clock } from 'lucide-react';

const BalanceCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass p-6 rounded-2xl flex items-center space-x-4 min-w-[240px]">
    <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-text-muted text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value} <span className="text-xs font-normal text-text-muted">Days</span></p>
    </div>
  </div>
);

const BalanceManager = ({ balances }) => {
  return (
    <section className="flex flex-wrap gap-4 mb-12">
      <BalanceCard 
        title="Paid Leave" 
        value={balances.paid} 
        icon={Briefcase} 
        color="bg-accent-primary" 
      />
      <BalanceCard 
        title="Casual Leave" 
        value={balances.casual} 
        icon={Clock} 
        color="bg-accent-secondary" 
      />
      <BalanceCard 
        title="Sick Leave" 
        value={balances.sick} 
        icon={HeartPulse} 
        color="bg-emerald-500" 
      />
    </section>
  );
};

export default BalanceManager;
