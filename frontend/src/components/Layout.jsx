import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-primary opacity-20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-secondary opacity-20 blur-[120px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gradient mb-4">Leave Planner Agent</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">Maximize your holidays with AI-driven intelligence.</p>
        </header>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
