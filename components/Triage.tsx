
import React, { useState, useEffect } from 'react';
import { CaseContext, TriageResult } from '../types';
import { assessCaseSuitability, mapApiError } from '../services/geminiService';
import DictationButton from './DictationButton';
import { useLanguage } from '../context/LanguageContext';

interface TriageProps {
  onComplete: (context: CaseContext, result: TriageResult) => void;
}

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "Federal Immigration (USCIS)", "Federal District Court"
];

const Triage: React.FC<TriageProps> = ({ onComplete }) => {
  const { t, language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  
  // Defined here to access 't'
  const CASE_TYPES = [
    { value: "Family Law (Divorce/Custody)", label: t('triageOptions', 'family') },
    { value: "Civil Litigation (Small Claims < $10k)", label: t('triageOptions', 'civilSmall') },
    { value: "Civil Litigation (>$10k)", label: t('triageOptions', 'civilLarge') },
    { value: "Landlord/Tenant (Eviction)", label: t('triageOptions', 'landlord') },
    { value: "Criminal (Traffic/Misdemeanor)", label: t('triageOptions', 'traffic') },
    { value: "Criminal (Felony)", label: t('triageOptions', 'felony') },
    { value: "Immigration (Visa/Greencard)", label: t('triageOptions', 'visa') },
    { value: "Immigration (Deportation/Asylum)", label: t('triageOptions', 'asylum') },
    { value: "Medical Malpractice", label: t('triageOptions', 'malpractice') },
    { value: "Business Dispute", label: t('triageOptions', 'business') },
    { value: "Juvenile Justice (Delinquency/Dependency)", label: t('triageOptions', 'juvenile') }
  ];

  const BUDGET_OPTIONS = [
    { value: "Low Income", label: t('triageOptions', 'lowIncome') },
    { value: "Moderate", label: t('triageOptions', 'moderate') },
    { value: "High", label: t('triageOptions', 'high') }
  ];

  const DEMO_SCENARIOS = [
      {
          label: "Eviction Defense",
          data: {
              jurisdiction: 'California',
              caseType: 'Landlord/Tenant (Eviction)',
              budget: 'Low Income',
              description: 'My landlord is trying to evict me for non-payment, but the heater has been broken for 3 months and I withheld rent. I have emails proving I asked for repairs.'
          },
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      },
      {
          label: "Car Accident",
          data: {
              jurisdiction: 'Texas',
              caseType: 'Civil Litigation (Small Claims < $10k)',
              budget: 'Moderate',
              description: 'I was rear-ended at a red light. The other driver admitted fault at the scene, but now his insurance is denying the claim saying I stopped too suddenly. Damage is $4,500.'
          },
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      },
      {
          label: "DUI Defense",
          data: {
              jurisdiction: 'Florida',
              caseType: 'Criminal (Traffic/Misdemeanor)',
              budget: 'High',
              description: 'Pulled over for swerving. Failed field sobriety test. Breathalyzer was 0.09. First offense. I need to know if I can keep my license for work.'
          },
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
  ];

  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [context, setContext] = useState<CaseContext>({
    jurisdiction: 'California',
    caseType: 'Family Law (Divorce/Custody)',
    budget: 'Low Income',
    description: ''
  });
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleAssess = async () => {
    if (!context.description) return;
    setError(null);
    setStep('analyzing');
    
    // Simulate multi-step loading for better UX
    setLoadingProgress(10);
    setLoadingText("Ingesting case facts...");
    
    try {
        const loadingTimer = setInterval(() => {
            setLoadingProgress(prev => {
                if(prev < 30) { setLoadingText("Querying procedural statutes..."); return prev + 5; }
                if(prev < 60) { setLoadingText("Cross-referencing fee schedules..."); return prev + 5; }
                if(prev < 90) { setLoadingText("Calculating risk score..."); return prev + 2; }
                return prev;
            });
        }, 300);

        const assessment = await assessCaseSuitability(context, language);
        
        clearInterval(loadingTimer);
        setLoadingProgress(100);
        setLoadingText("Finalizing Strategy...");
        
        setResult(assessment);
        setStep('result');

    } catch (error: any) {
      console.error(error);
      const errKey = mapApiError(error);
      setError(errKey);
      setStep('input');
    }
  };

  const loadDemo = (scenario: typeof DEMO_SCENARIOS[0]) => {
      setContext(scenario.data);
      setError(null);
  };

  if (step === 'input') {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-6 bg-slate-950 overflow-y-auto">
        <div className="max-w-3xl w-full bg-slate-950 border border-slate-700 rounded-sm p-6 md:p-12 shadow-2xl relative">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10 border-b-2 border-slate-800 pb-6 md:pb-8">
            <h2 className="text-2xl md:text-4xl font-serif font-black text-slate-100 mb-3 tracking-tight uppercase">{t('triage', 'header')}</h2>
            <p className="text-amber-600 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase">{t('triage', 'confidential')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm text-red-200 font-serif">{t('alerts', error)}</span>
            </div>
          )}

          {/* Demo Buttons */}
          <div className="flex flex-wrap gap-3 mb-8 md:mb-12 justify-center">
             <span className="text-[10px] uppercase font-bold text-slate-500 self-center mr-2 w-full md:w-auto text-center">Try Demo Case:</span>
             {DEMO_SCENARIOS.map((demo, idx) => (
                 <button 
                    key={idx}
                    onClick={() => loadDemo(demo)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-amber-600 rounded-sm text-[10px] font-bold uppercase text-slate-300 hover:text-white transition-all shadow-sm whitespace-nowrap"
                 >
                    {demo.icon}
                    {demo.label}
                 </button>
             ))}
          </div>

          <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   {t('triage', 'jurisdiction')}
                   <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </label>
                <div className="relative">
                    <select 
                        value={context.jurisdiction}
                        onChange={e => setContext({...context, jurisdiction: e.target.value})}
                        className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                    >
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  {t('triage', 'matterClass')}
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </label>
                <div className="relative">
                  <select 
                    value={context.caseType}
                    onChange={e => setContext({...context, caseType: e.target.value})}
                    className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                  >
                    {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                {t('triage', 'budget')}
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </label>
              <div className="relative">
                <select 
                  value={context.budget}
                  onChange={e => setContext({...context, budget: e.target.value})}
                  className="w-full bg-slate-900 border-b-2 border-slate-700 text-slate-200 rounded-none p-3 focus:border-amber-600 outline-none appearance-none font-serif text-sm transition-colors cursor-pointer hover:bg-slate-800"
                >
                  {BUDGET_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="group mt-8 md:mt-12">
              <div className="flex justify-between items-center mb-3">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   {t('triage', 'facts')}
                 </label>
                 <DictationButton 
                    onTranscript={(text) => setContext(prev => {
                        const spacer = prev.description && !prev.description.endsWith(' ') ? ' ' : '';
                        return {...prev, description: prev.description + spacer + text};
                    })} 
                    className="hover:bg-slate-800 bg-slate-950 border border-slate-800 text-amber-600"
                 />
              </div>
              <div className="relative">
                <div className="absolute top-2 right-2 text-[9px] text-slate-500 font-mono z-10">
                   {context.description.length} / 5000
                </div>
                <textarea 
                  value={context.description}
                  onChange={e => setContext({...context, description: e.target.value})}
                  placeholder={t('triage', 'factsPlaceholder')}
                  maxLength={5000}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-sm p-4 md:p-6 focus:border-amber-600 outline-none h-32 md:h-40 resize-none font-serif shadow-inner placeholder:text-slate-600 placeholder:italic leading-8 tracking-wide text-sm md:text-base"
                />
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-700/80">{t('triage', 'privileged')}</span>
              </div>
            </div>

            <button 
              onClick={handleAssess}
              disabled={!context.description}
              title="Submit your preliminary facts for risk and cost analysis."
              className="w-full py-5 md:py-6 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg tracking-[0.2em] uppercase text-xs md:text-sm border border-amber-500 hover:border-amber-400 mt-6 md:mt-8"
            >
              {t('triage', 'generateBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950">
         <div className="w-full max-w-md">
            <div className="flex justify-between text-xs uppercase font-bold text-slate-400 mb-2">
                <span>{loadingText}</span>
                <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 mb-8 overflow-hidden">
                <div 
                   className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
                   style={{ width: `${loadingProgress}%` }}
                ></div>
            </div>
         </div>
         <div className="text-amber-600 font-mono text-xs uppercase tracking-widest animate-pulse">{t('triage', 'analyzing')}</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-slate-950 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Header Result */}
        <div className={`p-6 md:p-8 rounded-sm border-l-4 shadow-2xl bg-slate-900 relative overflow-hidden ${
          result?.riskLevel === 'LOW' ? 'border-green-600' :
          result?.riskLevel === 'MEDIUM' ? 'border-amber-600' :
          'border-red-600'
        }`}>
          {/* Gemini Badge */}
          <div className="absolute top-0 right-0 p-4 hidden md:block">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950/50 rounded-full border border-purple-500/30">
                <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-1-1z"/></svg>
                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wide">Powered by Gemini 2.5 Flash</span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 border-b border-slate-800 pb-4 md:pb-6 gap-4">
            <div>
               <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-100 mb-1">{t('triage', 'riskMemo')}</h2>
               <p className="text-slate-500 text-[10px] uppercase tracking-[0.25em] font-bold">{t('triage', 'workProduct')}</p>
            </div>
            <div className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-widest text-center md:text-left self-start md:self-auto ${
               result?.riskLevel === 'LOW' ? 'bg-green-950/30 text-green-500 border-green-700' :
               result?.riskLevel === 'MEDIUM' ? 'bg-amber-950/30 text-amber-500 border-amber-700' :
               'bg-red-950/30 text-red-500 border-red-700'
            }`}>
              {result?.riskLevel} {t('triage', 'riskDetected')}
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-sm md:text-lg text-slate-300 mb-6 leading-relaxed font-serif">{result?.riskAnalysis}</p>
          </div>
          
          <div className="bg-slate-950 p-4 md:p-6 border-l-2 border-slate-700 mt-6">
            <span className="text-[10px] font-bold uppercase text-amber-600 block mb-3 tracking-widest">{t('triage', 'strategicCounsel')}</span>
            <p className="text-slate-200 italic font-serif text-sm md:text-lg leading-relaxed">"{result?.advice}"</p>
          </div>
        </div>

        {/* Wallet Reality Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-slate-900 p-6 md:p-8 rounded-sm border border-slate-800 shadow-lg">
             <h3 className="text-lg font-serif font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
               <span className="text-amber-600">§</span> {t('triage', 'financialProj')}
             </h3>
             <ul className="space-y-6">
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">{t('triage', 'estFees')}</span>
                 <span className="text-slate-200 font-mono text-lg md:text-xl border-b border-slate-700 pb-1 block w-full whitespace-normal break-words">{result?.estimatedCosts.filingFees}</span>
               </li>
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">{t('triage', 'ancillary')}</span>
                 <div className="flex flex-wrap gap-2">
                   {result?.estimatedCosts.hiddenCosts.map((c, i) => (
                     <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 text-slate-400 font-mono uppercase">{c}</span>
                   ))}
                 </div>
               </li>
               <li>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">{t('triage', 'marketRate')}</span>
                 <span className="text-slate-300 text-sm italic font-serif">{result?.estimatedCosts.attorneyComparison}</span>
               </li>
             </ul>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 rounded-sm border border-slate-800 shadow-lg">
             <h3 className="text-lg font-serif font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
               <span className="text-blue-600">§</span> {t('triage', 'resourceRouting')}
             </h3>
             <div className="space-y-4">
                <a href={result?.resources.legalAidUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-amber-600 group">
                  <span className="text-[10px] text-amber-600 font-bold uppercase block tracking-widest mb-1">{t('triage', 'proBono')}</span>
                  <span className="text-slate-200 font-serif font-bold group-hover:text-white text-sm">{result?.resources.legalAidName}</span>
                </a>
                
                <a href={result?.resources.barAssociationUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-blue-600 group">
                  <span className="text-[10px] text-blue-500 font-bold uppercase block tracking-widest mb-1">{t('triage', 'barAssoc')}</span>
                  <span className="text-slate-200 font-serif font-bold group-hover:text-white text-sm">Attorney Verification Database</span>
                </a>

                {result?.resources.immigrationUrl && (
                  <a href={result?.resources.immigrationUrl} target="_blank" rel="noreferrer" className="block p-5 bg-slate-950 hover:bg-slate-900 transition-colors border-l-2 border-green-600 group">
                    <span className="text-[10px] text-green-500 font-bold uppercase block tracking-widest mb-1">{t('triage', 'immigration')}</span>
                    <span className="text-slate-200 font-serif font-bold group-hover:text-white text-sm">EOIR Accreditation List</span>
                  </a>
                )}
             </div>
          </div>
        </div>

        <button 
          onClick={() => result && onComplete(context, result)}
          className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-sm transition-colors border border-slate-600 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs shadow-lg group"
        >
          <span>{t('triage', 'initVault')}</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {result?.riskLevel === 'HIGH' && (
           <div className="p-4 md:p-6 bg-red-950/20 border-2 border-red-900/50 text-center">
             <p className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">⚠️ {t('triage', 'criticalDisclaimer')}</p>
             <p className="text-red-300 text-sm font-serif max-w-2xl mx-auto">
               {t('triage', 'highRiskMsg')}
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Triage;
