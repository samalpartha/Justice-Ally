
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const JuvenileJustice: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'emancipation' | 'delinquency' | 'dependency'>('delinquency');
  const [selectedState, setSelectedState] = useState("California");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Reset check state when tab changes
  useEffect(() => {
    setCheckedItems({});
    setSelectedStep(null);
  }, [activeTab]);

  const toggleCheck = (itemKey: string) => {
    setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const getSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`official ${selectedState} ${query} pdf`)}`;
  };

  // Helper to get theme colors dynamically
  const getThemeColors = (isActive: boolean) => {
    if (activeTab === 'emancipation') {
      return isActive ? 'border-emerald-500 text-emerald-500 bg-emerald-950/20' : 'border-slate-800 text-slate-500 hover:text-emerald-400';
    }
    if (activeTab === 'dependency') {
      return isActive ? 'border-blue-500 text-blue-500 bg-blue-950/20' : 'border-slate-800 text-slate-500 hover:text-blue-400';
    }
    return isActive ? 'border-amber-600 text-amber-500 bg-amber-950/20' : 'border-slate-800 text-slate-500 hover:text-amber-400';
  };

  // Build Content Structure Dynamically from Translations
  const getContent = () => {
    if (activeTab === 'emancipation') {
        return {
            icon: <svg className="w-40 h-40 text-emerald-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
            desc: t('juvenile', 'emancipationDesc'),
            precedent: t('juvenile', 'emancipationPrecedent'),
            checklist: [
                { key: 'checkEmp1', text: t('juvenile', 'checkEmp1') },
                { key: 'checkEmp2', text: t('juvenile', 'checkEmp2') },
                { key: 'checkEmp3', text: t('juvenile', 'checkEmp3') },
                { key: 'checkEmp4', text: t('juvenile', 'checkEmp4') },
                { key: 'checkEmp5', text: t('juvenile', 'checkEmp5') }
            ],
            flow: [
                { title: t('juvenile', 'flowEmp1Title'), desc: t('juvenile', 'flowEmp1Desc'), detail: t('juvenile', 'flowEmp1Detail') },
                { title: t('juvenile', 'flowEmp2Title'), desc: t('juvenile', 'flowEmp2Desc'), detail: t('juvenile', 'flowEmp2Detail') },
                { title: t('juvenile', 'flowEmp3Title'), desc: t('juvenile', 'flowEmp3Desc'), detail: t('juvenile', 'flowEmp3Detail') },
                { title: t('juvenile', 'flowEmp4Title'), desc: t('juvenile', 'flowEmp4Desc'), detail: t('juvenile', 'flowEmp4Detail') }
            ],
            forms: [
                { name: t('juvenile', 'formEmp1'), query: "petition for emancipation form" },
                { name: t('juvenile', 'formEmp2'), query: "income and expense declaration form" },
                { name: t('juvenile', 'formEmp3'), query: "notice of hearing juvenile form" }
            ]
        };
    } else if (activeTab === 'dependency') {
        return {
            icon: <svg className="w-40 h-40 text-blue-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
            desc: t('juvenile', 'dependencyDesc'),
            precedent: t('juvenile', 'dependencyPrecedent'),
            checklist: [
                { key: 'checkDep1', text: t('juvenile', 'checkDep1') },
                { key: 'checkDep2', text: t('juvenile', 'checkDep2') },
                { key: 'checkDep3', text: t('juvenile', 'checkDep3') },
                { key: 'checkDep4', text: t('juvenile', 'checkDep4') },
                { key: 'checkDep5', text: t('juvenile', 'checkDep5') }
            ],
            flow: [
                { title: t('juvenile', 'flowDep1Title'), desc: t('juvenile', 'flowDep1Desc'), detail: t('juvenile', 'flowDep1Detail') },
                { title: t('juvenile', 'flowDep2Title'), desc: t('juvenile', 'flowDep2Desc'), detail: t('juvenile', 'flowDep2Detail') },
                { title: t('juvenile', 'flowDep3Title'), desc: t('juvenile', 'flowDep3Desc'), detail: t('juvenile', 'flowDep3Detail') },
                { title: t('juvenile', 'flowDep4Title'), desc: t('juvenile', 'flowDep4Desc'), detail: t('juvenile', 'flowDep4Detail') }
            ],
            forms: [
                { name: t('juvenile', 'formDep1'), query: "parental reunification plan template" },
                { name: t('juvenile', 'formDep2'), query: "visitation log sheet child custody" },
                { name: t('juvenile', 'formDep3'), query: "request for relative placement form" }
            ]
        };
    } else {
        // Delinquency
        return {
            icon: <svg className="w-40 h-40 text-amber-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
            desc: t('juvenile', 'delinquencyDesc'),
            precedent: t('juvenile', 'delinquencyPrecedent'),
            checklist: [
                { key: 'checkDel1', text: t('juvenile', 'checkDel1') },
                { key: 'checkDel2', text: t('juvenile', 'checkDel2') },
                { key: 'checkDel3', text: t('juvenile', 'checkDel3') },
                { key: 'checkDel4', text: t('juvenile', 'checkDel4') },
                { key: 'checkDel5', text: t('juvenile', 'checkDel5') }
            ],
            flow: [
                { title: t('juvenile', 'flowDel1Title'), desc: t('juvenile', 'flowDel1Desc'), detail: t('juvenile', 'flowDel1Detail') },
                { title: t('juvenile', 'flowDel2Title'), desc: t('juvenile', 'flowDel2Desc'), detail: t('juvenile', 'flowDel2Detail') },
                { title: t('juvenile', 'flowDel3Title'), desc: t('juvenile', 'flowDel3Desc'), detail: t('juvenile', 'flowDel3Detail') },
                { title: t('juvenile', 'flowDel4Title'), desc: t('juvenile', 'flowDel4Desc'), detail: t('juvenile', 'flowDel4Detail') }
            ],
            forms: [
                { name: t('juvenile', 'formDel1'), query: "motion to seal juvenile records form" },
                { name: t('juvenile', 'formDel2'), query: "character reference letter template court" },
                { name: t('juvenile', 'formDel3'), query: "community service log sheet" }
            ]
        };
    }
  };

  const currentData = getContent();

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => {
    const isActive = activeTab === id;
    let activeClass = "";
    if (id === 'emancipation') activeClass = isActive ? "border-emerald-500 text-emerald-500 bg-slate-900" : "hover:text-emerald-500";
    if (id === 'delinquency') activeClass = isActive ? "border-amber-600 text-amber-500 bg-slate-900" : "hover:text-amber-500";
    if (id === 'dependency') activeClass = isActive ? "border-blue-500 text-blue-500 bg-slate-900" : "hover:text-blue-500";

    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-4 ${
          isActive
            ? activeClass
            : 'border-transparent text-slate-600 bg-slate-950 hover:bg-slate-900'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
              {t('juvenile', 'header')}
            </h1>
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
              {t('juvenile', 'subHeader')}
            </p>
          </div>
          
          <div className="hidden md:block">
             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-right">{t('triage', 'jurisdiction')}</label>
             <div className="relative">
               <select 
                 value={selectedState} 
                 onChange={(e) => setSelectedState(e.target.value)}
                 className="bg-slate-900 border border-slate-700 text-slate-200 text-xs py-2 pl-3 pr-8 rounded-sm outline-none appearance-none font-serif cursor-pointer shadow-sm hover:border-slate-500 focus:border-white transition-colors"
               >
                 {STATES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs - Distinctly Separated */}
        <div className="flex border-b border-slate-800 mb-8">
          <TabButton id="emancipation" label={t('juvenile', 'emancipation')} />
          <TabButton id="delinquency" label={t('juvenile', 'delinquency')} />
          <TabButton id="dependency" label={t('juvenile', 'dependency')} />
        </div>

        {/* Dynamic Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Educational & Procedural (Cols 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card */}
            <div className={`bg-slate-900 border p-8 rounded-sm shadow-xl relative overflow-hidden transition-colors duration-300 ${getThemeColors(true).split(' ')[0]}`}>
               {/* Background Icon */}
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  {currentData.icon}
               </div>

               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6 border-b border-slate-800/50 pb-4">
                    <div className={`p-2 bg-slate-950 border rounded-sm ${getThemeColors(true)}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h2 className="text-xl font-serif font-bold text-slate-100">{t('juvenile', 'standard')}</h2>
                 </div>
                 
                 <p className="text-slate-300 font-serif leading-8 text-lg mb-8">
                   {currentData.desc}
                 </p>

                 <div className="bg-slate-950/40 border border-slate-800 rounded-sm p-5">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-3">{t('juvenile', 'precedentLabel')}</h4>
                    <div className="flex items-start gap-4">
                       <span className={`font-serif font-bold text-2xl ${activeTab === 'emancipation' ? 'text-emerald-500' : activeTab === 'dependency' ? 'text-blue-500' : 'text-amber-500'}`}>¶</span>
                       <p className="text-sm text-slate-300 font-serif italic leading-relaxed">
                         {currentData.precedent}
                       </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Procedural Flow */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-lg">
               <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] mb-8 border-b border-slate-800 pb-2">{t('juvenile', 'proceduralFlow')}</h3>
               
               <div className="relative mb-6">
                 {/* Connecting Line */}
                 <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800 hidden md:block"></div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {currentData.flow.map((step, idx) => {
                     const isSelected = selectedStep === idx;
                     return (
                       <div key={idx} className="relative group">
                          {/* Number Badge */}
                          <button 
                            onClick={() => setSelectedStep(idx)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs relative z-10 mx-auto md:mx-0 mb-4 transition-all duration-300 ${
                              isSelected 
                                ? (activeTab === 'emancipation' ? 'bg-emerald-600 border-emerald-400 text-white scale-110' : 
                                   activeTab === 'dependency' ? 'bg-blue-600 border-blue-400 text-white scale-110' : 
                                   'bg-amber-600 border-amber-400 text-white scale-110')
                                : (activeTab === 'emancipation' ? 'bg-slate-900 border-emerald-900 text-emerald-700 hover:border-emerald-600' : 
                                   activeTab === 'dependency' ? 'bg-slate-900 border-blue-900 text-blue-700 hover:border-blue-600' : 
                                   'bg-slate-900 border-amber-900 text-amber-700 hover:border-amber-600')
                          }`}>
                            {idx + 1}
                          </button>
                          
                          <button 
                             onClick={() => setSelectedStep(idx)}
                             className={`w-full text-left bg-slate-950 border p-4 rounded-sm transition-all h-full ${
                               isSelected 
                                 ? (activeTab === 'emancipation' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 
                                    activeTab === 'dependency' ? 'border-blue-500 ring-1 ring-blue-500/50' : 
                                    'border-amber-500 ring-1 ring-amber-500/50')
                                 : 'border-slate-800 hover:border-slate-600'
                             }`}
                          >
                             <h4 className={`font-serif font-bold text-sm mb-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{step.title}</h4>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">{step.desc}</p>
                          </button>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* Stage Detail View */}
               {selectedStep !== null && (
                 <div className="mt-8 bg-slate-950 border-t-2 border-slate-800 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="flex items-start gap-4">
                     <div className={`p-2 rounded-sm shrink-0 ${
                        activeTab === 'emancipation' ? 'bg-emerald-900/20 text-emerald-500' : 
                        activeTab === 'dependency' ? 'bg-blue-900/20 text-blue-500' : 
                        'bg-amber-900/20 text-amber-500'
                     }`}>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2">Stage {selectedStep + 1}: {currentData.flow[selectedStep].title}</h4>
                       <p className="text-slate-300 font-serif leading-7 text-sm">
                         {currentData.flow[selectedStep].detail}
                       </p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* RIGHT COLUMN: Action Items (Cols 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* State Resources Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm shadow-lg">
               <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <div className={`p-1.5 border rounded-sm ${
                      activeTab === 'emancipation' ? 'border-emerald-900 text-emerald-500 bg-emerald-900/20' :
                      activeTab === 'dependency' ? 'border-blue-900 text-blue-500 bg-blue-900/20' :
                      'border-amber-900 text-amber-500 bg-amber-900/20'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h2 className="text-sm font-serif font-bold text-slate-100">{t('juvenile', 'formsAndTools')}</h2>
               </div>
               
               <div className="space-y-3">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{selectedState} Forms</p>
                 {currentData.forms.map((form, i) => (
                    <a key={i} href={getSearchUrl(form.query)} target="_blank" rel="noreferrer" className="block p-4 bg-slate-950 border border-slate-800 hover:border-slate-600 transition-colors group rounded-sm">
                      <span className={`text-xs font-bold flex justify-between items-center ${
                          activeTab === 'emancipation' ? 'text-emerald-500' :
                          activeTab === 'dependency' ? 'text-blue-500' :
                          'text-amber-500'
                      }`}>
                        {form.name}
                        <svg className="w-3 h-3 text-slate-700 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </span>
                   </a>
                 ))}
               </div>

               <div className="mt-6 pt-6 border-t border-slate-800">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('juvenile', 'extResearch')}</h4>
                   <div className="grid grid-cols-2 gap-2">
                      <a href={`https://scholar.google.com/scholar?q=${selectedState}+juvenile+law+${activeTab}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-sm text-center group transition-colors">
                         <span className="text-blue-500 mb-1 font-serif font-bold group-hover:scale-105 transition-transform">G.Scholar</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Case Law</span>
                      </a>
                      <a href="https://www.lawhelp.org/" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-sm text-center group transition-colors">
                         <span className="text-emerald-500 mb-1 font-serif font-bold group-hover:scale-105 transition-transform">LawHelp</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Pro Bono</span>
                      </a>
                   </div>
               </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm shadow-xl">
               <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                 <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <h3 className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">{t('juvenile', 'readinessChecklist')}</h3>
                 </div>
                 {Object.keys(checkedItems).length > 0 && (
                   <button onClick={() => setCheckedItems({})} className="text-[9px] uppercase font-bold text-slate-600 hover:text-white transition-colors">{t('juvenile', 'reset')}</button>
                 )}
               </div>
               
               <ul className="space-y-3">
                 {currentData.checklist.map((item, i) => (
                   <li key={i} className="flex items-start gap-3 group cursor-pointer" onClick={() => toggleCheck(item.key)}>
                      <div className={`w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors mt-0.5 ${
                        checkedItems[item.key] 
                          ? (activeTab === 'emancipation' ? 'bg-emerald-600 border-emerald-600' : activeTab === 'dependency' ? 'bg-blue-600 border-blue-600' : 'bg-amber-600 border-amber-600') 
                          : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {checkedItems[item.key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-xs font-serif leading-relaxed select-none ${checkedItems[item.key] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {item.text}
                      </span>
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JuvenileJustice;
