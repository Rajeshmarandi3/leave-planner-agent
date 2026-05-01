import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[900px] relative font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-primary opacity-20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-secondary opacity-20 blur-[120px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gradient mb-4">Leave Planner Agent</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">Maximize your holidays with AI-driven intelligence.</p>
        </header>
        
        <main>
          {children}
        </main>
        
        <footer className="mt-16 py-8 border-t border-white border-opacity-10 text-center text-text-muted text-sm">
          Leave Planner Agent • Powered by Gemini Intelligence • 2026 Edition
        </footer>
      </div>
    </div>
  );
};

export default Layout;
