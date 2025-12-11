
import React, { useState } from 'react';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLogin: (role: UserRole, name: string, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, setLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState<UserRole>('litigant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
      const name = role === 'attorney' ? 'Jessica Pearson, Esq.' : 'Alex Citizen';
      onLogin(role, name, email || 'demo@justiceally.ai');
      setIsLoading(false);
    }, 1500);
  };

  const startDemo = () => {
      setRole('litigant');
      setEmail('demo@justiceally.ai');
      setPassword('demo');
      const name = 'Alex Citizen (Demo)';
      onLogin('litigant', name, 'demo@justiceally.ai');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>

      {/* Toggles */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
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
           className="text-xs font-bold uppercase text-slate-500 hover:text-amber-600 transition-colors border border-slate-800 px-3 py-1 rounded-sm bg-slate-900"
         >
           {language === 'en' ? 'Español' : 'English'}
         </button>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-sm relative z-10 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-800 bg-slate-950 flex flex-col items-center transition-colors duration-300">
          <div className="w-16 h-16 flex items-center justify-center border-2 border-amber-700 rounded-sm bg-slate-900 shadow-inner mb-4 transition-colors duration-300">
             <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2c-1.1 0-2 .9-2 2h-3v2h2.55c-.6 2.3-2.65 4-5.05 4-1.3 0-2.5-.35-3.5-1l-1 1.75c1.3.85 2.85 1.25 4.5 1.25 2.5 0 4.8-1.15 6.35-3h6.3c1.55 1.85 3.85 3 6.35 3 1.65 0 3.2-.4 4.5-1.25l-1-1.75c-1 .65-2.2 1-3.5 1-2.4 0-4.45-1.7-5.05-4h2.55V4h-3c0-1.1-.9-2-2-2zm-6 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm12 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
             </svg>
          </div>
          <h1 className="font-serif font-black text-3xl text-slate-100 tracking-tight mb-1">{t('common', 'appName')}<span className="text-amber-600">{t('common', 'appSuffix')}</span></h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mb-4">{t('login', 'subtitle')}</p>
          
          {/* Gemini Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-full mb-2">
             <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-1-1z"/></svg>
             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">{t('login', 'poweredBy')}</span>
          </div>
        </div>

        {/* Role Toggles */}
        <div className="grid grid-cols-2 border-b border-slate-800">
          <button
            onClick={() => setRole('litigant')}
            className={`p-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              role === 'litigant' 
                ? 'bg-slate-900 text-amber-500 border-b-2 border-amber-600' 
                : 'bg-slate-950 text-slate-500 hover:text-slate-300'
            }`}
          >
            {t('login', 'selfRep')}
          </button>
          <button
            onClick={() => setRole('attorney')}
            className={`p-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              role === 'attorney' 
                ? 'bg-slate-900 text-blue-500 border-b-2 border-blue-600' 
                : 'bg-slate-950 text-slate-500 hover:text-slate-300'
            }`}
          >
            {t('login', 'attorneyLogin')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('login', 'emailLabel')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-950 border border-slate-700 p-3 rounded-sm text-slate-200 text-sm focus:border-amber-600 focus:outline-none font-serif placeholder:text-slate-700 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('login', 'passLabel')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 p-3 rounded-sm text-slate-200 text-sm focus:border-amber-600 focus:outline-none font-serif placeholder:text-slate-700 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-sm font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2 ${
                role === 'attorney'
                    ? 'bg-blue-900 hover:bg-blue-800 text-blue-100 border border-blue-700'
                    : 'bg-amber-700 hover:bg-amber-600 text-white border border-amber-600'
                }`}
            >
                {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login', 'authenticating')}
                </>
                ) : (
                <>
                    <span>{t('login', 'authButton')}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </>
                )}
            </button>
            <button
               type="button"
               onClick={startDemo}
               className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Start Quick Tour (Demo)
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-950 border-t border-slate-800 text-center transition-colors duration-300">
          <p className="text-[10px] text-amber-600 font-bold uppercase mb-2">
             {t('login', 'impactStat')}
          </p>
          <p className="text-[10px] text-slate-600 font-serif italic">
            {t('login', 'footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
