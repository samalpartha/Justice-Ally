
import React, { useState } from 'react';
import { AppMode, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onSave?: () => void;
  onLoad?: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onShowAbout?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, onSave, onLoad, user, onLogout, onShowAbout, children }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const NavItem = ({ mode, icon, label, sub }: { mode: AppMode, icon: React.ReactNode, label: string, sub?: string }) => (
    <button
      onClick={() => {
        setMode(mode);
        setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
      }}
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
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-900/50 selection:text-amber-100 transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Menu Button & Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="font-serif font-black text-lg text-slate-100 tracking-tight leading-none">{t('common', 'appName')}<span className="text-amber-600">{t('common', 'appSuffix')}</span></h1>
         </div>
         <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs border bg-slate-800 border-slate-600 text-slate-300">
            {user?.name.charAt(0)}
         </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Legal Binder Spine Aesthetic */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r-4 border-double border-slate-800 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        no-print
      `} id="sidebar">
        
        {/* Toggles - Absolute Positioned to Avoid Overlap */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-700 w-8 h-8 rounded-sm transition-all shadow-sm group/theme"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {theme === 'dark' ? (
                   <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                   <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
            </button>
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

        {/* Branding Area - Centered Layout */}
        <div className="p-8 border-b border-slate-800 bg-slate-950 flex flex-col items-center text-center group mt-4 transition-colors duration-300">
             {/* Centered Icon */}
             <div className="w-14 h-14 flex items-center justify-center border-2 border-amber-700 rounded-sm bg-slate-900 shadow-inner mb-4 transition-colors duration-300">
               <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2c-1.1 0-2 .9-2 2h-3v2h2.55c-.6 2.3-2.65 4-5.05 4-1.3 0-2.5-.35-3.5-1l-1 1.75c1.3.85 2.85 1.25 4.5 1.25 2.5 0 4.8-1.15 6.35-3h6.3c1.55 1.85 3.85 3 6.35 3 1.65 0 3.2-.4 4.5-1.25l-1-1.75c-1 .65-2.2 1-3.5 1-2.4 0-4.45-1.7-5.05-4h2.55V4h-3c0-1.1-.9-2-2-2zm-6 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm12 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
               </svg>
             </div>
             
             {/* Text */}
             <div>
                <h1 className="font-serif font-black text-2xl text-slate-100 tracking-tight leading-none mb-1">{t('common', 'appName')}<span className="text-amber-600">{t('common', 'appSuffix')}</span></h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{t('common', 'tagline')}</p>
             </div>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center gap-3 transition-colors duration-300">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs border ${user.role === 'attorney' ? 'bg-blue-900 border-blue-600 text-blue-200' : 'bg-amber-900 border-amber-600 text-amber-200'}`}>
                {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-300 truncate">{user.name}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">{user.role === 'attorney' ? t('common', 'attorney') : t('common', 'litigant')}</div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
           <NavItem 
             mode={AppMode.TRIAGE} 
             label={t('sidebar', 'triage')} 
             sub={t('sidebar', 'riskAssessment')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
           />
           <NavItem 
             mode={AppMode.DASHBOARD} 
             label={t('sidebar', 'evidenceVault')}
             sub={t('sidebar', 'docket')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
           />
           <NavItem 
             mode={AppMode.WAR_ROOM} 
             label={t('sidebar', 'strategyRoom')} 
             sub={t('sidebar', 'casePlanning')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
           />
           {/* Added AI Counsel (Chat) */}
           <NavItem 
             mode={AppMode.CHAT} 
             label="AI Counsel" 
             sub="Wargame & Assistant"
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
           />
           <NavItem 
             mode={AppMode.LIVE_STRATEGY} 
             label={t('sidebar', 'liveStrategy')} 
             sub={t('sidebar', 'voiceConsult')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
           />
           <NavItem 
             mode={AppMode.FORMS} 
             label={t('sidebar', 'formsLib')} 
             sub={t('sidebar', 'templates')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
           />
           <NavItem 
             mode={AppMode.TRAFFIC} 
             label={t('sidebar', 'traffic')} 
             sub={t('sidebar', 'dui')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
           />
           <NavItem 
             mode={AppMode.JUVENILE} 
             label={t('sidebar', 'juvenile')} 
             sub={t('sidebar', 'youthLaw')}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           />
           <div className="my-2 border-t border-slate-800 mx-6 transition-colors duration-300"></div>
           <NavItem 
             mode={AppMode.HELP} 
             label={t('sidebar', 'manual')} 
             sub="V1.0.4"
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           />
        </nav>

        {/* About / Footer Actions */}
        <div className="bg-slate-950 p-6 border-t border-slate-800 space-y-3 transition-colors duration-300">
           {onShowAbout && (
             <button onClick={onShowAbout} className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-blue-400 hover:text-blue-300 border border-blue-900/30 hover:bg-blue-900/10 rounded-sm transition-all mb-2">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 About Project
             </button>
           )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onSave} className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-slate-800 hover:border-amber-600 rounded-sm group transition-all">
              <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span className="text-[9px] font-bold uppercase text-slate-500 group-hover:text-slate-300">{t('common', 'save')}</span>
            </button>
            <button onClick={onLoad} className="flex flex-col items-center justify-center p-2 bg-slate-900 border border-slate-800 hover:border-blue-600 rounded-sm group transition-all">
               <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               <span className="text-[9px] font-bold uppercase text-slate-500 group-hover:text-slate-300">{t('common', 'load')}</span>
            </button>
          </div>
          <button onClick={onLogout} className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-900 rounded-sm transition-all">
             {t('common', 'logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area - Added margin-top for mobile header spacing */}
      <main className="flex-1 min-w-0 bg-slate-950 relative z-10 transition-colors duration-300 print:overflow-visible print:h-auto print:block print:bg-white pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
