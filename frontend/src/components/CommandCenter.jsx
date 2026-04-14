import React, { useState } from 'react';
import { Paperclip, Sparkles, Send, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const CommandCenter = ({ onExecute }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="w-full max-w-3xl mx-auto mb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-2 rounded-[28px] shadow-2xl border-white border-opacity-10 group focus-within:border-accent-primary transition-all duration-500"
      >
        <div className="relative flex items-center px-4 py-2">
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-all group/btn">
            <Paperclip className="w-5 h-5 text-text-muted group-hover/btn:text-white" />
          </button>
          
          <textarea 
            rows="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Feed me your holiday list and balances to unlock vacation mode! 🌴"
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-text-muted px-4 py-2 resize-none text-lg min-h-[44px]"
            style={{ overflow: 'hidden' }}
          />

          <button 
            onClick={() => onExecute(inputValue)}
            className="bg-accent-primary hover:bg-opacity-80 p-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] group/send"
          >
            <Sparkles className="w-5 h-5 text-white group-hover/send:rotate-12 transition-transform" />
          </button>
        </div>
        
        <div className="px-6 pb-2 flex gap-4 text-[10px] text-text-muted uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Attach CSV/PDF</span>
          <span className="flex items-center gap-1"><Send className="w-3 h-3" /> Press Enter to Plan</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CommandCenter;
