import React from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-sm flex items-center justify-center">
              <span className="font-serif font-bold text-white text-lg">J</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">JusticeAlly</h1>
          </div>
          <p className="text-xs text-slate-500 mt-2">Litigation Strategy AI</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setMode(AppMode.DASHBOARD)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.DASHBOARD ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Shoebox & Dashboard
          </button>

          <button
            onClick={() => setMode(AppMode.WAR_ROOM)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.WAR_ROOM ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            War Room Strategy
          </button>

          <button
            onClick={() => setMode(AppMode.CHAT)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.CHAT ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Tactical Chat
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-amber-900/20 border border-amber-900/50 rounded p-3">
             <h4 className="text-amber-500 text-xs font-bold uppercase mb-1">Warning</h4>
             <p className="text-[10px] text-amber-200/70 leading-relaxed">
               This is an AI tool. Do not rely on it for legal advice. Check all citations.
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;