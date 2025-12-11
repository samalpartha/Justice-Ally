
import React from 'react';
import { AppMode, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onSave?: () => void;
  onLoad?: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, onSave, onLoad, user, onLogout, children }) => {
  const { language, setLanguage, t } = useLanguage();

  const NavItem = ({ mode, icon, label, sub }: { mode: AppMode, icon: React.ReactNode, label: string, sub?: string }) => (
    <button
      onClick={() => setMode(mode)}
      className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all border-l-4 group ${
        currentMode === mode
          ? 'bg-slate-900 border-amber-600 text-amber-500'
          : 'border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 hover:border-slate-700'
      }`}
    >
      <div className={`p-1 ${currentMode === mode ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </div>
      <div>
        <span className={`block font-bold text-sm tracking-wide uppercase ${currentMode === mode ? 'font-serif' : 'font-sans'}`}>{label}</span>
        {sub && <span className="block text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-0.5">{sub}</span>}
      </div>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-900/50 selection:text-amber-100">
      {/* Sidebar - Legal Binder Spine Aesthetic */}
      <aside className="w-72 bg-slate-950 border-r-4 border-double border-slate-800 flex flex-col shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Branding Area - Refactored to avoid overlap */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 group">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 flex items-center justify-center border-2 border-amber-700 rounded-sm bg-slate-900 shadow-inner shrink-0">
               <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2c-1.1 0-2 .9-2 2h-3v2h2.55c-.6 2.3-2.65 4-5.05 4-1.3 0-2.5-.35-3.5-1l-1 1.75c1.3.85 2.85 1.25 4.5 1.25 2.5 0 4.8-1.15 6.35-3h6.3c1.55 1.85 3.85 3 6.35 3 1.65 0 3.2-.4 4.5-1.25l-1-1.75c-1 .65-2.2 1-3.5 1-2.4 0-4.45-1.7-5.05-4h2.55V4h-3c0-1.1-.9-2-2-2zm-6 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-1.8-4-4-4zm12 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
               </svg>
             </div>
             
             {/* Enhanced Language Toggle - Positioned safely */}
             <button 
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded-sm transition-all shadow-sm group/lang"
                title={language === 'en' ? "Switch to Spanish" : "Cambiar a Inglés"}
              >
                <span className={`text-[10px] font-bold uppercase ${language === 'en' ? 'text-amber-500' : 'text-slate-500'}`}>EN</span>
                <span className="text-slate-600 text-[10px]">/</span>
                <span className={`text-[10px] font-bold uppercase ${language === 'es' ? 'text-amber-500' : 'text-slate-500'}`}>ES</span>
              </button>
          </div>
          
          <div>
             <h1 className="font-serif font-black text-2xl text-slate-100 tracking-tight leading-none mb-1">{t('common', 'appName')}<span className="text-amber-600">{t('common', 'appSuffix')}</span></h1>
             <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{t('common', 'tagline')}</p>
          </div>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs border ${user.role === 'attorney' ? 'bg-blue-900 border-blue-600 text-blue-200' : 'bg-amber-900 border-amber-600 text-amber-200'}`}>
                {user.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate font-serif">{user.name}</p>
                <p className={`text-[9px] uppercase tracking-widest font-bold ${user.role === 'attorney' ? 'text-blue-500' : 'text-amber-600'}`}>
                   {user.role === 'attorney' ? t('common', 'attorney') : t('common', 'litigant')}
                </p>
             </div>
             <button onClick={onLogout} title={t('common', 'logout')} className="text-slate-500 hover:text-white">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        )}

        {/* Navigation Docket */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-6 mb-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">{t('sidebar', 'intake')}</p>
          </div>
          <NavItem 
            mode={AppMode.TRIAGE} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label={t('sidebar', 'triage')}
            sub={t('sidebar', 'riskAssessment')}
          />
          
          <div className="px-6 mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">{t('sidebar', 'management')}</p>
          </div>
          <NavItem 
            mode={AppMode.DASHBOARD} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
            label={t('sidebar', 'evidenceVault')}
            sub={t('sidebar', 'docket')}
          />
          <NavItem 
            mode={AppMode.WAR_ROOM} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label={t('sidebar', 'strategyRoom')}
            sub={t('sidebar', 'casePlanning')}
          />

          <div className="px-6 mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">{t('sidebar', 'counselTools')}</p>
          </div>
          <NavItem 
            mode={AppMode.CHAT} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
            label={t('sidebar', 'tacticalChat')}
            sub={t('sidebar', 'aiCoCounsel')}
          />
          <NavItem 
            mode={AppMode.LIVE_STRATEGY} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
            label={t('sidebar', 'liveStrategy')}
            sub={t('sidebar', 'voiceConsult')}
          />
          <NavItem 
            mode={AppMode.FORMS} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label={t('sidebar', 'formsLib')}
            sub={t('sidebar', 'templates')}
          />
          <NavItem 
            mode={AppMode.JUVENILE} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            label={t('sidebar', 'juvenile')}
            sub={t('sidebar', 'youthLaw')}
          />
        </nav>

        {/* Persistence & Help - Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="grid grid-cols-2 gap-2 mb-4">
             <button onClick={onSave} className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-slate-700 hover:border-amber-600 rounded-sm text-slate-400 hover:text-amber-500 transition-all group">
               <svg className="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
               <span className="text-[9px] font-bold uppercase tracking-wider">{t('common', 'save')}</span>
             </button>
             <button onClick={onLoad} className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-slate-700 hover:border-amber-600 rounded-sm text-slate-400 hover:text-amber-500 transition-all group">
               <svg className="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               <span className="text-[9px] font-bold uppercase tracking-wider">{t('common', 'load')}</span>
             </button>
          </div>
          <button 
             onClick={() => setMode(AppMode.HELP)}
             className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-sm"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-widest">{t('sidebar', 'manual')}</span>
          </button>
          
          <div className="mt-4 pt-4 border-t border-slate-800">
             <button 
               onClick={() => window.location.href = "https://www.google.com/search?q=weather"}
               className="w-full py-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-900/30 rounded-sm flex items-center justify-center gap-2 transition-all"
               title="Immediate Exit to Google Weather for Safety"
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               {t('common', 'quickExit')}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
        {/* Subtle Pleading Paper Line */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-slate-800/50 pointer-events-none z-0 hidden lg:block"></div>
        <div className="absolute left-14 top-0 bottom-0 w-px bg-red-900/10 pointer-events-none z-0 hidden lg:block"></div>
        <div className="relative z-10 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
