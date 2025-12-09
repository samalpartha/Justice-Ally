
import React from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onSave?: () => void;
  onLoad?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, onSave, onLoad, children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              {/* Scales of Justice Icon */}
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">JusticeAlly</h1>
          </div>
          <p className="text-xs text-slate-500 mt-2">Universal Legal Navigator</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
           <button
            onClick={() => setMode(AppMode.TRIAGE)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.TRIAGE ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Triage & Intake
          </button>

          <button
            onClick={() => setMode(AppMode.DASHBOARD)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.DASHBOARD ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Evidence Vault
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

          <button
            onClick={() => setMode(AppMode.LIVE_STRATEGY)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.LIVE_STRATEGY ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Live Strategy
          </button>

           <button
            onClick={() => setMode(AppMode.FORMS)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              currentMode === AppMode.FORMS ? 'bg-amber-450/10 text-amber-500 border border-amber-450/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Forms Library
          </button>

          <div className="pt-4 mt-auto">
             <div className="h-px bg-slate-800 mb-4"></div>
             <button
              onClick={() => setMode(AppMode.HELP)}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors text-sm ${
                currentMode === AppMode.HELP ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help & Guidance
            </button>
          </div>
        </nav>

        {/* Persistence Section */}
        <div className="p-4 border-t border-slate-800 space-y-2">
           <div className="flex gap-2">
              {onSave && (
                <button 
                  onClick={onSave}
                  title="Save current case state to local storage"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-2 rounded border border-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Save Case
                </button>
              )}
              {onLoad && (
                <button 
                  onClick={onLoad}
                  title="Load saved case from local storage"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-2 rounded border border-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Load
                </button>
              )}
           </div>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-amber-900/20 border border-amber-900/50 rounded p-3 flex gap-2">
             <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <div>
               <h4 className="text-amber-500 text-xs font-bold uppercase mb-1">Warning</h4>
               <p className="text-[10px] text-amber-200/70 leading-relaxed">
                 AI tool. Not legal advice. Verify all citations.
               </p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">
        {children}
      </main>
    </div>
  );
};

export default Layout;
