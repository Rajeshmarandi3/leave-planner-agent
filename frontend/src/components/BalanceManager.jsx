import React from 'react';
import { Briefcase, HeartPulse, Clock } from 'lucide-react';

const BalanceCard = ({ title, value, type, icon: Icon, color, onUpdate }) => (
  <div className="glass p-6 rounded-2xl flex items-center space-x-4 min-w-[240px] flex-1">
    <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1">
      <h3 className="text-text-muted text-sm font-medium">{title}</h3>
      <div className="flex items-baseline gap-1">
        <input 
          type="number"
          value={value}
          onChange={(e) => onUpdate(type, e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-2xl font-bold p-0 w-16 text-white"
        />
        <span className="text-xs font-normal text-text-muted">Days</span>
      </div>
    </div>
  </div>
);

const BalanceManager = ({ balances, onUpdate }) => {
  return (
    <section className="flex flex-wrap gap-4 mb-12">
      <BalanceCard 
        title="Paid Leave" 
        value={balances.paid} 
        type="paid"
        icon={Briefcase} 
        color="bg-accent-primary" 
        onUpdate={onUpdate}
      />
      <BalanceCard 
        title="Casual Leave" 
        value={balances.casual} 
        type="casual"
        icon={Clock} 
        color="bg-accent-secondary" 
        onUpdate={onUpdate}
      />
      <BalanceCard 
        title="Sick Leave" 
        value={balances.sick} 
        type="sick"
        icon={HeartPulse} 
        color="bg-emerald-500" 
        onUpdate={onUpdate}
      />
    </section>
  );
};

export default BalanceManager;
